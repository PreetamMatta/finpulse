const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // --- Seed Demo User ---
  const hashedPassword = await bcrypt.hash('password123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@finpulse.app' },
    update: {},
    create: {
      id: 'user-demo',
      email: 'demo@finpulse.app',
      name: 'Demo User',
      passwordHash: hashedPassword,
    },
  })
  console.log('Seeded demo user:', demoUser.email)

  // --- Seed Categories ---
  // Parent categories
  const parentCategories = [
    { id: 'cat-income', name: 'Income', type: 'INCOME', icon: 'DollarSign', color: '#16a34a' },
    { id: 'cat-housing', name: 'Housing', type: 'EXPENSE', icon: 'Home', color: '#2563eb' },
    { id: 'cat-transport', name: 'Transport', type: 'EXPENSE', icon: 'Car', color: '#7c3aed' },
    { id: 'cat-food', name: 'Food', type: 'EXPENSE', icon: 'UtensilsCrossed', color: '#f59e0b' },
    { id: 'cat-shopping', name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899' },
    { id: 'cat-subscriptions', name: 'Subscriptions', type: 'EXPENSE', icon: 'CreditCard', color: '#8b5cf6' },
    { id: 'cat-health', name: 'Health', type: 'EXPENSE', icon: 'Heart', color: '#ef4444' },
    { id: 'cat-personal', name: 'Personal', type: 'EXPENSE', icon: 'User', color: '#14b8a6' },
    { id: 'cat-travel', name: 'Travel', type: 'EXPENSE', icon: 'Plane', color: '#0ea5e9' },
    { id: 'cat-financial', name: 'Financial', type: 'EXPENSE', icon: 'Landmark', color: '#6b7280' },
    { id: 'cat-savings-investing', name: 'Savings & Investing', type: 'EXPENSE', icon: 'PiggyBank', color: '#16a34a' },
  ]

  for (const cat of parentCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
  console.log('Seeded parent categories')

  // Child categories
  const childCategories = [
    // Income subcategories
    { id: 'cat-income-salary', name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#16a34a', parentId: 'cat-income' },
    { id: 'cat-income-bonus', name: 'Bonus', type: 'INCOME', icon: 'Gift', color: '#16a34a', parentId: 'cat-income' },
    { id: 'cat-income-interest', name: 'Interest', type: 'INCOME', icon: 'Percent', color: '#16a34a', parentId: 'cat-income' },
    { id: 'cat-income-investment-returns', name: 'Investment Returns', type: 'INCOME', icon: 'TrendingUp', color: '#16a34a', parentId: 'cat-income' },
    { id: 'cat-income-side', name: 'Side Income', type: 'INCOME', icon: 'Zap', color: '#16a34a', parentId: 'cat-income' },
    { id: 'cat-income-refunds', name: 'Refunds', type: 'INCOME', icon: 'RotateCcw', color: '#16a34a', parentId: 'cat-income' },

    // Housing subcategories
    { id: 'cat-housing-rent', name: 'Rent', type: 'EXPENSE', icon: 'Home', color: '#2563eb', parentId: 'cat-housing' },
    { id: 'cat-housing-utilities', name: 'Utilities', type: 'EXPENSE', icon: 'Zap', color: '#2563eb', parentId: 'cat-housing' },
    { id: 'cat-housing-internet', name: 'Internet', type: 'EXPENSE', icon: 'Wifi', color: '#2563eb', parentId: 'cat-housing' },
    { id: 'cat-housing-renters-insurance', name: 'Renters Insurance', type: 'EXPENSE', icon: 'Shield', color: '#2563eb', parentId: 'cat-housing' },

    // Transport subcategories
    { id: 'cat-transport-car-payment', name: 'Car Payment', type: 'EXPENSE', icon: 'Car', color: '#7c3aed', parentId: 'cat-transport' },
    { id: 'cat-transport-gas', name: 'Gas', type: 'EXPENSE', icon: 'Fuel', color: '#7c3aed', parentId: 'cat-transport' },
    { id: 'cat-transport-insurance', name: 'Insurance', type: 'EXPENSE', icon: 'Shield', color: '#7c3aed', parentId: 'cat-transport' },
    { id: 'cat-transport-parking', name: 'Parking', type: 'EXPENSE', icon: 'ParkingCircle', color: '#7c3aed', parentId: 'cat-transport' },
    { id: 'cat-transport-rideshare', name: 'Rideshare', type: 'EXPENSE', icon: 'Navigation', color: '#7c3aed', parentId: 'cat-transport' },

    // Food subcategories
    { id: 'cat-food-groceries', name: 'Groceries', type: 'EXPENSE', icon: 'ShoppingCart', color: '#f59e0b', parentId: 'cat-food' },
    { id: 'cat-food-restaurants', name: 'Restaurants', type: 'EXPENSE', icon: 'UtensilsCrossed', color: '#f59e0b', parentId: 'cat-food' },
    { id: 'cat-food-coffee', name: 'Coffee', type: 'EXPENSE', icon: 'Coffee', color: '#f59e0b', parentId: 'cat-food' },
    { id: 'cat-food-delivery', name: 'Food Delivery', type: 'EXPENSE', icon: 'Truck', color: '#f59e0b', parentId: 'cat-food' },

    // Shopping subcategories
    { id: 'cat-shopping-clothing', name: 'Clothing', type: 'EXPENSE', icon: 'Shirt', color: '#ec4899', parentId: 'cat-shopping' },
    { id: 'cat-shopping-electronics', name: 'Electronics', type: 'EXPENSE', icon: 'Monitor', color: '#ec4899', parentId: 'cat-shopping' },
    { id: 'cat-shopping-home', name: 'Home', type: 'EXPENSE', icon: 'Armchair', color: '#ec4899', parentId: 'cat-shopping' },
    { id: 'cat-shopping-amazon', name: 'Amazon', type: 'EXPENSE', icon: 'Package', color: '#ec4899', parentId: 'cat-shopping' },
    { id: 'cat-shopping-general', name: 'General', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899', parentId: 'cat-shopping' },

    // Subscriptions subcategories
    { id: 'cat-subscriptions-streaming', name: 'Streaming', type: 'EXPENSE', icon: 'Tv', color: '#8b5cf6', parentId: 'cat-subscriptions' },
    { id: 'cat-subscriptions-software', name: 'Software', type: 'EXPENSE', icon: 'Code', color: '#8b5cf6', parentId: 'cat-subscriptions' },
    { id: 'cat-subscriptions-gym', name: 'Gym', type: 'EXPENSE', icon: 'Dumbbell', color: '#8b5cf6', parentId: 'cat-subscriptions' },
    { id: 'cat-subscriptions-cloud-storage', name: 'Cloud Storage', type: 'EXPENSE', icon: 'Cloud', color: '#8b5cf6', parentId: 'cat-subscriptions' },

    // Health subcategories
    { id: 'cat-health-medical', name: 'Medical', type: 'EXPENSE', icon: 'Stethoscope', color: '#ef4444', parentId: 'cat-health' },
    { id: 'cat-health-dental', name: 'Dental', type: 'EXPENSE', icon: 'Smile', color: '#ef4444', parentId: 'cat-health' },
    { id: 'cat-health-pharmacy', name: 'Pharmacy', type: 'EXPENSE', icon: 'Pill', color: '#ef4444', parentId: 'cat-health' },
    { id: 'cat-health-vision', name: 'Vision', type: 'EXPENSE', icon: 'Eye', color: '#ef4444', parentId: 'cat-health' },

    // Personal subcategories
    { id: 'cat-personal-haircut', name: 'Haircut', type: 'EXPENSE', icon: 'Scissors', color: '#14b8a6', parentId: 'cat-personal' },
    { id: 'cat-personal-gifts', name: 'Gifts', type: 'EXPENSE', icon: 'Gift', color: '#14b8a6', parentId: 'cat-personal' },
    { id: 'cat-personal-education', name: 'Education', type: 'EXPENSE', icon: 'GraduationCap', color: '#14b8a6', parentId: 'cat-personal' },

    // Travel subcategories
    { id: 'cat-travel-flights', name: 'Flights', type: 'EXPENSE', icon: 'Plane', color: '#0ea5e9', parentId: 'cat-travel' },
    { id: 'cat-travel-hotels', name: 'Hotels', type: 'EXPENSE', icon: 'Building', color: '#0ea5e9', parentId: 'cat-travel' },
    { id: 'cat-travel-activities', name: 'Activities', type: 'EXPENSE', icon: 'Map', color: '#0ea5e9', parentId: 'cat-travel' },

    // Financial subcategories
    { id: 'cat-financial-cc-fees', name: 'Credit Card Fees', type: 'EXPENSE', icon: 'CreditCard', color: '#6b7280', parentId: 'cat-financial' },
    { id: 'cat-financial-bank-fees', name: 'Bank Fees', type: 'EXPENSE', icon: 'Landmark', color: '#6b7280', parentId: 'cat-financial' },
    { id: 'cat-financial-atm', name: 'ATM', type: 'EXPENSE', icon: 'Banknote', color: '#6b7280', parentId: 'cat-financial' },

    // Savings & Investing subcategories
    { id: 'cat-si-401k', name: '401k Contribution', type: 'EXPENSE', icon: 'PiggyBank', color: '#16a34a', parentId: 'cat-savings-investing' },
    { id: 'cat-si-hysa', name: 'HYSA Transfer', type: 'EXPENSE', icon: 'ArrowRightLeft', color: '#16a34a', parentId: 'cat-savings-investing' },
    { id: 'cat-si-brokerage', name: 'Brokerage Deposit', type: 'EXPENSE', icon: 'TrendingUp', color: '#16a34a', parentId: 'cat-savings-investing' },
  ]

  for (const cat of childCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
  console.log('Seeded child categories')

  // --- Seed Accounts ---
  const accounts = [
    {
      id: 'acct-bofa-checking',
      userId: demoUser.id,
      name: 'BoFA Checking',
      type: 'CHECKING',
      institution: 'Bank of America',
      balance: 450000,
      color: '#2563eb',
    },
    {
      id: 'acct-sofi-hysa',
      userId: demoUser.id,
      name: 'SoFi HYSA',
      type: 'SAVINGS',
      institution: 'SoFi',
      balance: 1200000,
      interestRate: 4.5,
      color: '#16a34a',
    },
    {
      id: 'acct-amex-delta',
      userId: demoUser.id,
      name: 'Amex Delta Gold',
      type: 'CREDIT_CARD',
      institution: 'American Express',
      balance: -185000,
      creditLimit: 1000000,
      color: '#7c3aed',
    },
    {
      id: 'acct-robinhood',
      userId: demoUser.id,
      name: 'Robinhood',
      type: 'INVESTMENT',
      institution: 'Robinhood',
      balance: 2800000,
      color: '#f59e0b',
    },
    {
      id: 'acct-car-loan',
      userId: demoUser.id,
      name: 'Car Loan',
      type: 'LOAN',
      institution: 'Toyota Financial',
      balance: -1850000,
      interestRate: 4.9,
      color: '#ef4444',
    },
  ]

  for (const acct of accounts) {
    await prisma.account.upsert({
      where: { id: acct.id },
      update: {},
      create: acct,
    })
  }
  console.log('Seeded accounts')

  // --- Seed Goals ---
  const goals = [
    {
      id: 'goal-car-loan-payoff',
      userId: demoUser.id,
      name: 'Car Loan Payoff',
      type: 'DEBT_PAYOFF',
      targetAmount: 1850000,
      currentAmount: 0,
    },
    {
      id: 'goal-home-purchase',
      userId: demoUser.id,
      name: 'Home Purchase in India',
      type: 'SAVINGS',
      targetAmount: 5000000,
      currentAmount: 0,
    },
    {
      id: 'goal-macbook',
      userId: demoUser.id,
      name: 'MacBook Pro Fund',
      type: 'PURCHASE',
      targetAmount: 350000,
      currentAmount: 125000,
    },
    {
      id: 'goal-emergency-fund',
      userId: demoUser.id,
      name: 'Emergency Fund',
      type: 'EMERGENCY_FUND',
      targetAmount: 3000000,
      currentAmount: 800000,
    },
  ]

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
    })
  }
  console.log('Seeded goals')

  // --- Seed Auto-Categorization Rules ---
  const rules = [
    // Food - Groceries
    { keyword: 'walmart', categoryId: 'cat-food-groceries', priority: 10 },
    { keyword: 'kroger', categoryId: 'cat-food-groceries', priority: 10 },
    { keyword: 'whole foods', categoryId: 'cat-food-groceries', priority: 10 },
    { keyword: 'trader joe', categoryId: 'cat-food-groceries', priority: 10 },
    { keyword: 'costco', categoryId: 'cat-food-groceries', priority: 10 },
    { keyword: 'aldi', categoryId: 'cat-food-groceries', priority: 10 },

    // Food - Restaurants
    { keyword: 'chipotle', categoryId: 'cat-food-restaurants', priority: 10 },
    { keyword: 'mcdonald', categoryId: 'cat-food-restaurants', priority: 10 },
    { keyword: 'chick-fil-a', categoryId: 'cat-food-restaurants', priority: 10 },

    // Food - Coffee
    { keyword: 'starbucks', categoryId: 'cat-food-coffee', priority: 10 },
    { keyword: 'dunkin', categoryId: 'cat-food-coffee', priority: 10 },

    // Food - Delivery
    { keyword: 'doordash', categoryId: 'cat-food-delivery', priority: 10 },
    { keyword: 'uber eats', categoryId: 'cat-food-delivery', priority: 10 },
    { keyword: 'grubhub', categoryId: 'cat-food-delivery', priority: 10 },

    // Transport
    { keyword: 'uber', categoryId: 'cat-transport-rideshare', priority: 5 },
    { keyword: 'lyft', categoryId: 'cat-transport-rideshare', priority: 10 },
    { keyword: 'shell oil', categoryId: 'cat-transport-gas', priority: 10 },
    { keyword: 'chevron', categoryId: 'cat-transport-gas', priority: 10 },
    { keyword: 'exxon', categoryId: 'cat-transport-gas', priority: 10 },

    // Shopping
    { keyword: 'amazon', categoryId: 'cat-shopping-amazon', priority: 5 },
    { keyword: 'target', categoryId: 'cat-shopping-general', priority: 5 },
    { keyword: 'apple.com', categoryId: 'cat-shopping-electronics', priority: 10 },
    { keyword: 'best buy', categoryId: 'cat-shopping-electronics', priority: 10 },

    // Subscriptions
    { keyword: 'netflix', categoryId: 'cat-subscriptions-streaming', priority: 10 },
    { keyword: 'spotify', categoryId: 'cat-subscriptions-streaming', priority: 10 },
    { keyword: 'hulu', categoryId: 'cat-subscriptions-streaming', priority: 10 },
    { keyword: 'youtube premium', categoryId: 'cat-subscriptions-streaming', priority: 10 },
    { keyword: 'icloud', categoryId: 'cat-subscriptions-cloud-storage', priority: 10 },
    { keyword: 'google storage', categoryId: 'cat-subscriptions-cloud-storage', priority: 10 },

    // Health
    { keyword: 'cvs', categoryId: 'cat-health-pharmacy', priority: 10 },
    { keyword: 'walgreens', categoryId: 'cat-health-pharmacy', priority: 10 },
  ]

  // Delete existing rules for demo user and recreate
  await prisma.categorizationRule.deleteMany({ where: { userId: demoUser.id } })
  for (const rule of rules) {
    await prisma.categorizationRule.create({
      data: {
        userId: demoUser.id,
        pattern: rule.keyword,
        categoryId: rule.categoryId,
        priority: rule.priority,
      },
    })
  }
  console.log('Seeded categorization rules')

  console.log('Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
