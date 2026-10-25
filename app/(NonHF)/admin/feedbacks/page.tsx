'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  MessageSquareHeart, Search, Filter, RefreshCw, Download, 
  Trash2, CheckCircle2, Clock, Eye, AlertCircle, Copy, Check,
  User, Mail, Phone, Sparkles, MessageCircle, ArrowUpDown, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export interface FeedbackItem {
  id: string;
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  rating: number;
  category: string;
  message: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'archived';
  admin_notes?: string | null;
  created_at: string;
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Load Feedbacks from Supabase
  const fetchFeedbacks = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Feedbacks fetch error:', error.message);
        if (error.message.includes('not find the table') || error.message.includes('schema cache')) {
          setTableMissing(true);
        }
        // Load fallback queue from localStorage if user submitted offline
        const localQueue = JSON.parse(localStorage.getItem('teqvault_feedbacks_queue') || '[]');
        setFeedbacks(localQueue);
      } else {
        setTableMissing(false);
        const localQueue = JSON.parse(localStorage.getItem('teqvault_feedbacks_queue') || '[]');
        setFeedbacks([...localQueue, ...(data || [])]);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: FeedbackItem['status']) => {
    try {
      // Optimistic update
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );

      if (!id.startsWith('local_')) {
        const { error } = await supabase
          .from('feedbacks')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      }
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: any) {
      console.error('Update status error:', err);
      toast.error('Failed to update status in database.');
    }
  };

  // Delete Feedback
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));

      if (!id.startsWith('local_')) {
        const { error } = await supabase.from('feedbacks').delete().eq('id', id);
        if (error) throw error;
      } else {
        const localQueue = JSON.parse(localStorage.getItem('teqvault_feedbacks_queue') || '[]');
        const filtered = localQueue.filter((item: any) => item.id !== id);
        localStorage.setItem('teqvault_feedbacks_queue', JSON.stringify(filtered));
      }

      toast.success('Feedback deleted.');
      if (selectedFeedback?.id === id) setSelectedFeedback(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete feedback.');
    }
  };

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // Search term
      const matchesSearch =
        !searchTerm.trim() ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      // Status filter
      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [feedbacks, searchTerm, selectedCategory, selectedStatus]);

  // Key Metrics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { total: 0, newCount: 0, reviewedCount: 0, resolvedCount: 0 };

    const newCount = feedbacks.filter((f) => f.status === 'new').length;
    const reviewedCount = feedbacks.filter((f) => f.status === 'reviewed').length;
    const resolvedCount = feedbacks.filter((f) => f.status === 'resolved').length;

    return { total, newCount, reviewedCount, resolvedCount };
  }, [feedbacks]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Category', 'Status', 'Message'];
    const rows = filteredFeedbacks.map((f) => [
      f.id,
      new Date(f.created_at).toLocaleString(),
      `"${f.name || 'Anonymous'}"`,
      `"${f.email || ''}"`,
      `"${f.phone || ''}"`,
      `"${f.category}"`,
      f.status,
      `"${(f.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teqvault_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Feedbacks exported to CSV');
  };

  const copySqlSchema = () => {
    const sqlText = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback" ON public.feedbacks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view all feedbacks" ON public.feedbacks FOR SELECT TO authenticated USING (LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com'));
CREATE POLICY "Admins update all feedbacks" ON public.feedbacks FOR UPDATE TO authenticated USING (LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com'));
CREATE POLICY "Admins delete all feedbacks" ON public.feedbacks FOR DELETE TO authenticated USING (LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com'));`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    toast.success('SQL Schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <MessageSquareHeart size={14} />
            Customer Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Feedbacks
          </h1>
          <p className="text-sm text-slate-500">
            Real-time suggestions, reviews, and shopper feedback.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchFeedbacks(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SQL Missing Notice Alert Banner */}
      {tableMissing && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Supabase Table Setup Available
              </h4>
              <p className="text-xs text-amber-700 mt-0.5 max-w-2xl leading-relaxed">
                The <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900 font-semibold">feedbacks</code> table has not been created in Supabase yet.
                Click below to copy the ready-to-run SQL schema or run <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900 font-semibold">create_feedbacks_table.sql</code> in your Supabase dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={copySqlSchema}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer"
          >
            {copiedSql ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Feedbacks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Feedbacks</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <MessageSquareHeart size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
            <p className="text-[11px] text-slate-400 font-medium">Customer responses</p>
          </div>
        </div>

        {/* New Unread */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">New & Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.newCount}</div>
            <p className="text-[11px] text-slate-400 font-medium">Awaiting review</p>
          </div>
        </div>

        {/* Reviewed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Review</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{stats.reviewedCount}</div>
            <p className="text-[11px] text-slate-400 font-medium">Under review</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.resolvedCount}</div>
            <p className="text-[11px] text-slate-400 font-medium">Addressed feedback</p>
          </div>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, keyword..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">📂 All Categories</option>
              <option value="General">🌟 General Experience</option>
              <option value="Website Usability">💻 Website & App</option>
              <option value="Product Quality">📦 Product Quality</option>
              <option value="Pricing & Deals">💰 Pricing & Deals</option>
              <option value="Delivery & Service">🚚 Delivery & Service</option>
              <option value="Suggestion">💡 Feature Suggestion</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">🏷️ All Statuses</option>
              <option value="new">🟠 New / Unread</option>
              <option value="reviewed">🔵 Reviewed</option>
              <option value="resolved">🟢 Resolved</option>
              <option value="archived">⚪ Archived</option>
            </select>
          </div>

        </div>
      </div>

      {/* Feedbacks List / Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Spinner className="w-8 h-8 text-orange-500" />
            <p className="text-xs font-semibold text-slate-500">Loading feedback responses...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <MessageSquareHeart size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-800">No feedbacks found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No customer feedback matches your current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFeedbacks.map((item) => (
              <div 
                key={item.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Left: User & Message */}
                <div className="space-y-2.5 flex-1">
                  
                  {/* User Bar */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                      {(item.name || 'A').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 mr-2">
                        {item.name || 'Anonymous Visitor'}
                      </span>
                      {item.user_id ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                          Registered Customer
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          Guest
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-slate-400 ml-auto md:ml-2">
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Category Chip & Contacts */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>

                    {/* Contact Badges */}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-orange-600 transition-colors"
                      >
                        <Mail size={12} />
                        <span>{item.email}</span>
                      </a>
                    )}

                    {item.phone && (
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <Phone size={12} />
                        <span>{item.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Feedback Message */}
                  <p className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{item.message}&rdquo;
                  </p>
                </div>

                {/* Right: Status Dropdown & Delete Action */}
                <div className="flex items-center md:flex-col md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 md:hidden">Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value as FeedbackItem['status'])}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer outline-none ${
                        item.status === 'new'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : item.status === 'reviewed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <option value="new">🟠 New</option>
                      <option value="reviewed">🔵 Reviewed</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="archived">⚪ Archived</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete feedback"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
