from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/products", tags=["Products"])

VALID_CATEGORIES = ["Chudithar", "Tops", "Lehenga", "Crop Tops", "Party Wears"]


@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    sort_by: str = Query("created_at", regex="^(price|rating_avg|created_at|name)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category:
        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}",
            )
        query = query.filter(models.Product.category == category)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term),
                models.Product.category.ilike(search_term),
                models.Product.fabric.ilike(search_term),
            )
        )

    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)

    sort_col = getattr(models.Product, sort_by, models.Product.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/categories", response_model=List[str])
def get_categories():
    return VALID_CATEGORIES


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.get("/{product_id}/reviews", response_model=List[schemas.ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.reviews


@router.post("/{product_id}/reviews", response_model=schemas.ReviewOut, status_code=201)
def add_review(
    product_id: int,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.product_id == product_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already reviewed this product")

    review = models.Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
    )
    db.add(review)

    all_reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    total = sum(r.rating for r in all_reviews) + payload.rating
    count = len(all_reviews) + 1
    product.rating_avg = round(total / count, 1)
    product.rating_count = count

    db.commit()
    db.refresh(review)
    return review
