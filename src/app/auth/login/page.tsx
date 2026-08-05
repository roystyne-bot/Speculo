"use client"

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "@/app/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });


export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
       email: "",
       password: "" },
    mode: "onChange",
  });

  function onSubmit(data: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const { data: result, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        toast.error(error?.message ?? "Invalid credentials. Please try again.");
      }
    });
  }

  return (
   
      <div className={`w-full max-w-[440px] ${quicksand.className}`}>

        
        <div className="flex text-2xl text-foreground items-center mb-8 justify-center">
          
          <span className="text-spring font-bold font-serif text-3xl tracking-tight">
            S
          </span>
          peculo
        </div>

        
        <div className="bg-white dark:bg-background border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden"
         style={{
                  
                  boxShadow: `0 2px 15px #808080`,
                  
                }}

          >
         

          <div className="p-8">

           
            <div className="mb-7 font-sans text-foreground">
              <h1 className="text-xl font-bold tracking-tight mb-1.5">
                Welcome back
              </h1>
              <p className="text-[13px] text-gray-500 dark:text-inherit">
                Sign in to continue your interview practice.
              </p>
            </div>

           
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-sans uppercase tracking-widest text-foreground">
                      Email address
                    </label>
                    <input
                      {...field}
                      type="email"
                      placeholder="coldy@example.com"
                      autoComplete="email"
                      className={cn(
                        "w-full bg-gray-50 dark:bg-onyx border rounded-xl px-4 py-3",
                        "text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20",
                        "outline-none transition-colors duration-150",
                        fieldState.invalid
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-300 dark:border-white/10 focus:border-spring"
                      )}
                    />
                    {fieldState.error && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 font-sans">
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
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-sans uppercase tracking-widest text-foreground">
                        Password
                      </label>
                      
                      <a href="/auth/forgot-password"
                        className="text-[10px] font-sans text-gray-400 dark:text-white/30 hover:text-spring transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="botenayo@32-jk"
                        autoComplete="current-password"
                        className={cn(
                          "w-full bg-gray-50 dark:bg-onyx border rounded-xl px-4 py-3 pr-11",
                          "text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20",
                          "outline-none transition-colors duration-150",
                          fieldState.invalid
                            ? "border-red-500/70 focus:border-red-400"
                            : "border-gray-300 dark:border-white/10 focus:border-spring"
                        )}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldState.error && (
                      <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 font-sans">
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
                  "bg-spring hover:bg-spring-pale text-spring-deep",
                  "text-[14px] font-bold tracking-tight",
                  "transition-all duration-200 hover:-translate-y-px",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin size-4" />
                    Signing in…
                  </>
                ) : (
                  "Sign in →"
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-[10px] font-sans text-gray-400 dark:text-white/30 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-[12px] text-gray-500 dark:text-gray-400">
              {`Don't have an account?`}{" "}
              
              <a href="/auth/sign-up"
                className="text-spring hover:text-spring-pale transition-colors font-semibold"
              >
                Create one
              </a>
            </p>

          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 font-sans mt-6">
          Having trouble?{" "}
          <a href="/support" className="underline hover:text-gray-700 dark:hover:text-white/40 transition-colors">
            Contact support
          </a>
        </p>

      </div>
  );
}