from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import safe_decode
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login", auto_error=False)

_LAST_SEEN_THROTTLE = timedelta(seconds=60)


def get_current_user(
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
) -> User:
    if not token:
        raise UnauthorizedError()
    payload = safe_decode(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Malformed token")
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedError("Account disabled")
    # Phase 6: bump last_seen_at at most once per minute to avoid DB churn.
    now = datetime.now(timezone.utc)
    last = user.last_seen_at
    # SQLite (and some Postgres rows) may return naive datetimes; treat as UTC.
    if last is not None and last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    if last is None or (now - last) > _LAST_SEEN_THROTTLE:
        user.last_seen_at = now
        try:
            db.commit()
        except Exception:
            db.rollback()
    return user


def require(*scopes: str):
    """User must have ANY of these scopes (or be a super-admin)."""

    needed = set(scopes)

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role == "super_admin":
            return user
        user_scopes = {s.key for s in user.scopes}
        if not (needed & user_scopes):
            raise ForbiddenError(f"Requires one of: {', '.join(sorted(needed))}")
        return user

    return _checker


def require_all(*scopes: str):
    needed = set(scopes)

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role == "super_admin":
            return user
        user_scopes = {s.key for s in user.scopes}
        missing = needed - user_scopes
        if missing:
            raise ForbiddenError(f"Missing scopes: {', '.join(sorted(missing))}")
        return user

    return _checker


def super_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "super_admin":
        raise ForbiddenError("Super-admin only")
    return user


def has_any_scope(user: User, scopes: Iterable[str]) -> bool:
    if user.role == "super_admin":
        return True
    user_scopes = {s.key for s in user.scopes}
    return any(s in user_scopes for s in scopes)
