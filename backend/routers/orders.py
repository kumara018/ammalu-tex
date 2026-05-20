import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth as auth_utils, notifications

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def generate_order_number() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"AMT-{suffix}"


@router.post("/", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Please add items before placing an order.",
        )

    items_snapshot = []
    subtotal = 0.0

    for item in cart_items:
        product = item.product
        if not product or not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Product '{product.name if product else 'Unknown'}' is no longer available.",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"'{product.name}' has only {product.stock} items left. Please update your cart.",
            )
        item_total = product.price * item.quantity
        subtotal += item_total
        items_snapshot.append({
            "product_id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "quantity": item.quantity,
            "size": item.size,
            "color": item.color,
            "image": product.images[0] if product.images else None,
            "subtotal": item_total,
        })

    shipping_fee = 0.0 if subtotal >= 999 else 49.0
    total = subtotal + shipping_fee

    order_number = generate_order_number()
    while db.query(models.Order).filter(models.Order.order_number == order_number).first():
        order_number = generate_order_number()

    transaction_id = None
    payment_status = "pending"
    if payload.payment.method == "cod":
        payment_status = "pending"
    else:
        transaction_id = f"TXN{''.join(random.choices(string.digits, k=12))}"
        payment_status = "paid"

    order = models.Order(
        order_number=order_number,
        user_id=current_user.id,
        items_snapshot=items_snapshot,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount=0.0,
        total=total,
        status="confirmed",
        payment_status=payment_status,
        payment_method=payload.payment.method,
        payment_transaction_id=transaction_id,
        shipping_address=payload.shipping_address.model_dump(),
        notes=payload.notes,
        open_box_delivery=payload.open_box_delivery,
    )
    db.add(order)

    for item in cart_items:
        item.product.stock -= item.quantity

    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()

    db.commit()
    db.refresh(order)

    # Send order confirmation email + SMS + WhatsApp
    notifications.send_order_confirmation_email(current_user.email, current_user.full_name, order)
    notifications.send_order_sms(current_user.phone, order.order_number, order.total)
    notifications.send_order_whatsapp(current_user.phone, current_user.full_name, order, items_snapshot)
    if order.payment_method != "cod":
        notifications.send_payment_success_email(current_user.email, current_user.full_name, order)

    return order


@router.get("/", response_model=List[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel_order(
    order_id: int,
    payload: schemas.CancelOrderPayload = schemas.CancelOrderPayload(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Allow cancel up to shipped — not once out for delivery or delivered
    cancellable = ["pending", "confirmed", "processing", "shipped"]
    if order.status not in cancellable:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled once it is '{order.status}'. Please contact support.",
        )

    order.status       = "cancelled"
    order.cancelled_by = "user"
    order.cancel_reason = (payload.reason or "Cancelled by customer").strip()

    # Restore stock
    for item in order.items_snapshot:
        product = db.query(models.Product).filter(
            models.Product.id == item["product_id"]
        ).first()
        if product:
            product.stock += item["quantity"]

    # Also cancel on Shiprocket if shipment was created
    if order.shiprocket_order_id:
        try:
            from shiprocket import shiprocket as sr
            sr.cancel_order([int(order.shiprocket_order_id)])
        except Exception as e:
            print(f"[Shiprocket cancel error] {e}")

    db.commit()
    db.refresh(order)

    # Notify customer by email + WhatsApp
    try:
        notifications.send_order_cancelled_email(current_user.email, current_user.full_name, order)
    except Exception as e:
        print(f"[Cancel email error] {e}")
    try:
        notifications.send_order_cancelled_whatsapp(current_user.phone, current_user.full_name, order)
    except Exception as e:
        print(f"[Cancel WhatsApp error] {e}")

    return order


@router.get("/{order_id}/track")
def track_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    """Return Shiprocket live tracking events if AWB is set, else order timeline."""
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    result = {
        "order_number":     order.order_number,
        "status":           order.status,
        "status_location":  order.status_location,
        "courier_name":     order.courier_name,
        "awb_code":         order.awb_code,
        "tracking_url":     order.tracking_url,
        "estimated_delivery": order.estimated_delivery,
        "shiprocket_data":  None,
    }

    if order.awb_code:
        try:
            from shiprocket import shiprocket as sr
            data = sr.track_awb(order.awb_code)
            if data:
                result["shiprocket_data"] = data
        except Exception as e:
            print(f"[Track fetch error] {e}")

    return result
