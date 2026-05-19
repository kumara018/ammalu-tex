from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, SessionLocal
import models
from routers import auth, products, cart, orders, admin, payments, addresses


os.makedirs(os.getenv("UPLOAD_DIR", "uploads/products"), exist_ok=True)


# ── Auto-setup on every startup ───────────────────────────────────────────────

def _ensure_admin():
    """Create (or re-hash) the admin user so login always works after a redeploy."""
    from auth import hash_password
    db = SessionLocal()
    try:
        admin_email    = os.getenv("ADMIN_EMAIL",    "kumaraguru27102@gmail.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "AmmaluTex@2026")
        admin_phone    = os.getenv("ADMIN_PHONE",    "9876543210")

        existing = db.query(models.User).filter(models.User.email == admin_email).first()
        if existing:
            existing.password_hash = hash_password(admin_password)
            existing.is_admin  = True
            existing.is_active = True
            db.commit()
            print(f"[Startup] Admin password re-synced: {admin_email}")
        else:
            admin = models.User(
                full_name     = "Ammalu Tex Admin",
                email         = admin_email,
                phone         = admin_phone,
                password_hash = hash_password(admin_password),
                is_admin      = True,
                is_active     = True,
            )
            db.add(admin)
            db.commit()
            print(f"[Startup] Admin user created: {admin_email}")
    finally:
        db.close()


def _ensure_products():
    """Seed products if the table is empty."""
    db = SessionLocal()
    try:
        count = db.query(models.Product).count()
        if count == 0:
            from seed_data import seed
            seed()
            print("[Startup] Products seeded.")
        else:
            print(f"[Startup] {count} products already in database.")
    finally:
        db.close()


def _migrate_db():
    """Add new columns to existing tables without dropping data (no Alembic needed)."""
    from sqlalchemy import text, inspect as sa_inspect
    try:
        with engine.connect() as conn:
            inspector = sa_inspect(engine)
            user_cols = [c["name"] for c in inspector.get_columns("users")]

            if "scheduled_delete_at" not in user_cols:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN scheduled_delete_at TIMESTAMP WITH TIME ZONE"
                ))
                conn.commit()
                print("[Startup] Migrated: added scheduled_delete_at to users")

            if "is_deactivated" not in user_cols:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN is_deactivated BOOLEAN NOT NULL DEFAULT FALSE"
                ))
                conn.commit()
                print("[Startup] Migrated: added is_deactivated to users")

            if "deactivated_at" not in user_cols:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN deactivated_at TIMESTAMP WITH TIME ZONE"
                ))
                conn.commit()
                print("[Startup] Migrated: added deactivated_at to users")

        # ── New Order columns ──────────────────────────────────────────────
        orders_cols = [c["name"] for c in inspector.get_columns("orders")]
        if "open_box_delivery" not in orders_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN open_box_delivery BOOLEAN NOT NULL DEFAULT FALSE"))
            conn.commit()
            print("[Startup] Migrated: added open_box_delivery to orders")
        if "delivery_otp" not in orders_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_otp VARCHAR(10)"))
            conn.commit()
            print("[Startup] Migrated: added delivery_otp to orders")
        if "delivery_person_name" not in orders_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_person_name VARCHAR(100)"))
            conn.commit()
            print("[Startup] Migrated: added delivery_person_name to orders")
        if "delivery_person_phone" not in orders_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_person_phone VARCHAR(20)"))
            conn.commit()
            print("[Startup] Migrated: added delivery_person_phone to orders")

    except Exception as e:
        print(f"[Startup] Migration note: {e}")

    # Fix size options by category
    try:
        db = SessionLocal()
        s_to_xxxl = ["S", "M", "L", "XL", "XXL", "XXXL"]
        l_to_xxxl = ["L", "XL", "XXL", "XXXL"]
        size_map  = {
            "Tops":       s_to_xxxl,
            "Crop Tops":  s_to_xxxl,
            "Chudithar":  l_to_xxxl,
            "Lehenga":    l_to_xxxl,
            "Half Saree": l_to_xxxl,
            "Party Wears":l_to_xxxl,
        }
        updated = 0
        for product in db.query(models.Product).all():
            target = size_map.get(product.category)
            if target and product.size_options != target:
                product.size_options = target
                updated += 1
        if updated:
            db.commit()
            print(f"[Startup] Updated size options for {updated} product(s).")

        # Seed Half Saree products if none exist
        hs_count = db.query(models.Product).filter(models.Product.category == "Half Saree").count()
        if hs_count == 0:
            from seed_data import PRODUCTS
            hs_products = [p for p in PRODUCTS if p["category"] == "Half Saree"]
            for p in hs_products:
                db.add(models.Product(**p))
            db.commit()
            print(f"[Startup] Added {len(hs_products)} Half Saree product(s).")

        # Seed categories table if empty
        cat_count = db.query(models.Category).count()
        if cat_count == 0:
            DEFAULT_CATEGORIES = [
                {"name": "Chudithar",   "emoji": "👘", "description": "Traditional & Casual",  "sort_order": 1},
                {"name": "Tops",        "emoji": "👕", "description": "Trendy & Stylish",       "sort_order": 2},
                {"name": "Lehenga",     "emoji": "👗", "description": "Bridal & Festive",       "sort_order": 3},
                {"name": "Half Saree",  "emoji": "🥻", "description": "Traditional & Elegant",  "sort_order": 4},
                {"name": "Crop Tops",   "emoji": "🎽", "description": "Casual & Modern",        "sort_order": 5},
                {"name": "Party Wears", "emoji": "✨", "description": "Glam & Elegant",         "sort_order": 6},
            ]
            for c in DEFAULT_CATEGORIES:
                db.add(models.Category(**c))
            db.commit()
            print("[Startup] Categories seeded.")
        db.close()
    except Exception as e:
        print(f"[Startup] Size/seed migration note: {e}")


def _cleanup_deleted_accounts():
    """Permanently remove accounts whose 24-hour deletion window has passed."""
    from datetime import datetime, timezone
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired = db.query(models.User).filter(
            models.User.scheduled_delete_at.isnot(None),
            models.User.scheduled_delete_at <= now,
        ).all()
        for u in expired:
            db.delete(u)
        if expired:
            db.commit()
            print(f"[Startup] Permanently deleted {len(expired)} expired account(s).")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Migrate new columns without data loss
    _migrate_db()
    # Delete accounts whose 24h deletion window expired
    _cleanup_deleted_accounts()
    # Always ensure admin + products exist
    _ensure_admin()
    _ensure_products()
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "Ammalu Tex API",
    description = "Premium Textile Shopping — Texvalley Gangapuram",
    version     = "3.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ammalutex.com",
        "https://www.ammalutex.com",
        "https://ammalu-tex.vercel.app",
        "https://ammalu-tex-git-main-kumara018s-projects.vercel.app",
        "https://ammalu-9bjm3ll9v-kumara018s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = os.getenv("UPLOAD_DIR", "uploads/products")
app.mount("/uploads/products", StaticFiles(directory=upload_dir), name="product_images")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(addresses.router)


@app.get("/")
def root():
    return {
        "store":    "Ammalu Tex",
        "location": "Shop Ground Floor No 129, Texvalley Gangapuram",
        "status":   "API is running",
        "docs":     "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/seed")
def seed_database():
    from seed_data import seed
    seed()
    return {"status": "Database seeded successfully"}


@app.get("/reset-admin")
def reset_admin():
    _ensure_admin()
    admin_email = os.getenv("ADMIN_EMAIL", "kumaraguru27102@gmail.com")
    return {"status": "Admin reset successfully", "email": admin_email}


@app.get("/test-email")
def test_email(to: str = ""):
    """
    Diagnostic endpoint — tests email delivery and returns the exact result.
    Uses SendGrid HTTP API (works on Render). Falls back to SMTP.
    Usage: GET /test-email?to=youremail@gmail.com
    """
    import json as _json, urllib.request as _req, urllib.error as _uerr

    sg_key     = os.getenv("SENDGRID_API_KEY", "")
    smtp_email = os.getenv("SMTP_EMAIL", "")
    target     = to.strip() if to.strip() else smtp_email or "kumaraguru27102@gmail.com"

    # ── Test via SendGrid ──────────────────────────────────────────────────────
    if sg_key:
        from_email = smtp_email or "noreply@ammalu-tex.com"
        payload = _json.dumps({
            "personalizations": [{"to": [{"email": target}]}],
            "from": {"email": from_email, "name": "Ammalu Tex"},
            "subject": "✅ Ammalu Tex — Email Test (SendGrid)",
            "content": [{
                "type": "text/html",
                "value": (
                    "<h2 style='color:#7c1d2e'>Email delivery is working! ✅</h2>"
                    "<p>This test email was sent from the Ammalu Tex backend on Render "
                    "using SendGrid. If you're reading this, emails (OTPs, order confirmations, etc.) "
                    "are now working correctly.</p>"
                    "<p style='color:#888;font-size:12px;'>Sent from ammalu-tex.onrender.com</p>"
                ),
            }],
        }).encode()
        try:
            request = _req.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=payload,
                headers={"Authorization": f"Bearer {sg_key}", "Content-Type": "application/json"},
            )
            with _req.urlopen(request, timeout=15) as resp:
                return {
                    "status":  "success",
                    "method":  "SendGrid",
                    "message": f"Test email sent to {target}. Check inbox + spam folder.",
                    "from":    from_email,
                    "to":      target,
                    "http_status": resp.status,
                }
        except _uerr.HTTPError as e:
            body = e.read().decode(errors="ignore")
            return {
                "status":  "error",
                "method":  "SendGrid",
                "type":    f"HTTP {e.code}",
                "message": body,
                "hint":    (
                    "Common causes: (1) API key is wrong/expired — regenerate at app.sendgrid.com/settings/api_keys, "
                    "(2) Sender email not verified — go to app.sendgrid.com → Settings → Sender Authentication."
                ),
            }
        except Exception as e:
            return {"status": "error", "method": "SendGrid", "type": type(e).__name__, "message": str(e)}

    # ── No SendGrid key — report setup instructions ────────────────────────────
    return {
        "status":  "not_configured",
        "message": (
            "SENDGRID_API_KEY is not set. "
            "Render free tier blocks SMTP ports, so SendGrid is required. "
            "Steps: (1) Sign up free at sendgrid.com, "
            "(2) Settings → Sender Authentication → Single Sender → verify your Gmail, "
            "(3) Settings → API Keys → Create API Key → Full Access, "
            "(4) Add SENDGRID_API_KEY to Render environment variables."
        ),
        "smtp_email_set": bool(smtp_email),
    }
