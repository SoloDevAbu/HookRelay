import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { logger } from "@hookrelay/lib";

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  logger.error(
    { err: error, method: request.method, url: request.url },
    "Unhandled request error",
  );

  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
      },
    });

    return;
  }

  reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "AN enexpected error occured",
    },
  });
};
