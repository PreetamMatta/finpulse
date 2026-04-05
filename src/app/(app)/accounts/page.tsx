import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountsClient } from "./accounts-client";

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return <AccountsClient accounts={JSON.parse(JSON.stringify(accounts))} />;
}
