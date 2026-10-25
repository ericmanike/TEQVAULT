'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';

const validationSchema = Yup.object({
  storeName: Yup.string().required('Store name is required').min(3, 'Store name must be at least 3 characters'),
  storeDescription: Yup.string().required('Store description is required').min(10, 'Description must be at least 10 characters'),
  storePhone: Yup.string().required('Phone number is required'),
  storeEmail: Yup.string().email('Must be a valid email').required('Email is required'),
  storeAddress: Yup.string().required('Address is required'),
  payoutMethod: Yup.string().oneOf(['momo', 'bank']).required('Payout method is required'),
  momoNetwork: Yup.string(),
  momoNumber: Yup.string().when('payoutMethod', {
    is: 'momo',
    then: (schema) => schema.required('Mobile money number is required'),
    otherwise: (schema) => schema.optional()
  }),
  momoName: Yup.string().when('payoutMethod', {
    is: 'momo',
    then: (schema) => schema.required('Account holder name is required'),
    otherwise: (schema) => schema.optional()
  }),
  bankName: Yup.string(),
  bankAccountNo: Yup.string().when('payoutMethod', {
    is: 'bank',
    then: (schema) => schema.required('Bank account number is required'),
    otherwise: (schema) => schema.optional()
  }),
  bankAccountName: Yup.string().when('payoutMethod', {
    is: 'bank',
    then: (schema) => schema.required('Bank account holder name is required'),
    otherwise: (schema) => schema.optional()
  }),
});

interface StoreFormValues {
  storeName: string;
  storeDescription: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  payoutMethod: 'momo' | 'bank';
  momoNetwork: string;
  momoNumber: string;
  momoName: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
}

export default function StoreProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const formik = useFormik<StoreFormValues>({
    initialValues: {
      storeName: '',
      storeDescription: '',
      storePhone: '',
      storeEmail: '',
      storeAddress: '',
      payoutMethod: 'momo',
      momoNetwork: 'MTN Mobile Money',
      momoNumber: '',
      momoName: '',
      bankName: 'GCB Bank',
      bankAccountNo: '',
      bankAccountName: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            store_name: values.storeName,
            store_description: values.storeDescription,
            store_phone: values.storePhone,
            store_email: values.storeEmail,
            store_address: values.storeAddress,
            payout_method: values.payoutMethod,
            momo_network: values.momoNetwork,
            momo_number: values.momoNumber,
            momo_name: values.momoName,
            bank_name: values.bankName,
            bank_account_no: values.bankAccountNo,
            bank_account_name: values.bankAccountName,
          }
        });

        if (error) throw error;
        showToast('Store profile & payment details updated successfully! 🎉', 'success');
      } catch (err: any) {
        console.error("Error updating store profile:", err);
        showToast(err.message || 'Failed to update store details.', 'error');
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        storeName: user.user_metadata?.store_name || '',
        storeDescription: user.user_metadata?.store_description || '',
        storePhone: user.user_metadata?.store_phone || '',
        storeEmail: user.user_metadata?.store_email || user.email || '',
        storeAddress: user.user_metadata?.store_address || '',
        payoutMethod: user.user_metadata?.payout_method || 'momo',
        momoNetwork: user.user_metadata?.momo_network || 'MTN Mobile Money',
        momoNumber: user.user_metadata?.momo_number || '',
        momoName: user.user_metadata?.momo_name || '',
        bankName: user.user_metadata?.bank_name || 'GCB Bank',
        bankAccountNo: user.user_metadata?.bank_account_no || '',
        bankAccountName: user.user_metadata?.bank_account_name || '',
      });
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="loader w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in pb-16">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Store Profile</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Configure your e-commerce storefront & payout details.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Main Store Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden space-y-6">
          
          {/* Banner Decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900" />
          
          <h2 className="text-base font-black text-slate-900 border-b border-gray-100 pb-3">Basic Information</h2>
            
          {/* Store Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
              Store Name
            </label>
            <input
              name="storeName"
              type="text"
              value={formik.values.storeName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. TEQVAULT Tech Hub"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeName && formik.errors.storeName && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeName}</p>
            )}
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
              Store Description
            </label>
            <textarea
              name="storeDescription"
              rows={4}
              value={formik.values.storeDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Describe your tech store, specialties, and support values..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeDescription && formik.errors.storeDescription && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
                Store Phone Number
              </label>
              <input
                name="storePhone"
                type="text"
                value={formik.values.storePhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. +233 XX XXX XXXX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none transition text-sm font-semibold text-gray-900"
              />
              {formik.touched.storePhone && formik.errors.storePhone && (
                <p className="text-xs font-bold text-red-500">{formik.errors.storePhone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
                Store Contact Email
              </label>
              <input
                name="storeEmail"
                type="email"
                value={formik.values.storeEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="store@teqvault.app"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none transition text-sm font-semibold text-gray-900"
              />
              {formik.touched.storeEmail && formik.errors.storeEmail && (
                <p className="text-xs font-bold text-red-500">{formik.errors.storeEmail}</p>
              )}
            </div>

          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
              Physical Store Address
            </label>
            <input
              name="storeAddress"
              type="text"
              value={formik.values.storeAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Ring Road Central, Accra"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeAddress && formik.errors.storeAddress && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeAddress}</p>
            )}
          </div>

        </div>

        {/* Payout & Payment Details Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Payment & Payout Details
              </h2>
              <p className="text-xs text-gray-500 font-medium">Configure where sales payouts are deposited</p>
            </div>
          </div>

          {/* Payout Method Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => formik.setFieldValue('payoutMethod', 'momo')}
              className={`py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                formik.values.payoutMethod === 'momo' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mobile Money
            </button>
            <button
              type="button"
              onClick={() => formik.setFieldValue('payoutMethod', 'bank')}
              className={`py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                formik.values.payoutMethod === 'bank' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Bank Account
            </button>
          </div>

          {formik.values.payoutMethod === 'momo' ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Mobile Network</label>
                <select
                  name="momoNetwork"
                  value={formik.values.momoNetwork}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900 bg-white"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Telecel Cash">Telecel Cash</option>
                  <option value="AT Money">AT Money</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">MoMo Phone Number *</label>
                  <input
                    name="momoNumber"
                    type="text"
                    placeholder="054 123 4567"
                    value={formik.values.momoNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900"
                  />
                  {formik.touched.momoNumber && formik.errors.momoNumber && (
                    <p className="text-xs font-bold text-red-500">{formik.errors.momoNumber}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Account Holder Name *</label>
                  <input
                    name="momoName"
                    type="text"
                    placeholder="e.g. John Doe / Store Owner"
                    value={formik.values.momoName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900"
                  />
                  {formik.touched.momoName && formik.errors.momoName && (
                    <p className="text-xs font-bold text-red-500">{formik.errors.momoName}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Bank Name</label>
                <select
                  name="bankName"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900 bg-white"
                >
                  <option value="GCB Bank">GCB Bank</option>
                  <option value="Ecobank Ghana">Ecobank Ghana</option>
                  <option value="Fidelity Bank">Fidelity Bank</option>
                  <option value="CalBank">CalBank</option>
                  <option value="Stanbic Bank">Stanbic Bank</option>
                  <option value="Absa Ghana">Absa Ghana</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Bank Account Number *</label>
                  <input
                    name="bankAccountNo"
                    type="text"
                    placeholder="1441000123456"
                    value={formik.values.bankAccountNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900"
                  />
                  {formik.touched.bankAccountNo && formik.errors.bankAccountNo && (
                    <p className="text-xs font-bold text-red-500">{formik.errors.bankAccountNo}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Account Holder Name *</label>
                  <input
                    name="bankAccountName"
                    type="text"
                    placeholder="Official Account Holder Name"
                    value={formik.values.bankAccountName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] outline-none text-sm font-semibold text-gray-900"
                  />
                  {formik.touched.bankAccountName && formik.errors.bankAccountName && (
                    <p className="text-xs font-bold text-red-500">{formik.errors.bankAccountName}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400 font-semibold">
              Saved changes sync automatically
            </span>
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition duration-200 shadow-lg shadow-slate-900/10 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {saving && <Spinner className="size-4" />}
              {saving ? 'Saving Profile...' : 'Save Store & Payment Details'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
