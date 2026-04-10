import { auth } from "@/lib/auth";
import { fetchBackend } from "@/lib/api";
import { redirect } from "next/navigation";
import { AccountsClient } from "./accounts-client";

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const accounts = await fetchBackend("/api/accounts");

  accounts.sort((a: any, b: any) => a.name.localeCompare(b.name));

  return <AccountsClient accounts={accounts} />;
}
