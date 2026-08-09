from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_admin_user
from app.models.user import User, AuditLog
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.put("/users/{user_id}/status")
def toggle_user_active_status(
    user_id: int,
    active: bool,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = active
    audit = AuditLog(user_id=admin_user.id, action="ADMIN_TOGGLE_USER_STATUS", details=f"Set user {user.email} active={active}")
    db.add(audit)
    db.commit()
    return {"message": f"User {user.email} status updated to active={active}"}

@router.get("/audit-logs")
def get_audit_logs(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": log.id,
            "user_email": log.user.email if log.user else "System",
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]
