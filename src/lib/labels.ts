import type {
  ContactPeriod,
  DeliveryPreference,
  DonationCondition,
  DonationStatus,
  DonorType,
  NeedPriority,
  NeedStatus,
  WorkingStatus,
} from "@/types";

export function donationStatusLabel(status: DonationStatus): string {
  const map: Record<DonationStatus, string> = {
    pending: "Pendente",
    reviewing: "Em análise",
    approved: "Aprovada",
    awaiting_delivery: "Aguardando entrega",
    completed: "Concluída",
    rejected: "Recusada",
  };
  return map[status];
}

export function needStatusLabel(status: NeedStatus): string {
  const map: Record<NeedStatus, string> = {
    draft: "Rascunho",
    active: "Ativa",
    fulfilled: "Atendida",
    archived: "Arquivada",
  };
  return map[status];
}

export function priorityLabel(priority: NeedPriority): string {
  const map: Record<NeedPriority, string> = {
    low: "Prioridade baixa",
    medium: "Prioridade média",
    high: "Prioridade alta",
  };
  return map[priority];
}

export function conditionLabel(condition: DonationCondition): string {
  const map: Record<DonationCondition, string> = {
    new: "Novo",
    very_good: "Muito bom",
    good: "Bom",
    needs_repair: "Necessita pequenos reparos",
    unknown: "Não sei informar",
  };
  return map[condition];
}

export function workingStatusLabel(status: WorkingStatus): string {
  const map: Record<WorkingStatus, string> = {
    yes: "Sim",
    partially: "Parcialmente",
    no: "Não",
    unknown: "Não sei informar",
  };
  return map[status];
}

export function deliveryLabel(preference: DeliveryPreference): string {
  const map: Record<DeliveryPreference, string> = {
    deliver: "Levarei até a instituição",
    pickup: "Preciso combinar retirada",
    talk_first: "Quero conversar com a escola antes",
  };
  return map[preference];
}

export function contactPeriodLabel(period: ContactPeriod): string {
  const map: Record<ContactPeriod, string> = {
    morning: "Manhã",
    afternoon: "Tarde",
    any: "Indiferente",
  };
  return map[period];
}

export function donorTypeLabel(type: DonorType): string {
  return type === "company" ? "Empresa / organização" : "Pessoa física";
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function progressOf(received: number, requested: number): number {
  if (requested <= 0) return 0;
  return Math.min(100, Math.round((received / requested) * 100));
}
