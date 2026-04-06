from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func, or_
from typing import List, Optional
from datetime import datetime
from database import engine, get_session
from models import SQLModel, User, Account, Transaction, Category, Budget, Goal
from auth import get_current_user, get_admin_user
import uvicorn
from pydantic import BaseModel
import bcrypt

app = FastAPI(title="FinPulse API")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ----------------- ADMIN USERS -----------------
class UserCreate(BaseModel):
    email: str
    password: str
    name: str | None = None
    role: str = "USER"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    role: str

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_users(session: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    return session.exec(select(User)).all()

@app.post("/api/admin/users", response_model=UserResponse)
def create_user(user: UserCreate, session: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    new_user = User(email=user.email, name=user.name, passwordHash=hashed, role=user.role)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: str, session: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"status": "deleted"}

# ----------------- ACCOUNTS -----------------
@app.get("/api/accounts")
def get_accounts(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Account).where(Account.userId == current_user.id)).all()

class AccountCreate(BaseModel):
    name: str
    type: str
    balance: int = 0
    color: str = "#6366f1"

@app.post("/api/accounts")
def create_account(account: AccountCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_account = Account(**account.dict(), userId=current_user.id)
    session.add(new_account)
    session.commit()
    session.refresh(new_account)
    return new_account

# ----------------- TRANSACTIONS -----------------
@app.get("/api/transactions")
def get_transactions(
    page: int = 1,
    limit: int = 20,
    accountId: Optional[str] = None,
    categoryId: Optional[str] = None,
    startDate: Optional[datetime] = None,
    endDate: Optional[datetime] = None,
    search: Optional[str] = None,
    sortBy: str = "date",
    sortOrder: str = "desc",
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
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
        query = query.where(or_(
            Transaction.description.contains(search),
            Transaction.merchant.contains(search)
        ))

    if sortOrder == "asc":
        query = query.order_by(getattr(Transaction, sortBy).asc())
    else:
        query = query.order_by(getattr(Transaction, sortBy).desc())

    total = session.exec(select(func.count()).select_from(query.subquery())).one()

    query = query.offset((page - 1) * limit).limit(limit)
    transactions = session.exec(query).all()

    return {
        "transactions": transactions,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit
    }

class TransactionCreate(BaseModel):
    accountId: str
    date: datetime
    amount: int
    description: str
    categoryId: Optional[str] = None
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    notes: Optional[str] = None

@app.post("/api/transactions")
def create_transaction(transaction: TransactionCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    account = session.get(Account, transaction.accountId)
    if not account or account.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Account not found")

    new_transaction = Transaction(**transaction.dict(), userId=current_user.id)
    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)
    return new_transaction

# ----------------- CATEGORIES -----------------
@app.get("/api/categories")
def get_categories(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(
        select(Category).where(
            or_(Category.userId == current_user.id, Category.userId == None)
        )
    ).all()

# ----------------- BUDGETS AND GOALS -----------------
@app.get("/api/budgets")
def get_budgets(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Budget).where(Budget.userId == current_user.id)).all()

@app.get("/api/goals")
def get_goals(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(Goal).where(Goal.userId == current_user.id)).all()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

class AuthVerify(BaseModel):
    email: str
    password: str

@app.post("/api/auth/verify")
def verify_credentials(credentials: AuthVerify, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.checkpw(credentials.password.encode(), user.passwordHash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }

class UserRegister(BaseModel):
    email: str
    password: str
    name: str | None = None

@app.post("/api/register")
def register_user(user: UserRegister, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    new_user = User(email=user.email, name=user.name, passwordHash=hashed, role="USER")
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"status": "ok"}
