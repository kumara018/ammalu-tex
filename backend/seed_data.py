"""Run once to populate the database with sample products and admin user."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models
from auth import hash_password
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

PRODUCTS = [
    {
        "name": "Kashmiri Floral Chudithar Set",
        "description": "Elegant Kashmiri floral printed chudithar set with matching dupatta. Perfect for festivals and special occasions. Made from premium cotton blend fabric.",
        "price": 1299.0,
        "compare_price": 1799.0,
        "category": "Chudithar",
        "fabric": "Cotton Blend",
        "size_options": ["XS", "S", "M", "L", "XL", "XXL"],
        "colors": ["Blue", "Green", "Pink"],
        "images": ["/images/placeholder-chudithar.jpg"],
        "stock": 50,
        "sku": "CHD-001",
        "is_featured": True,
    },
    {
        "name": "Traditional Embroidered Chudithar",
        "description": "Hand-embroidered chudithar with intricate patterns. Soft georgette fabric that drapes beautifully. Includes matching churidar and dupatta.",
        "price": 1599.0,
        "compare_price": 2199.0,
        "category": "Chudithar",
        "fabric": "Georgette",
        "size_options": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Red", "Navy Blue", "Mustard"],
        "images": ["/images/placeholder-chudithar.jpg"],
        "stock": 35,
        "sku": "CHD-002",
        "is_featured": False,
    },
    {
        "name": "Daily Wear Cotton Chudithar",
        "description": "Comfortable cotton chudithar for daily wear. Breathable fabric, perfect for hot weather. Available in multiple vibrant colors.",
        "price": 699.0,
        "compare_price": 999.0,
        "category": "Chudithar",
        "fabric": "Pure Cotton",
        "size_options": ["XS", "S", "M", "L", "XL"],
        "colors": ["Yellow", "White", "Peach", "Mint"],
        "images": ["/images/placeholder-chudithar.jpg"],
        "stock": 100,
        "sku": "CHD-003",
        "is_featured": False,
    },
    {
        "name": "Floral Printed Tops",
        "description": "Trendy floral printed tops with flutter sleeves. Lightweight polyester fabric. Perfect for casual outings and college wear.",
        "price": 399.0,
        "compare_price": 599.0,
        "category": "Tops",
        "fabric": "Polyester",
        "size_options": ["XS", "S", "M", "L", "XL"],
        "colors": ["Pink", "White", "Yellow"],
        "images": ["/images/placeholder-tops.jpg"],
        "stock": 75,
        "sku": "TOP-001",
        "is_featured": True,
    },
    {
        "name": "Solid Color Casual Tops",
        "description": "Classic solid color tops available in 12 shades. Comfortable cotton fabric with a relaxed fit. Versatile wardrobe essential.",
        "price": 299.0,
        "compare_price": 449.0,
        "category": "Tops",
        "fabric": "Cotton",
        "size_options": ["XS", "S", "M", "L", "XL", "XXL"],
        "colors": ["Black", "White", "Navy", "Red", "Green", "Purple"],
        "images": ["/images/placeholder-tops.jpg"],
        "stock": 120,
        "sku": "TOP-002",
        "is_featured": False,
    },
    {
        "name": "Embroidered Mirror Work Tops",
        "description": "Beautifully crafted tops with traditional mirror work embroidery. Perfect for festive occasions and cultural events.",
        "price": 649.0,
        "compare_price": 899.0,
        "category": "Tops",
        "fabric": "Rayon",
        "size_options": ["S", "M", "L", "XL"],
        "colors": ["Maroon", "Royal Blue", "Emerald Green"],
        "images": ["/images/placeholder-tops.jpg"],
        "stock": 40,
        "sku": "TOP-003",
        "is_featured": True,
    },
    {
        "name": "Bridal Lehenga Choli Set",
        "description": "Stunning bridal lehenga with heavy embroidery and zari work. Includes matching blouse and dupatta. Perfect for weddings and receptions.",
        "price": 8999.0,
        "compare_price": 12999.0,
        "category": "Lehenga",
        "fabric": "Silk",
        "size_options": ["S", "M", "L", "XL"],
        "colors": ["Red", "Maroon", "Gold"],
        "images": ["/images/placeholder-lehenga.jpg"],
        "stock": 15,
        "sku": "LEH-001",
        "is_featured": True,
    },
    {
        "name": "Designer Party Lehenga",
        "description": "Modern designer lehenga with contemporary cuts. Net fabric with sequin embellishments. Ideal for receptions and sangeet ceremonies.",
        "price": 4999.0,
        "compare_price": 6999.0,
        "category": "Lehenga",
        "fabric": "Net",
        "size_options": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Pink", "Purple", "Blue"],
        "images": ["/images/placeholder-lehenga.jpg"],
        "stock": 20,
        "sku": "LEH-002",
        "is_featured": False,
    },
    {
        "name": "Cotton Flared Lehenga",
        "description": "Casual cotton lehenga with hand block print. Perfect for Navratri and festive occasions. Comfortable and easy to wear.",
        "price": 1999.0,
        "compare_price": 2799.0,
        "category": "Lehenga",
        "fabric": "Cotton",
        "size_options": ["XS", "S", "M", "L", "XL"],
        "colors": ["Multicolor", "Yellow", "Orange"],
        "images": ["/images/placeholder-lehenga.jpg"],
        "stock": 30,
        "sku": "LEH-003",
        "is_featured": False,
    },
    {
        "name": "Trendy Lace Crop Top",
        "description": "Stylish lace crop top with adjustable straps. Perfect for casual outings and parties. Pair with high-waist jeans or skirts.",
        "price": 449.0,
        "compare_price": 649.0,
        "category": "Crop Tops",
        "fabric": "Lace",
        "size_options": ["XS", "S", "M", "L"],
        "colors": ["White", "Black", "Beige"],
        "images": ["/images/placeholder-crop.jpg"],
        "stock": 60,
        "sku": "CRP-001",
        "is_featured": True,
    },
    {
        "name": "Floral Smocked Crop Top",
        "description": "Boho-inspired smocked crop top with elasticated bodice. Breathable cotton fabric. Perfect for summer looks.",
        "price": 349.0,
        "compare_price": 499.0,
        "category": "Crop Tops",
        "fabric": "Cotton",
        "size_options": ["XS", "S", "M", "L", "XL"],
        "colors": ["Floral Print", "Pink", "Blue"],
        "images": ["/images/placeholder-crop.jpg"],
        "stock": 80,
        "sku": "CRP-002",
        "is_featured": False,
    },
    {
        "name": "Sequin Party Gown",
        "description": "Dazzling sequin gown for parties and evening events. Floor-length with thigh-high slit. Makes you stand out in any crowd.",
        "price": 3499.0,
        "compare_price": 4999.0,
        "category": "Party Wears",
        "fabric": "Sequin",
        "size_options": ["S", "M", "L", "XL"],
        "colors": ["Gold", "Silver", "Black"],
        "images": ["/images/placeholder-party.jpg"],
        "stock": 25,
        "sku": "PTY-001",
        "is_featured": True,
    },
    {
        "name": "Velvet Bodycon Dress",
        "description": "Luxurious velvet bodycon dress with elegant neckline. Perfect for evening parties and formal events. Stretchable fabric for perfect fit.",
        "price": 1999.0,
        "compare_price": 2999.0,
        "category": "Party Wears",
        "fabric": "Velvet",
        "size_options": ["XS", "S", "M", "L", "XL"],
        "colors": ["Burgundy", "Royal Blue", "Emerald"],
        "images": ["/images/placeholder-party.jpg"],
        "stock": 35,
        "sku": "PTY-002",
        "is_featured": False,
    },
    {
        "name": "Ruffle Tiered Party Dress",
        "description": "Gorgeous ruffle tiered dress with off-shoulder design. Georgette fabric that flows beautifully. Perfect for sangeet and cocktail parties.",
        "price": 2299.0,
        "compare_price": 3199.0,
        "category": "Party Wears",
        "fabric": "Georgette",
        "size_options": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Dusty Pink", "Lavender", "Mint Green"],
        "images": ["/images/placeholder-party.jpg"],
        "stock": 28,
        "sku": "PTY-003",
        "is_featured": True,
    },
]


def seed():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@ammalutex.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123456")

        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing_admin:
            admin = models.User(
                full_name="Ammalu Tex Admin",
                email=admin_email,
                phone="9876543210",
                password_hash=hash_password(admin_password),
                is_admin=True,
            )
            db.add(admin)
            print(f"Admin created: {admin_email} / {admin_password}")
        else:
            print(f"Admin already exists: {admin_email}")

        existing_count = db.query(models.Product).count()
        if existing_count == 0:
            for p in PRODUCTS:
                product = models.Product(**p)
                db.add(product)
            print(f"Added {len(PRODUCTS)} products")
        else:
            print(f"Products already exist ({existing_count}). Skipping seed.")

        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
