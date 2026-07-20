import { AuthPageLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-form";

export default function ForgotPasswordPage() {
  return <AuthPageLayout skipLabel="Skip to password reset form" heroTitle="Recover access without losing visibility." heroDescription="Reset your password and return to monitoring performance, governance, alerts, and operational data." showMetrics={false}><ForgotPasswordForm /></AuthPageLayout>;
}
