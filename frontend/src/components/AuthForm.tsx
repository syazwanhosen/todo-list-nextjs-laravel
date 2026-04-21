"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { ApiError } from "@/lib/types";

export interface AuthField {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
}

interface Props {
  title: string;
  submitLabel: string;
  fields: AuthField[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  footer: ReactNode;
}

export function AuthForm({ title, submitLabel, fields, onSubmit, footer }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit(values);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message);
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-slate-700"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              value={values[field.name]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.name]: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {fieldErrors[field.name]?.map((msg) => (
              <p key={msg} className="text-xs text-red-600">
                {msg}
              </p>
            ))}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? "Please wait…" : submitLabel}
        </button>

        <div className="text-center text-sm text-slate-600">{footer}</div>
      </form>
    </div>
  );
}
