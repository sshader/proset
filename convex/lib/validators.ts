import { Validator, v } from 'convex/values'
import { Doc, TableNames } from '../_generated/dataModel'
import schema from '../schema'

export const betterV = {
  id: <T extends TableNames>(tableName: T) => {
    return v.id(tableName)
  },
  doc: <T extends TableNames>(tableName: T): Validator<Doc<T>, false, any> => {
    const validator = v.object(
      (schema.tables[tableName] as any).documentSchema
    ) as Validator<any, any, any>
    if (validator?.kind !== 'object') {
      throw new Error(`Not an object validator`)
    }
    return v.object({
      ...validator.fields,
      _id: v.id(tableName),
      _creationTime: v.number(),
    })
  },
  mergeObjects: <
    O1 extends Record<string, any>,
    O2 extends Record<string, any>
  >(
    validator1: Validator<O1, false, any>,
    validator2: Validator<O2, false, any>
  ): Validator<Omit<O1, keyof O2> & O2, false, any> => {
    if (validator1.kind !== 'object' || validator2.kind !== 'object') {
      throw new Error('Not object validators')
    }
    return v.object({
      ...validator1.fields,
      ...validator2.fields,
    }) as any
  },
}
