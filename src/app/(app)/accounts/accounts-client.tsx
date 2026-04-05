"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
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

interface Account {
  id: string;
  name: string;
  type: string;
  institution?: string | null;
  balance: number;
  interestRate?: number | null;
  creditLimit?: number | null;
  color?: string | null;
}

interface AccountsClientProps {
  accounts: Account[];
}

const ACCOUNT_TYPES = [
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "INVESTMENT",
  "LOAN",
  "OTHER",
] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CHECKING: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-l-blue-500" },
  SAVINGS: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-l-emerald-500" },
  CREDIT_CARD: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-l-purple-500" },
  INVESTMENT: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-l-amber-500" },
  LOAN: { bg: "bg-red-500/10", text: "text-red-400", border: "border-l-red-500" },
  OTHER: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-l-zinc-500" },
};

const TYPE_LABELS: Record<string, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  CREDIT_CARD: "Credit Card",
  INVESTMENT: "Investment",
  LOAN: "Loan",
  OTHER: "Other",
};

export function AccountsClient({ accounts }: AccountsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    type: "CHECKING",
    institution: "",
    balance: "",
    interestRate: "",
    creditLimit: "",
    color: "#3b82f6",
  };

  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setEditingAccount(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setForm({
      name: account.name,
      type: account.type,
      institution: account.institution || "",
      balance: String(account.balance),
      interestRate: account.interestRate ? String(account.interestRate) : "",
      creditLimit: account.creditLimit ? String(account.creditLimit) : "",
      color: account.color || "#3b82f6",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        type: form.type,
        institution: form.institution || undefined,
        balance: parseFloat(form.balance),
        interestRate: form.interestRate
          ? parseFloat(form.interestRate)
          : undefined,
        creditLimit: form.creditLimit
          ? parseFloat(form.creditLimit)
          : undefined,
        color: form.color,
      };

      const url = editingAccount
        ? `/api/accounts/${editingAccount.id}`
        : "/api/accounts";
      const method = editingAccount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save account");
      setDialogOpen(false);
      setEditingAccount(null);
      setForm(emptyForm);
      router.refresh();
    } catch {
      // TODO: show error toast
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this account?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      // TODO: show error toast
    } finally {
      setDeleting(null);
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Accounts</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} &middot;
            Total balance:{" "}
            <span
              className={cn(
                "font-mono tabular-nums font-medium",
                totalBalance >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatCurrency(totalBalance)}
            </span>
          </p>
        </div>
        <Button onClick={openAdd}>Add Account</Button>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500 mb-4">No accounts yet</p>
            <Button onClick={openAdd}>Add Your First Account</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const typeStyle = TYPE_COLORS[account.type] || TYPE_COLORS.OTHER;
            const utilization =
              account.type === "CREDIT_CARD" && account.creditLimit
                ? Math.min(
                    100,
                    (Math.abs(account.balance) / account.creditLimit) * 100
                  )
                : null;

            return (
              <div
                key={account.id}
                className={cn(
                  "bg-zinc-900 border border-zinc-800 rounded-xl p-6 border-l-4 hover:shadow-lg hover:shadow-zinc-900/50 transition-shadow",
                  typeStyle.border
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-lg">
                      {account.name}
                    </h3>
                    {account.institution && (
                      <p className="text-sm text-zinc-400">
                        {account.institution}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-zinc-700",
                      typeStyle.bg,
                      typeStyle.text
                    )}
                  >
                    {TYPE_LABELS[account.type] || account.type}
                  </Badge>
                </div>

                <p
                  className={cn(
                    "text-2xl font-bold font-mono tabular-nums mb-4",
                    account.balance >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {formatCurrency(account.balance)}
                </p>

                {/* Credit card utilization */}
                {utilization !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Utilization</span>
                      <span>{utilization.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          utilization > 80
                            ? "bg-red-500"
                            : utilization > 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Credit limit: {formatCurrency(account.creditLimit!)}
                    </p>
                  </div>
                )}

                {/* Interest rate for savings/loans */}
                {(account.type === "SAVINGS" || account.type === "LOAN") &&
                  account.interestRate != null && (
                    <p className="text-sm text-zinc-400 mb-4">
                      Interest rate:{" "}
                      <span className="text-zinc-200 font-medium">
                        {account.interestRate}%
                      </span>
                    </p>
                  )}

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(account)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(account.id)}
                    disabled={deleting === account.id}
                  >
                    {deleting === account.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Account" : "Add Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Name</label>
              <Input
                placeholder="e.g. Main Checking"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Type
                </label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Institution
                </label>
                <Input
                  placeholder="e.g. Chase"
                  value={form.institution}
                  onChange={(e) =>
                    setForm({ ...form, institution: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Balance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={form.balance}
                  onChange={(e) =>
                    setForm({ ...form, balance: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Color
                </label>
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-10 p-1 cursor-pointer"
                />
              </div>
            </div>

            {(form.type === "SAVINGS" || form.type === "LOAN") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Interest Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 4.5"
                  value={form.interestRate}
                  onChange={(e) =>
                    setForm({ ...form, interestRate: e.target.value })
                  }
                />
              </div>
            )}

            {form.type === "CREDIT_CARD" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Credit Limit
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 10000"
                  value={form.creditLimit}
                  onChange={(e) =>
                    setForm({ ...form, creditLimit: e.target.value })
                  }
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingAccount
                    ? "Save Changes"
                    : "Add Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
