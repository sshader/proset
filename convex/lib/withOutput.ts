import * as ConvexHelpersZod from "convex-helpers/server/zod"
import { GenericDataModel, GenericQueryCtx, RegisteredQuery, queryGeneric } from "convex/server";
import { Infer, ObjectType, PropertyValidators, Validator, v } from "convex/values";

export const zCustomQuery: typeof ConvexHelpersZod.zCustomQuery = (query, mod) => {
    return ConvexHelpersZod.zCustomQuery((functionDef: any) => {
        console.log()
        const func = query(functionDef);
        // @ts-expect-error patch on an exportOutput function
        func.exportOutput = () => JSON.stringify((functionDef.output ?? v.any()).json)
        return func
    }, mod)
}

export const zCustomMutations: typeof ConvexHelpersZod.zCustomMutation = (mutation, mod) => {
  return ConvexHelpersZod.zCustomMutation((functionDef: any) => {
      const func = mutation(functionDef);
      // @ts-expect-error patch on an exportOutput function
      func.exportOutput = () => JSON.stringify((functionDef.output ?? v.any()).json)
      return func
  }, mod)
}

export const queryWithOutput = <DataModel extends GenericDataModel, ArgsValidator extends PropertyValidators, OutputValidator extends Validator<any, any, any>>(funcDef: {
  args: ArgsValidator,
  output: OutputValidator,
  handler: (ctx: GenericQueryCtx<DataModel>, args: ObjectType<ArgsValidator>) => Infer<OutputValidator>
}): RegisteredQuery<"public", ObjectType<ArgsValidator>, Infer<OutputValidator>>  => {
  const wrapped = queryGeneric({ args: funcDef.args, handler: funcDef.handler });
// @ts-expect-error patch on an exportOutput function
  wrapped.exportOutput = () => JSON.stringify(funcDef.output.json)
  return wrapped
}