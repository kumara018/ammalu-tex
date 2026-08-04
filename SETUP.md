# Ammalu Tex — Complete Setup Guide
# Shop Ground Floor No 129, Texvalley Gangapuram

================================================================
TOOLS YOU NEED TO INSTALL (in order)
================================================================

STEP 1 — Install Python 3.11
STEP 2 — Install Node.js 20 LTS
STEP 3 — Install the backend
STEP 4 — Run the backend
STEP 5 — Install the frontend
STEP 6 — Run the frontend
STEP 7 — Open the website

================================================================
STEP 1 — INSTALL PYTHON 3.11
================================================================

1. Open your browser and go to:
   https://www.python.org/downloads/

2. Click "Download Python 3.11.x" (the big yellow button)

3. Run the installer. IMPORTANT:
   ✅ CHECK "Add Python to PATH" at the bottom of the first screen
   Then click "Install Now"

4. After installation, open Command Prompt (search "cmd") and type:
   python --version
   
   You should see: Python 3.11.x
   If not, restart your computer and try again.

================================================================
STEP 2 — INSTALL NODE.JS 20 LTS
================================================================

1. Go to: https://nodejs.org/en/download/

2. Download the "LTS" version for Windows

3. Run the installer and click Next → Next → Install

4. After installation, open a NEW Command Prompt and type:
   node --version
   You should see: v20.x.x

   npm --version
   You should see: 10.x.x

================================================================
STEP 3 — SET UP THE BACKEND (Python / FastAPI)
================================================================

Open Command Prompt (cmd) as Administrator.

Navigate to the backend folder:
   cd "C:\Users\abcom\Downloads\New folder\ammalu-tex\backend"

Create a virtual environment (a safe isolated space for Python):
   python -m venv venv

Activate the virtual environment:
   venv\Scripts\activate

You should now see (venv) at the start of your command line.

Install all required Python packages:
   pip install -r requirements.txt

This will install FastAPI, SQLAlchemy, JWT, bcrypt, and all other tools.
Wait for it to finish (takes 1–2 minutes).

================================================================
STEP 4 — RUN THE BACKEND SERVER
================================================================

Still in the backend folder with (venv) activated, run:

   python seed_data.py

This creates the database and adds:
✅ Admin account: admin@ammalutex.com / Admin@123456
✅ 14 sample products (Chudithar, Tops, Lehenga, Crop Tops, Party Wears)

Now start the backend server:
   uvicorn main:app --reload --port 8000

You should see:
   INFO:     Uvicorn running on http://127.0.0.1:8000

🟢 Backend is running! Leave this window open.

To see the API documentation, open your browser and go to:
   http://localhost:8000/docs

================================================================
STEP 5 — SET UP THE FRONTEND (Next.js / React)
================================================================

Open a NEW Command Prompt window (keep the backend one running).

Navigate to the frontend folder:
   cd "C:\Users\abcom\Downloads\New folder\ammalu-tex\frontend"

Install all required frontend packages:
   npm install

Wait for it to finish (takes 2–3 minutes, downloads from internet).

================================================================
STEP 6 — RUN THE FRONTEND
================================================================

Still in the frontend folder, run:
   npm run dev

You should see:
   ▲ Next.js 14.x.x
   - Local: http://localhost:3000

🟢 Frontend is running! Leave this window open.

================================================================
STEP 7 — OPEN THE WEBSITE
================================================================

Open your browser and go to:
   http://localhost:3000

You will see the Ammalu Tex premium website! 🎉

================================================================
HOW TO USE THE WEBSITE
================================================================

CUSTOMER FEATURES:
──────────────────
▶ Home Page:       http://localhost:3000
  Beautiful hero banner, featured products, categories, new arrivals

▶ All Products:    http://localhost:3000/products
  Browse all products with filters (category, price, search, sort)

▶ Register:        http://localhost:3000/auth/register
  Create account with full validation:
  - Name, email, phone all required
  - Strong password required (8+ chars, uppercase, lowercase, number, symbol)
  - Must agree to Terms & Conditions
  - Cannot submit if any field is wrong

▶ Login:           http://localhost:3000/auth/login
  Secure login with validation:
  - Cannot login with wrong credentials
  - Clear error messages for empty fields

▶ Cart:            http://localhost:3000/cart
  - Add products to cart from product pages
  - Update quantities (1–10 per item)
  - Remove items
  - Auto-calculates total + shipping

▶ Checkout:        http://localhost:3000/checkout
  3-step checkout:
  STEP 1 — Delivery Address (all fields validated)
  STEP 2 — Payment Method:
    • Credit/Debit Card: card number (16 digits required), expiry (MM/YY),
      CVV (3-4 digits), cardholder name — ALL required
    • UPI: valid UPI ID format required (e.g. name@upi)
    • Cash on Delivery: no extra details needed
  STEP 3 — Review & Place Order
  
  ⚠️ CANNOT place order without filling all required fields!

▶ My Orders:       http://localhost:3000/orders
  View all orders with status tracker

▶ Customer Support: http://localhost:3000/support
  FAQ, size guide, shipping policy, returns, contact info

ADMIN FEATURES (login with admin@ammalutex.com / Admin@123456):
────────────────────────────────────────────────────────────────
▶ Admin Panel:     http://localhost:3000/admin

  Dashboard — Stats: total products, orders, revenue, customers
  
  Products Tab:
  - View all products
  - Add new product (with full validation: name, description, price, 
    category, stock all required; compare price must be higher than price)
  - Edit any product
  - Deactivate product (soft delete)
  - Set sizes, colours, featured status
  
  Orders Tab:
  - View all orders
  - Update order status (confirmed → processing → shipped → delivered)
  
  Customers Tab:
  - View all registered customers

================================================================
ADDING YOUR OWN PRODUCTS
================================================================

OPTION 1 — Via Admin Panel (easiest):
1. Login with admin@ammalutex.com / Admin@123456
2. Go to http://localhost:3000/admin
3. Click "Products" tab
4. Click "Add Product" button
5. Fill in all details and click "Add Product"

OPTION 2 — Via API (for developers):
Open http://localhost:8000/docs
Use the /api/admin/products POST endpoint

================================================================
CHANGING ADMIN PASSWORD
================================================================

1. Open the file: ammalu-tex/backend/.env
2. Change ADMIN_PASSWORD=Admin@123456 to your new password
3. Delete the database file: ammalu-tex/backend/ammalu_tex.db
4. Run: python seed_data.py again

================================================================
ADDING PRODUCT IMAGES
================================================================

1. Go to Admin Panel → Add/Edit Product
2. The "Images" field accepts URL paths
3. For local images:
   - Copy your image to: ammalu-tex/backend/uploads/products/
   - Enter the URL: /uploads/products/your-image.jpg

Or upload via the API at:
   POST http://localhost:8000/api/admin/products/upload-image

================================================================
MAKING IT LIVE ON THE INTERNET (Production)
================================================================

To share your website with customers on the internet:

Option 1 — Free hosting (Vercel + Railway):
  Frontend → Deploy on Vercel (vercel.com) — FREE
  Backend  → Deploy on Railway (railway.app) — FREE tier available

Option 2 — VPS hosting:
  Rent a server from DigitalOcean/AWS/Hostinger India
  Install Python + Node.js on the server
  Run the same commands as above

For production, change in .env:
  SECRET_KEY=your-super-strong-random-key-at-least-64-characters
  DATABASE_URL=postgresql://user:password@host/dbname  (use PostgreSQL)

================================================================
DELHIVERY SHIPPING — SHARED ACCOUNT WARNING
================================================================

⚠️ Ammalu Tex and Vijey Textile use the SAME Delhivery account
(kumaraguru27102@gmail.com). If DELHIVERY_PICKUP_NAME is left unset when
this site is deployed, it will default to "Primary" — the exact same
default Vijey Textile uses — so couriers could be dispatched to the wrong
shop for one store's orders.

Before deploying this site for real:
  1. In the Delhivery dashboard, register a pickup location for THIS shop
     (Ammalu Tex, Shop GF No 129) that is separate from Vijey Textile's
     (Shop GF No 131) pickup location.
  2. Set these env vars on whatever host runs this backend:

     DELHIVERY_API_TOKEN     = (same Delhivery account token)
     DELHIVERY_PICKUP_NAME   = (the pickup location name registered for
                                Ammalu Tex — must NOT match Vijey Textile's)
     DELHIVERY_RETURN_NAME   = Ammalu Tex
     DELHIVERY_RETURN_ADDRESS= Shop Ground Floor No 129, Texvalley Gangapuram
     DELHIVERY_RETURN_PIN    = 638001
     DELHIVERY_RETURN_CITY   = Gangapuram
     DELHIVERY_RETURN_STATE  = Tamil Nadu
     DELHIVERY_RETURN_PHONE  = (Ammalu Tex shop phone)

  3. Also double-check order numbers don't collide with Vijey Textile's —
     this site's generate_order_number() in backend/routers/orders.py
     still uses the "AMT-" prefix (that's fine, it's the original site
     this prefix was named after — just don't let Vijey Textile reuse it,
     which has already been changed to "VJT-").

================================================================
SECURITY FEATURES BUILT INTO THIS WEBSITE
================================================================

✅ Passwords are hashed with bcrypt (industry standard)
✅ JWT tokens with expiry (24 hours)
✅ All form inputs validated on frontend AND backend
✅ SQL injection prevention (SQLAlchemy ORM)
✅ CORS protection (only localhost:3000 can access the API)
✅ Admin-only routes protected
✅ Payment fields: card number, expiry, CVV all strictly validated
✅ Cannot order without filling payment details
✅ Cannot register with weak passwords
✅ Cannot login with wrong credentials
✅ Stock is checked before order is placed
✅ Email uniqueness enforced

================================================================
TROUBLESHOOTING
================================================================

Problem: "Module not found" when running pip install
Solution: Make sure (venv) is active. Run: venv\Scripts\activate

Problem: Backend starts but shows "port already in use"
Solution: Use a different port: uvicorn main:app --reload --port 8001
         Then update frontend/.env.local: NEXT_PUBLIC_API_URL=http://localhost:8001

Problem: Frontend shows "Cannot connect to server"
Solution: Make sure the backend is running at http://localhost:8000

Problem: npm install fails
Solution: Delete the node_modules folder and package-lock.json, then run npm install again

Problem: "sqlite3" error on Windows
Solution: The code uses SQLite which is built into Python. No extra installation needed.

Problem: Cannot see admin panel
Solution: Make sure you logged in with admin@ammalutex.com and the admin account was created by running seed_data.py

================================================================
QUICK START SUMMARY
================================================================

Terminal 1 (Backend):
  cd "C:\Users\abcom\Downloads\New folder\ammalu-tex\backend"
  venv\Scripts\activate
  uvicorn main:app --reload --port 8000

Terminal 2 (Frontend):
  cd "C:\Users\abcom\Downloads\New folder\ammalu-tex\frontend"
  npm run dev

Browser: http://localhost:3000

Admin: http://localhost:3000/admin
Login: admin@ammalutex.com / Admin@123456

================================================================
Store: Ammalu Tex — Shop GF No 129, Texvalley Gangapuram
================================================================
