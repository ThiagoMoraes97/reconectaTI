import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import {
  authService,
  dashboardService,
  donationService,
  needService,
  reportService,
} from "../services/index.js";
import { AppError } from "../utils/errors.js";
import { publicNeedFilterSchema } from "../schemas/index.js";

export const success = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });
export const health = async (_req: Request, res: Response) =>
  success(res, { status: "ok", timestamp: new Date().toISOString() });
export async function ensureDevAdmin() {
  if (env.NODE_ENV !== "development") return;
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await prisma.adminUser.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: { name: env.ADMIN_NAME, passwordHash },
    create: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });
}

export const login = async (req: Request, res: Response) =>
  success(res, await authService.login(req.body.email, req.body.password));
const routeParam = (req: Request, key: string) => req.params[key] as string;
export const me = async (req: Request, res: Response) =>
  success(res, await authService.me(req.admin!.id));
export const publicNeeds = async (req: Request, res: Response) =>
  success(res, await needService.listPublic(publicNeedFilterSchema.parse(req.query)));
export const adminNeeds = async (_req: Request, res: Response) =>
  success(res, await needService.listAdmin());
export const getNeed = async (req: Request, res: Response) =>
  success(res, await needService.get(routeParam(req, "id"), !req.baseUrl.includes("admin")));
export const createNeed = async (req: Request, res: Response) =>
  success(res, await needService.save(req.body), 201);
export const updateNeed = async (req: Request, res: Response) =>
  success(res, await needService.save(req.body, routeParam(req, "id")));
export const archiveNeed = async (req: Request, res: Response) =>
  success(res, await needService.archive(routeParam(req, "id")));
export const createDonation = async (req: Request, res: Response) =>
  success(res, await donationService.create(req.body), 201);
export const publicDonation = async (req: Request, res: Response) =>
  success(res, await donationService.byProtocol(routeParam(req, "protocol")));
export const adminDonations = async (_req: Request, res: Response) =>
  success(res, await donationService.list());
export const getDonation = async (req: Request, res: Response) =>
  success(res, await donationService.get(routeParam(req, "id")));
export const statusDonation = async (req: Request, res: Response) =>
  success(res, await donationService.transition(routeParam(req, "id"), req.body.status));
export const approveDonation = async (req: Request, res: Response) =>
  success(
    res,
    await donationService.approve(
      routeParam(req, "id"),
      req.body.acceptedQuantity,
      req.body.internalNotes,
    ),
  );
export const rejectDonation = async (req: Request, res: Response) =>
  success(
    res,
    await donationService.reject(
      routeParam(req, "id"),
      req.body.rejectionReason,
      req.body.internalNotes,
    ),
  );
export const completeDonation = async (req: Request, res: Response) =>
  success(
    res,
    await donationService.complete(
      routeParam(req, "id"),
      req.body.receivedQuantity,
      req.body.internalNotes,
    ),
  );
export const saveDonationNotes = async (req: Request, res: Response) =>
  success(res, await donationService.saveNotes(routeParam(req, "id"), req.body.internalNotes));
export const dashboard = async (_req: Request, res: Response) =>
  success(res, await dashboardService.get());
export const reports = async (_req: Request, res: Response) =>
  success(res, await reportService.get());
export const publicMetrics = async (_req: Request, res: Response) => {
  const [activeNeeds, fulfilledNeeds, donationsReceived] = await Promise.all([
    prisma.need.aggregate({
      where: { status: "ACTIVE" },
      _sum: { requestedQuantity: true, receivedQuantity: true },
    }),
    prisma.need.count({ where: { status: "FULFILLED" } }),
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { receivedQuantity: true },
    }),
  ]);
  return success(res, {
    neededEquipments: Math.max(
      0,
      (activeNeeds._sum.requestedQuantity ?? 0) - (activeNeeds._sum.receivedQuantity ?? 0),
    ),
    donationsReceived: donationsReceived._sum.receivedQuantity ?? 0,
    fulfilledNeeds,
  });
};

export const noPublicAdminRegistration = async () => {
  throw new AppError(404, "NOT_FOUND", "Rota não encontrada.");
};
