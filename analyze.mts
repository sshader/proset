import { execSync } from 'child_process'
import { JSONValue } from 'convex/values'
import fs from 'fs'
import path from 'path'

/*
Usage:
 npx ts-node-esm analyze.mts convex analyze

 Assumes there's already `convex/analyze` with a `helpers.ts` file
 Outputs content in /tmp/analyzeResult
*/

type Visibility = { kind: 'public' } | { kind: 'internal' }

type UdfType = 'action' | 'mutation' | 'query' | 'httpAction'

export type AnalyzedFunctions = Array<{
  name: string
  udfType: UdfType
  visibility: Visibility | null
  args: JSONValue | null
}>

async function analyzeModule(filePath: string): Promise<AnalyzedFunctions> {
  const importedModule = await import(filePath)

  const functions: Map<
    string,
    {
      udfType: UdfType
      visibility: Visibility | null
      args: JSONValue | null
    }
  > = new Map()
  for (const [name, value] of Object.entries(importedModule)) {
    if (value === undefined || value === null) {
      continue
    }

    let udfType: UdfType
    if (
      Object.prototype.hasOwnProperty.call(value, 'isAction') &&
      Object.prototype.hasOwnProperty.call(value, 'invokeAction')
    ) {
      udfType = 'action'
    } else if (
      Object.prototype.hasOwnProperty.call(value, 'isQuery') &&
      Object.prototype.hasOwnProperty.call(value, 'invokeQuery')
    ) {
      udfType = 'query'
    } else if (
      Object.prototype.hasOwnProperty.call(value, 'isMutation') &&
      Object.prototype.hasOwnProperty.call(value, 'invokeMutation')
    ) {
      udfType = 'mutation'
    } else if (
      Object.prototype.hasOwnProperty.call(value, 'isHttp') &&
      (Object.prototype.hasOwnProperty.call(value, 'invokeHttpEndpoint') ||
        Object.prototype.hasOwnProperty.call(value, 'invokeHttpAction'))
    ) {
      udfType = 'httpAction'
    } else {
      continue
    }
    const isPublic = Object.prototype.hasOwnProperty.call(value, 'isPublic')
    const isInternal = Object.prototype.hasOwnProperty.call(value, 'isInternal')

    let args: string | null = null
    if (
      Object.prototype.hasOwnProperty.call(value, 'exportArgs') &&
      typeof (value as any).exportArgs === 'function'
    ) {
      const exportedArgs = (value as any).exportArgs()
      if (typeof exportedArgs === 'string') {
        args = JSON.parse(exportedArgs)
      }
    }

    if (isPublic && isInternal) {
      console.debug(
        `Skipping function marked as both public and internal: ${name}`
      )
      continue
    } else if (isPublic) {
      functions.set(name, { udfType, visibility: { kind: 'public' }, args })
    } else if (isInternal) {
      functions.set(name, {
        udfType,
        visibility: { kind: 'internal' },
        args,
      })
    } else {
      functions.set(name, { udfType, visibility: null, args })
    }
  }
  const analyzed = [...functions.entries()].map(([name, properties]) => {
    // Finding line numbers is best effort. We should return the analyzed
    // function even if we fail to find the exact line number.
    return {
      name,
      ...properties,
    }
  })

  return analyzed
}

// Returns a generator of { isDir, path } for all paths
// within dirPath in some topological order (not including
// dirPath itself).
export function* walkDir(
  dirPath: string
): Generator<{ isDir: boolean; path: string }, void, void> {
  for (const dirEntry of fs
    .readdirSync(dirPath, { withFileTypes: true })
    .sort()) {
    const childPath = path.join(dirPath, dirEntry.name)
    if (dirEntry.isDirectory()) {
      yield { isDir: true, path: childPath }
      yield* walkDir(childPath)
    } else if (dirEntry.isFile()) {
      yield { isDir: false, path: childPath }
    }
  }
}
export async function entryPoints(
  dir: string,
  verbose: boolean
): Promise<string[]> {
  const entryPoints = []

  const log = (line: string) => {
    if (verbose) {
      console.log(line)
    }
  }

  for (const { isDir, path: fpath } of walkDir(dir)) {
    if (isDir) {
      continue
    }
    const relPath = path.relative(dir, fpath)
    const base = path.parse(fpath).base

    if (relPath.startsWith('_deps' + path.sep)) {
      throw new Error(
        `The path "${fpath}" is within the "_deps" directory, which is reserved for dependencies. Please move your code to another directory.`
      )
    } else if (relPath.startsWith('_generated' + path.sep)) {
      log(`Skipping ${fpath}`)
    } else if (base.startsWith('.')) {
      log(`Skipping dotfile ${fpath}`)
    } else if (base === 'README.md') {
      log(`Skipping ${fpath}`)
    } else if (base === '_generated.ts') {
      log(`Skipping ${fpath}`)
    } else if (base === 'schema.ts') {
      log(`Skipping ${fpath}`)
    } else if ((base.match(/\./g) || []).length > 1) {
      log(`Skipping ${fpath} that contains multiple dots`)
    } else if (base === 'tsconfig.json') {
      log(`Skipping ${fpath}`)
    } else if (relPath.endsWith('.config.js')) {
      log(`Skipping ${fpath}`)
    } else if (relPath.includes(' ')) {
      log(`Skipping ${relPath} because it contains a space`)
    } else if (base.endsWith('.d.ts')) {
      log(`Skipping ${fpath} declaration file`)
    } else if (base.endsWith('.json')) {
      log(`Skipping ${fpath} json file`)
    } else {
      log(`Preparing ${fpath}`)
      entryPoints.push(fpath)
    }
  }

  // If using TypeScript, require that at least one line starts with `export` or `import`,
  // a TypeScript requirement. This prevents confusing type errors described in CX-5067.
  const nonEmptyEntryPoints = entryPoints.filter((fpath) => {
    // This check only makes sense for TypeScript files
    if (!fpath.endsWith('.ts') && !fpath.endsWith('.tsx')) {
      return true
    }
    const contents = fs.readFileSync(fpath, { encoding: 'utf-8' })
    if (/^\s{0,100}(import|export)/m.test(contents)) {
      return true
    }
    log(
      `Skipping ${fpath} because it has no export or import to make it a valid TypeScript module`
    )
  })

  return nonEmptyEntryPoints
}

export type CanonicalizedModulePath = string

export async function analyze(
  convexDir: string
): Promise<Record<CanonicalizedModulePath, AnalyzedFunctions>> {
  const modules: Record<CanonicalizedModulePath, AnalyzedFunctions> = {}
  const files = await entryPoints(convexDir, false)
  for (const modulePath of files) {
    const filePath = path.join(convexDir, modulePath)
    modules[modulePath] = await analyzeModule(filePath)
  }
  return modules
}

export function importPath(modulePath: string) {
  // Replace backslashes with forward slashes.
  const filePath = modulePath.replace(/\\/g, '/')
  // Strip off the file extension.
  const lastDot = filePath.lastIndexOf('.')
  return filePath.slice(0, lastDot === -1 ? undefined : lastDot)
}

function generateFile(paths: string[], filename: string, isNode: boolean) {
  const imports: string[] = []
  const moduleGroupKeys: string[] = []
  for (const p of paths) {
    const safeModulePath = importPath(p).replace(/\//g, '_').replace(/-/g, '_')
    imports.push(`import * as ${safeModulePath} from "../${p}";`)
    moduleGroupKeys.push(`"${p}": ${safeModulePath},`)
  }

  const content = `
  ${isNode ? '"use node";' : ''}
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  ${imports.join('\n')}
  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      ${moduleGroupKeys.join('\n')}
    })
  })
  `
  fs.writeFileSync(filename, content)
}

async function main(convexDir: string, analyzeDir: string) {
  // analyzeDir is nested under convexDir and should contain a
  // `helpers.ts` with a `analyzeModuleGroups` function

  // TODO: clear out analyzeDir

  // Get a list of modules split by module type
  execSync('rm -rf /tmp/debug_bundle_path')
  execSync('npx convex dev --once --debug-bundle-path /tmp/debug_bundle_path')
  const outputStr = fs.readFileSync('/tmp/debug_bundle_path/fullConfig.json', {
    encoding: 'utf-8',
  })
  const output = JSON.parse(outputStr)
  if (!fs.existsSync('/tmp/debugConvexDir')) {
    fs.mkdirSync('/tmp/debugConvexDir')
  }
  const isolatePaths: string[] = []
  const nodePaths: string[] = []
  for (const m of output.modules) {
    if (m.path.startsWith('_deps')) {
      continue
    }
    if (m.path.startsWith(analyzeDir)) {
      continue
    }
    if (m.path === 'schema.js') {
      continue
    }
    if (m.path === 'auth.config.js') {
      continue
    }
    if (m.environment === 'isolate') {
      isolatePaths.push(m.path)
    } else {
      nodePaths.push(m.path)
    }
  }

  // Split these into chunks
  const chunkSize = 10
  let chunkNumber = 0
  // Generate files in the analyze directory for each of these
  for (let i = 0; i < isolatePaths.length; i += chunkSize) {
    const chunk = isolatePaths.slice(i, i + chunkSize)
    generateFile(
      chunk,
      `${convexDir}/${analyzeDir}/group${chunkNumber}.ts`,
      false
    )
    chunkNumber += 1
  }
  for (let i = 0; i < nodePaths.length; i += chunkSize) {
    const chunk = nodePaths.slice(i, i + chunkSize)
    generateFile(
      chunk,
      `${convexDir}/${analyzeDir}/group${chunkNumber}.ts`,
      true
    )
    chunkNumber += 1
  }

  // Push our generated functions to dev
  execSync('npx convex dev --once')

  // Run all the functions and collect the result
  let fullResults: Record<string, any> = {}
  for (let i = 0; i < chunkNumber; i += 1) {
    const result = execSync(`npx convex run ${analyzeDir}/group${i}:default`, {
      maxBuffer: 2 ** 30,
    }).toString()
    console.log(result)
    fullResults = {
      ...fullResults,
      ...JSON.parse(result),
    }
  }
  fs.writeFileSync('/tmp/analyzeResult', JSON.stringify(fullResults, null, 2))
  console.log('Result written to /tmp/analyzeResult')
}

await main(process.argv[2], process.argv[3])
