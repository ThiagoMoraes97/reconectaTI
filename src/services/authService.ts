import { apiRequest, clearAuthToken, getAuthToken, jsonBody, saveAuthToken } from "@/config/api";
import type { AdminUser } from "@/types";

interface AuthResponse {
  token: string;
  user: AdminUser;
}

export async function login(email: string, password: string, remember = true): Promise<AdminUser> {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: jsonBody({ email, password }),
  });
  saveAuthToken(response.token, remember);
  return response.user;
}

export async function getSession(): Promise<AdminUser | null> {
  if (!getAuthToken()) return null;
  try {
    return await apiRequest<AdminUser>("/auth/me");
  } catch {
    clearAuthToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  clearAuthToken();
}
