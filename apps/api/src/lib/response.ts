import type { FastifyReply } from "fastify";

export const sendSuccess = (
  reply: FastifyReply,
  data: unknown,
  statusCode: number,
): void => {
  reply.status(statusCode).send({
    success: true,
    data,
  });
};

export const sendError = (
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode = 400,
): void => {
  reply.status(statusCode).send({
    success: false,
    error: { code, message },
  });
};
