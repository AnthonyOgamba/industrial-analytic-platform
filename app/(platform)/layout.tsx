import { PlatformShell } from "@/components/layout/platform-shell";
import { AccessProvider, ProtectedRoute } from "@/lib/access-control";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessProvider>
      <ProtectedRoute>
        <PlatformShell>{children}</PlatformShell>
      </ProtectedRoute>
    </AccessProvider>
  );
}
