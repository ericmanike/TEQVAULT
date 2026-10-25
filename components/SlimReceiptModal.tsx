'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, X, CheckCircle2, ShieldCheck, Printer, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/toastProvider';
import { Spinner } from '@/components/ui/spinner';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  brand?: string;
}

export interface ReceiptOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  delivery_address?: string;
  items: ReceiptItem[];
}

interface SlimReceiptModalProps {
  order: ReceiptOrder;
  onClose: () => void;
}

export default function SlimReceiptModal({ order, onClose }: SlimReceiptModalProps) {
  const { showToast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      // Small delay to ensure clean render
      await new Promise(res => setTimeout(res, 150));

      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 3, // High-DPI crisp image export
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `TEQVAULT-Receipt-ORD-${order.id.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();

      showToast('Slim Image Receipt downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to capture receipt image:', err);
      showToast('Failed to download image receipt', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-white my-auto">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-orange-500" size={22} />
            <h3 className="text-lg font-black text-orange-500 tracking-tight">Order Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Container containing Slim Thermal Receipt */}
        <div className="flex justify-center overflow-x-auto py-2  rounded-2xl p-3 ">
          
          {/* SLIM THERMAL RECEIPT CONTAINER (Target for html-to-image) */}
          <div
            ref={receiptRef}
            className="w-[340px] bg-white text-slate-900 font-sans p-6 rounded-lg shadow-xl space-y-4 border border-slate-200 shrink-0 text-xs"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
              <h2 className="text-lg font-black tracking-wider uppercase text-slate-900">
               Official Receipt 
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 TEQVAULT 
              </p>
              <p className="text-[10px] text-slate-600 font-semibold">
                Ghana • support@teqvault.app
              </p>
            </div>

            {/* Receipt Metadata */}
            <div className="space-y-1.5 py-1 text-[11px] border-b-2 border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold uppercase">Receipt #:</span>
                <span className="font-mono font-bold text-slate-900">ORD-{order.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold uppercase">Date:</span>
                <span className="font-medium text-slate-800">{formattedDate}</span>
              </div>
              {order.user_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold uppercase">Customer:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[170px]">{order.user_name}</span>
                </div>
              )}
              {order.user_email && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold uppercase">Email:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[170px]">{order.user_email}</span>
                </div>
              )}
              
              {order.delivery_address && (
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-semibold uppercase shrink-0">Address:</span>
                  <span className="font-medium text-slate-700 text-right truncate max-w-[190px]">{order.delivery_address}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-semibold uppercase">Status:</span>
                <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                  {order.status || '???'}
                </span>
              </div>
            </div>

            {/* Purchased Items Table */}
            <div className="py-1 space-y-2 border-b-2 border-dashed border-slate-300">
              <div className="flex justify-between font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">
                <span>ITEM DESC</span>
                <span>QTY / PRICE</span>
                <span>AMT</span>
              </div>

              <div className="space-y-2 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate max-w-[180px]">{item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>{item.brand || 'Standard'}</span>
                      <span>{item.quantity} × {formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 py-1 text-[11px] border-b-2 border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Shipping Fee:</span>
                <span>GH₵0.00</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Est. Tax:</span>
                <span>GH₵0.00</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL PAID:</span>
                <span className="text-orange-600">{formatCurrency(order.total)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-400 font-medium">
            
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Spinner className="size-4 text-white" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
