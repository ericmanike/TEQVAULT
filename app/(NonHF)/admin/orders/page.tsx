'use client';

import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, Search, Filter, CheckCircle, 
  Clock, Truck, AlertCircle, RefreshCw, Eye, ChevronRight, Sparkles,
  User, Mail, Phone, Calendar, DollarSign, ShoppingBag, X, TrendingUp, MapPin
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/toastProvider';
import { formatCurrency } from '@/lib/utils';
import SlimReceiptModal, { ReceiptOrder } from '@/components/SlimReceiptModal';

interface ProductImage {
  image_url: string;
}

interface Product {
  name: string;
  brand: string;
  product_images: ProductImage[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: Product;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user_id: string;
  delivery_address?: string;
  phone_number?: string;
  users: UserProfile | null;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Selection / Detail Panel
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<ReceiptOrder | null>(null);

  // Lookups & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetching function
  async function loadOrders() {
    try {
      setLoading(true);
      let allOrdersList: Order[] = [];

      // Query directly from Supabase DB (Orders & Users)
      try {
        const [ordersRes, usersRes] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              *,
              users (
                id,
                name,
                email,
                phone
              ),
              order_items (
                id,
                quantity,
                price,
                products (
                  name,
                  brand,
                  product_images (
                    image_url
                  )
                )
              )
            `)
            .order('created_at', { ascending: false }),
          supabase.from('users').select('id, name, email, phone')
        ]);

        const userMap: Record<string, any> = {};
        if (usersRes.data) {
          usersRes.data.forEach((u: any) => {
            if (u.id) userMap[u.id] = u;
          });
        }

        if (!ordersRes.error && ordersRes.data && ordersRes.data.length > 0) {
          allOrdersList = ordersRes.data.map((row: any) => {
            const userObj = row.users || (row.user_id ? userMap[row.user_id] : null);
            const userName = userObj?.name || userObj?.full_name || (userObj?.email ? userObj.email.split('@')[0] : (row.user_id ? `Customer (${String(row.user_id).slice(0, 8)})` : 'Guest Customer'));
            const userEmail = userObj?.email || (row.user_id ? `user-${String(row.user_id).slice(0, 8)}@teqvault.app` : 'Guest Checkout');
            const userPhone = row.phone_number || userObj?.phone || userObj?.phone_number || 'N/A';

            return {
              id: String(row.id),
              created_at: row.created_at,
              total: Number(row.total) || 0,
              status: row.status || 'Paid',
              user_id: row.user_id || '',
              delivery_address: row.delivery_address || row.delivery_addreess || undefined,
              phone_number: row.phone_number || undefined,
              users: {
                name: userName,
                email: userEmail,
                phone: userPhone
              },
              order_items: (row.order_items || []).map((item: any) => ({
                id: String(item.id),
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                products: item.products ? {
                  name: item.products.name || 'Gadget Item',
                  brand: item.products.brand || 'Generic',
                  product_images: item.products.product_images || []
                } : {
                  name: 'Gadget Item',
                  brand: 'Generic',
                  product_images: []
                }
              }))
            };
          });
        }
      } catch (dbErr) {
        console.warn('Failed to query database orders:', dbErr);
      }

      setOrders(allOrdersList);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Update Status handler
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const orderToUpdate = orders.find(o => o.id === orderId);
    
    if (!orderToUpdate) return;

    try {
      // Supabase DB update
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      const updated = orders.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status: newStatus };
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(updatedOrder);
          }
          return updatedOrder;
        }
        return o;
      });
      setOrders(updated);
      showToast(`Order status successfully updated to "${newStatus}"!`, 'success');
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err.message || "Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const custName = order.users?.name?.toLowerCase() || '';
    const custEmail = order.users?.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(search) || 
      custName.includes(search) || 
      custEmail.includes(search);
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Status Badge Colors Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 border border-amber-200 text-amber-700';
      case 'Processing':
        return 'bg-blue-550/10 border border-blue-200 text-blue-700';
      case 'Shipped':
        return 'bg-indigo-50 border border-indigo-200 text-indigo-700';
      case 'Delivered':
        return 'bg-emerald-550/10 border border-emerald-200 text-emerald-700';
      case 'Cancelled':
        return 'bg-rose-50 border border-rose-200 text-rose-700';
      default:
        return 'bg-slate-100 border border-slate-200 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Customer Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Monitor client billing, process active deliveries, and update shipment status transitions.
          </p>
        </div>
        <button 
          onClick={loadOrders}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer self-start md:self-auto"
        >
          {loading ? <Spinner className="size-3.5" /> : <RefreshCw size={14} />}
          <span>Refresh List</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Orders Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Orders</span>
              <h2 className="text-3xl font-black text-slate-900">{totalOrdersCount}</h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-xs">
              <ClipboardList size={22} />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5 font-semibold">
            <TrendingUp size={12} className="text-emerald-600 animate-bounce" />
            <span>Active transactions processed</span>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Delivered</span>
              <h2 className="text-3xl font-black text-emerald-600">{completedOrdersCount}</h2>
            </div>
            <div className="w-12 h-12 bg-emerald-550/10 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-650 shadow-xs">
              <Truck size={22} />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5 font-semibold">
            <CheckCircle size={12} className="text-emerald-600" />
            <span>Successfully shipped</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Revenue</span>
              <h2 className="text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-xs">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="text-[10px] text-slate-550 mt-4 flex items-center gap-1.5 font-semibold">
            <span>Excludes cancelled orders</span>
          </div>
        </div>
      </div>

      {/* Lookup Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lookup orders by UUID, client name, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-56 shrink-0">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition cursor-pointer appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Directory Grid / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="loader w-10 h-10 mb-2" />
          <p className="text-slate-500 font-semibold">Updating orders ledger registry...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-base">No Orders Found</h3>
            <p className="text-slate-500 text-xs mt-1">There are no client transaction orders matching criteria.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer Profile</th>
                  <th className="py-4 px-6">Date Placed</th>
                  <th className="py-4 px-6">Bill Total</th>
                  <th className="py-4 px-6">Fulfillment Badge</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition duration-150">
                    <td className="py-4 px-6 font-mono text-xs text-slate-550">
                      <span className="truncate block max-w-[100px]" title={order.id}>
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {order.users ? (
                        <div>
                          <span className="font-bold text-slate-900 block text-sm leading-snug">{order.users.name}</span>
                          <span className="text-[10px] text-slate-400 block leading-none font-mono mt-0.5">{order.users.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Anonymous User</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-750 hover:text-slate-950 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">Order Details</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1">UUID: {selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Order Status Action Panel */}
              <div className="bg-slate-50/55 border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Update Order Status</span>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      disabled={updatingId !== null}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                        selectedOrder.status === status
                          ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Customer & Date info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Profile */}
                <div className="bg-slate-50/25 border border-slate-200 p-4 rounded-2xl space-y-3 animate-in">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 text-slate-500">
                    <User size={16} className="text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Customer Profile</span>
                  </div>
                  {selectedOrder.users || selectedOrder.phone_number ? (
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="font-bold text-slate-900 text-base leading-snug">{selectedOrder.users?.name || 'Customer'}</div>
                      {selectedOrder.users?.email && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{selectedOrder.users.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Phone size={12} className="shrink-0" />
                        <span>{selectedOrder.phone_number || selectedOrder.users?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">Anonymous / Deleted Customer Profile</p>
                  )}
                </div>

                {/* Logistics */}
                <div className="bg-slate-50/25 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 text-slate-500">
                    <Calendar size={16} className="text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Logistics & Date</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px]">Date Placed</span>
                      <span className="text-slate-800 font-semibold text-sm block mt-0.5">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-500 uppercase tracking-wider text-[9px]">Fulfillment Status</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold mt-1 text-[10px] uppercase tracking-wider border bg-emerald-50 border-emerald-200 text-emerald-700">
                        {selectedOrder.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Destination */}
                <div className="bg-slate-50/25 border border-slate-200 p-4 rounded-2xl space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 text-slate-500">
                    <MapPin size={16} className="text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Delivery Destination</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedOrder.delivery_address ? (
                      <span>{selectedOrder.delivery_address}</span>
                    ) : (
                      <span className="text-slate-400 italic font-normal">No specific address recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Products */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Items list</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/10">
                  {selectedOrder.order_items.map((item) => {
                    const firstImage = item.products.product_images?.[0]?.image_url;
                    return (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {firstImage ? (
                              <img src={firstImage} alt={item.products.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm block truncate leading-tight">{item.products.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">Brand: {item.products.brand}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-900 block">{formatCurrency(item.price * item.quantity)}</span>
                          <span className="text-[10px] text-slate-500 block">{formatCurrency(item.price)} × {item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Calculation */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-slate-650">
                <div>
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-black text-slate-900 block mt-0.5">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const receiptObj: ReceiptOrder = {
                    id: selectedOrder.id,
                    created_at: selectedOrder.created_at,
                    total: selectedOrder.total,
                    status: selectedOrder.status,
                    user_name: selectedOrder.users?.name,
                    user_email: selectedOrder.users?.email,
                    user_phone: selectedOrder.phone_number || selectedOrder.users?.phone,
                    delivery_address: selectedOrder.delivery_address,
                    items: selectedOrder.order_items.map(i => ({
                      name: i.products.name,
                      quantity: i.quantity,
                      price: i.price,
                      brand: i.products.brand
                    }))
                  };
                  setReceiptModalOrder(receiptObj);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                <span>Download Image Receipt</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-350 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-300"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

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
