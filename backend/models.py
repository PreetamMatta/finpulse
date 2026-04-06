from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    __tablename__ = "User"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    passwordHash: str
    currency: str = Field(default="USD")
    role: str = Field(default="USER")
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    accounts: List["Account"] = Relationship(back_populates="user", cascade_delete=True)
    transactions: List["Transaction"] = Relationship(back_populates="user", cascade_delete=True)
    budgets: List["Budget"] = Relationship(back_populates="user", cascade_delete=True)
    goals: List["Goal"] = Relationship(back_populates="user", cascade_delete=True)
    payStubs: List["PayStub"] = Relationship(back_populates="user", cascade_delete=True)
    subscriptions: List["Subscription"] = Relationship(back_populates="user", cascade_delete=True)
    categories: List["Category"] = Relationship(back_populates="user", cascade_delete=True)
    recurringTransactions: List["RecurringTransaction"] = Relationship(back_populates="user", cascade_delete=True)
    categorizationRules: List["CategorizationRule"] = Relationship(back_populates="user", cascade_delete=True)


class Account(SQLModel, table=True):
    __tablename__ = "Account"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    name: str
    type: str
    institution: Optional[str] = None
    balance: int = Field(default=0)
    interestRate: Optional[float] = None
    creditLimit: Optional[int] = None
    color: str = Field(default="#6366f1")
    isActive: bool = Field(default=True)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="accounts")
    transactions: List["Transaction"] = Relationship(back_populates="account", cascade_delete=True)
    subscriptions: List["Subscription"] = Relationship(back_populates="account")
    goals: List["Goal"] = Relationship(back_populates="linkedAccount")
    recurringTransactions: List["RecurringTransaction"] = Relationship(back_populates="account", cascade_delete=True)


class Category(SQLModel, table=True):
    __tablename__ = "Category"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: Optional[str] = Field(default=None, foreign_key="User.id", index=True)
    name: str
    icon: Optional[str] = None
    type: str
    parentId: Optional[str] = Field(default=None, foreign_key="Category.id", index=True)
    color: str = Field(default="#6366f1")

    user: Optional[User] = Relationship(back_populates="categories")
    parent: Optional["Category"] = Relationship(back_populates="children", sa_relationship_kwargs=dict(remote_side="Category.id"))
    children: List["Category"] = Relationship(back_populates="parent")
    transactions: List["Transaction"] = Relationship(back_populates="category")
    budgets: List["Budget"] = Relationship(back_populates="category")
    recurringTransactions: List["RecurringTransaction"] = Relationship(back_populates="category")


class Transaction(SQLModel, table=True):
    __tablename__ = "Transaction"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    accountId: str = Field(foreign_key="Account.id", index=True)
    date: datetime = Field(index=True)
    amount: int
    description: str
    categoryId: Optional[str] = Field(default=None, foreign_key="Category.id")
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    isRecurring: bool = Field(default=False)
    notes: Optional[str] = None
    importSource: str = Field(default="MANUAL")
    importBatchId: Optional[str] = Field(default=None, index=True)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="transactions")
    account: Account = Relationship(back_populates="transactions")
    category: Optional[Category] = Relationship(back_populates="transactions")


class PayStub(SQLModel, table=True):
    __tablename__ = "PayStub"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    payDate: datetime
    grossPay: int
    netPay: int
    payPeriodStart: datetime
    payPeriodEnd: datetime
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="payStubs")
    deductions: List["PayStubDeduction"] = Relationship(back_populates="payStub", cascade_delete=True)


class PayStubDeduction(SQLModel, table=True):
    __tablename__ = "PayStubDeduction"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    payStubId: str = Field(foreign_key="PayStub.id", index=True)
    name: str
    amount: int
    type: str
    isPreTax: bool = Field(default=True)

    payStub: PayStub = Relationship(back_populates="deductions")


class Subscription(SQLModel, table=True):
    __tablename__ = "Subscription"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    accountId: Optional[str] = Field(default=None, foreign_key="Account.id")
    name: str
    amount: int
    frequency: str
    category: Optional[str] = None
    nextBillingDate: datetime
    isActive: bool = Field(default=True)
    url: Optional[str] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="subscriptions")
    account: Optional[Account] = Relationship(back_populates="subscriptions")


class Budget(SQLModel, table=True):
    __tablename__ = "Budget"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    categoryId: str = Field(foreign_key="Category.id", index=True)
    amount: int
    period: str = Field(default="MONTHLY")
    startDate: datetime = Field(default_factory=get_utc_now)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="budgets")
    category: Category = Relationship(back_populates="budgets")


class Goal(SQLModel, table=True):
    __tablename__ = "Goal"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    name: str
    targetAmount: int
    currentAmount: int = Field(default=0)
    deadline: Optional[datetime] = None
    type: str
    linkedAccountId: Optional[str] = Field(default=None, foreign_key="Account.id")
    notes: Optional[str] = None
    isCompleted: bool = Field(default=False)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="goals")
    linkedAccount: Optional[Account] = Relationship(back_populates="goals")


class RecurringTransaction(SQLModel, table=True):
    __tablename__ = "RecurringTransaction"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    accountId: str = Field(foreign_key="Account.id")
    description: str
    amount: int
    categoryId: Optional[str] = Field(default=None, foreign_key="Category.id")
    frequency: str
    nextOccurrence: datetime
    isActive: bool = Field(default=True)
    createdAt: datetime = Field(default_factory=get_utc_now)
    updatedAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="recurringTransactions")
    account: Account = Relationship(back_populates="recurringTransactions")
    category: Optional[Category] = Relationship(back_populates="recurringTransactions")


class CategorizationRule(SQLModel, table=True):
    __tablename__ = "CategorizationRule"
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    pattern: str
    categoryId: str
    isRegex: bool = Field(default=False)
    priority: int = Field(default=0)
    createdAt: datetime = Field(default_factory=get_utc_now)

    user: User = Relationship(back_populates="categorizationRules")
