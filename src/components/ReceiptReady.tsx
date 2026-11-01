import { useEffect, useRef, useState } from 'react';
import type { Sale } from '@/types';
import { generateSareeInvoice } from '@/lib/pdf';
import { Download, MessageCircle, CheckCircle, X } from 'lucide-react';

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

export default function ReceiptReady({ sale, onClose }: Props) {
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
      // Auto-download as soon as the receipt is ready
      downloadBlob(blob, `${sale.invoice_number}.pdf`);
    });

    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [sale]);

  if (!sale) return null;

  const shareWhatsApp = () => {
    const phone = sale.customer_phone.replace(/\D/g, '');
    const intl = phone.length === 10 ? `91${phone}` : phone;
    const message = `Hello ${sale.customer_name}, thank you for shopping with Amma Meenakshi Saree Mandir! Your invoice ${sale.invoice_number} (Total: ${formatCurrency(sale.total)}) is attached. Please download it and share it here.`;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-50 mb-3">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-rose-950">Receipt Ready!</h3>
          <p className="text-sm text-stone-500 mt-1">
            Invoice <span className="font-semibold text-rose-800">{sale.invoice_number}</span> for {sale.customer_name} has been saved
            {pdfBlob ? ' and downloaded.' : '. Preparing PDF...'}
          </p>
        </div>

        <div className="px-6 pb-2">
          <div className="rounded-xl border border-stone-100 overflow-hidden bg-stone-100 h-48">
            <iframe ref={iframeRef} title="Receipt" className="w-full h-full border-0" />
          </div>
          <p className="text-xs text-stone-400 text-center mt-2 leading-relaxed">
            The PDF was downloaded automatically. Tap "WhatsApp" to open the customer's chat, then attach the PDF to send it.
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-4">
          <button
            disabled={!pdfBlob}
            onClick={() => pdfBlob && downloadBlob(pdfBlob, `${sale.invoice_number}.pdf`)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
          >
            <Download size={16} /> Download Again
          </button>
          <button onClick={shareWhatsApp} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={onClose} className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}