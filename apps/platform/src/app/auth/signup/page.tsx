import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return <AuthLayout title="Create your workspace" description="Launch a secure renewable energy organization in minutes."><SignupForm /></AuthLayout>;
}
