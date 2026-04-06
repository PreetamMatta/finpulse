import os
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from jwcrypto import jwk, jwe, jwt
import json
from sqlmodel import Session
from models import User
from database import get_session
import hashlib

AUTH_SECRET = os.getenv("AUTH_SECRET", "finpulse-dev-secret-change-in-production")

def get_encryption_key(secret: str) -> bytes:
    # Auth.js uses HKDF to derive the encryption key from the secret.
    # The info string is typically "Auth.js Generated Encryption Key"
    import hkdf
    key = hkdf.hkdf_expand(hkdf.hkdf_extract(None, secret.encode()), b"Auth.js Generated Encryption Key (jwt)", 32)
    return key

async def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    token = request.cookies.get("authjs.session-token")
    if not token:
        token = request.cookies.get("next-auth.session-token")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # We need to decrypt the JWE token
        key_bytes = get_encryption_key(AUTH_SECRET)
        key = jwk.JWK(kty="oct", k=key_bytes)

        jwe_token = jwe.JWE()
        jwe_token.deserialize(token)
        jwe_token.decrypt(key)

        payload = json.loads(jwe_token.payload)
        user_id = payload.get("sub") or payload.get("id")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return user
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user
