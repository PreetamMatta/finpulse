import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

  // Fetch in parallel
  const [accounts, thisMonthTx, lastMonthTx, recentTx, goals, budgetsWithCategory] = await Promise.all([
    prisma.account.findMany({ where: { userId: session.user.id, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({ where: { userId: session.user.id, date: { gte: monthStart, lte: monthEnd } } }),
    prisma.transaction.findMany({ where: { userId: session.user.id, date: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.transaction.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" }, take: 10, include: { account: true, category: true } }),
    prisma.goal.findMany({ where: { userId: session.user.id, isCompleted: false } }),
    prisma.budget.findMany({ where: { userId: session.user.id }, include: { category: true } }),
  ])

  // Calculate metrics
  const thisMonthIncome = thisMonthTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const thisMonthSpending = thisMonthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const lastMonthSpending = lastMonthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const savingsRate = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthSpending) / thisMonthIncome) * 100 : 0
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0)
  const spendingChange = lastMonthSpending > 0 ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0

  // Spending by category
  const spendingByCategory: Record<string, number> = {}
  for (const tx of thisMonthTx.filter(t => t.amount < 0)) {
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

  // Fetch 6 months transactions for chart
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))
  const sixMonthTx = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: sixMonthsAgo, lte: monthEnd } },
  })

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
  const budgetProgress = budgetsWithCategory.map(b => {
    const spent = thisMonthTx
      .filter(t => t.amount < 0 && t.categoryId === b.categoryId)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
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
      accounts={accounts.map(a => ({
        ...a,
        balance: a.balance,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))}
      recentTransactions={recentTx.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date.toISOString(),
        type: t.account.type,
        accountName: t.account.name,
        categoryName: t.category?.name || null,
        categoryColor: t.category?.color || null,
      }))}
      monthlyData={monthlyDataDollars}
      budgetProgress={budgetProgress}
      goals={goals.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        type: g.type,
        deadline: g.deadline?.toISOString() || null,
      }))}
    />
  )
}
