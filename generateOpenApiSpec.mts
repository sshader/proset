import { JSONValue } from 'convex/values'
import fs from 'fs'
/*
Usage:
 npx ts-node-esm generateOpenApiSpec.mts /tmp/analyzeResult
*/

type Visibility = { kind: 'public' } | { kind: 'internal' }

type UdfType = 'action' | 'mutation' | 'query' | 'httpAction'

export type AnalyzedFunction = {
  udfType: UdfType
  visibility: Visibility | null
  args: ValidatorJSON | null
  output: ValidatorJSON | null
}

export type ObjectFieldType = { fieldType: ValidatorJSON; optional: boolean }
export type ValidatorJSON =
  | {
      type: 'null'
    }
  | { type: 'number' }
  | { type: 'bigint' }
  | { type: 'boolean' }
  | { type: 'string' }
  | { type: 'bytes' }
  | { type: 'any' }
  | {
      type: 'literal'
      value: JSONValue
    }
  | { type: 'id'; tableName: string }
  | { type: 'array'; value: ValidatorJSON }
  | { type: 'record'; keys: ValidatorJSON; values: ObjectFieldType }
  | { type: 'object'; value: Record<string, ObjectFieldType> }
  | { type: 'union'; value: ValidatorJSON[] }

function generateSchemaFromValidator(validatorJson: ValidatorJSON): string {
  switch (validatorJson.type) {
    case 'null':
      // kind of a hack
      return 'type: string\nnullable: true'
    case 'number':
      return 'type: number'
    case 'bigint':
      throw new Error('bigint unsupported')
    case 'boolean':
      return 'type: boolean'
    case 'string':
      return 'type: string'
    case 'bytes':
      throw new Error('bytes unsupported')
    case 'any':
      // TODO: real any type
      return 'type: object'
    case 'literal':
      if (typeof validatorJson.value === 'string') {
        return `type: string\nenum:\n  - "${validatorJson.value}"` as string
      } else if (typeof validatorJson.value === 'boolean') {
        return `type: boolean\nenum:\n  - ${validatorJson.value.toString()}`
      } else {
        return `type: number\nenum:\n  - ${validatorJson.value!.toString()}`
      }
    case 'id':
      return `type: string\ndescription: ID from table "${validatorJson.tableName}"`
    case 'array':
      return `type: array\nitems:\n${reindent(
        generateSchemaFromValidator(validatorJson.value),
        1
      )}`
    case 'record':
      return 'type: object'
    case 'object': {
      const requiredProperties: string[] = []
      const members: string[] = Object.entries(validatorJson.value).map(
        ([key, value]) => {
          if (!value.optional) {
            requiredProperties.push(key)
          }
          return `${key}:\n${reindent(
            generateSchemaFromValidator(value.fieldType),
            1
          )}`
        }
      )
      const requiredPropertiesStr =
        requiredProperties.length === 0
          ? ''
          : `required:\n${reindent(
              requiredProperties.map((r) => `- ${r}`).join('\n'),
              1
            )}\n`
      const propertiesStr =
        members.length === 0
          ? ''
          : `properties:\n${reindent(members.join('\n'), 1)}`
      return `type: object\n${requiredPropertiesStr}${propertiesStr}`
    }
    case 'union': {
      const nullMember = validatorJson.value.find((v) => v.type === 'null')
      const nonNullMembers = validatorJson.value.filter(
        (v) => v.type !== 'null'
      )
      if (nonNullMembers.length === 1 && nullMember !== undefined) {
        return `${generateSchemaFromValidator(
          nonNullMembers[0]
        )}\nnullable: true`
      }
      const members: string[] = nonNullMembers.map((v) =>
        generateSchemaFromValidator(v)
      )
      return `${
        nullMember === undefined ? '' : 'nullable: true\n'
      }oneOf:\n${members.map((m) => reindent(m, 1, true)).join('\n')}`
    }
  }
}

function reindent(
  linesStr: string,
  indentation: number,
  firstLineList: boolean = false
) {
  const lines = linesStr.split('\n')
  return lines
    .map((l, index) => {
      if (index === 0 && firstLineList) {
        return `- ${'  '.repeat(indentation - 1)}${l}`
      }
      return `${'  '.repeat(indentation)}${l}`
    })
    .join('\n')
}

function formatName(name: string) {
  const [modulePath, functionName] = name.split(':')
  const withoutExtension = modulePath.slice(0, modulePath.length - 3)
  const pathParts = withoutExtension.split('/')
  const shortName = `${pathParts.join('.')}.${functionName}`
  const urlPathName = `${pathParts.join('/')}/${functionName}`
  return {
    original: name,
    shortName,
    urlPathName,
  }
}

function generateEndpointDef(name: string, func: AnalyzedFunction) {
  const { urlPathName, shortName } = formatName(name)
  return `
/api/${func.udfType}/${urlPathName}:
  post:
    tags: 
      - ${func.udfType}
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Request_${shortName}'
      required: true
    responses:
      '200':
        description: Successful operation
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Response_${shortName}'    
      '500':
        description: Successful operation
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FailedResponse'\n`
}

function generateEndpointSchemas(name: string, func: AnalyzedFunction) {
  const { shortName } = formatName(name)
  return `
Request_${shortName}:
  type: object
  required:
    - args
  properties:
    args:\n${reindent(
      generateSchemaFromValidator(func.args ?? { type: 'any' }),
      4
    )}\n
Response_${shortName}:
  type: object
  properties:
    status:
      type: string
      enum:
        - "success"
    value:\n${reindent(
      generateSchemaFromValidator(func.output ?? { type: 'any' }),
      4
    )}\n`
}

function generateOpenApiSpec(analyzeResult: Record<string, AnalyzedFunction>) {
  const siteUrl = 'https://bitter-narwhal-770.convex.site'
  return `
openapi: 3.0.3
info:
  title: My Cool Convex App - OpenAPI 3.0
  version: 0.0.0
servers:
  - url: ${siteUrl}
tags:
  - name: query
  - name: mutation
  - name: action
paths:
${reindent(
  Object.entries(analyzeResult)
    .map(([key, value]) => generateEndpointDef(key, value))
    .join('\n'),
  1
)}
components:
  schemas:
${reindent(
  Object.entries(analyzeResult)
    .map(([key, value]) => generateEndpointSchemas(key, value))
    .join('\n'),
  2
)}
    FailedResponse:
      type: object
      properties:
        status:
          type: string
          enum:
            - "error"
        errorMessage:
          type: string
        errorData:
          type: object
`
}

async function main(analyzeResultFile: string) {
  const analyzeResult: Record<string, AnalyzedFunction> = JSON.parse(
    fs.readFileSync(analyzeResultFile, { encoding: 'utf-8' })
  )
  const spec = generateOpenApiSpec(analyzeResult)
  console.log(spec)
}

await main(process.argv[2])
