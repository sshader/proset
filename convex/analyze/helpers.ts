export const analyzeModuleGroups = (moduleGroup: Record<string, any>) => {
    const analyzed: Record<string, any> = {};
    for (const modulePath in moduleGroup) {
        analyzeModule(moduleGroup[modulePath], modulePath, analyzed)
    }
    
    return analyzed
}

type UdfType = "action" | "mutation" | "query" | "httpAction";

const analyzeModule = (importedModule: any, modulePath: string, analyzedResults: Record<string, any>) => {
    for (const exportName of Object.keys(importedModule)) {
        const value = importedModule[exportName] as any;
        if (value === undefined || value === null) {
            continue;
        }
        let udfType: UdfType;
        if (
          Object.prototype.hasOwnProperty.call(value, "isAction") &&
          Object.prototype.hasOwnProperty.call(value, "invokeAction")
        ) {
          udfType = "action";
        } else if (
          Object.prototype.hasOwnProperty.call(value, "isQuery") &&
          Object.prototype.hasOwnProperty.call(value, "invokeQuery")
        ) {
          udfType = "query";
        } else if (
          Object.prototype.hasOwnProperty.call(value, "isMutation") &&
          Object.prototype.hasOwnProperty.call(value, "invokeMutation")
        ) {
          udfType = "mutation";
        } else if (
          Object.prototype.hasOwnProperty.call(value, "isHttp") &&
          (Object.prototype.hasOwnProperty.call(value, "invokeHttpEndpoint") ||
            Object.prototype.hasOwnProperty.call(value, "invokeHttpAction"))
        ) {
          udfType = "httpAction";
        } else {
          continue;
        }
        const isPublic = Object.prototype.hasOwnProperty.call(value, "isPublic");
        const isInternal = Object.prototype.hasOwnProperty.call(
          value,
          "isInternal",
        );
    
        let args: string | null = null;
        if (
          Object.prototype.hasOwnProperty.call(value, "exportArgs") &&
          typeof (value as any).exportArgs === "function"
        ) {
          const exportedArgs = (value as any).exportArgs();
          if (typeof exportedArgs === "string") {
            args = JSON.parse(exportedArgs);
          }
        }

        let output: string | null = null;
        if (
          Object.prototype.hasOwnProperty.call(value, "exportOutput") &&
          typeof (value as any).exportOutput === "function"
        ) {
          const exportedOutput = (value as any).exportOutput();
          if (typeof exportedOutput === "string") {
            output = JSON.parse(exportedOutput);
          }
        }
    
        if (isPublic && isInternal) {
          continue;
        } else if (isPublic) {
            analyzedResults[`${modulePath}:${exportName}`] = { udfType, visibility: { kind: "public" }, args, output };
        } else if (isInternal) {
            analyzedResults[`${modulePath}:${exportName}`] = {
                udfType,
                visibility: { kind: "internal" },
                args,
                output
          }
        } else {
            analyzedResults[`${modulePath}:${exportName}`] = { udfType, visibility: null, args, output };
        }
    }
    return analyzedResults
}
