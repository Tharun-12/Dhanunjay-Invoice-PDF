import { useState } from 'react';
import type { SaleForm } from '@/types';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';

interface Props {
  onSubmit: (form: SaleForm) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_ITEM = { saree_name: '', saree_code: '', quantity: '1', price: '' };

const EMPTY_FORM: SaleForm = {
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  items: [{ ...EMPTY_ITEM }],
  discount: '0',
  payment_method: 'Cash',
  payment_status: 'Paid',
  amount_paid: '0',
  notes: '',
  sale_date: new Date().toISOString().slice(0, 10),
};


function todayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const createEmptyForm = (): SaleForm => ({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  items: [{ ...EMPTY_ITEM }],
  discount: '0',
  payment_method: 'Cash',
  payment_status: 'Paid',
  amount_paid: '0',
  notes: '',
  sale_date: todayLocal(),
});

export default function SaleForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<SaleForm>(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof SaleForm, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const setItem = (i: number, field: string, value: string) =>
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: value };
      return { ...f, items };
    });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((sum, it) => {
    const qty = parseInt(it.quantity || '0', 10);
    const price = parseFloat(it.price || '0');
    return sum + (qty > 0 && price > 0 ? qty * price : 0);
  }, 0);
  const discount = parseFloat(form.discount || '0') || 0;
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.customer_name.trim()) return setError('Please enter the customer name.');
    if (!form.customer_phone.trim()) return setError('Please enter the customer WhatsApp number.');
    if (form.items.length === 0 || !form.items.some((it) => it.saree_name.trim() && parseFloat(it.price) > 0))
      return setError('Please add at least one saree with a name and price.');
    setSaving(true);
    try {
      await onSubmit(form);
      setForm(createEmptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sale.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition';
  const labelCls = 'block text-xs font-semibold text-stone-600 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-rose-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-700" /> Customer Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Customer Name *</label>
            <input className={inputCls} value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} placeholder="Lakshmi" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number *</label>
            <input className={inputCls} value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} placeholder="9876543210" inputMode="numeric" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <textarea className={inputCls} value={form.customer_address} onChange={(e) => set('customer_address', e.target.value)} placeholder="Optional delivery or home address" rows={2} />
          </div>
        </div>
      </div>

      {/* Saree items */}
      <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-700" /> Saree Items
          </h3>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition">
            <Plus size={14} /> Add Saree
          </button>
        </div>

        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-xl border border-stone-100 bg-stone-50/50 p-3">
              <div className="col-span-12 sm:col-span-4">
                <label className={labelCls}>Saree Name</label>
                <input className={inputCls} value={item.saree_name} onChange={(e) => setItem(i, 'saree_name', e.target.value)} placeholder="Kanchipuram Silk" />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className={labelCls}>Code</label>
                <input className={inputCls} value={item.saree_code} onChange={(e) => setItem(i, 'saree_code', e.target.value)} placeholder="KS-001" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className={labelCls}>Qty</label>
                <input className={inputCls} value={item.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} type="number" min="1" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className={labelCls}>Price (Rs)</label>
                <input className={inputCls} value={item.price} onChange={(e) => setItem(i, 'price', e.target.value)} type="number" min="0" step="0.01" placeholder="8500" />
              </div>
              <div className="col-span-2 sm:col-span-1 flex justify-end">
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="col-span-12 text-right text-xs text-stone-500">
                Line total: <span className="font-semibold text-stone-700">Rs. {((parseInt(item.quantity || '0', 10)) * (parseFloat(item.price || '0') || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-rose-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-700" /> Payment & Totals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Payment Method</label>
            <select className={inputCls} value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment Status</label>
            <select className={inputCls} value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)}>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Sale Date</label>
            <input type="date" className={inputCls} value={form.sale_date} onChange={(e) => set('sale_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Discount (Rs)</label>
            <input type="number" min="0" step="0.01" className={inputCls} value={form.discount} onChange={(e) => set('discount', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Amount Paid (Rs)</label>
            <input type="number" min="0" step="0.01" className={inputCls} value={form.amount_paid} onChange={(e) => set('amount_paid', e.target.value)} disabled={form.payment_status === 'Paid'} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <input className={inputCls} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full sm:w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-stone-500"><span>Discount</span><span>- Rs. {discount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-lg font-bold text-rose-900 border-t border-rose-100 pt-1.5"><span>Grand Total</span><span>Rs. {total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-sm transition disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save & Generate Receipt'}
        </button>
      </div>
    </form>
  );
}
