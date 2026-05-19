from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    full_name     = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    phone         = Column(String(15), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city          = Column(String(100), nullable=True)
    state         = Column(String(100), nullable=True)
    pincode       = Column(String(10),  nullable=True)
    is_admin             = Column(Boolean, default=False)
    is_active            = Column(Boolean, default=True)
    is_deactivated       = Column(Boolean, default=False)          # user-initiated soft suspend
    deactivated_at       = Column(DateTime(timezone=True), nullable=True)
    scheduled_delete_at  = Column(DateTime(timezone=True), nullable=True)   # account deletion
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())

    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders     = relationship("Order",    back_populates="user")
    reviews    = relationship("Review",   back_populates="user")
    addresses  = relationship("Address",  back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    """Master list of product categories with their own IDs."""
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=True)
    emoji       = Column(String(10), nullable=True)
    is_active   = Column(Boolean, default=True)
    sort_order  = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class OTPStore(Base):
    """Stores OTPs for password reset / MFA."""
    __tablename__ = "otp_store"

    id         = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(255), index=True, nullable=False)   # email or phone
    otp_code   = Column(String(10),  nullable=False)
    otp_type   = Column(String(50),  nullable=False, default="reset")  # reset | mfa
    is_used    = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(255), nullable=False, index=True)
    description   = Column(Text, nullable=False)
    price         = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)
    category      = Column(String(100), nullable=False, index=True)
    fabric        = Column(String(100), nullable=True)
    size_options  = Column(JSON, default=list)
    colors        = Column(JSON, default=list)
    images        = Column(JSON, default=list)
    stock         = Column(Integer, default=0)
    sku           = Column(String(50), unique=True, index=True, nullable=True)
    is_active      = Column(Boolean, default=True)
    is_featured    = Column(Boolean, default=False)
    is_new_arrival = Column(Boolean, default=False)
    rating_avg    = Column(Float, default=0.0)
    rating_count  = Column(Integer, default=0)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    cart_items = relationship("CartItem", back_populates="product")
    reviews    = relationship("Review",   back_populates="product", cascade="all, delete-orphan")


class Address(Base):
    """Saved delivery addresses per user. Each user can have multiple."""
    __tablename__ = "addresses"

    id            = Column(Integer, primary_key=True, index=True)   # auto-increment
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    label         = Column(String(50),  nullable=True)   # "Home", "Work", "Other"
    full_name     = Column(String(100), nullable=False)
    phone         = Column(String(20),  nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city          = Column(String(100), nullable=False)
    state         = Column(String(100), nullable=False)
    pincode       = Column(String(10),  nullable=False)
    is_default    = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="addresses")


class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity   = Column(Integer, default=1)
    size       = Column(String(20),  nullable=True)
    color      = Column(String(50),  nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user    = relationship("User",    back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id                     = Column(Integer, primary_key=True, index=True)
    order_number           = Column(String(20), unique=True, index=True)
    user_id                = Column(Integer, ForeignKey("users.id"), nullable=False)
    items_snapshot         = Column(JSON,   nullable=False)
    subtotal               = Column(Float,  nullable=False)
    shipping_fee           = Column(Float,  default=0.0)
    discount               = Column(Float,  default=0.0)
    total                  = Column(Float,  nullable=False)
    status                 = Column(String(50), default="pending")
    payment_status         = Column(String(50), default="pending")
    payment_method         = Column(String(50), nullable=False)
    payment_transaction_id = Column(String(100), nullable=True)
    shipping_address       = Column(JSON,  nullable=False)
    tracking_number        = Column(String(100), nullable=True)
    notes                  = Column(Text, nullable=True)
    open_box_delivery      = Column(Boolean, default=False)          # customer requested open-box
    delivery_otp           = Column(String(10),  nullable=True)      # 6-digit OTP for delivery confirmation
    delivery_person_name   = Column(String(100), nullable=True)      # agent name (set on out_for_delivery)
    delivery_person_phone  = Column(String(20),  nullable=True)      # agent phone
    created_at             = Column(DateTime(timezone=True), server_default=func.now())
    updated_at             = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")


class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    rating     = Column(Integer, nullable=False)
    title      = Column(String(255), nullable=True)
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user    = relationship("User",    back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


class SupportRating(Base):
    __tablename__ = "support_ratings"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), nullable=False)
    phone      = Column(String(20), nullable=True)
    rating     = Column(Integer, nullable=False)   # 1-5
    category   = Column(String(100), nullable=True)  # "Order Issue", "Product Query", etc.
    message    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", foreign_keys=[user_id])
