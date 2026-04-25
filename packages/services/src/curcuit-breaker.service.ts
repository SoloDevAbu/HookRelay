import { redis, logger } from "@hookrelay/lib";
import { config } from "@hookrelay/config";

export type CircuitState = "CLOSED" | "OPEN" | "HALF-OPEN";

export interface CircuitStatus {
  allowed: boolean;
  state: CircuitState;
}

// REDIS KEY HELPERS
const cbKeys = {
  state: (endpointId: string) => `cb:${endpointId}:state`,
  failures: (endpointId: string) => `cb:${endpointId}:failures`,
  openedAt: (endpointId: string) => `cb:${endpointId}:opened_at`,
  halfOpenLock: (endpointId: string) => `cb:${endpointId}:half_open_lock`,
};

const getTtlSeconds = () =>
  Math.ceil((config.circuitBreakerCooldownMs / 1000) * 10);

// /**
//  * Get the state of a delivery
//  * @param endpointId
//  */
// export const getState = async (endpointId: string): Promise<CircuitStatus> => {
//   const [state, failure, openedAt] = await redis.mget(
//     cbKeys.state(endpointId),
//     cbKeys.failures(endpointId),
//     cbKeys.openedAt(endpointId),
//   );

//   const failureCount = parseInt(failure ?? "0", 10);
//   const currentState = (state as CircuitState) ?? "CLOSED";

//   if (currentState === "OPEN" && openedAt) {
//     const openedAtMs = parseInt(openedAt, 10);
//     const elapsed = Date.now() - openedAtMs;
//     const cooldownRemainingMs = config.circuitBreakerCooldownMs - elapsed;

//     if (cooldownRemainingMs <= 0) {
//       await redis.set(cbKeys.state(endpointId), CircuitStates.HALF_OPEN);
//       logger.info({ endpointId }, "Circuit breaker transitioned to HALF-OPEN");

//       return {
//         state: "HALF-OPEN",
//         failures: failureCount,
//         cooldownRemainingMs: null,
//       };
//     }

//     return {
//       state: "OPEN",
//       failures: failureCount,
//       cooldownRemainingMs,
//     };
//   }

//   return {
//     state: currentState,
//     failures: failureCount,
//     cooldownRemainingMs: null,
//   };
// };

/**
 * Should allow a request based on the circuit state
 * @param endpointId
 * @returns CircuitStatus
 */
export const shouldAllowRequest = async (
  endpointId: string,
): Promise<CircuitStatus> => {
  const [state, openedAt] = await redis.mget(
    cbKeys.state(endpointId),
    cbKeys.openedAt(endpointId),
  );

  const currentState = (state as CircuitState) ?? "CLOSED";

  //CLOSED- healthy, always allow
  if (currentState === "CLOSED") {
    return { allowed: true, state: "CLOSED" };
  }

  //OPEN- check if cooldown has passed
  if (currentState === "OPEN") {
    if (!openedAt) {
      return { allowed: false, state: "OPEN" };
    }

    const elapsed = Date.now() - Number(openedAt);

    if (elapsed >= config.circuitBreakerCooldownMs) {
      //Cooldown passed- try to acuire hald-open lock
      const ttl = getTtlSeconds();

      const lock = await redis.set(
        cbKeys.halfOpenLock(endpointId),
        "1",
        "EX",
        ttl,
        "NX",
      );

      if (lock === "OK") {
        await redis.set(cbKeys.state(endpointId), "HALF-OPEN");
        logger.info(
          { endpointId },
          "Circuit breaker transitioned to HALF-OPEN",
        );
        return { allowed: true, state: "HALF-OPEN" };
      }

      //Another worker already holds the lock
      return { allowed: false, state: "OPEN" };
    }

    return { allowed: false, state: "OPEN" };
  }

  if (currentState === "HALF-OPEN") {
    const lockExists = await redis.exists(cbKeys.halfOpenLock(endpointId));

    return {
      allowed: lockExists === 1,
      state: "HALF-OPEN",
    };
  }

  return { allowed: true, state: "CLOSED" };
};

const failureLuaScript = `
local failuresKey = KEYS[1]
local stateKey = KEYS[2]
local openedAtKey = KEYS[3]
local threshold = tonumber(ARGV[1])
local now = ARGV[2]
local ttl = tonumber(ARGV[3])

local failures = redis.call("INCR", failuresKey)
local state = redis.call("GET", stateKey) or "CLOSED"

--threshold crossed OR test request failed in halfOpen -> open circuit

if failures >= threshold or state == "HALF-OPEN" then
 redis.call("SET", stateKey, "OPEN", "EX", ttl)
 redis.call("SET", openedAtKey, now, "EX", ttl)
 redis.call("EXPIRE", failuresKey, ttl)
 return { failures, "OPEN"}
end

redis.call("EXPIRE", failuresKey, ttl)
return { failures, state }
`;
/**
 * Record failure of a delivery
 * @param endpointId
 */
export const recordFailure = async (endpointId: string): Promise<void> => {
  const ttl = getTtlSeconds();

  const result = (await redis.eval(
    failureLuaScript,
    3,
    cbKeys.failures(endpointId),
    cbKeys.state(endpointId),
    cbKeys.openedAt(endpointId),
    config.circuitBreakerThreshold,
    Date.now().toString(),
    ttl,
  )) as [number, string];

  const [newFailureCount, newState] = result;

  if (newState === "OPEN") {
    logger.warn({ endpointId, newFailureCount }, "Circuit breaker opened");
  } else {
    logger.debug(
      { endpointId, newFailureCount },
      "Circuit breaker failure recorded",
    );
  }
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
    cbKeys.halfOpenLock(endpointId),
  );

  logger.info({ endpointId }, "Circuit breaker reset after success");
};

// /**
//  * Record failure of a delivery
//  * - increment failure count
//  * - if count crosses threashold -> open the circuit
//  * - if clready half-open and failed -> re-open immediately
//  * @param endpointId
//  */
// export const recordFailure = async (endpointId: string): Promise<void> => {
//   const pipeline = redis.pipeline();

//   pipeline.incr(cbKeys.failures(endpointId));
//   pipeline.get(cbKeys.state(endpointId));

//   const results = await pipeline.exec();

//   const newFailureCount = results?.[0]?.[1] as number;
//   const currentState = results?.[1]?.[1] as CircuitState;

//   const shouldOpen =
//     newFailureCount >= config.circuitBreakerThreshold ||
//     currentState === "HALF-OPEN";

//   if (shouldOpen) {
//     const openPipeline = redis.pipeline();
//     const cooldownTtlSeconds = Math.ceil(
//       config.circuitBreakerCooldownMs / 1000,
//     );

//     openPipeline.set(cbKeys.state(endpointId), cooldownTtlSeconds * 10);
//     openPipeline.set(cbKeys.openedAt(endpointId), Date.now().toString());

//     // TTL on state and openedAt so Redis self-cleans
//     // even if no delivery ever hits this endpoint again
//     openPipeline.expire(cbKeys.state(endpointId), cooldownTtlSeconds * 10);
//     openPipeline.expire(cbKeys.openedAt(endpointId), cooldownTtlSeconds * 10);

//     await openPipeline.exec();

//     logger.warn({ endpointId, newFailureCount }, "Circuit breaker opened");
//   } else {
//     logger.debug(
//       { endpointId, newFailureCount },
//       "Circuit breaker failure recorded",
//     );
//   }
// };

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
    cbKeys.halfOpenLock(endpointId),
  );
};
