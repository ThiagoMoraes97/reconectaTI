import { apiRequest, getAuthToken, jsonBody } from "@/config/api";
import type { Need, NeedInput, PublicMetrics } from "@/types";

export async function getNeeds(): Promise<Need[]> {
  return apiRequest<Need[]>("/admin/needs");
}

export async function getPublicNeeds(): Promise<Need[]> {
  return apiRequest<Need[]>("/needs");
}

export async function getNeedById(id: string): Promise<Need | null> {
  const path = getAuthToken() ? "/admin/needs" : "/needs";
  try {
    return await apiRequest<Need>(`${path}/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message === "Necessidade não encontrada.") return null;
    throw error;
  }
}

export async function createNeed(input: NeedInput): Promise<Need> {
  return apiRequest<Need>("/admin/needs", { method: "POST", body: jsonBody(input) });
}

export async function updateNeed(id: string, input: Partial<NeedInput>): Promise<Need> {
  const current = await getNeedById(id);
  if (!current) throw new Error("Necessidade não encontrada.");
  return apiRequest<Need>(`/admin/needs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: jsonBody({ ...current, ...input }),
  });
}

export async function archiveNeed(id: string): Promise<Need> {
  return apiRequest<Need>(`/admin/needs/${encodeURIComponent(id)}/archive`, { method: "POST" });
}

export async function fulfillNeed(id: string): Promise<Need> {
  const need = await getNeedById(id);
  if (!need) throw new Error("Necessidade não encontrada.");
  return updateNeed(id, { ...need, status: "fulfilled" });
}

export async function getPublicMetrics(): Promise<PublicMetrics> {
  return apiRequest<PublicMetrics>("/metrics");
}
