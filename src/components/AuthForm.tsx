"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthForm({
  mode,
  hint,
}: {
  mode: "login" | "register";
  hint?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login" ? { email, password } : { name, email, password },
        ),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — is the server running?");
      setBusy(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <span className="text-lg font-extrabold tracking-tight text-[var(--ink-dim)] hover:text-white">
            ← Qro<span className="gradient-text">via</span>
          </span>
        </Link>

        <div className="card p-7 shadow-glow sm:p-9">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--ink-dim)]">
            {isLogin
              ? "Log in to manage your codes and scans."
              : "Free plan includes 3 dynamic codes. No card required."}
          </p>

          {hint && (
            <div className="mt-5 rounded-xl border border-lime/25 bg-lime/10 px-4 py-3 text-sm">
              <span className="font-semibold text-lime">Demo account</span>
              <span className="text-[var(--ink-dim)]"> — email </span>
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">{hint.split(" / ")[0]}</code>
              <span className="text-[var(--ink-dim)]"> · password </span>
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">{hint.split(" / ")[1]}</code>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  required
                  minLength={2}
                />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "demo@qrovia.app" : "you@company.com"}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "demo1234" : "At least 8 characters"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={isLogin ? 1 : 8}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className={`${isLogin ? "btn-primary" : "btn-lime"} w-full disabled:opacity-60`}>
              {busy ? "…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--ink-dim)]">
            {isLogin ? (
              <>No account? <Link href="/register" className="font-semibold text-violet-300 hover:underline">Register free</Link></>
            ) : (
              <>Already have one? <Link href="/login" className="font-semibold text-violet-300 hover:underline">Log in</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
