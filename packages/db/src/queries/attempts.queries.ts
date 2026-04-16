import { db } from "../index";
import { eq } from "drizzle-orm";
import { deliveryAttempts } from "../schema";
import type { DeliveryAttempt, NewDeliveryAttempt } from "../schema";

/**
 * Insert Delivery Attempt
 */

export const insertDeliveryAttempt = async (data: NewDeliveryAttempt): Promise<DeliveryAttempt> => {
    const result = await db.insert(deliveryAttempts).values(data).returning();

    return result[0]!;
}

/**
 * Find attempts by delivery
 */

export const findAttemptsByDeliveryId = async (deliveryId: string): Promise<DeliveryAttempt[]> => {
    const result = await db
        .select()
        .from(deliveryAttempts)
        .where(eq(deliveryAttempts.deliveryId, deliveryId));

    return result;
}