"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  const [sent,setSent]=useState(false);
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setSent(true);}
  return <AuthLayout title="Reset your password" description="Enter your work email and we will send secure reset instructions."><form className="auth-form" onSubmit={submit}><label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><input required type="email" name="email" autoComplete="email" placeholder="Enter your email" style={{paddingLeft:"1rem"}} /></div></label><button className="auth-submit" type="submit">Send reset link</button>{sent&&<p role="status" className="text-sm text-emerald-700">If that account exists, reset instructions are ready to be sent by the configured identity provider.</p>}<p className="auth-account-copy"><Link href="/auth/signin">Return to sign in</Link></p></form></AuthLayout>;
}
