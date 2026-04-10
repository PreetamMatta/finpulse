import os
from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session
from models import User
from database import get_session

INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]  # KeyError on missing = intentional


def _verify_api_key(request: Request) -> None:
    key = request.headers.get("X-API-Key")
    if key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


async def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    _verify_api_key(request)

    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


def verify_api_key_only(request: Request) -> None:
    """For public endpoints (register, auth/verify) that only need the API key."""
    _verify_api_key(request)
