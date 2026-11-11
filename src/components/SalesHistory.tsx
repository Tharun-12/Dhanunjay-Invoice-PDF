import { useState } from 'react';
import type { Sale } from '@/types';
import { generateSareeInvoice } from '@/lib/pdf';
import { Download, MessageCircle, Search, Trash2, Eye, Loader2 } from 'lucide-react';

interface Props {
  sales: Sale[];
  onDelete: (id: string) => Promise<void>;
  onSelect: (sale: Sale) => void;
}

function formatCurrency(n: number): string {
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusColor(status: string): string {
  if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Partial') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

async function downloadPdf(sale: Sale): Promise<void> {
  const blob = await generateSareeInvoice(sale);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sale.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareWhatsApp(sale: Sale) {
  const phone = sale.customer_phone.replace(/\D/g, '');
  const intl = phone.length === 10 ? `91${phone}` : phone;
  const message = `Hello ${sale.customer_name}, thank you for shopping with Amma Meenakshi Saree Mandir! Your invoice ${sale.invoice_number} (Total: ${formatCurrency(sale.total)}) is attached. Please download it and share it here.`;
  window.open(`https://wa.me/${intl}?text=${encodeURIComponent(message)}`, '_blank');
}

export default function SalesHistory({ sales, onDelete, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = sales.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_phone.includes(q) ||
      s.invoice_number.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-rose-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-rose-50">
        <h3 className="text-sm font-bold text-rose-900">Sales History</h3>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, invoice..."
            className="w-full sm:w-64 rounded-lg border border-stone-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-stone-400">No sales found. Create a new sale to get started.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50/50 text-left text-xs uppercase tracking-wide text-rose-700/70">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-rose-50/30 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-rose-800">{sale.invoice_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{sale.customer_name}</p>
                    <p className="text-xs text-stone-400">{sale.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(sale.sale_date)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-900">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(sale.payment_status)}`}>{sale.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onSelect(sale)} title="Preview" className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"><Eye size={16} /></button>
                      <button onClick={() => { void downloadPdf(sale); }} title="Download PDF" className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"><Download size={16} /></button>
                      <button onClick={() => shareWhatsApp(sale)} title="Send on WhatsApp" className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><MessageCircle size={16} /></button>
                      <button onClick={() => handleDelete(sale.id)} title="Delete" disabled={busyId === sale.id} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50">
                        {busyId === sale.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
