'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, Loader2, Mail, Phone, Shield, Copy, Check, Sparkles, Trash2 
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  
  // Filters & Lookups
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedUsers: UserItem[] = data?.map((row: any) => {
        const rawRole = row.role || row.user_role || (row.email?.toLowerCase() === 'manikeeric@gmail.com' ? 'admin' : 'user');
        return {
          id: row.id,
          fullName: row.name || row.full_name || "Anonymous User",
          email: row.email || "No Email",
          phone: row.phone || row.phone_number || "N/A",
          role: String(rawRole).toLowerCase() === 'admin' ? 'Admin' : 'User'
        };
      }) || [];

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Delete user
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
      if (error) {
        console.error('Error occurred deleting user:', error);
        throw error;
      }

      showToast("User profile deleted successfully!", "success");
      setUsers(users.filter(u => u.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast(err.message || "Failed to delete user. Check database permissions.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Copy
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Registered Accounts 
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          Inspect registered user profiles, search lookup contact lines, and audit system authorization credentials.
        </p>
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
            placeholder="Lookup users by full name, email, or telephone number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
          />
        </div>

        {/* Role Filter */}
        <div className="relative w-full md:w-56 shrink-0">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition cursor-pointer appearance-none animate-in"
          >
            <option value="">All Roles</option>
            <option value="Admin">Administrator</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Directory Grid / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="loader w-10 h-10 mb-2" />
          <p className="text-slate-500 font-semibold ">loading user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 bg-slate-550 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-base">No Users Found</h3>
            <p className="text-slate-505 text-xs mt-1">There are no accounts matching the criteria.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-550/5 bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Privilege Level</th>

                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition duration-150">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-xs">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm leading-snug">{user.fullName}</span>
                          <span className="text-[10px] text-slate-400 block leading-none font-mono mt-0.5">registered profile</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="text-slate-650">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span className="text-slate-650">{user.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        user.role === 'Admin' 
                          ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}>
                        <Shield size={12} className="shrink-0" />
                        {user.role}
                      </span>
                    </td>
                  
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => setDeletingId(user.id)}
                          className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl border border-slate-200 hover:border-rose-100 transition cursor-pointer shadow-2xs"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
            <p className="text-slate-550 text-sm leading-relaxed">
              Are you sure you want to permanently delete this user profile? This will remove their record from the database.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingId && handleDeleteUser(deletingId)}
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
