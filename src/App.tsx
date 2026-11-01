import { useCallback, useEffect, useState } from 'react';
import type { Sale } from '@/types';
import { fetchSales, saveSale, deleteSale } from '@/lib/sales';
import Dashboard from '@/components/Dashboard';
import SaleForm from '@/components/SaleForm';
import SalesHistory from '@/components/SalesHistory';
import ReceiptPreview from '@/components/ReceiptPreview';
import ReceiptReady from '@/components/ReceiptReady';
import { Plus, LayoutDashboard, ScrollText, Loader2, AlertCircle } from 'lucide-react';

type View = 'dashboard' | 'new';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSale, setPreviewSale] = useState<Sale | null>(null);
  const [readySale, setReadySale] = useState<Sale | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSales();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (form: Parameters<typeof saveSale>[0]) => {
    const sale = await saveSale(form);
    await load();
    setView('dashboard');
    setReadySale(sale);
  };

  const handleDelete = async (id: string) => {
    await deleteSale(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/60 via-stone-50 to-amber-50/40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-rose-700 to-rose-950 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              A
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-rose-950 leading-tight truncate">Amma Meenakshi Saree Mandir</h1>
              <p className="text-xs text-stone-400 leading-tight truncate">Billing & WhatsApp Receipts</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setView('dashboard')}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition ${view === 'dashboard' ? 'text-rose-800 bg-rose-50' : 'text-stone-500 hover:text-rose-700 hover:bg-rose-50/50'}`}
            >
              <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setView('new')}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition ${view === 'new' ? 'text-rose-800 bg-rose-50' : 'text-stone-500 hover:text-rose-700 hover:bg-rose-50/50'}`}
            >
              <Plus size={16} /> <span className="hidden sm:inline">New Sale</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {view === 'new' ? (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-rose-950">New Sale</h2>
              <p className="text-sm text-stone-500">Enter the customer and saree details from the in-store sale.</p>
            </div>
            <SaleForm onSubmit={handleSave} onCancel={() => setView('dashboard')} />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                <Dashboard sales={sales} />
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <ScrollText size={16} className="text-rose-700" />
                    <h2 className="text-base font-bold text-rose-950">Recent Sales</h2>
                  </div>
                  <SalesHistory sales={sales} onDelete={handleDelete} onSelect={setPreviewSale} />
                </div>
              </>
            )}
          </>
        )}
      </main>

      <ReceiptPreview sale={previewSale} onClose={() => setPreviewSale(null)} />
      <ReceiptReady sale={readySale} onClose={() => setReadySale(null)} />
    </div>
  );
}