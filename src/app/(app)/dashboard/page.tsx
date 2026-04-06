import { auth } from "@/lib/auth"
import { fetchBackend } from "@/lib/api"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const [accounts, goals, budgets] = await Promise.all([
    fetchBackend("/api/accounts"),
    fetchBackend("/api/goals"),
    fetchBackend("/api/budgets"),
  ])

  // To avoid adding completely new complex APIs if not necessary, we can just fetch transactions for the last 6 months
  // and process them here. Or fetch this month, last month, and recent via specific API calls.
  // For simplicity since we replaced Prisma, let's fetch transactions up to 6 months ago.

  const sixMonthsAgo = startOfMonth(subMonths(now, 5))
  const txData = await fetchBackend(`/api/transactions?startDate=${sixMonthsAgo.toISOString()}&endDate=${monthEnd.toISOString()}&limit=1000`)
  const allTx = txData.transactions || []

  const thisMonthTx = allTx.filter((t: any) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
  const lastMonthTx = allTx.filter((t: any) => new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd)

  // Sort for recent tx
  const recentTx = [...allTx].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  // Actually we need `budgetsWithCategory` but our API only returned budgets.
  // We can fetch categories and map them.
  const categories = await fetchBackend("/api/categories")
  const budgetsWithCategory = budgets.map((b: any) => ({
    ...b,
    category: categories.find((c: any) => c.id === b.categoryId) || { name: "Unknown" }
  }))

  // Calculate metrics
  const thisMonthIncome = thisMonthTx.filter((t: any) => t.amount > 0).reduce((s: number, t: any) => s + t.amount, 0)
  const thisMonthSpending = thisMonthTx.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + Math.abs(t.amount), 0)
  const lastMonthSpending = lastMonthTx.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + Math.abs(t.amount), 0)
  const savingsRate = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthSpending) / thisMonthIncome) * 100 : 0
  const netWorth = accounts.reduce((s: number, a: any) => s + a.balance, 0)
  const spendingChange = lastMonthSpending > 0 ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0

  // Spending by category
  const spendingByCategory: Record<string, number> = {}
  for (const tx of thisMonthTx.filter((t: any) => t.amount < 0)) {
    const cat = tx.categoryId || "Uncategorized"
    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Math.abs(tx.amount)
  }

  // Last 6 months income vs expense
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i)
    monthlyData.push({
      month: m.toLocaleString("default", { month: "short" }),
      income: 0,
      expenses: 0,
    })
  }

  const sixMonthTx = allTx

  for (const tx of sixMonthTx) {
    const txMonth = new Date(tx.date).toLocaleString("default", { month: "short" })
    const entry = monthlyData.find(m => m.month === txMonth)
    if (entry) {
      if (tx.amount > 0) entry.income += tx.amount
      else entry.expenses += Math.abs(tx.amount)
    }
  }

  // Convert to dollars for display
  const monthlyDataDollars = monthlyData.map(m => ({
    month: m.month,
    income: m.income / 100,
    expenses: m.expenses / 100,
  }))

  // Budget progress - compute spent per budget category this month
  const budgetProgress = budgetsWithCategory.map((b: any) => {
    const spent = thisMonthTx
      .filter((t: any) => t.amount < 0 && t.categoryId === b.categoryId)
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)
    return {
      id: b.id,
      categoryName: b.category.name,
      budgeted: b.amount,
      spent,
      percentage: b.amount > 0 ? (spent / b.amount) * 100 : 0,
    }
  })

  return (
    <DashboardClient
      metrics={{
        netIncome: thisMonthIncome,
        totalSpending: thisMonthSpending,
        savingsRate,
        netWorth,
        spendingChange,
      }}
      accounts={accounts.map((a: any) => ({
        ...a,
        balance: a.balance,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }))}
      recentTransactions={recentTx.map((t: any) => {
        const tAccount = accounts.find((a: any) => a.id === t.accountId) || { type: 'OTHER', name: 'Unknown' }
        const tCategory = categories.find((c: any) => c.id === t.categoryId)
        return {
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          type: tAccount.type,
          accountName: tAccount.name,
          categoryName: tCategory?.name || null,
          categoryColor: tCategory?.color || null,
        }
      })}
      monthlyData={monthlyDataDollars}
      budgetProgress={budgetProgress}
      goals={goals.map((g: any) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        type: g.type,
        deadline: g.deadline || null,
      }))}
    />
  )
}
