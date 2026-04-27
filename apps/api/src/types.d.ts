import type { Tenant } from "@hookrelay/db";

declare module "fastify" {
  interface FastifyRequest {
    tenant: Tenant;
  }
}
