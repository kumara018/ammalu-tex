from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/products", tags=["Products"])

VALID_CATEGORIES = ["Chudithar", "Tops", "Lehenga", "Half Saree", "Crop Tops", "Party Wears"]


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Return categories from DB (with IDs). Falls back to hardcoded list."""
    cats = db.query(models.Category).filter(models.Category.is_active == True).order_by(models.Category.sort_order).all()
    if cats:
        return [{"id": c.id, "name": c.name, "emoji": c.emoji, "description": c.description} for c in cats]
    # Fallback if DB not seeded yet
    return [{"id": i+1, "name": n, "emoji": None, "description": None} for i, n in enumerate(VALID_CATEGORIES)]


@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    category:   Optional[str]   = None,
    search:     Optional[str]   = None,
    min_price:  Optional[float] = None,
    max_price:  Optional[float] = None,
    featured:   Optional[bool]  = None,
    sort_by:    str = Query("created_at", pattern="^(price|rating_avg|created_at|name)$"),
    sort_order: str = Query("desc",       pattern="^(asc|desc)$"),
    skip:       int = Query(0,  ge=0),
    limit:      int = Query(40, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category:
        query = query.filter(models.Product.category == category)

    if search:
        # Split search into words for better matching
        words = search.strip().split()
        for word in words:
            term = f"%{word}%"
            query = query.filter(
                or_(
                    models.Product.name.ilike(term),
                    models.Product.description.ilike(term),
                    models.Product.category.ilike(term),
                    models.Product.fabric.ilike(term),
                )
            )

    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)

    sort_col = getattr(models.Product, sort_by, models.Product.created_at)
    query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.get("/{product_id}/reviews", response_model=List[schemas.ReviewOut])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product.reviews


@router.post("/{product_id}/reviews", response_model=schemas.ReviewOut, status_code=201)
def add_review(
    product_id:   int,
    payload:      schemas.ReviewCreate,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    existing = db.query(models.Review).filter(
        models.Review.user_id    == current_user.id,
        models.Review.product_id == product_id,
    ).first()
    if existing:
        raise HTTPException(409, "You have already reviewed this product")

    review = models.Review(
        user_id=current_user.id, product_id=product_id,
        rating=payload.rating, title=payload.title, comment=payload.comment,
    )
    db.add(review)

    all_reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    total = sum(r.rating for r in all_reviews) + payload.rating
    count = len(all_reviews) + 1
    product.rating_avg   = round(total / count, 1)
    product.rating_count = count

    db.commit()
    db.refresh(review)
    return review
