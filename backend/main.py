from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
import models
from routers import auth, products, cart, orders, admin, payments

os.makedirs(os.getenv("UPLOAD_DIR", "uploads/products"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Ammalu Tex API",
    description="Premium Textile Shopping Backend — Texvalley Gangapuram",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ammalu-tex.vercel.app",
        "https://ammalu-tex-git-main-kumara018s-projects.vercel.app",
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
        "store": "Ammalu Tex",
        "location": "Shop Ground Floor No 129, Texvalley Gangapuram",
        "status": "API is running",
        "docs": "/docs",
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
    from database import SessionLocal
    import models
    from auth import hash_password
    import os
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "kumaraguru27102@gmail.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "AmmaluTex@2026")
        existing = db.query(models.User).filter(models.User.email == admin_email).first()
        if existing:
            existing.password_hash = hash_password(admin_password)
            existing.is_admin = True
            existing.is_active = True
        else:
            admin = models.User(
                full_name="Ammalu Tex Admin",
                email=admin_email,
                phone="9876543210",
                password_hash=hash_password(admin_password),
                is_admin=True,
                is_active=True,
            )
            db.add(admin)
        db.commit()
        return {"status": "Admin reset successfully", "email": admin_email}
    finally:
        db.close()
