"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { passwordIsValid } from "@powerchain/auth/password-policy";
import { AuthFormFeedback, AuthSubmitButton } from "./auth-form-feedback";
import { PasswordField } from "./password-field";

const PROVIDER_MESSAGE = "Password authentication is not enabled in this deployment yet. No credential was submitted or stored. Use the implemented Solana authentication flow or configure a credential provider before enabling this form.";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault(); setFeedback(null); setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setPending(false); setFeedback(PROVIDER_MESSAGE);
  }
  return <form className="pc-auth-form" onSubmit={submit} noValidate>
    {feedback ? <AuthFormFeedback state="info" title="Credential provider not configured" message={feedback}/> : null}
    <div className="pc-auth-field-group"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required/></div>
    <PasswordField id="password" value={password} onChange={setPassword}/>
    <div className="pc-auth-form-row"><label className="pc-auth-check"><input type="checkbox" name="remember"/><span>Remember this browser</span></label><Link href="/forgot-password">Forgot password?</Link></div>
    <AuthSubmitButton pending={pending}>Sign in</AuthSubmitButton>
    <div className="pc-auth-divider"><span>or</span></div>
    <button className="pc-auth-secondary" type="button" disabled aria-disabled="true" title="Install and configure a wallet provider to enable this control">Solana wallet provider not configured</button>
  </form>;
}

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const valid = useMemo(() => passwordIsValid(password, email) && confirm === password && /.+@.+\..+/.test(email), [password, confirm, email]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setFeedback(null);
    if (!valid) { setFeedback("Complete every password rule, enter a valid email address, and confirm the same password before continuing."); return; }
    setPending(true); await new Promise((resolve) => setTimeout(resolve, 350)); setPending(false); setFeedback(PROVIDER_MESSAGE);
  }
  return <form className="pc-auth-form" onSubmit={submit} noValidate>
    {feedback ? <AuthFormFeedback state={valid ? "info" : "error"} title={valid ? "Credential provider not configured" : "Account details need attention"} message={feedback}/> : null}
    <div className="pc-auth-field-group"><label htmlFor="signup-email">Work email</label><input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required/></div>
    <PasswordField id="new-password" label="Create password" value={password} onChange={setPassword} email={email} autoComplete="new-password" showRules/>
    <PasswordField id="confirm-password" label="Confirm password" value={confirm} onChange={setConfirm} email={email} autoComplete="new-password"/>
    {confirm && confirm !== password ? <p className="pc-auth-inline-error" role="alert">Passwords do not match.</p> : null}
    <label className="pc-auth-check pc-auth-check-long"><input type="checkbox" required/><span>I understand that account authentication does not authorize wallet transactions, energy dispatch or organization-level financial actions.</span></label>
    <AuthSubmitButton pending={pending}>Create account</AuthSubmitButton>
  </form>;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setPending(true); await new Promise((resolve) => setTimeout(resolve, 350)); setPending(false); setSent(true); }
  if (sent) return <AuthFormFeedback state="success" title="Request accepted" message="If a credential account exists for that address, the configured identity provider will send reset instructions. PowerChain does not disclose whether an email is registered."/>;
  return <form className="pc-auth-form" onSubmit={submit}><div className="pc-auth-field-group"><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required/></div><AuthSubmitButton pending={pending}>Request reset</AuthSubmitButton></form>;
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const valid = passwordIsValid(password) && confirm === password;
  async function submit(event: FormEvent) { event.preventDefault(); if (!valid) { setFeedback("Complete every password rule and confirm the same password."); return; } setPending(true); await new Promise((resolve) => setTimeout(resolve, 350)); setPending(false); setFeedback(PROVIDER_MESSAGE); }
  return <form className="pc-auth-form" onSubmit={submit}>{feedback ? <AuthFormFeedback state={valid ? "info" : "error"} title={valid ? "Credential provider not configured" : "Password needs attention"} message={feedback}/> : null}<PasswordField id="reset-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" showRules/><PasswordField id="reset-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password"/>{confirm && confirm !== password ? <p className="pc-auth-inline-error" role="alert">Passwords do not match.</p> : null}<AuthSubmitButton pending={pending}>Set new password</AuthSubmitButton></form>;
}
