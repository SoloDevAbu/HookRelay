import { db } from "../index";
import { eq, and, gte, sql } from "drizzle-orm";
import { deliveries, endpoints } from "../schema";

export const getDeliveryStatsQuery = async (tenantId: string, startDate: Date) => {
  return db
    .select({
      status: deliveries.status,
      count: sql<number>`count(*)::int`,
    })
    .from(deliveries)
    .where(
      and(
        eq(deliveries.tenantId, tenantId),
        gte(deliveries.createdAt, startDate)
      )
    )
    .groupBy(deliveries.status);
};

export const getEndpointHealthQuery = async (endpointId: string) => {
  const endpoint = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1);
  const stats = await db
    .select({
      status: deliveries.status,
      count: sql<number>`count(*)::int`,
    })
    .from(deliveries)
    .where(eq(deliveries.endpointId, endpointId))
    .groupBy(deliveries.status);
    
  return { endpoint: endpoint[0], stats };
};

export const getThroughputMetricsQuery = async (tenantId: string, startDate: Date) => {
  return db
    .select({
      timeBucket: sql<string>`date_trunc('hour', ${deliveries.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(deliveries)
    .where(
      and(
        eq(deliveries.tenantId, tenantId),
        gte(deliveries.createdAt, startDate)
      )
    )
    .groupBy(sql`date_trunc('hour', ${deliveries.createdAt})`)
    .orderBy(sql`date_trunc('hour', ${deliveries.createdAt})`);
};
