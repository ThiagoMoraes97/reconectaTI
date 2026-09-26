import assert from "node:assert/strict";
import { after, test } from "node:test";
import { DonationStatus } from "@prisma/client";
import { prisma } from "../src/config/prisma.js";
import { donationService } from "../src/services/index.js";
import { needSchema } from "../src/schemas/index.js";
import { canTransition } from "../src/utils/donation-rules.js";
import { createProtocol } from "../src/utils/protocol.js";

test("creates a readable sequential donation protocol", () => {
  assert.equal(createProtocol(2026, 7), "RCT-2026-00007");
  assert.equal(createProtocol(2026, 123456), "RCT-2026-123456");
});

test("allows only the expected donation status transitions", () => {
  assert.equal(canTransition(DonationStatus.PENDING, DonationStatus.REVIEWING), true);
  assert.equal(canTransition(DonationStatus.PENDING, DonationStatus.REJECTED), true);
  assert.equal(canTransition(DonationStatus.COMPLETED, DonationStatus.APPROVED), false);
  assert.equal(canTransition(DonationStatus.REJECTED, DonationStatus.REVIEWING), false);
});

test("rejects non-positive requested quantities and negative received quantities", () => {
  const base = {
    name: "Computador",
    category: "Computadores",
    description: "Teste",
    reason: "Teste",
    requestedQuantity: 1,
    receivedQuantity: 0,
    priority: "medium",
    status: "active",
    recommendedConditions: [],
  };
  assert.equal(needSchema.safeParse({ ...base, requestedQuantity: 0 }).success, false);
  assert.equal(needSchema.safeParse({ ...base, receivedQuantity: -1 }).success, false);
});

test("completing a donation updates its need once and rejects duplicate completion", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const need = await prisma.need.create({
    data: {
      name: "Necessidade de teste",
      slug: `teste-${suffix}`,
      category: "Computadores",
      description: "Teste",
      reason: "Teste",
      requestedQuantity: 2,
      receivedQuantity: 0,
      priority: "MEDIUM",
      status: "ACTIVE",
      recommendedConditions: "[]",
    },
  });
  const donor = await prisma.donor.create({
    data: {
      name: "Doador de teste",
      type: "PERSON",
      email: `teste-${suffix}@example.invalid`,
      phone: "2400000000",
    },
  });
  const donation = await prisma.donation.create({
    data: {
      protocol: `RCT-${new Date().getFullYear()}-T${suffix.replaceAll("-", "").slice(0, 16)}`,
      needId: need.id,
      donorId: donor.id,
      equipment: "Notebook",
      category: "Computadores",
      quantity: 2,
      acceptedQuantity: 2,
      condition: "GOOD",
      workingStatus: "YES",
      deliveryPreference: "DELIVER",
      contactPeriod: "ANY",
      status: "AWAITING_DELIVERY",
    },
  });
  try {
    await donationService.complete(donation.id, 2);
    const updatedNeed = await prisma.need.findUniqueOrThrow({ where: { id: need.id } });
    const updatedDonation = await prisma.donation.findUniqueOrThrow({ where: { id: donation.id } });
    assert.equal(updatedNeed.receivedQuantity, 2);
    assert.equal(updatedNeed.status, "FULFILLED");
    assert.equal(updatedDonation.receivedQuantity, 2);
    await assert.rejects(() => donationService.complete(donation.id, 2), {
      code: "INVALID_TRANSITION",
    });
    const afterRetry = await prisma.need.findUniqueOrThrow({ where: { id: need.id } });
    assert.equal(afterRetry.receivedQuantity, 2);
  } finally {
    await prisma.donation.delete({ where: { id: donation.id } });
    await prisma.donor.delete({ where: { id: donor.id } });
    await prisma.need.delete({ where: { id: need.id } });
  }
});

after(async () => {
  await prisma.$disconnect();
});
