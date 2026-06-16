import { eq } from "drizzle-orm";
import { db } from "../connection";
import { users } from "../schema/users";

export const findUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
};

export const findUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
};

export const createUser = async (data: typeof users.$inferInsert) => {
  const result = await db.insert(users).values(data).returning();
  return result[0];
};

export const updateUser = async (id: string, data: Partial<typeof users.$inferInsert>) => {
  const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return result[0];
};
