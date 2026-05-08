import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import type { NewUser, User } from "../schema";

/**
 * Find user by email
 * Used in login / signup duplicate check
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Find user by ID
 * Used in session validation
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Create a new user
 */
export const createUser = async (data: NewUser): Promise<User> => {
  const result = await db.insert(users).values(data).returning();

  return result[0]!;
};
