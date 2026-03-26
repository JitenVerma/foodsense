"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ErrorBanner } from "./ErrorBanner";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

interface AuthPageClientProps {
  mode: "login" | "signup";
}

export function AuthPageClient({ mode }: AuthPageClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const authResponse = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authResponse.error) {
        throw authResponse.error;
      }

      router.push("/dashboard");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to complete authentication right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <section className="w-full rounded-[36px] border border-white/60 bg-white/90 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur-sm sm:p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
          {isLogin ? "Log in" : "Create account"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">
          {isLogin ? "Welcome back" : "Start building your meal history"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isLogin
            ? "Sign in to save analyzed meals, track today's macros, and review your history."
            : "Create an account to turn meal analysis into a daily tracking workflow."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
            />
          </label>

          {error ? <ErrorBanner message={error} /> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Working..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </section>
    </main>
  );
}
