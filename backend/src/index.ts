import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { ensureDevAdmin } from "./controllers/index.js";

await ensureDevAdmin();
const server = app.listen(env.PORT, () =>
  console.info(`ReConecta API disponível em http://localhost:${env.PORT}/api`),
);
const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
