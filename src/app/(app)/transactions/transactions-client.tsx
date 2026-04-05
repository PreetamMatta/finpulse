"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  merchant?: string | null;
  date: string;
  notes?: string | null;
  account: { id: string; name: string };
  category?: { id: string; name: string; color: string } | null;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TransactionsClientProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function TransactionsClient({
  transactions: initialTransactions,
  accounts,
  categories,
  currentPage,
  totalPages,
  totalCount,
}: TransactionsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Add transaction form
  const [form, setForm] = useState({
    amount: "",
    description: "",
    accountId: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Client-side filtering
  const filtered = initialTransactions.filter((t) => {
    if (
      search &&
      !t.description.toLowerCase().includes(search.toLowerCase()) &&
      !(t.merchant && t.merchant.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    if (accountFilter !== "all" && t.account.id !== accountFilter) return false;
    if (categoryFilter !== "all" && t.category?.id !== categoryFilter)
      return false;
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.date) > new Date(dateTo + "T23:59:59"))
      return false;
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "date":
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "description":
        cmp = a.description.localeCompare(b.description);
        break;
      case "amount":
        cmp = a.amount - b.amount;
        break;
      case "category":
        cmp = (a.category?.name || "").localeCompare(b.category?.name || "");
        break;
      case "account":
        cmp = a.account.name.localeCompare(b.account.name);
        break;
      default:
        cmp = 0;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function clearFilters() {
    setSearch("");
    setAccountFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters =
    search || accountFilter !== "all" || categoryFilter !== "all" || dateFrom || dateTo;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          description: form.description,
          accountId: form.accountId,
          categoryId: form.categoryId || undefined,
          date: form.date,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      setDialogOpen(false);
      setForm({
        amount: "",
        description: "",
        accountId: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      router.refresh();
    } catch {
      // TODO: show error toast
    } finally {
      setSubmitting(false);
    }
  }

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <span className="ml-1 text-zinc-600">&#8597;</span>;
    return (
      <span className="ml-1 text-zinc-300">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Transactions</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {totalCount} total transaction{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Description
                </label>
                <Input
                  placeholder="e.g. Grocery store"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Account
                  </label>
                  <Select
                    value={form.accountId}
                    onValueChange={(v) => setForm({ ...form, accountId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Category
                  </label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Notes
                </label>
                <textarea
                  className="flex min-h-20 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search description or merchant..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-[160px]"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
          />
          <Input
            type="date"
            className="w-[160px]"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/50">
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("date")}
                >
                  Date
                  <SortIcon field="date" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("description")}
                >
                  Description
                  <SortIcon field="description" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("category")}
                >
                  Category
                  <SortIcon field="category" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("account")}
                >
                  Account
                  <SortIcon field="account" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("amount")}
                >
                  Amount
                  <SortIcon field="amount" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-zinc-500 py-12"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((t) => (
                  <>
                    <TableRow
                      key={t.id}
                      className="border-zinc-800 cursor-pointer hover:bg-zinc-800/50"
                      onClick={() =>
                        setExpandedId(expandedId === t.id ? null : t.id)
                      }
                    >
                      <TableCell className="text-zinc-400">
                        {formatDate(new Date(t.date))}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-zinc-100">
                            {t.description}
                          </span>
                          {t.merchant && (
                            <span className="text-zinc-500 text-xs ml-2">
                              {t.merchant}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.category ? (
                          <Badge
                            variant="outline"
                            className="border-zinc-700"
                            style={{
                              backgroundColor: t.category.color + "20",
                              color: t.category.color,
                              borderColor: t.category.color + "40",
                            }}
                          >
                            {t.category.name}
                          </Badge>
                        ) : (
                          <span className="text-zinc-600 text-sm">
                            Uncategorized
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {t.account.name}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono tabular-nums",
                          t.amount >= 0 ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                    {expandedId === t.id && (
                      <TableRow
                        key={`${t.id}-expanded`}
                        className="border-zinc-800 bg-zinc-900/30"
                      >
                        <TableCell colSpan={5}>
                          <div className="py-2 px-4 space-y-1 text-sm">
                            {t.notes && (
                              <p className="text-zinc-400">
                                <span className="text-zinc-500 font-medium">
                                  Notes:
                                </span>{" "}
                                {t.notes}
                              </p>
                            )}
                            <p className="text-zinc-500">
                              Transaction ID: {t.id}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() =>
                router.push(`/transactions?page=${currentPage - 1}`)
              }
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4)
              );
              const page = start + i;
              if (page > totalPages) return null;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => router.push(`/transactions?page=${page}`)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                router.push(`/transactions?page=${currentPage + 1}`)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
