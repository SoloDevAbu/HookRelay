import {
  findEventById,
  batchInsertDeliveries,
  findEndpointsByTenantIdAndEventType,
} from "@hookrelay/db";
import { getDeliveryQueue } from "@hookrelay/queue";
import { logger } from "@hookrelay/lib";
import type { Endpoint } from "@hookrelay/db";

export interface FanoutInput {
  eventId: string;
  tenantId: string;
}

export interface FanoutResult {
  deliveriesCreated: number;
  skipped: boolean;
}

/**
 * Build delivery jobs
 */
export const buildDeliveryJobs = (
  eventId: string,
  tenantId: string,
  deliveryIds: string[],
  endpoints: Endpoint[],
) => {
  return endpoints.map((endpoint, index) => {
    const deliveryId = deliveryIds[index];
    if (!deliveryId) {
      logger.error({ eventId, tenantId, deliveryId }, "Delivery ID not found");
      throw new Error(`Missing deliveryId for endpoint ${endpoint.id}`);
    }

    return {
      name: "deliver",
      data: {
        deliveryId,
        endpointId: endpoint.id,
        eventId,
        tenantId,
      },
      opts: {
        jobId: `${eventId}:${endpoint.id}`,
      },
    };
  });
};

/**
 * Fanout event
 * - fetch event from DB
 * - resolve matching active endpoint for tenant + event type
 * - if no endpoint - skip
 * - batch insert ove delivery row per endpoint
 * - bulk enqueue one delivery job per endpoint
 */

export const fanoutEvent = async (
  input: FanoutInput,
): Promise<FanoutResult> => {
  const { eventId, tenantId } = input;

  const childLogger = logger.child({ eventId, tenantId });

  const event = await findEventById(eventId);

  if (!event) {
    childLogger.error("Event not found during fanout");
    return { deliveriesCreated: 0, skipped: true };
  }

  const endpoints = await findEndpointsByTenantIdAndEventType({
    tenantId,
    eventType: event.eventType,
  });

  if (endpoints.length === 0) {
    childLogger.info("No matching endpoints for event, skipping fanout");
    return {
      deliveriesCreated: 0,
      skipped: true,
    };
  }

  childLogger.info(
    { endpointCount: endpoints.length },
    "Resolved matching endpoints",
  );

  const deliveries = await batchInsertDeliveries(
    endpoints.map((endpoint) => ({
      eventId,
      endpointId: endpoint.id,
      tenantId,
    })),
  );
  childLogger.info(
    { deliveryCount: deliveries.length },
    "Delivery rows created",
  );

  const deliveryQueue = getDeliveryQueue(tenantId);
  const jobs = buildDeliveryJobs(
    eventId,
    tenantId,
    deliveries.map((d) => d.id),
    endpoints,
  );

  await deliveryQueue.addBulk(jobs);

  childLogger.info({ jobCount: jobs.length }, "Delivery jobs enqueued");

  return {
    deliveriesCreated: deliveries.length,
    skipped: false,
  };
};
