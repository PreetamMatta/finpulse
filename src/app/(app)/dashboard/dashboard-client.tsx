"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  CalendarDays,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency, formatDate, formatPercent, getAccountTypeColor, getAccountTypeLabel } from "@/lib/utils"

interface Metrics {
  netIncome: number
  totalSpending: number
  savingsRate: number
  netWorth: number
  spendingChange: number
}

interface Account {
  id: string
  name: string
  type: string
  institution: string | null
  balance: number
  creditLimit: number | null
  interestRate: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: string
  accountName: string
  categoryName: string | null
  categoryColor: string | null
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

interface BudgetProgress {
  id: string
  categoryName: string
  budgeted: number
  spent: number
  percentage: number
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  type: string
  deadline: string | null
}

interface DashboardClientProps {
  metrics: Metrics
  accounts: Account[]
  recentTransactions: Transaction[]
  monthlyData: MonthlyData[]
  budgetProgress: BudgetProgress[]
  goals: Goal[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-xl">
      <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400 capitalize">{entry.name}:</span>
          <span className="font-tabular font-semibold text-zinc-100">
            {formatCurrency(entry.value * 100)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DashboardClient({
  metrics,
  accounts,
  recentTransactions,
  monthlyData,
  budgetProgress,
  goals,
}: DashboardClientProps) {
  const savingsRateColor =
    metrics.savingsRate >= 20
      ? "text-emerald-400"
      : metrics.savingsRate >= 10
        ? "text-yellow-400"
        : "text-red-400"

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your financial overview at a glance
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Income */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Net Income</p>
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="mt-3 font-tabular text-2xl font-bold text-emerald-400">
              {formatCurrency(metrics.netIncome)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">This month</p>
          </CardContent>
        </Card>

        {/* Total Spending */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">
                Total Spending
              </p>
              <div className="rounded-lg bg-red-500/10 p-2">
                <CreditCard className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="mt-3 font-tabular text-2xl font-bold text-red-400">
              {formatCurrency(metrics.totalSpending)}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {metrics.spendingChange > 0 ? (
                <Badge
                  variant="destructive"
                  className="gap-0.5 bg-red-500/10 px-1.5 py-0 text-xs font-medium text-red-400 hover:bg-red-500/10"
                >
                  <ArrowUpRight className="h-3 w-3" />
                  {Math.abs(metrics.spendingChange).toFixed(1)}%
                </Badge>
              ) : (
                <Badge className="gap-0.5 bg-emerald-500/10 px-1.5 py-0 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10">
                  <ArrowDownRight className="h-3 w-3" />
                  {Math.abs(metrics.spendingChange).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs text-zinc-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Savings Rate</p>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <PiggyBank className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p
              className={cn(
                "mt-3 font-tabular text-2xl font-bold",
                savingsRateColor
              )}
            >
              {metrics.savingsRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {metrics.savingsRate >= 20
                ? "Great savings this month"
                : metrics.savingsRate >= 10
                  ? "Room for improvement"
                  : "Below target"}
            </p>
          </CardContent>
        </Card>

        {/* Net Worth */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Net Worth</p>
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Wallet className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <p className="mt-3 font-tabular text-2xl font-bold text-blue-400">
              {formatCurrency(metrics.netWorth)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Across all accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts + Chart row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Income vs Expenses Chart */}
        <Card className="border-zinc-800 bg-zinc-900 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#3f3f46"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
                  />
                  <Bar
                    dataKey="income"
                    fill="#34d399"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accounts */}
        <Card className="border-zinc-800 bg-zinc-900 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {accounts.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No accounts yet
              </p>
            ) : (
              accounts.map((account) => {
                const utilization =
                  account.type === "CREDIT_CARD" && account.creditLimit
                    ? (Math.abs(account.balance) / account.creditLimit) * 100
                    : null

                return (
                  <div
                    key={account.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {account.name}
                        </p>
                        {account.institution && (
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            {account.institution}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p
                          className={cn(
                            "font-tabular text-sm font-semibold",
                            account.balance >= 0
                              ? "text-zinc-100"
                              : "text-red-400"
                          )}
                        >
                          {formatCurrency(account.balance)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-0 px-1.5 py-0 text-[10px] font-medium",
                            getAccountTypeColor(account.type)
                          )}
                        >
                          {getAccountTypeLabel(account.type)}
                        </Badge>
                      </div>
                    </div>
                    {utilization !== null && (
                      <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">
                            Credit utilization
                          </span>
                          <span className="font-tabular text-[10px] text-zinc-500">
                            {utilization.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(utilization, 100)}
                          className="h-1.5"
                        />
                      </div>
                    )}
                    {account.type === "SAVINGS" && account.interestRate && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="border-emerald-800/50 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-400"
                        >
                          {account.interestRate}% APY
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress + Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget Progress */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Budget Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {budgetProgress.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No budgets configured
              </p>
            ) : (
              budgetProgress.map((budget) => {
                const barColor =
                  budget.percentage > 100
                    ? "text-red-400"
                    : budget.percentage >= 80
                      ? "text-yellow-400"
                      : "text-emerald-400"

                const progressColor =
                  budget.percentage > 100
                    ? "[&>div]:bg-red-500"
                    : budget.percentage >= 80
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-emerald-500"

                return (
                  <div key={budget.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-300">
                        {budget.categoryName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-tabular text-xs text-zinc-400">
                          {formatCurrency(budget.spent)}
                        </span>
                        <span className="text-xs text-zinc-600">/</span>
                        <span className="font-tabular text-xs text-zinc-500">
                          {formatCurrency(budget.budgeted)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={Math.min(budget.percentage, 100)}
                        className={cn("h-2 flex-1 bg-zinc-800", progressColor)}
                      />
                      <span
                        className={cn(
                          "font-tabular text-xs font-medium",
                          barColor
                        )}
                      >
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {tx.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {formatDate(tx.date)}
                        </span>
                        <span className="text-zinc-700">&middot;</span>
                        <span className="truncate text-xs text-zinc-500">
                          {tx.accountName}
                        </span>
                      </div>
                    </div>
                    {tx.categoryName && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-zinc-700/50 bg-zinc-800/50 px-2 py-0 text-[10px] text-zinc-400"
                      >
                        {tx.categoryName}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "shrink-0 font-tabular text-sm font-semibold",
                        tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-zinc-200">
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const progress =
                  goal.targetAmount > 0
                    ? (goal.currentAmount / goal.targetAmount) * 100
                    : 0

                return (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {goal.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1.5 border-zinc-700/50 bg-zinc-800/50 px-1.5 py-0 text-[10px] text-zinc-400"
                        >
                          {goal.type}
                        </Badge>
                      </div>
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <Target className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="font-tabular text-sm font-semibold text-zinc-100">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="font-tabular text-xs text-zinc-500">
                          of {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(progress, 100)}
                        className="h-2 bg-zinc-800 [&>div]:bg-blue-500"
                      />
                    </div>
                    {goal.deadline && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">
                          {formatDate(goal.deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
