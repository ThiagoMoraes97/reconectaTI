import { apiRequest } from "@/config/api";
import type { DashboardMetrics } from "@/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiRequest<DashboardMetrics>("/admin/dashboard");
}
