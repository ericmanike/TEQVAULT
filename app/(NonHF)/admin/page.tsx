'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Tag, Users, Package, ArrowUpRight, Plus, Edit, Eye, Loader2, Sparkles, Trash2, Store
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { parseImageUrls } from '@/lib/products';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
  totalStock: number;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  created_at?: string;
}

interface ShopItem {
  userId: string;
  name: string;
  email: string;
  productCount: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    totalStock: 0
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // 1. Fetch counts
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Sum of stock from products
      const { data: stockData } = await supabase
        .from('products')
        .select('stock');
      
      const totalStock = stockData?.reduce((sum, item) => sum + Number(item.stock || 0), 0) || 0;

      setStats({
        productsCount: productsCount || 0,
        categoriesCount: categoriesCount || 0,
        usersCount: usersCount || 0,
        totalStock
      });

      // 2. Fetch Recent Products (limit to 5)
      const { data: dbProducts } = await supabase
        .from('products')
        .select(`
          id, name, price, stock,
          categories(name),
          product_images(image_url)
        `)
        .order('id', { ascending: false })
        .limit(5);

      const mappedProducts: RecentProduct[] = dbProducts?.map((row: any) => {
        const images = parseImageUrls(row.product_images);
        return {
          id: row.id.toString(),
          name: row.name || "Unknown Product",
          price: Number(row.price || 0),
          stock: Number(row.stock || 0),
          category: row.categories?.name || "Uncategorized",
          imageUrl: images.length > 0 ? images[0] : "https://placehold.co/800?text=photo+unavailable&font=roboto"
        };
      }) || [];

      setRecentProducts(mappedProducts);

      // 3. Fetch Recent Users (limit to 5)
      const { data: dbUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .limit(5);

      const ADMIN_EMAILS = ['manikeeric@gmail.com'];
      const mappedUsers: RecentUser[] = dbUsers?.map((row: any) => ({
        id: row.id,
        fullName: row.name || "Anonymous User",
        email: row.email || "No Email",
        role: row.email && ADMIN_EMAILS.includes(row.email.toLowerCase()) ? 'Admin' : 'User'
      })) || [];

      setRecentUsers(mappedUsers);

      // 4. Fetch all shops (sellers with products)
      const { data: sellerRows } = await supabase
        .from('products')
        .select('user_id')
        .not('user_id', 'is', null);

      const countMap: Record<string, number> = {};
      sellerRows?.forEach((r: any) => {
        countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
      });

      const sellerIds = Object.keys(countMap);
      if (sellerIds.length > 0) {
        const { data: sellerUsers } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', sellerIds);

        const mappedShops: ShopItem[] = (sellerUsers || []).map((u: any) => ({
          userId: u.id,
          name: u.name || 'Unknown Seller',
          email: u.email || 'No Email',
          productCount: countMap[u.id] || 0,
        }));
        setShops(mappedShops);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      setSubmitting(true);

      // Unlink foreign key dependencies (orders, addresses) so delete query succeeds
      try {
        await supabase.from('orders').update({ user_id: null }).eq('user_id', id);
        await supabase.from('addresses').delete().eq('user_id', id);
      } catch (e) {
        console.warn('Cleanup before user delete warning:', e);
      }

      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;

      showToast("User profile deleted successfully!", "success");
      setRecentUsers(prev => prev.filter(u => u.id !== id));
      setStats(prev => ({ ...prev, usersCount: Math.max(0, prev.usersCount - 1) }));
      setDeletingUserId(null);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast(err.message || "Failed to delete user.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="loader w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading stats & activity...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.productsCount,
      description: 'Listed gadgets on marketplace',
      icon: ShoppingBag,
      color: 'from-orange-500 to-amber-505',
      bgColor: 'bg-orange-50 border-orange-100 text-orange-600 shadow-xs',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount,
      description: 'Active filter categories',
      icon: Tag,
      color: 'from-blue-500 to-indigo-505',
      bgColor: 'bg-blue-550/10 border-blue-200 text-blue-700 shadow-xs',
    },
    {
      title: 'Registered Users',
      value: stats.usersCount,
      description: 'Buyers and Sellers accounts',
      icon: Users,
      color: 'from-emerald-500 to-teal-505',
      bgColor: 'bg-emerald-550/10 border-emerald-200 text-emerald-700 shadow-xs',
    },
    {
      title: 'Available Stock',
      value: stats.totalStock,
      description: 'Total unit inventory items',
      icon: Package,
      color: 'from-fuchsia-500 to-pink-505',
      bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600 shadow-xs',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-slate-800">
      
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Overview 
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Real-time business insights, stock logs, and user registration analytics.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/admin/products" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-xl transition duration-200 shadow-lg shadow-orange-500/25 text-sm cursor-pointer">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 transition duration-250">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</h3>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border ${card.bgColor}`}>
                <card.icon size={20} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Split Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Products Listed */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col space-y-5 sm:space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Recent Products Listed</h2>
              <p className="text-xs text-slate-500">Latest gadgets available for purchase</p>
            </div>
            <Link href="/admin/products">
              <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 text-xs font-bold transition cursor-pointer p-1">
                <span>Manage all</span>
                <ArrowUpRight size={14} />
              </button>
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <ShoppingBag className="w-10 h-10 mb-2 opacity-50 text-orange-500" />
                <p>No products listed yet.</p>
              </div>
            ) : (
              recentProducts.map((prod) => (
                <div key={prod.id} className="py-3.5 sm:py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-3 group">
                  <div className="flex items-center space-x-3 truncate">
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs" 
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-orange-500 transition-colors truncate">{prod.name}</p>
                      <span className="inline-block text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">{prod.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-black text-slate-900">GHS {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <span className={`text-[10px] font-bold ${prod.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <Link href="/admin/products">
                      <button className="p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200 shadow-2xs" title="Edit Product">
                        <Edit size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col space-y-5 sm:space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Recent User Registrations</h2>
              <p className="text-xs text-slate-500">Newly registered user profiles</p>
            </div>
            <Link href="/admin/users">
              <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-650 text-xs font-bold transition cursor-pointer p-1">
                <span>Manage all</span>
                <ArrowUpRight size={14} />
              </button>
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <Users className="w-10 h-10 mb-2 opacity-50 text-orange-500" />
                <p>No registered users found.</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="py-3.5 sm:py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-700 font-bold shrink-0 shadow-2xs">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      user.role === 'Admin' 
                        ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                    <button 
                      onClick={() => setDeletingUserId(user.id)}
                      className="p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition cursor-pointer border border-slate-200 shadow-2xs"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* All Shops Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Store size={18} className="text-orange-500" />
              All Shops
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Sellers who have listed products on the marketplace</p>
          </div>
          <span className="text-xs font-black bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 rounded-full">
            {shops.length} {shops.length === 1 ? 'shop' : 'shops'}
          </span>
        </div>

        {shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
            <Store className="w-10 h-10 mb-2 opacity-40 text-orange-400" />
            <p>No shops found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shops.map((shop) => (
              <div
                key={shop.userId}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm">
                  {shop.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">{shop.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{shop.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    {shop.productCount} {shop.productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
            <p className="text-slate-550 text-sm leading-relaxed">
              Are you sure you want to permanently delete this user profile? This will remove their record from the database.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Spinner className="size-3.5" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
