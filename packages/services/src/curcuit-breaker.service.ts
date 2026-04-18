import { redis, logger } from "@hookrelay/lib";
import { config, cbKeys } from "@hookrelay/config";
import { CircuitState, CircuitStatus, CircuitStates } from "@hookrelay/config";

/**
 * Get the state of a delivery
 * @param endpointId
 */
export const getState = async (endpointId: string): Promise<CircuitStatus> => {
  const [state, failure, openedAt] = await redis.mget(
    cbKeys.state(endpointId),
    cbKeys.failures(endpointId),
    cbKeys.openedAt(endpointId),
  );

  const failureCount = parseInt(failure ?? "0", 10);
  const currentState = (state as CircuitState) ?? "CLOSED";

  if (currentState === "OPEN" && openedAt) {
    const openedAtMs = parseInt(openedAt, 10);
    const elapsed = Date.now() - openedAtMs;
    const cooldownRemainingMs = config.circuitBreakerCooldownMs - elapsed;

    if (cooldownRemainingMs <= 0) {
      await redis.set(cbKeys.state(endpointId), CircuitStates.HALF_OPEN);
      logger.info({ endpointId }, "Circuit breaker transitioned to HALF-OPEN");

      return {
        state: "HALF-OPEN",
        failures: failureCount,
        cooldownRemainingMs: null,
      };
    }

    return {
      state: "OPEN",
      failures: failureCount,
      cooldownRemainingMs,
    };
  }

  return {
    state: currentState,
    failures: failureCount,
    cooldownRemainingMs: null,
  };
};

/**
 * Record success of a delivery
 * @param endpointId
 */
export const recordSuccess = async (endpointId: string): Promise<void> => {
  await redis.del(
    cbKeys.state(endpointId),
    cbKeys.failures(endpointId),
    cbKeys.openedAt(endpointId),
  );

  logger.info({ endpointId }, "Circuit breaker reset after success");
};

/**
 * Record failure of a delivery
 * - increment failure count
 * - if count crosses threashold -> open the circuit
 * - if clready half-open and failed -> re-open immediately
 * @param endpointId
 */
export const recordFailure = async (endpointId: string): Promise<void> => {
  const pipeline = redis.pipeline();

  pipeline.incr(cbKeys.failures(endpointId));
  pipeline.get(cbKeys.state(endpointId));

  const results = await pipeline.exec();

  const newFailureCount = results?.[0]?.[1] as number;
  const currentState = results?.[1]?.[1] as CircuitState;

  const shouldOpen =
    newFailureCount >= config.circuitBreakerThreshold ||
    currentState === "HALF-OPEN";

  if (shouldOpen) {
    const openPipeline = redis.pipeline();
    const cooldownTtlSeconds = Math.ceil(
      config.circuitBreakerCooldownMs / 1000,
    );

    openPipeline.set(cbKeys.state(endpointId), cooldownTtlSeconds * 10);
    openPipeline.set(cbKeys.openedAt(endpointId), Date.now().toString());

    // TTL on state and openedAt so Redis self-cleans
    // even if no delivery ever hits this endpoint again
    openPipeline.expire(cbKeys.state(endpointId), cooldownTtlSeconds * 10);
    openPipeline.expire(cbKeys.openedAt(endpointId), cooldownTtlSeconds * 10);

    await openPipeline.exec();

    logger.warn({ endpointId, newFailureCount }, "Circuit breaker opened");
  } else {
    logger.debug(
      { endpointId, newFailureCount },
      "Circuit breaker failure recorded",
    );
  }
};

/**
 * Admin force reset
 * @param endpointId
 * Called by admin when a tenant wants to manually force-reset a degraded endpoint
 */
export const reset = async (endpointId: string): Promise<void> => {
  await redis.del(
    cbKeys.state(endpointId),
    cbKeys.failures(endpointId),
    cbKeys.openedAt(endpointId),
  );
};
