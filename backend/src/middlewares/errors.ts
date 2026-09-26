import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export const notFound: RequestHandler = (_req, _res, next) =>
  next(new AppError(404, "NOT_FOUND", "Rota não encontrada."));
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }
  const parserStatus =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;
  const status =
    error instanceof AppError
      ? error.status
      : parserStatus === 413
        ? 413
        : parserStatus === 400
          ? 400
          : 500;
  const code =
    error instanceof AppError
      ? error.code
      : status === 400 || status === 413
        ? "VALIDATION_ERROR"
        : "INTERNAL_ERROR";
  const message =
    error instanceof AppError
      ? error.message
      : status === 413
        ? "A requisição excede o limite permitido."
        : status === 400
          ? "Dados inválidos."
          : "Ocorreu um erro inesperado.";
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(error instanceof AppError && error.details ? { details: error.details } : {}),
    },
  });
};
