import Link from "next/link";
import { AccountStateCard } from "../../../components/account-state-card";
import { AuthShell } from "../../../components/auth-shell";
import { SignInForm } from "../../../components/credential-form";
export default function SignInPage(){return <AuthShell title="Welcome back" description="Sign in to your PowerChain account. Authentication is separate from wallet transaction approval and organization permissions." footer={<p>New to PowerChain? <Link href="/sign-up">Create an account</Link></p>}><AccountStateCard state="SIGNED_OUT"/><SignInForm/></AuthShell>}
