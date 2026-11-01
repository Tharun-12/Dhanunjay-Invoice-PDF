import { useMemo } from 'react';
import type { Sale } from '@/types';
import { TrendingUp, Users, ShoppingBag, Calendar, MapPin, Phone } from 'lucide-react';

interface Props {
  sales: Sale[];
}

const SHOP = {
  name: 'Amma Meenakshi Saree Mandir',
  tagline: 'Traditional Sarees  |  Pure Elegance  |  Timeless Beauty',
  since: 'Since 1995',
  categories: 'Kanchipuram Silk  •  Dharmavaram Silk  •  Pattu & Fancy  •  Wholesale & Retail',
  address: 'Mythri Amogha Apartment, Electronic City Phase 1, Bangalore',
  phoneLabel: 'Sadhu',
  phone: '6300080805',
  motto: 'Grace in Every Thread...',
};

function formatCurrency(n: number): string {
  return 'Rs. ' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Dashboard({ sales }: Props) {
  const stats = useMemo(() => {
    const total = sales.reduce((s, x) => s + Number(x.total), 0);
    // Local date (YYYY-MM-DD), so "today" is correct in India time
    const today = new Date().toLocaleDateString('en-CA');
    const todaySales = sales.filter((s) => s.sale_date === today);
    const todayTotal = todaySales.reduce((s, x) => s + Number(x.total), 0);
    const customers = new Set(sales.map((s) => s.customer_phone)).size;
    const itemsSold = sales.reduce(
      (s, x) => s + (x.sale_items?.reduce((a, it) => a + it.quantity, 0) ?? 0),
      0,
    );
    return { total, todayTotal, customers, itemsSold, todayCount: todaySales.length, count: sales.length };
  }, [sales]);

  const cards = [
    {
      label: 'Total Sales',
      value: formatCurrency(stats.total),
      sub: `${stats.count} invoices`,
      icon: TrendingUp,
      accent: 'from-rose-700 to-rose-900',
    },
    {
      label: "Today's Sales",
      value: formatCurrency(stats.todayTotal),
      sub: `${stats.todayCount} invoices today`,
      icon: Calendar,
      accent: 'from-amber-500 to-amber-700',
    },
    {
      label: 'Customers',
      value: String(stats.customers),
      sub: 'unique customers',
      icon: Users,
      accent: 'from-teal-600 to-teal-800',
    },
    {
      label: 'Sarees Sold',
      value: String(stats.itemsSold),
      sub: 'total sarees',
      icon: ShoppingBag,
      accent: 'from-rose-500 to-rose-700',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Shop banner */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-900 to-rose-950 text-white shadow-sm border-b-4 border-amber-500 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{SHOP.name}</h2>
            <p className="text-sm text-rose-100 mt-1">{SHOP.tagline}</p>
            <p className="text-xs text-amber-300 mt-1">{SHOP.categories}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block text-xs font-semibold text-amber-300 border border-amber-400/60 rounded-full px-3 py-1">
              {SHOP.since}
            </span>
            <p className="text-xs italic text-rose-200 mt-2">{SHOP.motto}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-rose-100">
          <span className="inline-flex items-center gap-2">
            <MapPin size={15} className="text-amber-300 shrink-0" /> {SHOP.address}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone size={15} className="text-amber-300 shrink-0" /> {SHOP.phoneLabel}: {SHOP.phone}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-2xl bg-white border border-rose-100 shadow-sm p-5"
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.accent} opacity-10`} />
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${c.accent} text-white mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-rose-950">{c.value}</p>
              <p className="text-sm text-rose-700/70 font-medium">{c.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{c.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}