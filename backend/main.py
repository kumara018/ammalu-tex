from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, SessionLocal
import models
from routers import auth, products, cart, orders, admin, payments


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
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
