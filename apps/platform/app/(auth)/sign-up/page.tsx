import Link from "next/link";
import { AuthShell } from "../../../components/auth-shell";
import { SignUpForm } from "../../../components/credential-form";
export default function SignUpPage(){return <AuthShell title="Create your account" description="Start with an identity account. Organization membership, wallets and execution permissions are linked only after separate verification." footer={<p>Already have an account? <Link href="/sign-in">Sign in</Link></p>}><SignUpForm/></AuthShell>}
