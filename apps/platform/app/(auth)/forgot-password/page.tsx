import Link from "next/link";
import { AuthShell } from "../../../components/auth-shell";
import { ForgotPasswordForm } from "../../../components/credential-form";
export default function ForgotPasswordPage(){return <AuthShell title="Reset your password" description="Request a reset without disclosing whether an account exists for the supplied email address." footer={<p><Link href="/sign-in">Return to sign in</Link></p>}><ForgotPasswordForm/></AuthShell>}
