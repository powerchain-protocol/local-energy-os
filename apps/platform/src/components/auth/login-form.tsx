"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DemoAccounts } from "@/components/auth/demo-accounts";
import { Web3SignInButton } from "@/components/auth/web3-signin-button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Sign in failed");
      const destination = searchParams.get("next");
      window.location.assign(destination?.startsWith("/") ? destination : "/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  const social = (provider: string) => setError(`${provider} sign-in is available after its OAuth connection is configured.`);

  return (
    <form onSubmit={submit} className="auth-form">
      <label className="auth-field">
        <span>Email address</span>
        <div className="auth-input-wrap">
          <Mail aria-hidden className="auth-input-icon" />
          <input autoFocus required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" />
        </div>
      </label>

      <label className="auth-field">
        <span className="auth-label-row"><span>Password</span><Link href="/auth/forgot-password">Forgot password?</Link></span>
        <div className="auth-input-wrap">
          <LockKeyhole aria-hidden className="auth-input-icon" />
          <input required minLength={10} type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button>
        </div>
      </label>

      <label className="auth-check"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label>
      {error && <p role="alert" className="auth-error">{error}</p>}

      <button type="submit" disabled={pending} className="auth-submit"><span>{pending ? "Signing in…" : "Sign in"}</span><ArrowRight aria-hidden /></button>

      <div className="auth-divider"><span>or continue with</span></div>
      <Web3SignInButton />
      <div className="auth-social-grid">
        <button type="button" onClick={()=>social("Google")} className="auth-social"><span className="google-mark">G</span>Continue with Google</button>
        <button type="button" onClick={()=>social("Microsoft")} className="auth-social"><span className="microsoft-mark" aria-hidden><i/><i/><i/><i/></span>Continue with Microsoft</button>
      </div>

      <p className="auth-account-copy">Don&apos;t have an account? <Link href="/auth/signup">Create an account</Link></p>
      <details className="auth-demo"><summary>Use a demo account</summary><DemoAccounts /></details>
    </form>
  );
}
