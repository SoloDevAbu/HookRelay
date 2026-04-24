import {
  getDeliveryStatsQuery,
  getEndpointHealthQuery,
  getThroughputMetricsQuery,
} from "@hookrelay/db";

const parseDateRange = (dateRange: string): Date => {
  const now = new Date();
  if (dateRange === "24h") {
    now.setHours(now.getHours() - 24);
  } else if (dateRange === "7d") {
    now.setDate(now.getDate() - 7);
  } else if (dateRange === "30d") {
    now.setDate(now.getDate() - 30);
  } else {
    // Default 24h
    now.setHours(now.getHours() - 24);
  }
  return now;
};

export const getDeliveryStats = async (tenantId: string, dateRange: string) => {
  const startDate = parseDateRange(dateRange);
  return getDeliveryStatsQuery(tenantId, startDate);
};

export const getEndpointHealth = async (endpointId: string) => {
  return getEndpointHealthQuery(endpointId);
};

export const getThroughputMetrics = async (tenantId: string) => {
  const startDate = parseDateRange("24h");
  return getThroughputMetricsQuery(tenantId, startDate);
};
