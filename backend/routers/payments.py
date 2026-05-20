import razorpay
import hmac
import hashlib
import os
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
import models, auth as auth_utils, notifications
from pydantic import BaseModel

router = APIRouter(prefix="/api/payments", tags=["Payments"])

RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")


def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class CreateOrderRequest(BaseModel):
    amount: float  # in rupees


class VerifyRequest(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str


@router.post("/create-order")
def create_razorpay_order(
    payload: CreateOrderRequest,
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    client = get_razorpay_client()
    amount_paise = int(payload.amount * 100)  # Razorpay uses paise
    order = client.order.create({
        "amount":   amount_paise,
        "currency": "INR",
        "payment_capture": 1,
    })
    return {
        "order_id":  order["id"],
        "amount":    order["amount"],
        "currency":  order["currency"],
        "key_id":    RAZORPAY_KEY_ID,
    }


@router.post("/verify")
def verify_payment(payload: VerifyRequest):
    key_secret = RAZORPAY_KEY_SECRET.encode()
    message    = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    generated  = hmac.new(key_secret, message, hashlib.sha256).hexdigest()

    if generated != payload.razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    return {"verified": True, "payment_id": payload.razorpay_payment_id}


@router.get("/key")
def get_key(current_user: models.User = Depends(auth_utils.get_current_user)):
    if not RAZORPAY_KEY_ID:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    return {"key_id": RAZORPAY_KEY_ID}


# ── Razorpay Webhook ──────────────────────────────────────────────────────────
@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay sends events here automatically.
    Configure in: Razorpay Dashboard → Settings → Webhooks
      URL:    https://ammalu-tex.onrender.com/api/payments/webhook/razorpay
      Events: refund.processed, refund.created, refund.speed_changed
      Secret: set RAZORPAY_WEBHOOK_SECRET in Render env vars (optional but recommended)
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

    # Verify signature if webhook secret is configured
    if webhook_secret and signature:
        expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            print(f"[Webhook] ❌ Invalid Razorpay signature")
            raise HTTPException(400, "Invalid webhook signature")

    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(400, "Invalid JSON payload")

    event = payload.get("event", "")
    print(f"[Webhook] Razorpay event received: {event}")

    # Handle refund events
    if event in ("refund.processed", "refund.created", "refund.speed_changed"):
        entity     = payload.get("payload", {}).get("refund", {}).get("entity", {})
        payment_id = entity.get("payment_id", "")
        refund_id  = entity.get("id", "")

        print(f"[Webhook] Refund {refund_id} for payment {payment_id}")

        if payment_id:
            order = db.query(models.Order).filter(
                models.Order.payment_transaction_id == payment_id
            ).first()

            if order and order.payment_status != "refunded":
                order.payment_status = "refunded"
                db.commit()
                print(f"[Webhook] ✅ Order {order.order_number} marked refunded")

                # Notify customer
                user = db.query(models.User).filter(models.User.id == order.user_id).first()
                if user:
                    try:
                        notifications.send_refund_initiated_email(
                            user.email, user.full_name, order, refund_id
                        )
                        notifications.send_refund_initiated_whatsapp(
                            user.phone, user.full_name, order, refund_id
                        )
                        notifications.send_refund_initiated_sms(
                            user.phone, order.order_number, order.total
                        )
                    except Exception as e:
                        print(f"[Webhook] Notification error: {e}")
            else:
                print(f"[Webhook] Order already refunded or not found for payment {payment_id}")

    return {"status": "ok"}


# ── Admin: Mark order as refunded (for manually processed refunds) ────────────
@router.post("/admin/orders/{order_id}/mark-refunded")
def admin_mark_refunded(
    order_id: int,
    db:    Session    = Depends(get_db),
    _:     models.User = Depends(auth_utils.get_current_admin),
):
    """
    Mark a cancelled paid order as refunded.
    Use this when you've already issued the refund manually from Razorpay Dashboard
    and want the website to show '↩️ REFUNDED' to the customer.
    Also triggers refund notification email + WhatsApp to the customer.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.payment_method == "cod":
        raise HTTPException(400, "COD orders don't have a digital refund")
    if order.payment_status == "refunded":
        raise HTTPException(400, "Order is already marked as refunded")

    order.payment_status = "refunded"
    db.commit()
    db.refresh(order)

    # Notify customer
    user = db.query(models.User).filter(models.User.id == order.user_id).first()
    if user:
        try:
            notifications.send_refund_initiated_email(
                user.email, user.full_name, order, "manual"
            )
            notifications.send_refund_initiated_whatsapp(
                user.phone, user.full_name, order, "manual"
            )
            notifications.send_refund_initiated_sms(
                user.phone, order.order_number, order.total
            )
        except Exception as e:
            print(f"[Admin] Refund notification error: {e}")

    return {
        "message":   f"Order {order.order_number} marked as refunded ✅",
        "order_id":  order_id,
        "payment_status": "refunded",
    }
