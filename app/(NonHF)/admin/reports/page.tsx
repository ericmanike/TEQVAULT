'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, 
  Calendar, Download, RefreshCw, BarChart3, PieChart as PieChartIcon, 
  Activity, Sparkles, Filter, ArrowUpRight, CheckCircle2, ChevronDown, Clock, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/toastProvider';

// Time range type
type TimeRange = '7d' | '30d' | '60d';

// Color Palette definitions
const CHART_COLORS = {
  primary: '#f97316',   // Orange
  secondary: '#3b82f6', // Blue
  emerald: '#10b981',   // Emerald
  purple: '#8b5cf6',    // Purple
  amber: '#f59e0b',     // Amber
  rose: '#f43f5e',      // Rose
  cyan: '#06b6d4',      // Cyan
};

const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

interface TimelineData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
  percentage: number;
}

interface OrderStatusData {
  status: string;
  count: number;
  revenue: number;
}

interface TopProductData {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
}

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Raw fetched data states
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Fetch real data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              products (
                id,
                name,
                categories (name)
              )
            )
          `)
          .order('created_at', { ascending: true }),
        supabase.from('products').select('*, categories(name)').order('id', { ascending: false }),
        supabase.from('users').select('*'),
        supabase.from('categories').select('*')
      ]);

      setDbOrders(ordersRes.data || []);
      setDbProducts(productsRes.data || []);
      setDbUsers(usersRes.data || []);
      setDbCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to load reports data:', err);
      showToast('Error loading report data from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate date points based on selected TimeRange
  const daysLimit = useMemo(() => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '60d': return 60;
      default: return 30;
    }
  }, [timeRange]);

  // Real database analytics generator
  const analytics = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysLimit);

    const filteredOrders = dbOrders.filter((o: any) => new Date(o.created_at || Date.now()) >= cutoffDate);

    // Map daily timeline strictly from real orders
    const timelineMap: Record<string, { revenue: number; orders: number; customers: Set<string> }> = {};

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timelineMap[key] = { revenue: 0, orders: 0, customers: new Set() };
    }

    let realTotalRevenue = 0;
    const statusCounts: Record<string, { count: number; revenue: number }> = {};

    filteredOrders.forEach((order: any) => {
      const orderDate = new Date(order.created_at || Date.now());
      const key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const val = Number(order.total || 0);
      
      if (timelineMap[key]) {
        timelineMap[key].revenue += val;
        timelineMap[key].orders += 1;
        if (order.user_id) timelineMap[key].customers.add(order.user_id);
      }
      realTotalRevenue += val;

      const st = order.status || 'Pending';
      if (!statusCounts[st]) {
        statusCounts[st] = { count: 0, revenue: 0 };
      }
      statusCounts[st].count += 1;
      statusCounts[st].revenue += val;
    });

    const timeline: TimelineData[] = Object.keys(timelineMap).map(date => ({
      date,
      revenue: timelineMap[date].revenue,
      orders: timelineMap[date].orders,
      customers: timelineMap[date].customers.size
    }));

    // Compute Category Stats strictly from real products
    const catMap: Record<string, { count: number; value: number }> = {};
    dbProducts.forEach((p: any) => {
      const cName = p.categories?.name || 'Uncategorized';
      if (!catMap[cName]) catMap[cName] = { count: 0, value: 0 };
      catMap[cName].count += 1;
      catMap[cName].value += Number(p.price || 0) * Number(p.stock || 1);
    });

    const totalCatVal = Object.values(catMap).reduce((sum, item) => sum + item.value, 0) || 1;
    const categories: CategoryData[] = Object.keys(catMap).map(name => ({
      name,
      value: catMap[name].value,
      count: catMap[name].count,
      percentage: Math.round((catMap[name].value / totalCatVal) * 100)
    }));

    // Real order status breakdown
    const orderStatuses: OrderStatusData[] = Object.keys(statusCounts).map(st => ({
      status: st,
      count: statusCounts[st].count,
      revenue: statusCounts[st].revenue
    }));

    // Top products performance computed from actual order items and products
    const productSalesMap: Record<string, { name: string; category: string; sales: number; revenue: number; stock: number }> = {};

    dbProducts.forEach((p: any) => {
      productSalesMap[String(p.id)] = {
        name: p.name || 'Unnamed Product',
        category: p.categories?.name || 'General',
        sales: 0,
        revenue: 0,
        stock: Number(p.stock || 0)
      };
    });

    dbOrders.forEach((o: any) => {
      (o.order_items || []).forEach((item: any) => {
        const pid = String(item.product_id || item.products?.id || '');
        if (pid && productSalesMap[pid]) {
          productSalesMap[pid].sales += Number(item.quantity || 1);
          productSalesMap[pid].revenue += Number(item.price || 0) * Number(item.quantity || 1);
        } else if (item.products?.name) {
          const fallbackKey = item.products.name;
          if (!productSalesMap[fallbackKey]) {
            productSalesMap[fallbackKey] = {
              name: item.products.name,
              category: item.products.categories?.name || 'General',
              sales: 0,
              revenue: 0,
              stock: 0
            };
          }
          productSalesMap[fallbackKey].sales += Number(item.quantity || 1);
          productSalesMap[fallbackKey].revenue += Number(item.price || 0) * Number(item.quantity || 1);
        }
      });
    });

    const topProducts: TopProductData[] = Object.entries(productSalesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue || b.sales - a.sales || b.stock - a.stock)
      .slice(0, 5);

    const realOrdersCount = filteredOrders.length;
    const realAOV = realOrdersCount > 0 ? Math.round(realTotalRevenue / realOrdersCount) : 0;

    return {
      timeline,
      categories,
      orderStatuses,
      topProducts,
      metrics: {
        totalRevenue: realTotalRevenue,
        totalOrders: realOrdersCount,
        avgOrderValue: realAOV,
        activeProductsCount: dbProducts.length,
        totalUsersCount: dbUsers.length,
      }
    };
  }, [daysLimit, dbOrders, dbProducts, dbUsers]);

  // Export report functionality
  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Revenue (GHS)', 'Orders', 'Customers'].join(','),
      ...analytics.timeline.map(row => [row.date, row.revenue, row.orders, row.customers].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-report-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV downloaded successfully', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Spinner className="w-10 h-10 text-orange-500" />
        <p className="text-slate-500 font-semibold animate-pulse">Gathering analytical metrics & charts...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 border border-blue-500 p-6 rounded-3xl shadow-xl shadow-blue-600/20 text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-xs">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Analytics & Reports</h1>
          </div>
          <p className="text-blue-100 text-sm font-medium">
            Monitor sales performance, revenue metrics, order velocity, and customer trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="bg-blue-800/60 border border-blue-400/30 rounded-2xl p-1 flex items-center space-x-1 backdrop-blur-xs">
            {(['7d', '30d', '60d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>


          {/* Refresh & Export */}
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition border border-white/20 cursor-pointer backdrop-blur-xs"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Revenue</span>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(analytics.metrics.totalRevenue)}</h3>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Orders Placed</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{analytics.metrics.totalOrders.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Avg Order Value (AOV)</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(analytics.metrics.avgOrderValue)}</h3>
          </div>
        </div>

        {/* Card 4: Active Products & Users */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Catalog & Users</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-slate-900">{analytics.metrics.activeProductsCount}</h3>
              <span className="text-xs font-bold text-slate-500">Products</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-bold text-slate-700">{analytics.metrics.totalUsersCount}</span>
              <span className="text-xs font-bold text-slate-500">Users</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue & Orders Timeline Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Revenue & Orders Velocity</h2>
              <p className="text-xs text-slate-500">Daily sales breakdown and volume activity curve</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                <span className="text-slate-600">Revenue (GHS)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-600">Order Count</span>
              </div>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `GH₵${val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value, 
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Sales by Category</h2>
            <p className="text-xs text-slate-500">Inventory valuation and sales breakdown</p>
          </div>

          {analytics.categories.length > 0 ? (
            <>
              <div className="h-[230px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Valuation / Sales']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Category Legend List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 max-h-[120px] overflow-y-auto pr-1">
                {analytics.categories.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                      />
                      <span className="text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-slate-900 font-extrabold">{cat.percentage}%</span>
                      <span className="text-slate-400 font-normal">({cat.count} items)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Package size={32} className="mb-2 opacity-50 text-slate-300" />
              <p className="text-xs font-medium">No catalog categories found in database.</p>
            </div>
          )}
        </div>

      </div>

      {/* Secondary Row: Order Status Breakdown & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Order Status Distribution Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Status Breakdown</h2>
              <p className="text-xs text-slate-500">Fulfillment state and active orders workflow</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Total: {analytics.orderStatuses.reduce((acc, curr) => acc + curr.count, 0)} orders
            </span>
          </div>

          {analytics.orderStatuses.length > 0 ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.orderStatuses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} orders (${formatCurrency(item.payload.revenue)})`,
                      'Count'
                    ]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {analytics.orderStatuses.map((entry, index) => {
                      let fill = CHART_COLORS.primary;
                      if (entry.status === 'Delivered') fill = CHART_COLORS.emerald;
                      else if (entry.status === 'Processing') fill = CHART_COLORS.secondary;
                      else if (entry.status === 'Shipped') fill = CHART_COLORS.purple;
                      else if (entry.status === 'Cancelled') fill = CHART_COLORS.rose;
                      return <Cell key={`bar-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag size={32} className="mb-2 opacity-50 text-slate-300" />
              <p className="text-xs font-medium">No customer orders recorded in database yet.</p>
            </div>
          )}
        </div>

        {/* Customer Growth & Registrations Line Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">User Acquisition & Growth</h2>
              <p className="text-xs text-slate-500">Customer checkout frequency over time</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center">
              <Users size={12} className="mr-1" /> {dbUsers.length} total users
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  name="Active Customers"
                  stroke={CHART_COLORS.emerald} 
                  strokeWidth={3}
                  dot={{ r: 3, fill: CHART_COLORS.emerald }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Products Table & Strategic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products Performance Table (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Top Performing Products</h2>
              <p className="text-xs text-slate-500">Inventory performance based on sales orders and available stock</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="py-3 px-2">Product Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-center">Units Sold</th>
                  <th className="py-3 px-2 text-right">Revenue</th>
                  <th className="py-3 px-2 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topProducts.length > 0 ? (
                  analytics.topProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-2 font-bold text-slate-900 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <span className="truncate max-w-[220px]">{prod.name}</span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-600 font-medium">{prod.category}</td>
                      <td className="py-3.5 px-2 text-center font-bold text-slate-800">{prod.sales}</td>
                      <td className="py-3.5 px-2 text-right font-black text-slate-900">{formatCurrency(prod.revenue)}</td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          prod.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {prod.stock} in stock
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No products recorded in the database catalog yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI & Executive Insights Card */}
        <div className="bg-white border border-blue-100 text-slate-900 rounded-3xl p-6 shadow-xl shadow-blue-500/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <h3 className="font-extrabold text-sm tracking-wider uppercase text-blue-900">Executive Insights</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-600 border border-blue-500 p-4 rounded-2xl space-y-1 text-white shadow-sm">
                <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider">Top Product Segment</p>
                <p className="text-sm font-extrabold text-white">
                  {analytics.categories.length > 0 ? analytics.categories[0].name : 'Catalog Pending'}
                </p>
                <p className="text-xs text-blue-50 font-medium">
                  {analytics.categories.length > 0
                    ? `Accounts for ${analytics.categories[0].percentage}% of catalog valuation (${analytics.categories[0].count} items).`
                    : 'Add products and categories to see valuation breakdown.'}
                </p>
              </div>

              <div className="bg-blue-600 border border-blue-500 p-4 rounded-2xl space-y-1 text-white shadow-sm">
                <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider">Fulfillment Health</p>
                <p className="text-sm font-extrabold text-white">
                  {dbOrders.length > 0 
                    ? `${Math.round((dbOrders.filter((o: any) => ['delivered', 'completed', 'paid'].includes((o.status || '').toLowerCase())).length / dbOrders.length) * 100)}% Fulfilled / Paid`
                    : 'No Orders Yet'}
                </p>
                <p className="text-xs text-blue-50 font-medium">
                  {dbOrders.length > 0
                    ? `${dbOrders.filter((o: any) => ['delivered', 'completed', 'paid'].includes((o.status || '').toLowerCase())).length} of ${dbOrders.length} total orders fulfilled or paid.`
                    : 'Fulfillment statistics update automatically as customer orders are placed.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-100 flex items-center justify-between text-xs font-semibold text-blue-600">
            <span className="flex items-center">
              <ShieldCheck size={15} className="mr-1 text-blue-600" /> Live Database Metrics
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
