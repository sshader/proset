import { entDefinitions } from "./schema";
import { scheduledDeleteFactory } from "convex-ents";
export const scheduledDelete = scheduledDeleteFactory(entDefinitions);