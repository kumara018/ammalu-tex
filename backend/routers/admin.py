from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil, uuid, random
from database import get_db
import models, schemas, auth as auth_utils, notifications

router = APIRouter(prefix="/api/admin", tags=["Admin"])
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/products")


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
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WebP images are allowed")

    contents = await file.read()
    max_size = 5 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="Image size must be under 5MB")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/products/{filename}", "filename": filename}


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
