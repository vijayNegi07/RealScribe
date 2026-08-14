"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation"
import Link from "next/link";
import { sigInValidation } from "@/Schema/Inputvalidation";
import { authClient } from "@/app/lib/auth-client";


function SignIn() {
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>("");
    const [submitted, setSubmitted] = useState<z.infer<typeof sigInValidation> | null>(null);


  const {register,
    handleSubmit,
    formState: { errors, isSubmitting }} = useForm<z.infer<typeof sigInValidation>>({
    resolver: zodResolver(sigInValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof sigInValidation>) => {
    setFormSubmitting(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email, // required
        password: formData.password, // required
        rememberMe: true,
        callbackURL: "/dashboard",
      });

      if (error) {
        console.log("APi error -> ", error);
        setApiError(error?.message);
        return;
      }

      setSubmitted(formData);
    } catch (error) {
      console.log("Some errr while user logging in ", error);
    } finally {
      setFormSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue.</p>
 
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${
                errors.email ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
 
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              aria-invalid={errors.password ? "true" : "false"}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${
                errors.password ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
 
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
 
        {submitted && (
          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
            Submitted: {submitted.email}
          </div>
        )}
      </div>
    </div>
  );
}



export default SignIn;
