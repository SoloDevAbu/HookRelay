import { createHash, randomBytes } from "crypto";

export const hashApiKey = (apiKey: string): string => {
  return createHash("sha256").update(apiKey).digest("hex");
};

export const generateApiKey = (): string => {
  return `wh_live_${randomBytes(32).toString("hex")}`;
};
