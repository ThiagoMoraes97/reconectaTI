import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errors.js";
import { router } from "./routes/index.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    credentials: false,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);
