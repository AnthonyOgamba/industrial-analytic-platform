import { UsersPage } from "@/components/users/users-page";
import { SensitiveUserActions } from "@/components/users/sensitive-user-actions";

export default function Page() {
  return <div className="space-y-5"><UsersPage /><SensitiveUserActions /></div>;
}
