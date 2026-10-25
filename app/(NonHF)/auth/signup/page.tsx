"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Turnstile } from '@marsidev/react-turnstile';
import { useFormik } from "formik";
import * as Yup from "yup";

import { useToast } from "@/components/toastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import SignupSuccessModal from "@/components/SignupSuccessModal";

const signupSchema = Yup.object().shape({
  name: Yup.string().trim().required("Full Name is required"),
  phone: Yup.string().trim().required("Phone Number is required"),
  email: Yup.string().trim().email("Invalid email address").required("Email Address is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("Password is required"),
});

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and sanitize redirect URL
  const rawRedirectTo = searchParams.get("redirectTo") || "/shop";
  const redirectTo = (rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")) ? rawRedirectTo : "/shop";

  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'verification_pending' | 'success'>('success');
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === "success") {
      window.location.href = redirectTo;
    } else {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      showToast(err.message || "Google Auth failed", "error");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      if (!captchaToken) {
        showToast("Please complete the security check (CAPTCHA)", "error");
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            captchaToken,
            data: {
              full_name: values.name,
              phone: values.phone,
            },
          },
        });

        console.log("Sign Up Data", data);
        console.log("Sign Up Error", error);
        if (error) throw error;

        setRegisteredEmail(values.email);
        if (data.session) {
          setModalType("success");
          setShowModal(true);
          return;
        }

        setModalType("verification_pending");
        setShowModal(true);

      } catch (err: any) {
        showToast(err.message || "Signup failed", "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const passwordVal = formik.values.password;

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Create account to get started
        </h1>
        <p className="text-[14px] font-medium text-slate-500">
          Join TEQVAULT today
        </p>
      </div>

      {/* Google Signup Button */}
      <div className="w-full flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading || isLoading}
          className="flex justify-center cursor-pointer items-center gap-3 border border-slate-200 w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm bg-white disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <>
              <Spinner className="h-5 w-5" />
              <span className="text-[14px] font-semibold text-gray-700">
                Connecting to Google...
              </span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              <span className="text-[14px] font-semibold text-gray-700">
                Continue with Google
              </span>
            </>
          )}
        </motion.button>
        <div className="relative flex items-center py-3">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-4 text-gray-400 text-[14px] uppercase tracking-[0.2em] font-bold">or</span>
          <div className="grow border-t border-gray-200"></div>
        </div>
      </div>

      {/* Sign Up Form */}
      <form className="space-y-4" onSubmit={formik.handleSubmit}>

        {/* Full Name input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <User className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              {...formik.getFieldProps("name")}
              className={`block w-full rounded-xl border ${formik.touched.name && formik.errors.name ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
            />
          </div>
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.name}</p>
          )}
        </div>

        {/* Phone input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Phone className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="text"
              autoComplete="phone"
              placeholder="Phone Number"
              {...formik.getFieldProps("phone")}
              className={`block w-full rounded-xl border ${formik.touched.phone && formik.errors.phone ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.phone}</p>
          )}
        </div>

        {/* Email input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              {...formik.getFieldProps("email")}
              className={`block w-full rounded-xl border ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              {...formik.getFieldProps("password")}
              className={`block w-full rounded-xl border ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
            />
            {/* Password Visibility Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" strokeWidth={1.8} />
              ) : (
                <Eye className="h-5 w-5" strokeWidth={1.8} />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.password}</p>
          )}
        </div>

        {/* Password Requirements Check */}
        {passwordVal.length > 0 && (
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[14px]">
            <div className={passwordVal.length >= 8 ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least 8 characters long ({passwordVal.length}/8)
            </div>
            <div className={/[a-z]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one lowercase letter
            </div>
            <div className={/[A-Z]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one uppercase letter
            </div>
            <div className={/[0-9]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one number
            </div>
          </div>
        )}

        {/* Turnstile CAPTCHA */}
        <div className="flex justify-center my-3">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEolcdFOtWjBK2n_"}
            onSuccess={(token) => {
              setCaptchaToken(token);
            }}
            onExpire={() => {
              setCaptchaToken(undefined);
            }}
            onError={() => {
              setCaptchaToken(undefined);
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading || !formik.isValid || !formik.dirty}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-[16px] font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link */}
      <p className="mt-6 text-center text-[14px] font-medium text-slate-500">
        Already have an account?{" "}
        <Link
          href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
          Sign In
        </Link>
      </p>

      <SignupSuccessModal
        isOpen={showModal}
        onClose={handleModalClose}
        type={modalType}
        email={registeredEmail}
        redirectTo={redirectTo}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 flex justify-center items-center py-12">
        <div className="loader w-8 h-8" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
