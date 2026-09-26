import type { Donation, Need } from "@/types";
import { mockNeeds } from "./mockNeeds";
import { mockDonations } from "./mockDonations";

/**
 * Store em memória que simula a persistência do futuro backend.
 * Quando a API REST existir, esta camada desaparece e os services
 * passam a fazer fetch diretamente.
 */
export const db = {
  needs: mockNeeds.map((need) => ({ ...need })) as Need[],
  donations: mockDonations.map((donation) => ({ ...donation })) as Donation[],
};

export function nextProtocol(): string {
  const numbers = db.donations
    .map((donation) => Number(donation.protocol.split("-")[2]))
    .filter((value) => !Number.isNaN(value));
  const next = Math.max(0, ...numbers) + 1;
  return `RCT-2026-${String(next).padStart(5, "0")}`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
