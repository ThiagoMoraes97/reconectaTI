import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z.string().default("file:./dev.db"),
  CORS_ORIGIN: z
    .string()
    .default(
      "http://localhost:3000,http://localhost:3002,http://localhost:5173,http://localhost:8080,http://localhost:8081",
    ),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  ADMIN_NAME: z.string().default("Administração"),
  ADMIN_EMAIL: z.string().email().default("admin@reconectati.local"),
  ADMIN_PASSWORD: z.string().min(8),
});

export const env = schema.parse(process.env);
