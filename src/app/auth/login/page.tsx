"use client"

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "@/app/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";




export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  /*J'ai Change type en interface*/
  interface SignInResult {
    data: { user: { id: string; email: string; name: string } } | null;
    error: { message?: string; status?: number } | null;
  };

  function onSubmit(data: z.infer<typeof loginSchema>): void {
    startTransition(async () => {
      const { data: result, error }: SignInResult = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result) {
        toast.success("Loggedin successfully! ✅");
        router.push("/");
      } else {
        toast.error("Something went wrong! ❌");
      }
      console.log("Result:", result);
      console.log("Error:", error);
    });
  }

  return (
    <div className="font-mono">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to get started right away</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) =>
              console.log("Validation errors:", errors),
            )}
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="coldy.daroy@example.com"
                      type="email"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        {...field}
                        type={showPassword ? "text" : "password"}
                        className="relative"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff size={22} />
                        ) : (
                          <Eye size={22} />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
               disabled={isPending}
               className="bg-blue-600">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin size-4" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
