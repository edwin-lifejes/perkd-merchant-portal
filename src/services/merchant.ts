import { api } from "./api";
import type { DashboardData, MerchantBusiness, ProfileProgress } from "../types";

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<{ success: boolean; data: DashboardData }>(
    "/merchant/dashboard"
  );
  return res.data.data!;
}

export async function getProfile(): Promise<MerchantBusiness> {
  const res = await api.get<{ success: boolean; data: MerchantBusiness }>(
    "/merchant/profile"
  );
  return res.data.data!;
}

export async function updateLogo(logoUrl: string): Promise<void> {
  await api.put("/merchant/profile/logo", { logoUrl });
}

export async function updateDescription(description: string): Promise<void> {
  await api.put("/merchant/profile/description", { description });
}

export async function updateCoordinates(lat: number, lng: number): Promise<void> {
  await api.put("/merchant/profile/coordinates", { lat, lng });
}

export async function skipStep(step: string): Promise<ProfileProgress> {
  const res = await api.post<{ success: boolean; data: ProfileProgress }>(`/merchant/profile/progress/skip`, { step });
  return res.data.data!;
}

export async function getProgress(): Promise<ProfileProgress> {
  const res = await api.get<{ success: boolean; data: ProfileProgress }>(
    "/merchant/profile/progress"
  );
  return res.data.data!;
}

export async function getProvinces(): Promise<Array<{ code: string; name: string }>> {
  const res = await api.get<{ success: boolean; data: Array<{ code: string; name: string }> }>(
    "/reference/provinces"
  );
  return res.data.data ?? [];
}

export async function getCategories(): Promise<Array<{ value: string; label: string }>> {
  const res = await api.get<{ success: boolean; data: Array<{ value: string; label: string }> }>(
    "/allCategories"
  );
  return res.data.data ?? [];
}
