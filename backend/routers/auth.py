import os, re, random, smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ── helpers ───────────────────────────────────────────────────────────────────

def _is_email(value: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value))

def _normalize_phone(v: str) -> str:
    v = v.strip().replace(" ", "").replace("-", "")
    if v.startswith("+91"):  v = v[3:]
    elif v.startswith("91") and len(v) == 12: v = v[2:]
    elif v.startswith("0"): v = v[1:]
    return v

def _find_user(db: Session, identifier: str):
    """Find user by email or phone."""
    identifier = identifier.strip()
    if _is_email(identifier):
        return db.query(models.User).filter(
            models.User.email == identifier.lower()
        ).first()
    else:
        phone = _normalize_phone(identifier)
        return db.query(models.User).filter(
            models.User.phone == phone
        ).first()

def _send_otp_email(to_email: str, otp: str, purpose: str = "Password Reset"):
    """Send OTP via Gmail SMTP. Falls back to console log if not configured."""
    smtp_email = os.getenv("SMTP_EMAIL", "")
    smtp_pass  = os.getenv("SMTP_PASSWORD", "")
    if not smtp_email or not smtp_pass:
        print(f"[OTP] {purpose} OTP for {to_email}: {otp}")
        return
    try:
        msg = MIMEText(
            f"Your Ammalu Tex {purpose} OTP is: {otp}\n\n"
            f"This OTP is valid for 10 minutes.\n"
            f"Do not share this OTP with anyone.\n\n"
            f"— Ammalu Tex Team"
        )
        msg["Subject"] = f"Ammalu Tex — {purpose} OTP: {otp}"
        msg["From"]    = smtp_email
        msg["To"]      = to_email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(smtp_email, smtp_pass)
            s.sendmail(smtp_email, to_email, msg.as_string())
    except Exception as e:
        print(f"[OTP Email Error] {e}")
        print(f"[OTP] {purpose} OTP for {to_email}: {otp}")

def _create_otp(db: Session, identifier: str, otp_type: str = "reset") -> str:
    """Create a 6-digit OTP and store in DB."""
    # Delete any existing OTPs for this identifier
    db.query(models.OTPStore).filter(
        models.OTPStore.identifier == identifier,
        models.OTPStore.otp_type  == otp_type,
    ).delete()
    db.commit()

    otp = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    record = models.OTPStore(
        identifier=identifier,
        otp_code=otp,
        otp_type=otp_type,
        expires_at=expires,
    )
    db.add(record)
    db.commit()
    return otp

def _verify_otp(db: Session, identifier: str, otp_code: str, otp_type: str = "reset") -> bool:
    """Verify OTP. Returns True if valid."""
    record = db.query(models.OTPStore).filter(
        models.OTPStore.identifier == identifier,
        models.OTPStore.otp_code   == otp_code,
        models.OTPStore.otp_type   == otp_type,
        models.OTPStore.is_used    == False,
    ).first()
    if not record:
        return False
    now = datetime.now(timezone.utc)
    if record.expires_at.tzinfo is None:
        record.expires_at = record.expires_at.replace(tzinfo=timezone.utc)
    if now > record.expires_at:
        return False
    record.is_used = True
    db.commit()
    return True


# ── REGISTER ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=schemas.Token, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email.lower()).first():
        raise HTTPException(409, "An account with this email already exists. Please login.")

    phone = _normalize_phone(payload.phone)
    if db.query(models.User).filter(models.User.phone == phone).first():
        raise HTTPException(409, "This phone number is already registered.")

    user = models.User(
        full_name     = payload.full_name.strip(),
        email         = payload.email.lower(),
        phone         = phone,
        password_hash = auth_utils.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth_utils.create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ── LOGIN (email OR phone) ────────────────────────────────────────────────────

@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = _find_user(db, payload.identifier)

    if not user or not auth_utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email/phone or password. Please check and try again.",
        )
    if not user.is_active:
        raise HTTPException(403, "Your account has been deactivated. Contact support.")

    token = auth_utils.create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ── GET ME ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user


# ── UPDATE PROFILE ────────────────────────────────────────────────────────────

@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    payload:      schemas.UserUpdate,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


# ── FORGOT PASSWORD — send OTP ────────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(payload: schemas.OTPRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    user = _find_user(db, identifier)
    if not user:
        # Don't reveal if user exists — just return success
        return {"message": "If this account exists, an OTP has been sent."}

    # Use email as identifier for OTP
    otp = _create_otp(db, user.email, otp_type="reset")
    _send_otp_email(user.email, otp, "Password Reset")

    return {
        "message": f"OTP sent to your registered email ({user.email[:3]}***). Valid for 10 minutes.",
        "email_hint": user.email[:3] + "***@" + user.email.split("@")[-1],
    }


# ── VERIFY OTP & RESET PASSWORD ───────────────────────────────────────────────

@router.post("/reset-password")
def reset_password(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    user = _find_user(db, identifier)
    if not user:
        raise HTTPException(404, "Account not found")

    if not _verify_otp(db, user.email, payload.otp_code, otp_type="reset"):
        raise HTTPException(400, "Invalid or expired OTP. Please request a new one.")

    user.password_hash = auth_utils.hash_password(payload.new_password)
    db.commit()

    return {"message": "Password reset successfully. Please login with your new password."}
