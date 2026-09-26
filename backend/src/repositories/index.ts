import { prisma } from "../config/prisma.js";
import { donationInclude } from "../utils/serializers.js";

export { donationInclude };

export const needRepository = {
  list: (where: object = {}) =>
    prisma.need.findMany({ where, orderBy: [{ priority: "desc" }, { createdAt: "desc" }] }),
  find: (id: string) => prisma.need.findFirst({ where: { OR: [{ id }, { slug: id }] } }),
  create: (data: import("@prisma/client").Prisma.NeedCreateInput) => prisma.need.create({ data }),
  update: (id: string, data: import("@prisma/client").Prisma.NeedUpdateInput) =>
    prisma.need.update({ where: { id }, data }),
};

export const donationRepository = {
  list: (where: object = {}) =>
    prisma.donation.findMany({ where, include: donationInclude, orderBy: { createdAt: "desc" } }),
  find: (id: string) => prisma.donation.findUnique({ where: { id }, include: donationInclude }),
  byProtocol: (protocol: string) =>
    prisma.donation.findUnique({
      where: { protocol },
      include: { history: { orderBy: { createdAt: "asc" } } },
    }),
};
