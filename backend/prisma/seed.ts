import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const categories = ["Computadores", "Periféricos", "Audiovisual"];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@reconectati.local";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8)
    throw new Error("Configure ADMIN_PASSWORD (mínimo de 8 caracteres) no arquivo backend/.env.");
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name: process.env.ADMIN_NAME ?? "Administração",
      passwordHash: await bcrypt.hash(password, 12),
    },
    create: {
      name: process.env.ADMIN_NAME ?? "Administração",
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  const seeds = [
    {
      name: "Computadores para uso pedagógico",
      category: categories[0]!,
      description: "Equipamentos de demonstração para salas de informática.",
      reason: "Dado demonstrativo para apresentar o fluxo do projeto.",
      requestedQuantity: 8,
      priority: "HIGH" as const,
      recommendedConditions: ["Funcionando", "Com carregador e cabos"],
    },
    {
      name: "Teclados USB",
      category: categories[1]!,
      description: "Periféricos de demonstração para reposição.",
      reason: "Dado demonstrativo; confirmar necessidades com a escola.",
      requestedQuantity: 12,
      priority: "MEDIUM" as const,
      recommendedConditions: ["Conexão USB", "Teclas funcionais"],
    },
    {
      name: "Projetor multimídia",
      category: categories[2]!,
      description: "Equipamento de demonstração para atividades em sala.",
      reason: "Dado demonstrativo; não representa inventário oficial.",
      requestedQuantity: 1,
      priority: "LOW" as const,
      recommendedConditions: ["Com controle e cabos"],
    },
  ];
  for (const [index, item] of seeds.entries()) {
    const slug = `demonstracao-${index + 1}`;
    await prisma.need.upsert({
      where: { slug },
      update: {},
      create: {
        ...item,
        slug,
        status: "ACTIVE",
        demoData: true,
        recommendedConditions: JSON.stringify(item.recommendedConditions),
      },
    });
  }
  const computerNeed = await prisma.need.findUniqueOrThrow({ where: { slug: "demonstracao-1" } });
  const keyboardNeed = await prisma.need.findUniqueOrThrow({ where: { slug: "demonstracao-2" } });
  const demoDonations = [
    {
      protocol: `RCT-${new Date().getFullYear()}-90001`,
      name: "Doador demonstrativo",
      email: "doador.demo@example.invalid",
      phone: "(24) 90000-0001",
      equipment: "Computador desktop",
      category: "Computadores",
      needId: computerNeed.id,
      status: "PENDING" as const,
      quantity: 2,
      condition: "GOOD" as const,
      workingStatus: "YES" as const,
      deliveryPreference: "DELIVER" as const,
      contactPeriod: "ANY" as const,
      events: ["Intenção recebida"],
    },
    {
      protocol: `RCT-${new Date().getFullYear()}-90002`,
      name: "Organização demonstrativa",
      email: "organizacao.demo@example.invalid",
      phone: "(24) 90000-0002",
      equipment: "Teclados USB",
      category: "Periféricos",
      needId: keyboardNeed.id,
      status: "AWAITING_DELIVERY" as const,
      quantity: 3,
      acceptedQuantity: 3,
      condition: "VERY_GOOD" as const,
      workingStatus: "YES" as const,
      deliveryPreference: "PICKUP" as const,
      contactPeriod: "AFTERNOON" as const,
      events: ["Intenção recebida", "Em análise", "Aprovada", "Entrega combinada"],
    },
  ];
  for (const donation of demoDonations) {
    const donor = await prisma.donor.upsert({
      where: { email: donation.email },
      update: {},
      create: {
        name: donation.name,
        type: donation.name.startsWith("Organização") ? "ORGANIZATION" : "PERSON",
        ...(donation.name.startsWith("Organização") ? { companyName: donation.name } : {}),
        email: donation.email,
        phone: donation.phone,
      },
    });
    await prisma.donation.upsert({
      where: { protocol: donation.protocol },
      update: {},
      create: {
        protocol: donation.protocol,
        need: { connect: { id: donation.needId } },
        donor: { connect: { id: donor.id } },
        equipment: donation.equipment,
        category: donation.category,
        quantity: donation.quantity,
        ...(donation.acceptedQuantity ? { acceptedQuantity: donation.acceptedQuantity } : {}),
        condition: donation.condition,
        workingStatus: donation.workingStatus,
        deliveryPreference: donation.deliveryPreference,
        contactPeriod: donation.contactPeriod,
        status: donation.status,
        demoData: true,
        history: { create: donation.events.map((label) => ({ label })) },
      },
    });
  }
  console.info("Seed demonstrativo aplicado (não representa dados oficiais da escola).");
}

main().finally(async () => prisma.$disconnect());
