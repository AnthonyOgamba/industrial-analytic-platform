import { redirect } from "next/navigation";

export default function ApiSecurityPage() {
  redirect("/security-ops?tab=api-gateway");
}
