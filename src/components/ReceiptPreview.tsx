import { useEffect, useRef, useState } from 'react';
import type { Sale } from '@/types';
import { generateSareeInvoice } from '@/lib/pdf';
import { X, Download, MessageCircle } from 'lucide-react';

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

function formatCurrency(n: number): string {
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function shareWhatsApp(sale: Sale) {
  const phone = sale.customer_phone.replace(/\D/g, '');
  const intl = phone.length === 10 ? `91${phone}` : phone;
  const message = `Hello ${sale.customer_name}, thank you for shopping with Amma Meenakshi Saree Mandir! Your invoice ${sale.invoice_number} (Total: ${formatCurrency(sale.total)}) is attached. Please download it and share it here.`;
  window.open(`https://wa.me/${intl}?text=${encodeURIComponent(message)}`, '_blank');
}

export default function ReceiptPreview({ sale, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | null = null;
    setPdfBlob(null);
    if (!sale) return;

    generateSareeInvoice(sale).then((blob) => {
      if (cancelled) return;
      setPdfBlob(blob);
      previewUrl = URL.createObjectURL(blob);
      if (iframeRef.current) iframeRef.current.src = previewUrl;
    });

    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [sale]);

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-rose-900">Receipt Preview</h3>
            <p className="text-xs text-stone-400">{sale.invoice_number} — {sale.customer_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-stone-100">
          <iframe ref={iframeRef} title="Receipt preview" className="w-full h-full min-h-[60vh] border-0" />
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-stone-100">
          <button
            disabled={!pdfBlob}
            onClick={() => pdfBlob && downloadBlob(pdfBlob, `${sale.invoice_number}.pdf`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
          >
            <Download size={16} /> Download PDF
          </button>
          <button
            onClick={() => shareWhatsApp(sale)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            <MessageCircle size={16} /> Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}