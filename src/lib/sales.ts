import { supabase } from '@/lib/supabase';
import type { Sale, SaleForm, SareeItem } from '@/types';

function parseItems(form: SaleForm): { items: Omit<SareeItem, 'id' | 'sale_id'>[]; subtotal: number } {
  const items: Omit<SareeItem, 'id' | 'sale_id'>[] = [];
  let subtotal = 0;
  for (const it of form.items) {
    const qty = parseInt(it.quantity || '1', 10);
    const price = parseFloat(it.price || '0');
    if (!it.saree_name.trim() || qty <= 0 || price <= 0) continue;
    const lineTotal = qty * price;
    subtotal += lineTotal;
    items.push({ saree_name: it.saree_name.trim(), saree_code: it.saree_code.trim(), quantity: qty, price, line_total: lineTotal });
  }
  return { items, subtotal };
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const { data, error } = await supabase
    .from('sales')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1);
  if (error) throw error;
  let next = 1;
  if (data && data.length > 0) {
    const m = data[0].invoice_number.match(/(\d+)$/);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export async function saveSale(form: SaleForm): Promise<Sale> {
  const { items, subtotal } = parseItems(form);
  if (items.length === 0) throw new Error('Please add at least one saree with a name, quantity and price.');

  const discount = parseFloat(form.discount || '0') || 0;
  const total = Math.max(0, subtotal - discount);
  const amountPaid = parseFloat(form.amount_paid || '0') || 0;
  const invoiceNumber = await generateInvoiceNumber();

  const saleInsert = {
    invoice_number: invoiceNumber,
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_address: form.customer_address.trim() || null,
    subtotal,
    discount,
    total,
    payment_method: form.payment_method,
    payment_status: form.payment_status,
    amount_paid: amountPaid,
    notes: form.notes.trim() || null,
    sale_date: form.sale_date,
  };

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert(saleInsert)
    .select()
    .single();
  if (saleError) throw saleError;

  const itemRows = items.map((it) => ({ ...it, sale_id: saleData.id }));
  const { data: itemData, error: itemError } = await supabase
    .from('sale_items')
    .insert(itemRows)
    .select();
  if (itemError) throw itemError;

  return { ...saleData, sale_items: itemData as SareeItem[] } as Sale;
}

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Sale[];
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw error;
}
