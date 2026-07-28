import { AuthPageLayout } from "@/components/auth/auth-layout";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default function ChangePasswordPage() {
  return (
    <AuthPageLayout
      skipLabel="Skip to password change form"
      heroTitle="Secure your DIVU Analytics account."
      heroDescription="Set your permanent password before accessing operational and analytical data."
      showMetrics={false}
    >
      <ChangePasswordForm />
    </AuthPageLayout>
  );
}
