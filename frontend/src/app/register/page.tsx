"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <AuthForm
      title="Create an account"
      submitLabel="Register"
      fields={[
        { name: "name", label: "Name", type: "text", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
        },
        {
          name: "password_confirmation",
          label: "Confirm password",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      onSubmit={async (v) => {
        await register(v.name, v.email, v.password, v.password_confirmation);
        router.replace("/todos");
      }}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-slate-900 underline">
            Sign in
          </Link>
        </>
      }
    />
  );
}
