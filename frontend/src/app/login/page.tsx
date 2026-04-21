"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      onSubmit={async (v) => {
        await login(v.email, v.password);
        router.replace("/todos");
      }}
      footer={
        <>
          No account?{" "}
          <Link href="/register" className="text-slate-900 underline">
            Register
          </Link>
        </>
      }
    />
  );
}
