"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "@/lib/validations/auth";
import { signUp } from "@/lib/actions/auth";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormState } from "@/lib/actions/auth"; // Import the FormState type

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // Initialize useFormState with the server action and initial state
  const [state, formAction] = useFormState<FormState, FormData>(signUp, {
    errors: undefined,
    message: undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (state.message) {
      alert(state.message);
      router.push("/login"); // Redirect after successful signup message
    } else if (state.errors && state.errors._form && state.errors._form.length > 0) {
      alert(state.errors._form[0]); // Display general form errors
    }
  }, [state, router]);

  const onSubmit = (data: SignUpSchema) => {
    // This function acts as a client-side intermediary if needed for client-only validation
    // The formAction will directly handle the server action when submitted
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              required
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm font-medium text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              type="text"
              placeholder="Acme Corp"
              required
              {...register("orgName")}
            />
            {errors.orgName && (
              <p className="text-sm font-medium text-destructive">
                {errors.orgName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              {...register("password")}
            />
             {errors.password && (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
