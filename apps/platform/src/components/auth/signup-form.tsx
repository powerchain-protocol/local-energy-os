"use client";

import { Building2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Web3SignInButton } from "@/components/auth/web3-signin-button";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const strength = useMemo(() => [password.length >= 10, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password)].filter(Boolean).length, [password]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!accepted) return setError("Accept the Terms and Privacy Policy to continue.");
    setPending(true);
    try {
      const response = await fetch("/api/v1/auth/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, organization, email, password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create account");
      router.push("/");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create account"); }
    finally { setPending(false); }
  }

  const field = (label: string, icon: ReactNode, input: ReactNode) => <label className="auth-field"><span>{label}</span><div className="auth-input-wrap">{icon}{input}</div></label>;
  const social = (provider: string) => setError(`${provider} sign-up is available after its OAuth connection is configured.`);

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="auth-two-col">
        {field("Full name", <UserRound className="auth-input-icon" aria-hidden />, <input required autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />)}
        {field("Organization", <Building2 className="auth-input-icon" aria-hidden />, <input required autoComplete="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Organization name" />)}
      </div>
      {field("Work email", <Mail className="auth-input-icon" aria-hidden />, <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />)}
      <label className="auth-field"><span>Password</span><div className="auth-input-wrap"><LockKeyhole className="auth-input-icon" aria-hidden /><input required minLength={10} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a secure password" /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div><div className="auth-strength" aria-label={`Password strength ${strength} of 4`}>{[0,1,2,3].map((i)=><i key={i} data-active={i<strength}/>)}</div><small>Use 10+ characters with uppercase, lowercase, and a number.</small></label>
      <label className="auth-check"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>I agree to the <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.</span></label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button type="submit" disabled={pending} className="auth-submit">{pending ? "Creating workspace…" : "Create workspace"}</button>
      <div className="auth-divider"><span>or continue with</span></div>
      <Web3SignInButton />
      <div className="auth-social-grid"><button type="button" onClick={()=>social("Google")} className="auth-social"><span className="google-mark">G</span>Google</button><button type="button" onClick={()=>social("Microsoft")} className="auth-social"><span className="microsoft-mark" aria-hidden><i/><i/><i/><i/></span>Microsoft</button></div>
      <p className="auth-account-copy">Already registered? <Link href="/auth/signin">Sign in</Link></p>
    </form>
  );
}
