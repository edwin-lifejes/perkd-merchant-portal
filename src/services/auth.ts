import axios from "axios";
import type { AuthTokens, RegisterPayload, RegisterResponse } from "../types";
import { setTokens, clearTokens, getRefreshToken } from "./api";

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3233";

export async function getAuthConfig(): Promise<{ tokenUrl: string; clientId: string }> {
  const res = await axios.get<{ tokenUrl: string; clientId: string }>(
    `${BASE_URL}/auth-config`
  );
  return res.data;
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthTokens> {
  const { tokenUrl, clientId } = await getAuthConfig();

  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", clientId);
  params.append("username", email);
  params.append("password", password);

  const res = await axios.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const tokens: AuthTokens = {
    accessToken: res.data.access_token,
    refreshToken: res.data.refresh_token,
    expiresIn: res.data.expires_in,
  };

  setTokens(tokens);
  return tokens;
}

export async function registerMerchant(
  data: Partial<RegisterPayload>
): Promise<RegisterResponse> {
  const res = await axios.post<{ success: boolean; data: RegisterResponse }>(
    `${BASE_URL}/merchant/register`,
    data
  );
  const result = res.data.data!;
  setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
  });
  return result;
}

export async function saveDraft(
  data: Partial<RegisterPayload>,
  id?: string
): Promise<{ id: string }> {
  const url = id
    ? `${BASE_URL}/merchant/register/draft/${id}`
    : `${BASE_URL}/merchant/register/draft`;
  const method = "put";
  const res = await axios[method]<{ success: boolean; data: { id: string } }>(url, data);
  return res.data.data!;
}

export async function getDraft(id: string): Promise<Partial<RegisterPayload>> {
  const res = await axios.get<{ success: boolean; data: Partial<RegisterPayload> }>(
    `${BASE_URL}/merchant/register/draft/${id}`
  );
  return res.data.data!;
}

export async function refreshAuthTokens(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const { tokenUrl, clientId } = await getAuthConfig();

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);

  const res = await axios.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const tokens: AuthTokens = {
    accessToken: res.data.access_token,
    refreshToken: res.data.refresh_token,
    expiresIn: res.data.expires_in,
  };

  setTokens(tokens);
  return tokens;
}

export function logout(): void {
  clearTokens();
}
