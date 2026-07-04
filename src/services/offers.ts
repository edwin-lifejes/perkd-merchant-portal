import { api } from "./api";
import type { Offer, OfferTemplate } from "../types";

export async function getOfferTemplates(): Promise<OfferTemplate[]> {
  const res = await api.get<{ success: boolean; data: OfferTemplate[] }>(
    "/merchant/offer-templates"
  );
  return res.data.data ?? [];
}

export async function listOffers(status?: string): Promise<Offer[]> {
  const params = status ? { status } : {};
  const res = await api.get<{ success: boolean; data: Offer[] }>("/merchant/offers", {
    params,
  });
  return res.data.data ?? [];
}

export async function getOffer(id: string): Promise<Offer> {
  const res = await api.get<{ success: boolean; data: Offer }>(
    `/merchant/offers/${id}`
  );
  return res.data.data!;
}

export async function createOffer(
  data: Partial<Offer> & { activate?: boolean }
): Promise<Offer> {
  const res = await api.post<{ success: boolean; data: Offer }>("/merchant/offers", data);
  return res.data.data!;
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  const res = await api.put<{ success: boolean; data: Offer }>(
    `/merchant/offers/${id}`,
    data
  );
  return res.data.data!;
}

export async function activateOffer(id: string): Promise<Offer> {
  const res = await api.post<{ success: boolean; data: Offer }>(
    `/merchant/offers/${id}/activate`
  );
  return res.data.data!;
}

export async function pauseOffer(id: string): Promise<Offer> {
  const res = await api.post<{ success: boolean; data: Offer }>(
    `/merchant/offers/${id}/pause`
  );
  return res.data.data!;
}

export async function deleteOffer(id: string): Promise<void> {
  await api.delete(`/merchant/offers/${id}`);
}
