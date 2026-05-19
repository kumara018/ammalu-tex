from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, notifications
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/support", tags=["Support"])


class SupportRatingCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    rating: int           # 1-5
    category: Optional[str] = None
    message: Optional[str] = None


@router.post("/rating", status_code=201)
def submit_support_rating(
    payload: SupportRatingCreate,
    db: Session = Depends(get_db),
):
    if not 1 <= payload.rating <= 5:
        raise HTTPException(400, "Rating must be between 1 and 5")

    rating = models.SupportRating(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        rating=payload.rating,
        category=payload.category,
        message=payload.message,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    # Send confirmation email to user + notify admin
    notifications.send_support_rating_confirmation(payload.email, payload.name, payload.rating)
    notifications.send_support_rating_admin_notify(
        payload.name, payload.email, payload.rating,
        payload.category or "", payload.message or ""
    )

    return {"message": "Thank you for your feedback! It helps us serve you better."}


@router.get("/rating/summary")
def get_rating_summary(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(models.SupportRating).count()
    avg = db.query(func.avg(models.SupportRating.rating)).scalar() or 0
    return {"total_ratings": total, "average_rating": round(float(avg), 1)}
