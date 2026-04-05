import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const perPage = 20;

  const [transactions, totalCount, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { account: true, category: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.transaction.count({
      where: { userId: session.user.id },
    }),
    prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TransactionsClient
      transactions={JSON.parse(JSON.stringify(transactions))}
      accounts={JSON.parse(JSON.stringify(accounts))}
      categories={JSON.parse(JSON.stringify(categories))}
      currentPage={page}
      totalPages={Math.ceil(totalCount / perPage)}
      totalCount={totalCount}
    />
  );
}
