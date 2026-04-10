"""
Seed script — populates the database with demo data.

Usage (inside backend container):
    python seed.py

Demo credentials:
    Email:    demo@finpulse.app
    Password: password123
"""

from datetime import datetime, timezone, timedelta
from database import engine
from models import (
    SQLModel, User, Account, Category, Transaction,
    Budget, Goal, CategorizationRule,
)
from sqlmodel import Session, select
import bcrypt
import uuid


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.now(timezone.utc)


def days_ago(n: int) -> datetime:
    return now() - timedelta(days=n)


def main():
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # ── Demo user ────────────────────────────────────────────
        existing = session.exec(select(User).where(User.email == "demo@finpulse.app")).first()
        if existing:
            print("Demo user already exists — skipping seed.")
            return

        hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
        user = User(
            id=uid(),
            email="demo@finpulse.app",
            name="Demo User",
            passwordHash=hashed,
            role="USER",
        )
        session.add(user)

        # ── Categories ───────────────────────────────────────────
        def cat(name, type_, icon=None, color="#6366f1", parent_id=None):
            c = Category(id=uid(), name=name, type=type_, icon=icon, color=color, parentId=parent_id)
            session.add(c)
            return c

        # Income
        income        = cat("Income",       "INCOME", "💰", "#22c55e")
        salary        = cat("Salary",        "INCOME", "💼", "#22c55e", income.id)
        freelance     = cat("Freelance",     "INCOME", "🧑‍💻", "#16a34a", income.id)
        investments   = cat("Investments",  "INCOME", "📈", "#15803d", income.id)

        # Expenses — housing
        housing       = cat("Housing",      "EXPENSE", "🏠", "#f59e0b")
        rent          = cat("Rent",         "EXPENSE", "🏠", "#f59e0b", housing.id)
        utilities     = cat("Utilities",    "EXPENSE", "💡", "#d97706", housing.id)

        # Expenses — food
        food          = cat("Food",         "EXPENSE", "🍔", "#ef4444")
        groceries     = cat("Groceries",    "EXPENSE", "🛒", "#ef4444", food.id)
        dining        = cat("Dining Out",   "EXPENSE", "🍽️",  "#dc2626", food.id)

        # Expenses — transport
        transport     = cat("Transport",    "EXPENSE", "🚗", "#8b5cf6")
        car_payment   = cat("Car Payment",  "EXPENSE", "🚙", "#7c3aed", transport.id)
        gas           = cat("Gas",          "EXPENSE", "⛽",  "#6d28d9", transport.id)

        # Expenses — subscriptions
        subscriptions = cat("Subscriptions","EXPENSE", "📱", "#06b6d4")
        streaming     = cat("Streaming",    "EXPENSE", "🎬", "#0891b2", subscriptions.id)

        # Expenses — health & personal
        health        = cat("Healthcare",   "EXPENSE", "🏥", "#f97316")
        personal      = cat("Personal",     "EXPENSE", "👤", "#ec4899")
        shopping      = cat("Shopping",     "EXPENSE", "🛍️",  "#a855f7")
        entertainment = cat("Entertainment","EXPENSE", "🎮", "#14b8a6")
        savings_cat   = cat("Savings",      "EXPENSE", "🏦", "#64748b")

        # ── Accounts ─────────────────────────────────────────────
        checking = Account(
            id=uid(), userId=user.id, name="BofA Checking",
            type="CHECKING", institution="Bank of America",
            balance=485320, color="#ef4444",
        )
        savings_acc = Account(
            id=uid(), userId=user.id, name="SoFi Savings",
            type="SAVINGS", institution="SoFi",
            balance=1250000, color="#22c55e",
        )
        credit = Account(
            id=uid(), userId=user.id, name="Amex Gold",
            type="CREDIT_CARD", institution="American Express",
            balance=-145600, creditLimit=500000, color="#f59e0b",
        )
        invest = Account(
            id=uid(), userId=user.id, name="Robinhood",
            type="INVESTMENT", institution="Robinhood",
            balance=3720000, color="#8b5cf6",
        )
        loan = Account(
            id=uid(), userId=user.id, name="Toyota Auto Loan",
            type="LOAN", institution="Toyota Financial",
            balance=-1540000, interestRate=4.9, color="#64748b",
        )
        for acc in [checking, savings_acc, credit, invest, loan]:
            session.add(acc)

        # ── Transactions ─────────────────────────────────────────
        def tx(account, amount, description, category, merchant=None, days=0):
            t = Transaction(
                id=uid(), userId=user.id, accountId=account.id,
                date=days_ago(days), amount=amount,
                description=description, categoryId=category.id,
                merchant=merchant,
            )
            session.add(t)

        # Income
        tx(checking,  895000, "Payroll Deposit",        salary,       "Acme Corp",      1)
        tx(checking,  895000, "Payroll Deposit",        salary,       "Acme Corp",     15)
        tx(checking,  895000, "Payroll Deposit",        salary,       "Acme Corp",     31)
        tx(checking,  150000, "Freelance Payment",      freelance,    "Client A",       5)
        tx(invest,     48200, "Dividend Income",        investments,  "Robinhood",     10)

        # Housing
        tx(checking, -180000, "Rent Payment",           rent,         "Landlord",       1)
        tx(checking,  -12400, "Electric Bill",          utilities,    "PG&E",           3)
        tx(checking,   -8900, "Internet",               utilities,    "Comcast",        5)

        # Food
        tx(credit,    -23400, "Whole Foods Market",     groceries,    "Whole Foods",    2)
        tx(credit,    -15600, "Trader Joe's",           groceries,    "Trader Joes",    6)
        tx(credit,    -8900,  "Chipotle",               dining,       "Chipotle",       3)
        tx(credit,    -14200, "Nobu Restaurant",        dining,       "Nobu",           8)
        tx(credit,    -6700,  "Starbucks",              dining,       "Starbucks",      1)
        tx(credit,    -5400,  "Uber Eats",              dining,       "Uber Eats",      4)

        # Transport
        tx(checking,  -45000, "Car Payment",            car_payment,  "Toyota",         1)
        tx(credit,    -7200,  "Shell Gas Station",      gas,          "Shell",          4)
        tx(credit,    -6800,  "Chevron",                gas,          "Chevron",       12)

        # Subscriptions
        tx(credit,    -1599,  "Netflix",                streaming,    "Netflix",        5)
        tx(credit,    -1399,  "Spotify",                streaming,    "Spotify",        5)
        tx(credit,    -1499,  "Disney+",                streaming,    "Disney Plus",    5)
        tx(credit,   -14999,  "GitHub Copilot",         subscriptions,"GitHub",         2)

        # Health
        tx(checking,  -25000, "Doctor Visit Copay",     health,       "Kaiser",         7)
        tx(credit,    -4500,  "CVS Pharmacy",           health,       "CVS",            9)

        # Shopping
        tx(credit,    -34900, "Amazon Order",           shopping,     "Amazon",         6)
        tx(credit,    -18900, "Target",                 shopping,     "Target",        11)

        # Entertainment
        tx(credit,    -7500,  "AMC Movie Tickets",      entertainment,"AMC",           13)
        tx(credit,    -12000, "Concert Tickets",        entertainment,"Ticketmaster",  18)

        # Savings
        tx(savings_acc,-100000,"Transfer to Savings",   savings_cat,  None,             1)
        tx(savings_acc,-100000,"Transfer to Savings",   savings_cat,  None,            31)

        # ── Budgets ──────────────────────────────────────────────
        budgets = [
            (groceries,     60000),
            (dining,        40000),
            (entertainment, 20000),
            (shopping,      50000),
            (utilities,     25000),
            (health,        30000),
        ]
        for category, amount in budgets:
            session.add(Budget(
                id=uid(), userId=user.id, categoryId=category.id,
                amount=amount, period="MONTHLY",
            ))

        # ── Goals ────────────────────────────────────────────────
        goals = [
            ("Emergency Fund",     1000000,  800000,  "EMERGENCY_FUND", savings_acc.id, 180),
            ("Down Payment",       5000000, 1250000,  "HOME_PURCHASE",  savings_acc.id, 730),
            ("Vacation Fund",       300000,   85000,  "VACATION",       None,            90),
            ("Investment Target",  5000000, 3720000,  "INVESTMENT",     invest.id,      365),
        ]
        for name, target, current, type_, linked_id, days in goals:
            session.add(Goal(
                id=uid(), userId=user.id, name=name,
                targetAmount=target, currentAmount=current,
                type=type_, linkedAccountId=linked_id,
                deadline=now() + timedelta(days=days),
            ))

        # ── Categorization rules ─────────────────────────────────
        rules = [
            ("Whole Foods",   groceries.id,   False),
            ("Trader Joe",    groceries.id,   False),
            ("WHOLEFDS",      groceries.id,   False),
            ("Chipotle",      dining.id,      False),
            ("Starbucks",     dining.id,      False),
            ("Uber Eats",     dining.id,      False),
            ("Netflix",       streaming.id,   False),
            ("Spotify",       streaming.id,   False),
            ("Disney",        streaming.id,   False),
            ("Amazon",        shopping.id,    False),
            ("Target",        shopping.id,    False),
            ("Shell",         gas.id,         False),
            ("Chevron",       gas.id,         False),
            ("CVS",           health.id,      False),
            ("Payroll",       salary.id,      False),
            (r"Payroll\s+Deposit", salary.id, True),
        ]
        for pattern, cat_id, is_regex in rules:
            session.add(CategorizationRule(
                id=uid(), userId=user.id, pattern=pattern,
                categoryId=cat_id, isRegex=is_regex,
            ))

        session.commit()
        print("✓ Demo data seeded successfully.")
        print("  Login: demo@finpulse.app / password123")


if __name__ == "__main__":
    main()
