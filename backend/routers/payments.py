import razorpay
import hmac
import hashlib
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, auth as auth_utils
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
