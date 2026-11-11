import type { Sale, SaleForm } from '@/types';

const API_URL = import.meta.env.API_URL as string;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check that the backend is running.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const fetchSales = () => request<Sale[]>('/sales');

export const saveSale = (form: SaleForm) =>
  request<Sale>('/sales', { method: 'POST', body: JSON.stringify(form) });

export const deleteSale = (id: string) =>
  request<void>(`/sales/${encodeURIComponent(id)}`, { method: 'DELETE' });