export type CircuitState = "CLOSED" | "OPEN" | "HALF-OPEN";
export enum CircuitStates {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF-OPEN",
}

export interface CircuitStatus {
  state: CircuitState;
  failures: number;
  cooldownRemainingMs: number | null;
}
