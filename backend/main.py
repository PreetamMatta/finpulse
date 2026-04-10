from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select, func, or_
from typing import List, Optional
from datetime import datetime
from database import engine, get_session
from models import SQLModel, User, Account, Transaction, Category, Budget, Goal
from auth import get_current_user, get_admin_user, verify_api_key_only
from pydantic import BaseModel
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="FinPulse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # internal only, cross-origin restricted
    allow_credentials=False,
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


# ─── Auth ──────────────────────────────────────────────────

class AuthVerify(BaseModel):
    email: str
    password: str


@app.post("/api/auth/verify")
def verify_credentials(
    credentials: AuthVerify,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_api_key_only(request)
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user or not bcrypt.checkpw(credentials.password.encode(), user.passwordHash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}


class UserRegister(BaseModel):
    email: str
    password: str
    name: str | None = None


@app.post("/api/register")
def register_user(
    user: UserRegister,
    request: Request,
    session: Session = Depends(get_session),
):
    verify_api_key_only(request)
    if session.exec(select(User).where(User.email == user.email)).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    new_user = User(email=user.email, name=user.name, passwordHash=hashed, role="USER")
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email, "name": new_user.name}


# ─── Admin ─────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    role: str


class UserCreate(BaseModel):
    email: str
    password: str
    name: str | None = None
    role: str = "USER"


@app.get("/api/admin/users", response_model=List[UserResponse])
def get_users(session: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    return session.exec(select(User)).all()


@app.post("/api/admin/users", response_model=UserResponse)
def create_admin_user(
    user: UserCreate,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user),
):
    if session.exec(select(User).where(User.email == user.email)).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    new_user = User(email=user.email, name=user.name, passwordHash=hashed, role=user.role)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user


@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"status": "deleted"}


# ─── Accounts ──────────────────────────────────────────────

ACCOUNT_TYPES = {"CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "LOAN", "OTHER"}


class AccountCreate(BaseModel):
    name: str
    type: str
    institution: str | None = None
    balance: int = 0
    interestRate: float | None = None
    creditLimit: int | None = None
    color: str = "#6366f1"

    def model_post_init(self, __context):
        if self.type not in ACCOUNT_TYPES:
            raise ValueError(f"type must be one of {ACCOUNT_TYPES}")


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    institution: Optional[str] = None
    balance: Optional[int] = None
    interestRate: Optional[float] = None
    creditLimit: Optional[int] = None
    color: Optional[str] = None
    isActive: Optional[bool] = None


@app.get("/api/accounts")
def get_accounts(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(
        select(Account).where(Account.userId == current_user.id).order_by(Account.createdAt)
    ).all()


@app.post("/api/accounts", status_code=201)
def create_account(
    account: AccountCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    new_account = Account(**account.model_dump(), userId=current_user.id)
    session.add(new_account)
    session.commit()
    session.refresh(new_account)
    return new_account


@app.put("/api/accounts/{account_id}")
def update_account(
    account_id: str,
    account_update: AccountUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    account = session.get(Account, account_id)
    if not account or account.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    if account_update.type and account_update.type not in ACCOUNT_TYPES:
        raise HTTPException(status_code=422, detail=f"type must be one of {ACCOUNT_TYPES}")
    for key, value in account_update.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


@app.delete("/api/accounts/{account_id}")
def delete_account(
    account_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    account = session.get(Account, account_id)
    if not account or account.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    session.delete(account)
    session.commit()
    return {"status": "ok"}


# ─── Transactions ───────────────────────────────────────────

class TransactionCreate(BaseModel):
    accountId: str
    date: datetime
    amount: int
    description: str
    categoryId: Optional[str] = None
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    accountId: Optional[str] = None
    date: Optional[datetime] = None
    amount: Optional[int] = None
    description: Optional[str] = None
    categoryId: Optional[str] = None
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    notes: Optional[str] = None


@app.get("/api/transactions")
def get_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=10000), # Cap at 10000 for dashboard
    accountId: Optional[str] = None,
    categoryId: Optional[str] = None,
    startDate: Optional[datetime] = None,
    endDate: Optional[datetime] = None,
    search: Optional[str] = None,
    sortBy: str = "date",
    sortOrder: str = "desc",
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(Transaction).where(Transaction.userId == current_user.id)
    if accountId:
        query = query.where(Transaction.accountId == accountId)
    if categoryId:
        query = query.where(Transaction.categoryId == categoryId)
    if startDate:
        query = query.where(Transaction.date >= startDate)
    if endDate:
        query = query.where(Transaction.date <= endDate)
    if search:
        query = query.where(
            or_(Transaction.description.contains(search), Transaction.merchant.contains(search))
        )

    allowed = {"date", "amount", "description", "createdAt"}
    sort_field = sortBy if sortBy in allowed else "date"
    col = getattr(Transaction, sort_field)
    query = query.order_by(col.asc() if sortOrder == "asc" else col.desc())

    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    transactions = session.exec(query.offset((page - 1) * limit).limit(limit)).all()

    return {
        "transactions": transactions,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
    }


@app.post("/api/transactions", status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    account = session.get(Account, transaction.accountId)
    if not account or account.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    new_tx = Transaction(**transaction.model_dump(), userId=current_user.id)
    session.add(new_tx)
    session.commit()
    session.refresh(new_tx)
    return new_tx


@app.put("/api/transactions/{transaction_id}")
def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tx = session.get(Transaction, transaction_id)
    if not tx or tx.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction_update.accountId:
        account = session.get(Account, transaction_update.accountId)
        if not account or account.userId != current_user.id:
            raise HTTPException(status_code=404, detail="Account not found")
    for key, value in transaction_update.model_dump(exclude_unset=True).items():
        setattr(tx, key, value)
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tx = session.get(Transaction, transaction_id)
    if not tx or tx.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    session.delete(tx)
    session.commit()
    return {"status": "ok"}


# ─── Categories ─────────────────────────────────────────────

CATEGORY_TYPES = {"INCOME", "EXPENSE"}


class CategoryCreate(BaseModel):
    name: str
    type: str
    icon: Optional[str] = None
    parentId: Optional[str] = None
    color: str = "#6366f1"

    def model_post_init(self, __context):
        if self.type not in CATEGORY_TYPES:
            raise ValueError(f"type must be one of {CATEGORY_TYPES}")


@app.get("/api/categories")
def get_categories(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(
        select(Category)
        .where(or_(Category.userId == current_user.id, Category.userId == None))
        .order_by(Category.name)
    ).all()


@app.post("/api/categories", status_code=201)
def create_category(
    category: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    new_cat = Category(**category.model_dump(), userId=current_user.id)
    session.add(new_cat)
    session.commit()
    session.refresh(new_cat)
    return new_cat


# ─── Budgets & Goals ────────────────────────────────────────

@app.get("/api/budgets")
def get_budgets(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Budget).where(Budget.userId == current_user.id)).all()


@app.get("/api/goals")
def get_goals(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Goal).where(Goal.userId == current_user.id)).all()
