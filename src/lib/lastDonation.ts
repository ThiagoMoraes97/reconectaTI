import type { DonationReceipt } from "@/services/donationsService";

/** Guarda a última intenção enviada para exibir na página de sucesso (mock). */
const KEY = "reconecta-ti:last-donation";

export function saveLastDonation(donation: DonationReceipt) {
  window.sessionStorage.setItem(KEY, JSON.stringify(donation));
}

export function readLastDonation(): DonationReceipt | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DonationReceipt;
  } catch {
    return null;
  }
}
