'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CircleStar, Calendar, Clock, Download, RefreshCw, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user_id?: string | null;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  delivery_address?: string;
  items: OrderItem[];
  isLocal?: boolean;
}

import SlimReceiptModal, { ReceiptOrder } from '@/components/SlimReceiptModal';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<ReceiptOrder | null>(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    let databaseOrders: Order[] = [];

    // Fetch directly from Supabase orders database
    try {
      let query = supabase.from('orders').select(`
        *,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            brand,
            product_images (
              image_url
            )
          )
        )
      `).order('created_at', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        databaseOrders = data.map((row: any) => ({
          id: String(row.id),
          created_at: row.created_at || new Date().toISOString(),
          total: Number(row.total) || 0,
          status: row.status || 'Paid',
          user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
          user_email: user?.email,
          items: (row.order_items || []).map((item: any) => ({
            id: item.id,
            name: item.products?.name || 'Gadget Product',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            brand: item.products?.brand || 'TEQVAULT',
            image: item.products?.product_images?.[0]?.image_url || ''
          }))
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch orders exception:', e);
    }

    setOrders(databaseOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if ( s.includes('delivered') || s.includes('success')) {
      return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
    }
    if (s.includes('paid')  || s.includes('shipped') || s.includes('processing')) {
      return { label: 'Processing & Shipping', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck };
    }
    if (s.includes('cancel')) {
      return { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle };
    }
    return { label: 'Order Confirmed', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
  };

  return (
    <div className="bg-slate-50 rounded-2xl shadow-lg min-h-[90vh]  overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">Track your purchases and view order history</p>
        </div>
        <button
          onClick={fetchCustomerOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-orange-500' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Content Feed */}
      <div className="p-4 md:p-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-orange-500 mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-orange-100">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">You have no orders yet!</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-6 max-w-sm leading-relaxed">
              All your placed orders and receipts will appear here so you can track delivery progress.
            </p>
            <Link href="/shop">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer">
                Start Shopping Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={order.id}
                  className="border border-slate-200 rounded-2xl p-4 md:p-5 hover:border-slate-400 transition-all bg-white shadow-lg  flex flex-col gap-4"
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                        <CircleStar size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs md:text-sm font-bold text-slate-900">
                            Order #{order.id.slice(-8)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-xs text-slate-500 mt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                        <StatusIcon size={13} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Itemized summary */}
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs md:text-sm py-1">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                              📦
                            </div>
                          )}
                          <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                          <span className="text-slate-500 font-medium">× {item.quantity}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0 ml-2">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-slate-400 font-medium italic">+ {order.items.length - 3} more items...</p>
                    )}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 md:-mx-5 md:-mb-5 p-4 rounded-b-2xl">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Total Amount</span>
                      <span className="text-base md:text-lg font-black text-slate-900">{formatCurrency(order.total)}</span>
                    </div>
                    <button
                      onClick={() => setReceiptModalOrder(order as ReceiptOrder)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Download Receipt</span>
                             <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slim Receipt Modal */}
      {receiptModalOrder && (
        <SlimReceiptModal
          order={receiptModalOrder}
          onClose={() => setReceiptModalOrder(null)}
        />
      )}
    </div>
  );
}
