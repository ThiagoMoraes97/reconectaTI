/**
 * Modelos de domínio do ReConecta TI.
 * Estes tipos representam o contrato esperado da futura API REST em Node.js.
 */

export type NeedCategory = "Computadores" | "Periféricos" | "Audiovisual" | "Rede" | "Outros";

export const NEED_CATEGORIES: NeedCategory[] = [
  "Computadores",
  "Periféricos",
  "Audiovisual",
  "Rede",
  "Outros",
];

export type NeedPriority = "low" | "medium" | "high";
export type NeedStatus = "draft" | "active" | "fulfilled" | "archived";

export interface Need {
  id: string;
  name: string;
  slug: string;
  category: NeedCategory;
  description: string;
  reason: string;
  requestedQuantity: number;
  receivedQuantity: number;
  priority: NeedPriority;
  status: NeedStatus;
  recommendedConditions: string[];
  demoData?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DonorType = "individual" | "company";

export interface Donor {
  name: string;
  type: DonorType;
  companyName?: string | undefined;
  email: string;
  phone: string;
}

export type DonationCondition = "new" | "very_good" | "good" | "needs_repair" | "unknown";

export type WorkingStatus = "yes" | "partially" | "no" | "unknown";

export type DeliveryPreference = "deliver" | "pickup" | "talk_first";
export type ContactPeriod = "morning" | "afternoon" | "any";

export type DonationStatus =
  "pending" | "reviewing" | "approved" | "awaiting_delivery" | "completed" | "rejected";

export interface DonationEvent {
  label: string;
  date: string;
  note?: string | undefined;
}

export interface Donation {
  id: string;
  protocol: string;
  needId?: string | undefined;
  donor: Donor;
  equipment: string;
  category: NeedCategory;
  quantity: number;
  brand?: string | undefined;
  model?: string | undefined;
  approximateYear?: string | undefined;
  condition: DonationCondition;
  workingStatus: WorkingStatus;
  notes?: string | undefined;
  deliveryPreference: DeliveryPreference;
  contactPeriod: ContactPeriod;
  status: DonationStatus;
  internalNotes?: string | undefined;
  rejectionReason?: string | undefined;
  approvedQuantity?: number | undefined;
  receivedQuantity?: number | undefined;
  history: DonationEvent[];
  createdAt: string;
  updatedAt: string;
  demoData?: boolean;
}

export interface DashboardMetrics {
  activeNeeds: number;
  pendingDonations: number;
  approvedDonations: number;
  receivedItems: number;
  fulfilledNeeds: number;
  monthlyDonations: { month: string; total: number }[];
  donationsByCategory: { category: string; total: number }[];
  donationsByStatus: { status: string; total: number }[];
  recentActivity: { id: string; label: string; description: string; date: string }[];
}

export interface PublicMetrics {
  neededEquipments: number;
  donationsReceived: number;
  fulfilledNeeds: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

export type NewDonationInput = Omit<
  Donation,
  "id" | "protocol" | "status" | "history" | "createdAt" | "updatedAt"
>;

export type NeedInput = Omit<Need, "id" | "slug" | "createdAt" | "updatedAt">;
