import {describe, expect, test} from '@jest/globals';
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from './_generated/api';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', async () => {
    const t = convexTest(schema);
    const userOrNull = await t.query(api.users.getOrNull, { sessionId: "test" })
    expect(userOrNull).toBe(null);
  });
});