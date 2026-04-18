export const FANOUT_QUEUE_NAME = "fanout-queue";
export const FANOUT_WORKER_NAME = "fanout-worker";
export const DLQ_NAME = "dlq";

export const cbKeys = {
  state: (endpointId: string) => `cb:${endpointId}:state`,
  failures: (endpointId: string) => `cb:${endpointId}:failures`,
  openedAt: (endpointId: string) => `cb:${endpointId}:opened_at`,
};
