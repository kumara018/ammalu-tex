from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List, Any
from datetime import datetime
import re


# ─── AUTH SCHEMAS ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
    agree_terms: bool

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Name must contain only letters and spaces")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        v = v.strip().replace(" ", "").replace("-", "")
        if not re.match(r"^(\+91|91|0)?[6-9]\d{9}$", v):
            raise ValueError("Enter a valid Indian mobile number")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must have at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must have at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must have at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must have at least one special character")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if not self.agree_terms:
            raise ValueError("You must agree to the Terms & Conditions")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Email is required")
        return v

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Password is required")
        return v


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


# ─── PRODUCT SCHEMAS ──────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    compare_price: Optional[float] = None
    category: str
    fabric: Optional[str] = None
    size_options: List[str] = []
    colors: List[str] = []
    images: List[str] = []
    stock: int
    sku: Optional[str] = None
    is_featured: bool = False

    @field_validator("name")
    @classmethod
    def name_valid(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Product name must be at least 3 characters")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be greater than 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v):
        if v < 0:
            raise ValueError("Stock cannot be negative")
        return v

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        allowed = ["Chudithar", "Tops", "Lehenga", "Crop Tops", "Party Wears"]
        if v not in allowed:
            raise ValueError(f"Category must be one of: {', '.join(allowed)}")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    category: Optional[str] = None
    fabric: Optional[str] = None
    size_options: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    compare_price: Optional[float] = None
    category: str
    fabric: Optional[str] = None
    size_options: List[str] = []
    colors: List[str] = []
    images: List[str] = []
    stock: int
    sku: Optional[str] = None
    is_active: bool
    is_featured: bool
    rating_avg: float
    rating_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── CART SCHEMAS ─────────────────────────────────────────────────────────────

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        if v > 10:
            raise ValueError("Maximum 10 items per product")
        return v


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None
    product: ProductOut

    model_config = {"from_attributes": True}


# ─── ORDER SCHEMAS ────────────────────────────────────────────────────────────

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str

    @field_validator("full_name")
    @classmethod
    def name_required(cls, v):
        if not v or not v.strip():
            raise ValueError("Full name is required")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_required(cls, v):
        v = v.strip().replace(" ", "")
        if not re.match(r"^(\+91|91|0)?[6-9]\d{9}$", v):
            raise ValueError("Enter a valid Indian mobile number")
        return v

    @field_validator("address_line1")
    @classmethod
    def addr_required(cls, v):
        if not v or not v.strip():
            raise ValueError("Address is required")
        return v.strip()

    @field_validator("city")
    @classmethod
    def city_required(cls, v):
        if not v or not v.strip():
            raise ValueError("City is required")
        return v.strip()

    @field_validator("state")
    @classmethod
    def state_required(cls, v):
        if not v or not v.strip():
            raise ValueError("State is required")
        return v.strip()

    @field_validator("pincode")
    @classmethod
    def pincode_valid(cls, v):
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("Pincode must be exactly 6 digits")
        return v


class PaymentDetails(BaseModel):
    method: str
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    card_holder_name: Optional[str] = None
    upi_id: Optional[str] = None

    @model_validator(mode="after")
    def validate_payment(self):
        allowed_methods = ["card", "upi", "cod"]
        if self.method not in allowed_methods:
            raise ValueError(f"Payment method must be one of: {', '.join(allowed_methods)}")

        if self.method == "card":
            if not self.card_number or not self.card_number.strip():
                raise ValueError("Card number is required")
            clean = self.card_number.replace(" ", "").replace("-", "")
            if not re.match(r"^\d{16}$", clean):
                raise ValueError("Card number must be exactly 16 digits")

            if not self.card_expiry or not self.card_expiry.strip():
                raise ValueError("Card expiry is required")
            if not re.match(r"^(0[1-9]|1[0-2])\/\d{2}$", self.card_expiry.strip()):
                raise ValueError("Expiry must be in MM/YY format")
            month, year = self.card_expiry.strip().split("/")
            from datetime import date
            exp = date(2000 + int(year), int(month), 1)
            if exp < date.today().replace(day=1):
                raise ValueError("Card has expired")

            if not self.card_cvv or not self.card_cvv.strip():
                raise ValueError("CVV is required")
            if not re.match(r"^\d{3,4}$", self.card_cvv.strip()):
                raise ValueError("CVV must be 3 or 4 digits")

            if not self.card_holder_name or not self.card_holder_name.strip():
                raise ValueError("Card holder name is required")

        elif self.method == "upi":
            if not self.upi_id or not self.upi_id.strip():
                raise ValueError("UPI ID is required")
            if not re.match(r"^[\w.\-_]{3,}@[a-zA-Z]{3,}$", self.upi_id.strip()):
                raise ValueError("Enter a valid UPI ID (e.g., name@upi)")
        return self


class OrderCreate(BaseModel):
    shipping_address: ShippingAddress
    payment: PaymentDetails
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    order_number: str
    items_snapshot: Any
    subtotal: float
    shipping_fee: float
    discount: float
    total: float
    status: str
    payment_status: str
    payment_method: str
    shipping_address: Any
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── REVIEW SCHEMAS ───────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime
    user: UserOut

    model_config = {"from_attributes": True}
