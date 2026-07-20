import { AuthPageLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <AuthPageLayout skipLabel="Skip to password reset form" heroTitle="Secure your account and return to insight." heroDescription="Choose a strong new password, then return to your operational analytics with confidence." showMetrics={false}><ResetPasswordForm token={token} /></AuthPageLayout>;
}
