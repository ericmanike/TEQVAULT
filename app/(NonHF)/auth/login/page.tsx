"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Turnstile } from '@marsidev/react-turnstile';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/components/toastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { popup } from "leaflet";

const loginSchema = Yup.object().shape({
  email: Yup.string().trim().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

function LoginForm() {
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { showToast } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and sanitize redirect URL
  const rawRedirectTo = searchParams.get("redirectTo") || "/shop";
  const redirectTo = (rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")) ? rawRedirectTo : "/shop";

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
          queryParams: {
            prompt: "select_account",
            popup: "true",
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
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      if (!captchaToken) {
        showToast("Please complete the security check (CAPTCHA)", "error");
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
          options: {
            captchaToken,
          },
        });

        if (error) {
          showToast(error.message, "error");
        } else {
          showToast("Welcome back!", "success");
          // Small delay to let the toast be seen before redirection
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 800);
        }
      } catch (err: any) {
        showToast("Failed to sign in. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Welcome back
        </h1>
        <p className="text-[14px] font-medium text-slate-500">
          Sign in to your account
        </p>
      </div>

      {/* Google Login Button - Disabled */}
    
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
     

      {/* Sign In Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        
        {/* Email input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
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
              autoComplete="current-password"
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

        {/* Remember me Checkbox & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="relative flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="peer sr-only"
            />
            <div className="h-4.5 w-4.5 rounded bg-white border border-slate-300 peer-checked:bg-[#1e3a8a] peer-checked:border-[#1e3a8a] flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-slate-300">
              <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
            </div>
            <span className="ml-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-[13px] font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

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

        {/* Yellow Submit CTA */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading || !formik.isValid || !formik.dirty}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-4 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link */}
      <p className="mt-6 text-center text-[13px] font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
        Create Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 flex justify-center items-center py-12">
        <div className="loader w-8 h-8" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
