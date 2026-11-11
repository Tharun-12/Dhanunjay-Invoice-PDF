export interface SareeItem {
  id: string;
  saree_name: string;
  saree_code: string | null;
  quantity: number;
  price: number;
  line_total: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  notes: string | null;
  sale_date: string;
  created_at: string;
  sale_items?: SareeItem[];
}

export interface SaleForm {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: { saree_name: string; saree_code: string; quantity: string; price: string }[];
  discount: string;
  payment_method: string;
  payment_status: string;
  amount_paid: string;
  notes: string;
  sale_date: string;
}
