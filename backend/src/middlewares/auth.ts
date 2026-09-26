import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = (req.header("authorization") ?? "").split(" ");
  if (scheme !== "Bearer" || !token)
    return next(new AppError(401, "UNAUTHENTICATED", "Entre para acessar esta área."));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || payload.role !== "ADMIN" || !payload.sub)
      throw new Error("invalid token");
    req.admin = {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      role: "ADMIN",
    };
    next();
  } catch {
    next(new AppError(401, "UNAUTHENTICATED", "Sua sessão expirou. Entre novamente."));
  }
}
