import { auth } from "@/lib/auth";
import { fetchBackend } from "@/lib/api";
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

  const [txRes, accounts, categories] = await Promise.all([
    fetchBackend(`/api/transactions?page=${page}&limit=${perPage}`),
    fetchBackend("/api/accounts"),
    fetchBackend("/api/categories")
  ]);

  return (
    <TransactionsClient
      transactions={txRes.transactions}
      accounts={accounts}
      categories={categories}
      currentPage={page}
      totalPages={txRes.totalPages}
      totalCount={txRes.total}
    />
  );
}
