from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os, random
from database import get_db
import models, schemas, auth as auth_utils, notifications

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    total_products = db.query(models.Product).count()
    active_products = db.query(models.Product).filter(models.Product.is_active == True).count()
    total_users = db.query(models.User).filter(models.User.is_admin == False).count()
    total_orders = db.query(models.Order).count()
    pending_orders = db.query(models.Order).filter(models.Order.status == "confirmed").count()
    from sqlalchemy import func
    revenue = db.query(func.sum(models.Order.total)).filter(
        models.Order.status != "cancelled"
    ).scalar() or 0

    recent_orders = (
        db.query(models.Order)
        .order_by(models.Order.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_products": total_products,
        "active_products": active_products,
        "total_users": total_users,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": round(revenue, 2),
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "total": o.total,
                "status": o.status,
                "payment_status": o.payment_status,
                "created_at": o.created_at,
            }
            for o in recent_orders
        ],
    }


@router.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    if payload.sku:
        existing = db.query(models.Product).filter(models.Product.sku == payload.sku).first()
        if existing:
            raise HTTPException(status_code=409, detail="Product with this SKU already exists")

    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/products", response_model=List[schemas.ProductOut])
def list_all_products(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
    skip: int = 0,
    limit: int = 50,
):
    return db.query(models.Product).order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()


@router.post("/products/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    api_key    = os.getenv("CLOUDINARY_API_KEY", "")
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

    if not all([cloud_name, api_key, api_secret]):
        raise HTTPException(500, "Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to Render env vars.")

    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(400, "Only JPEG, PNG and WebP images are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(400, "Image must be under 10MB")

    try:
        import cloudinary, cloudinary.uploader
        cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True)
        result = cloudinary.uploader.upload(
            contents,
            folder="ammalutex/products",
            resource_type="image",
            transformation=[{"width": 900, "height": 900, "crop": "limit", "quality": "auto", "fetch_format": "auto"}],
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        raise HTTPException(500, f"Cloudinary upload failed: {e}")


@router.get("/orders", response_model=List[schemas.OrderOut])
def get_all_orders(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    allowed = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"]
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(allowed)}")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status

    # Update tracking number if provided
    if payload.tracking_number:
        order.tracking_number = payload.tracking_number

    # Set delivery person info if provided
    if payload.delivery_person_name:
        order.delivery_person_name = payload.delivery_person_name
    if payload.delivery_person_phone:
        order.delivery_person_phone = payload.delivery_person_phone

    # ── Out for Delivery: generate a 6-digit delivery OTP ─────────────────────
    if payload.status == "out_for_delivery":
        otp = str(random.randint(100000, 999999))
        order.delivery_otp = otp

    db.commit()
    db.refresh(order)

    # ── Notify the customer by email ──────────────────────────────────────────
    user = db.query(models.User).filter(models.User.id == order.user_id).first()
    if user:
        if payload.status == "out_for_delivery":
            notifications.send_delivery_otp_email(
                user.email, user.full_name, order.delivery_otp,
                order.order_number,
                agent_name=order.delivery_person_name or "",
                agent_phone=order.delivery_person_phone or "",
            )
            # Also SMS the OTP
            notifications.send_otp_sms(
                user.phone,
                f"Delivery OTP for order {order.order_number}: {order.delivery_otp}. Share with delivery agent only.",
                "Delivery",
            )
        else:
            notifications.send_order_status_email(user.email, user.full_name, order, payload.status)

        # After delivered, ask for a review
        if payload.status == "delivered":
            notifications.send_review_request_email(user.email, user.full_name, order)

    return {
        "message": f"Order {order.order_number} updated to {payload.status}",
        "delivery_otp": order.delivery_otp if payload.status == "out_for_delivery" else None,
    }


@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    return db.query(models.User).filter(models.User.is_admin == False).all()


@router.get("/support-ratings")
def get_support_ratings(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_admin),
):
    ratings = db.query(models.SupportRating).order_by(models.SupportRating.created_at.desc()).limit(100).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "phone": r.phone,
            "rating": r.rating,
            "category": r.category,
            "message": r.message,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in ratings
    ]
