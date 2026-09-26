import { apiRequest, jsonBody } from "@/config/api";
import type { Donation, DonationStatus, NewDonationInput } from "@/types";

export interface PublicDonation {
  protocol: string;
  equipment: string;
  category: Donation["category"];
  quantity: number;
  status: DonationStatus;
  acceptedQuantity?: number;
  receivedQuantity?: number;
  history: Donation["history"];
  createdAt: string;
  updatedAt: string;
}

export interface DonationReceipt {
  protocol: string;
  equipment: string;
  quantity: number;
  status: DonationStatus;
}

const byId = (id: string) => `/admin/donations/${encodeURIComponent(id)}`;

export async function getDonations(): Promise<Donation[]> {
  return apiRequest<Donation[]>("/admin/donations");
}

export async function getDonationById(id: string): Promise<Donation | null> {
  try {
    return await apiRequest<Donation>(byId(id));
  } catch (error) {
    if (error instanceof Error && error.message === "Doação não encontrada.") return null;
    throw error;
  }
}

export async function getDonationByProtocol(protocol: string): Promise<PublicDonation | null> {
  try {
    return await apiRequest<PublicDonation>(
      `/donations/protocol/${encodeURIComponent(protocol.trim())}`,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Protocolo não encontrado.") return null;
    throw error;
  }
}

export async function getDonationsByNeed(needId: string): Promise<Donation[]> {
  return (await getDonations()).filter((donation) => donation.needId === needId);
}

export async function createDonation(input: NewDonationInput): Promise<DonationReceipt> {
  return apiRequest<DonationReceipt>("/donations", { method: "POST", body: jsonBody(input) });
}

export async function approveDonation(
  id: string,
  approvedQuantity: number,
  note?: string,
): Promise<Donation> {
  return apiRequest<Donation>(`${byId(id)}/approve`, {
    method: "POST",
    body: jsonBody({
      acceptedQuantity: approvedQuantity,
      ...(note ? { internalNotes: note } : {}),
    }),
  });
}

export async function rejectDonation(
  id: string,
  rejectionReason: string,
  note?: string,
): Promise<Donation> {
  return apiRequest<Donation>(`${byId(id)}/reject`, {
    method: "POST",
    body: jsonBody({ rejectionReason, ...(note ? { internalNotes: note } : {}) }),
  });
}

export async function updateDonationStatus(id: string, status: DonationStatus): Promise<Donation> {
  return apiRequest<Donation>(`${byId(id)}/status`, {
    method: "PATCH",
    body: jsonBody({ status }),
  });
}

export async function registerReception(
  id: string,
  receivedQuantity: number,
  note?: string,
): Promise<Donation> {
  const donation = await getDonationById(id);
  if (!donation) throw new Error("Doação não encontrada.");
  if (donation.status === "approved") await updateDonationStatus(id, "awaiting_delivery");
  return apiRequest<Donation>(`${byId(id)}/complete`, {
    method: "POST",
    body: jsonBody({ receivedQuantity, ...(note ? { internalNotes: note } : {}) }),
  });
}

export async function saveInternalNotes(id: string, internalNotes: string): Promise<Donation> {
  return apiRequest<Donation>(`${byId(id)}/notes`, {
    method: "PATCH",
    body: jsonBody({ internalNotes }),
  });
}
