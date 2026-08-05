"use client"

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { signUpSchema } from "@/app/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import z from "zod";
import toast from "react-hot-toast";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Quicksand } from "next/font/google";


const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });


export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  function onSubmit(data: z.infer<typeof signUpSchema>) {
    startTransition(async () => {
      const { data: result, error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if (result) {
        toast.success("Account created! Redirecting…");
        router.push("/auth/login");
      } else {
        toast.error(error?.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 bg-transparent ${quicksand.className}`}>

      <div className="w-full max-w-[440px]">

        <div className="flex text-2xl text-background items-center mb-8 justify-center">
          <span className="text-spring font-bold font-serif text-3xl tracking-tight">
            S
          </span>
          peculo
        </div>

        {/* Card body */}
        <div className="bg-white dark:bg-background border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/70 dark:shadow-black/40">

          <div className="p-8">

            <div className="mb-7">
              <h1 className="text-xl font-bold text-foreground tracking-tight mb-1.5">
                Create your account
              </h1>
              <p className="text-[13px] text-gray-500 dark:text-foreground/80">
                Start practising interviews with AI today.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >

              {/* Full name */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-[#6B7899]">
                      Full name
                    </label>
                    <input
                      {...field}
                      placeholder="Coldy Daroy"
                      autoComplete="name"
                      className={cn(
                        "w-full bg-gray-50 dark:bg-[#0F1115] border rounded-xl px-4 py-3",
                        "text-[14px] text-gray-900 dark:text-[#E8EDF8] placeholder:text-gray-400 dark:placeholder:text-[#3A4560]",
                        "outline-none transition-colors duration-150",
                        fieldState.invalid
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-300 dark:border-gray-800 focus:border-spring"
                      )}
                    />
                    {fieldState.error && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 font-mono">
                        <AlertCircle size={11} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-[#6B7899]">
                      Email address
                    </label>
                    <input
                      {...field}
                      type="email"
                      placeholder="coldy@example.com"
                      autoComplete="email"
                      className={cn(
                        "w-full bg-gray-50 dark:bg-[#0F1115] border rounded-xl px-4 py-3",
                        "text-[14px] text-gray-900 dark:text-[#E8EDF8] placeholder:text-gray-400 dark:placeholder:text-[#3A4560]",
                        "outline-none transition-colors duration-150",
                        fieldState.invalid
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-300 dark:border-gray-800 focus:border-spring"
                      )}
                    />
                    {fieldState.error && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 font-mono">
                        <AlertCircle size={11} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-[#6B7899]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="cold@safari23"
                        autoComplete="new-password"
                        className={cn(
                          "w-full bg-gray-50 dark:bg-[#0F1115] border rounded-xl px-4 py-3 pr-11",
                          "text-[14px] text-gray-900 dark:text-[#E8EDF8] placeholder:text-gray-400 dark:placeholder:text-[#3A4560]",
                          "outline-none transition-colors duration-150",
                          fieldState.invalid
                            ? "border-red-500 focus:border-red-400"
                            : "border-gray-300 dark:border-gray-800 focus:border-spring"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#3A4560] hover:text-gray-600 dark:hover:text-[#6B7899] transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {field.value && (
                      <div className="flex gap-1 mt-0.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-[3px] flex-1 rounded-full transition-colors duration-300",
                              field.value.length >= i * 3
                                ? i <= 1 ? "bg-red-500"
                                : i <= 2 ? "bg-amber-400"
                                : i <= 3 ? "bg-[#2FDD79]/70"
                                : "bg-[#2FDD79]"
                                : "bg-gray-200 dark:bg-[#2A3045]"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {fieldState.error && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 font-mono">
                        <AlertCircle size={11} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "w-full mt-2 py-3 rounded-xl",
                  "bg-[#2FDD79] hover:bg-[#1AAA55] text-[#0F1115]",
                  "text-[14px] font-bold tracking-tight",
                  "transition-all duration-200 hover:-translate-y-px",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin size-4" />
                    Creating account…
                  </>
                ) : (
                  "Create account →"
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#2A3045]" />
              <span className="text-[10px] font-mono text-gray-400 dark:text-[#3A4560] uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#2A3045]" />
            </div>

            {/* Sign in link */}
            <p className="text-center text-[12px] text-gray-500 dark:text-gray-400 font-mono">
              Already have an account?{" "}
              
              <a href="/auth/login"
                className="text-spring hover:text-gray-900 dark:hover:text-[#E8EDF8] transition-colors font-semibold"
              >
                Sign in
              </a>
            </p>

          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 font-sans mt-6">
          By signing up you agree to our{" "}
          <a href="/terms" className="underline hover:text-shadow-spring-pale transition-colors">
            terms
          </a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-shadow-spring-pale transition-colors">
            privacy policy
          </a>
          .
        </p>

      </div>
    </div>
  );
}