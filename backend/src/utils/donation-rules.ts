import type { DonationStatus } from "@prisma/client";

const transitions: Record<DonationStatus, readonly DonationStatus[]> = {
  PENDING: ["REVIEWING", "REJECTED"],
  REVIEWING: ["APPROVED", "REJECTED"],
  APPROVED: ["AWAITING_DELIVERY"],
  AWAITING_DELIVERY: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
};

export function canTransition(from: DonationStatus, to: DonationStatus): boolean {
  return transitions[from].includes(to);
}
