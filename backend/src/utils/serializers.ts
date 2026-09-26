import type { Donation, Need, Prisma } from "@prisma/client";

export const donationInclude = {
  donor: true,
  history: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.DonationInclude;
type DonationWithDetails = Prisma.DonationGetPayload<{ include: typeof donationInclude }>;
type DonationWithHistory = Prisma.DonationGetPayload<{
  include: { history: { orderBy: { createdAt: "asc" } } };
}>;

const lc = (value: string) => value.toLowerCase();
const date = (value: Date) => value.toISOString();
export function serializeNeed(need: Need) {
  return {
    id: need.id,
    name: need.name,
    slug: need.slug,
    category: need.category,
    description: need.description,
    reason: need.reason,
    requestedQuantity: need.requestedQuantity,
    receivedQuantity: need.receivedQuantity,
    priority: lc(need.priority),
    status: lc(need.status),
    recommendedConditions: JSON.parse(need.recommendedConditions) as string[],
    createdAt: date(need.createdAt),
    updatedAt: date(need.updatedAt),
    demoData: need.demoData,
  };
}

export function serializeDonation(donation: DonationWithDetails) {
  return {
    id: donation.id,
    protocol: donation.protocol,
    needId: donation.needId ?? undefined,
    donor: {
      name: donation.donor.name,
      type: donation.donor.type === "PERSON" ? "individual" : "company",
      ...(donation.donor.companyName ? { companyName: donation.donor.companyName } : {}),
      email: donation.donor.email,
      phone: donation.donor.phone,
    },
    equipment: donation.equipment,
    category: donation.category,
    quantity: donation.quantity,
    ...(donation.brand ? { brand: donation.brand } : {}),
    ...(donation.model ? { model: donation.model } : {}),
    ...(donation.approximateYear ? { approximateYear: donation.approximateYear } : {}),
    condition: lc(donation.condition),
    workingStatus: lc(donation.workingStatus),
    ...(donation.notes ? { notes: donation.notes } : {}),
    deliveryPreference: lc(donation.deliveryPreference),
    contactPeriod: lc(donation.contactPeriod),
    status: lc(donation.status),
    ...(donation.internalNotes ? { internalNotes: donation.internalNotes } : {}),
    ...(donation.rejectionReason ? { rejectionReason: donation.rejectionReason } : {}),
    ...(donation.acceptedQuantity !== null ? { approvedQuantity: donation.acceptedQuantity } : {}),
    ...(donation.receivedQuantity !== null ? { receivedQuantity: donation.receivedQuantity } : {}),
    history: donation.history.map((event) => ({
      label: event.label,
      date: date(event.createdAt),
      ...(event.note ? { note: event.note } : {}),
    })),
    createdAt: date(donation.createdAt),
    updatedAt: date(donation.updatedAt),
    demoData: donation.demoData,
  };
}

export function serializePublicDonation(donation: DonationWithHistory) {
  return {
    protocol: donation.protocol,
    equipment: donation.equipment,
    category: donation.category,
    quantity: donation.quantity,
    status: lc(donation.status),
    ...(donation.acceptedQuantity !== null ? { acceptedQuantity: donation.acceptedQuantity } : {}),
    ...(donation.receivedQuantity !== null ? { receivedQuantity: donation.receivedQuantity } : {}),
    history: donation.history.map(({ label, createdAt }) => ({ label, date: date(createdAt) })),
    createdAt: date(donation.createdAt),
    updatedAt: date(donation.updatedAt),
  };
}
