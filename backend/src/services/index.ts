import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  Prisma,
  type ContactPeriod,
  type DeliveryPreference,
  type DonationCondition,
  type DonationStatus,
  type NeedPriority,
  type NeedStatus,
  type WorkingStatus,
} from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { donationRepository, needRepository } from "../repositories/index.js";
import { AppError } from "../utils/errors.js";
import { createProtocol } from "../utils/protocol.js";
import { serializeDonation, serializeNeed, serializePublicDonation } from "../utils/serializers.js";
import { donationInclude } from "../utils/serializers.js";
import type { DonationInput, NeedInput } from "../schemas/index.js";
import { canTransition } from "../utils/donation-rules.js";

const up = (value: string) => value.toUpperCase();
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const authService = {
  async login(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash)))
      throw new AppError(401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    const token = jwt.sign({ role: admin.role }, env.JWT_SECRET, {
      subject: admin.id,
      expiresIn: env.JWT_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>,
    });
    return {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "ADMIN",
        organization: "Escola Municipal Francisco Costa",
      },
    };
  },
  async me(id: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!admin) throw new AppError(401, "UNAUTHENTICATED", "Sessão inválida.");
    return { ...admin, organization: "Escola Municipal Francisco Costa" };
  },
};

export const needService = {
  async listPublic(query: Record<string, string | undefined>) {
    const where: Prisma.NeedWhereInput = { status: { in: ["ACTIVE", "FULFILLED"] } };
    if (query.category) where.category = query.category;
    if (query.priority) where.priority = up(query.priority) as NeedPriority;
    if (query.status && ["active", "fulfilled"].includes(query.status)) {
      where.status = up(query.status) as NeedStatus;
    }
    if (query.search)
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    const needs = await needRepository.list(where);
    const sort = query.sort;
    if (sort === "name") needs.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "recent") needs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sort === "priority")
      needs.sort(
        (a, b) =>
          ["HIGH", "MEDIUM", "LOW"].indexOf(a.priority) -
          ["HIGH", "MEDIUM", "LOW"].indexOf(b.priority),
      );
    return needs.map(serializeNeed);
  },
  async listAdmin() {
    return (await needRepository.list()).map(serializeNeed);
  },
  async get(id: string, publicOnly = true) {
    const need = await needRepository.find(id);
    if (!need || (publicOnly && !["ACTIVE", "FULFILLED"].includes(need.status)))
      throw new AppError(404, "NOT_FOUND", "Necessidade não encontrada.");
    return serializeNeed(need);
  },
  async save(input: NeedInput, id?: string) {
    if (input.receivedQuantity > input.requestedQuantity)
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "A quantidade recebida não pode superar a quantidade solicitada.",
      );
    const data = {
      name: input.name,
      slug: `${slugify(input.name)}-${id ?? Date.now().toString(36)}`,
      category: input.category,
      description: input.description,
      reason: input.reason,
      requestedQuantity: input.requestedQuantity,
      receivedQuantity: input.receivedQuantity,
      priority: up(input.priority) as NeedPriority,
      status: (input.status === "archived"
        ? "ARCHIVED"
        : input.receivedQuantity >= input.requestedQuantity
          ? "FULFILLED"
          : up(input.status)) as NeedStatus,
      recommendedConditions: JSON.stringify(input.recommendedConditions),
    };
    const existing = id ? await needRepository.find(id) : null;
    if (id && !existing) throw new AppError(404, "NOT_FOUND", "Necessidade não encontrada.");
    const need = id
      ? await needRepository.update(id, { ...data, slug: `${slugify(input.name)}-${id}` })
      : await needRepository.create(data);
    return serializeNeed(need);
  },
  async archive(id: string) {
    const need = await needRepository.find(id);
    if (!need) throw new AppError(404, "NOT_FOUND", "Necessidade não encontrada.");
    return serializeNeed(await needRepository.update(id, { status: "ARCHIVED" }));
  },
};

export const donationService = {
  async create(input: DonationInput) {
    if (input.needId) {
      const need = await needRepository.find(input.needId);
      if (!need || !["ACTIVE", "FULFILLED"].includes(need.status))
        throw new AppError(400, "INVALID_NEED", "A necessidade selecionada não está disponível.");
    }
    return prisma.$transaction(async (tx) => {
      const sequence =
        (await tx.donation.count({
          where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
        })) + 1;
      const protocol = createProtocol(new Date().getFullYear(), sequence);
      const donation = await tx.donation.create({
        data: {
          protocol,
          ...(input.needId ? { need: { connect: { id: input.needId } } } : {}),
          equipment: input.equipment,
          category: input.category,
          quantity: input.quantity,
          brand: input.brand || null,
          model: input.model || null,
          approximateYear: input.approximateYear || null,
          condition: up(input.condition) as DonationCondition,
          workingStatus: up(input.workingStatus) as WorkingStatus,
          notes: input.notes || null,
          deliveryPreference: up(input.deliveryPreference) as DeliveryPreference,
          contactPeriod: up(input.contactPeriod) as ContactPeriod,
          donor: {
            create: {
              name: input.donor.name,
              type: input.donor.type === "individual" ? "PERSON" : "ORGANIZATION",
              companyName: input.donor.companyName || null,
              email: input.donor.email.toLowerCase(),
              phone: input.donor.phone,
            },
          },
          history: { create: { label: "Intenção recebida" } },
        },
        include: donationInclude,
      });
      return {
        protocol: donation.protocol,
        equipment: donation.equipment,
        quantity: donation.quantity,
        status: donation.status.toLowerCase(),
      };
    });
  },
  async list() {
    return (await donationRepository.list()).map(serializeDonation);
  },
  async get(id: string) {
    const donation = await donationRepository.find(id);
    if (!donation) throw new AppError(404, "NOT_FOUND", "Doação não encontrada.");
    return serializeDonation(donation);
  },
  async byProtocol(protocol: string) {
    const donation = await donationRepository.byProtocol(protocol.trim().toUpperCase());
    if (!donation) throw new AppError(404, "NOT_FOUND", "Protocolo não encontrado.");
    return serializePublicDonation(donation);
  },
  async transition(id: string, next: string) {
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({ where: { id } });
      if (!donation) throw new AppError(404, "NOT_FOUND", "Doação não encontrada.");
      const status = up(next) as DonationStatus;
      if (!canTransition(donation.status, status))
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Não é possível alterar ${donation.status.toLowerCase()} para ${next}.`,
        );
      const labels: Record<DonationStatus, string> = {
        PENDING: "Intenção recebida",
        REVIEWING: "Em análise",
        APPROVED: "Aprovada",
        AWAITING_DELIVERY: "Entrega combinada",
        COMPLETED: "Concluída",
        REJECTED: "Recusada",
      };
      const updated = await tx.donation.update({
        where: { id },
        data: { status, history: { create: { label: labels[status] } } },
        include: donationInclude,
      });
      return serializeDonation(updated);
    });
  },
  async approve(id: string, acceptedQuantity: number, internalNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({ where: { id } });
      if (!donation) throw new AppError(404, "NOT_FOUND", "Doação não encontrada.");
      if (!["PENDING", "REVIEWING"].includes(donation.status))
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          "Somente intenções pendentes ou em análise podem ser aprovadas.",
        );
      if (acceptedQuantity > donation.quantity)
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "A quantidade aceita não pode superar a quantidade informada.",
        );
      await tx.donation.update({
        where: { id },
        data: {
          status: "APPROVED",
          acceptedQuantity,
          ...(internalNotes !== undefined ? { internalNotes } : {}),
          history: { create: { label: "Aprovada" } },
        },
      });
      return serializeDonation(
        await tx.donation.findUniqueOrThrow({ where: { id }, include: donationInclude }),
      );
    });
  },
  async reject(id: string, rejectionReason: string, internalNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({ where: { id } });
      if (!donation) throw new AppError(404, "NOT_FOUND", "Doação não encontrada.");
      if (!["PENDING", "REVIEWING"].includes(donation.status))
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          "Somente intenções pendentes ou em análise podem ser recusadas.",
        );
      await tx.donation.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason,
          ...(internalNotes !== undefined ? { internalNotes } : {}),
          history: { create: { label: "Recusada" } },
        },
      });
      return serializeDonation(
        await tx.donation.findUniqueOrThrow({ where: { id }, include: donationInclude }),
      );
    });
  },
  async complete(id: string, receivedQuantity: number, internalNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({ where: { id }, include: { need: true } });
      if (!donation) throw new AppError(404, "NOT_FOUND", "Doação não encontrada.");
      if (donation.status !== "AWAITING_DELIVERY")
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          "A doação precisa estar aguardando entrega para ser concluída.",
        );
      const maximum = donation.acceptedQuantity ?? donation.quantity;
      if (receivedQuantity > maximum)
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "A quantidade recebida não pode superar a quantidade aceita.",
        );
      if (donation.need) {
        const total = donation.need.receivedQuantity + receivedQuantity;
        await tx.need.update({
          where: { id: donation.need.id },
          data: {
            receivedQuantity: total,
            ...(total >= donation.need.requestedQuantity ? { status: "FULFILLED" } : {}),
          },
        });
      }
      await tx.donation.update({
        where: { id },
        data: {
          status: "COMPLETED",
          receivedQuantity,
          ...(internalNotes !== undefined ? { internalNotes } : {}),
          history: { create: { label: "Concluída" } },
        },
      });
      return serializeDonation(
        await tx.donation.findUniqueOrThrow({ where: { id }, include: donationInclude }),
      );
    });
  },
  async saveNotes(id: string, internalNotes: string) {
    await this.get(id);
    await prisma.donation.update({ where: { id }, data: { internalNotes } });
    return this.get(id);
  },
};

export const dashboardService = {
  async get() {
    const [needs, donations, receivedItems] = await Promise.all([
      prisma.need.findMany(),
      prisma.donation.findMany({
        include: { donor: true, history: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.need.aggregate({ _sum: { receivedQuantity: true } }),
    ]);
    const monthly = new Map<string, number>();
    const categories = new Map<string, number>();
    const statuses = new Map<string, number>();
    donations.forEach((d) => {
      const month = d.createdAt.toLocaleDateString("pt-BR", { month: "short" });
      monthly.set(month, (monthly.get(month) ?? 0) + 1);
      categories.set(d.category, (categories.get(d.category) ?? 0) + d.quantity);
      statuses.set(d.status.toLowerCase(), (statuses.get(d.status.toLowerCase()) ?? 0) + 1);
    });
    return {
      activeNeeds: needs.filter((n) => n.status === "ACTIVE").length,
      pendingDonations: donations.filter((d) => ["PENDING", "REVIEWING"].includes(d.status)).length,
      approvedDonations: donations.filter((d) =>
        ["APPROVED", "AWAITING_DELIVERY", "COMPLETED"].includes(d.status),
      ).length,
      receivedItems: receivedItems._sum.receivedQuantity ?? 0,
      fulfilledNeeds: needs.filter((n) => n.status === "FULFILLED").length,
      monthlyDonations: [...monthly].map(([month, total]) => ({ month, total })),
      donationsByCategory: [...categories].map(([category, total]) => ({ category, total })),
      donationsByStatus: [...statuses].map(([status, total]) => ({ status, total })),
      recentActivity: donations.slice(0, 5).map((d) => ({
        id: d.id,
        label: d.history[0]?.label ?? "Atualização",
        description: `${d.protocol} • ${d.equipment} (${d.donor.name})`,
        date: d.updatedAt.toISOString(),
      })),
    };
  },
};

export const reportService = {
  async get() {
    return {
      dashboard: await dashboardService.get(),
      needs: await needService.listAdmin(),
      generatedAt: new Date().toISOString(),
    };
  },
};
