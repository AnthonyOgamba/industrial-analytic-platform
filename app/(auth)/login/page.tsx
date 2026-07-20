import { Suspense } from "react";
import { AuthPageLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <AuthPageLayout skipLabel="Skip to login form" heroTitle="Empower your decisions with real-time data insights." heroDescription="Join businesses using Divu Analytics to track performance, predict trends, and optimize operations across the globe."><Suspense><LoginForm /></Suspense></AuthPageLayout>;
}
