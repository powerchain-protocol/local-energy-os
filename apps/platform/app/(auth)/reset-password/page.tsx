import Link from "next/link";
import { AuthShell } from "../../../components/auth-shell";
import { ResetPasswordForm } from "../../../components/credential-form";
export default function ResetPasswordPage(){return <AuthShell title="Choose a new password" description="Use a unique credential that satisfies every PowerChain password rule. Existing wallet links and organization memberships are not changed by a password reset." footer={<p><Link href="/sign-in">Return to sign in</Link></p>}><ResetPasswordForm/></AuthShell>}
