import { JSONValue } from "convex/values";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export type ObjectFieldType = { fieldType: ValidatorJSON; optional: boolean };
export type ValidatorJSON =
  | {
      type: "null";
    }
  | { type: "number" }
  | { type: "bigint" }
  | { type: "boolean" }
  | { type: "string" }
  | { type: "bytes" }
  | { type: "any" }
  | {
      type: "literal";
      value: JSONValue;
    }
  | { type: "id"; tableName: string }
  | { type: "array"; value: ValidatorJSON }
  | { type: "record"; keys: ValidatorJSON; values: ObjectFieldType }
  | { type: "object"; value: Record<string, ObjectFieldType> }
  | { type: "union"; value: ValidatorJSON[] };

function generateArgsType(argsJson: ValidatorJSON): string {
    switch (argsJson.type) {
        case "null":
            return "null"
        case "number":
            return "number";
        case "bigint":
            return "bigint";
        case "boolean":
            return "boolean"
        case "string":
            return "string"
        case "bytes":
            return "ArrayBuffer"
        case "any":
            return "any";
        case "literal": 
            return argsJson.value as string
        case "id":
            return `Id<"${argsJson.tableName}">`
        case "array": 
            return `Array<${generateArgsType(argsJson.value)}>`
        case "record":
            return "any";
        case "object": {
            const members: string[] = Object.entries(argsJson.value).map(([key, value]) => {
                return `${key}${value.optional ? "?": ""}: ${generateArgsType(value.fieldType)},`
            })
            return `{ ${members.join("\n")} }`
        }
        case "union": {
            const members: string[] = argsJson.value.map(v => generateArgsType(v))
            return members.join(" | ")
        }
    }
}

function generateApiType(tree: Record<string, any>) {
    const isFunction = tree.udfType !== undefined;
    if (isFunction) {
        console.log(tree.output)
        const output = tree.output === null || tree.output === undefined ? "any" : generateArgsType(tree.output)
        return `FunctionReference<"${tree.udfType}", "${tree.visibility.kind}", ${generateArgsType(tree.args)}, ${output}>`
    }
    const members: string[] = Object.entries(tree).map(([key, value]) => {
        return `${key}: ${generateApiType(value)}`
    })
    return `{ ${members.join("\n")} }`
}

async function main(analyzeResultFile: string) {
    const analyzeResult = JSON.parse(fs.readFileSync(analyzeResultFile, { encoding: "utf-8"}))
    const publicFunctionTree: Record<string, any> = {}
    const internalFunctionTree: Record<string, any> = {}
    for (const functionPath in analyzeResult) {
        const analyzedFunction = analyzeResult[functionPath]
        const [modulePath, functionName] = functionPath.split(":");
        const withoutExtension = modulePath.slice(0, modulePath.length - 3)
        const pathParts = withoutExtension.split("/");
        let treeNode = analyzedFunction.visibility.kind === "internal" ? internalFunctionTree : publicFunctionTree;
        for (let i = 0; i < pathParts.length; i += 1) {
            const pathPart = pathParts[i]
            if (treeNode[pathPart] === undefined) {
                treeNode[pathPart] = {}
            }
            treeNode = treeNode[pathPart]
        }
        treeNode[functionName] = analyzedFunction
    }
    const apiType = generateApiType(publicFunctionTree);
    const internalApiType = generateApiType(internalFunctionTree)
    console.log(`
    import { FunctionReference, anyApi } from "convex/server"
    import { GenericId as Id } from "convex/values"
    
    export type PublicApiType = ${apiType}

    export type InternalApiType = ${internalApiType}

    export const api: PublicApiType = anyApi as unknown as PublicApiType;
    export const internal: InternalApiType = anyApi as unknown as InternalApiType;
    `)
}

await main(process.argv[2])