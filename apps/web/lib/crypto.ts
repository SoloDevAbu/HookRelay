import crypto from "crypto"

/**
 * Generate a secure random API key.
 * Format: hr_<32 random hex chars>
 */
export function generateApiKey(): string {
  return `wh_live_${crypto.randomBytes(32).toString("hex")}`
}

/**
 * SHA-256 hash of an API key — this is what we store in the DB.
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}
