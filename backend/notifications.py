"""
Ammalu Tex — Email & SMS Notifications
Sends all transactional emails (welcome, order, payment, status, OTPs)
and optional SMS via Twilio.

Env vars required:
  SMTP_EMAIL       — Gmail address
  SMTP_PASSWORD    — Gmail App Password (16 chars, no spaces)

Optional (SMS):
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_PHONE     — Twilio from-number (e.g. +14155551234)
"""

import os, smtplib, threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASS     = os.getenv("SMTP_PASSWORD", "")
STORE_NAME    = "Ammalu Tex"
STORE_URL     = os.getenv("FRONTEND_URL", "https://ammalu-tex.vercel.app")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", SMTP_EMAIL or "support@ammalu-tex.com")
STORE_ADDR    = "Shop Ground Floor No 129, Texvalley Gangapuram"
YEAR          = datetime.now().year


# ── Low-level send (runs in background thread so API never blocks) ─────────────
def _send_email(to: str, subject: str, html: str):
    if not SMTP_EMAIL or not SMTP_PASS:
        print(f"[Email] {subject} → {to}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"]  = subject
        msg["From"]     = f"{STORE_NAME} <{SMTP_EMAIL}>"
        msg["To"]       = to
        msg["Reply-To"] = SUPPORT_EMAIL
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(SMTP_EMAIL, SMTP_PASS)
            s.sendmail(SMTP_EMAIL, to, msg.as_string())
    except Exception as e:
        print(f"[Email Error] {e}")

def _bg(to: str, subject: str, html: str):
    """Fire-and-forget email in a daemon thread."""
    threading.Thread(target=_send_email, args=(to, subject, html), daemon=True).start()


# ── HTML helpers ───────────────────────────────────────────────────────────────
def _wrap(body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:24px 16px;background:#fff9f2;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c1d2e 0%,#9b2335 100%);padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-family:Georgia,serif;letter-spacing:0.5px;">{STORE_NAME}</h1>
      <p style="margin:6px 0 0;color:#f5c842;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Premium Textiles · Texvalley Gangapuram</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">{body}</div>

    <!-- Footer -->
    <div style="background:#f8f4f0;padding:20px 32px;border-top:1px solid #ede8e3;text-align:center;">
      <p style="margin:0 0 8px;color:#888;font-size:12px;">{STORE_ADDR}</p>
      <p style="margin:0;color:#888;font-size:12px;">
        <a href="mailto:{SUPPORT_EMAIL}" style="color:#7c1d2e;text-decoration:none;">Contact Support</a>
        &nbsp;·&nbsp;
        <a href="{STORE_URL}" style="color:#7c1d2e;text-decoration:none;">Visit Store</a>
        &nbsp;·&nbsp;
        <a href="{STORE_URL}/orders" style="color:#7c1d2e;text-decoration:none;">My Orders</a>
      </p>
      <p style="margin:10px 0 0;color:#bbb;font-size:11px;">© {YEAR} {STORE_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>"""

def _btn(text: str, url: str, bg: str = "#7c1d2e") -> str:
    return (f'<div style="text-align:center;margin:28px 0;">'
            f'<a href="{url}" style="display:inline-block;background:{bg};color:#ffffff;'
            f'padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;'
            f'font-size:15px;letter-spacing:0.3px;">{text}</a></div>')


# ── 1. Welcome email (sent on registration) ────────────────────────────────────
def send_welcome_email(email: str, name: str):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">Welcome to {STORE_NAME}, {first}! 🎉</h2>
      <p style="color:#444;line-height:1.7;font-size:15px;">
        Thank you for creating your account. We're delighted to have you as part of the
        <strong>{STORE_NAME}</strong> family!
      </p>
      <p style="color:#444;line-height:1.7;font-size:15px;">Discover our exclusive collection:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:12px 8px;text-align:center;background:#fff9f2;border-radius:8px;width:30%;">
            <div style="font-size:30px;">👗</div>
            <div style="color:#7c1d2e;font-weight:bold;font-size:13px;margin-top:6px;">Chudithar &amp; Tops</div>
          </td>
          <td style="width:4%;"></td>
          <td style="padding:12px 8px;text-align:center;background:#fff9f2;border-radius:8px;width:30%;">
            <div style="font-size:30px;">🪭</div>
            <div style="color:#7c1d2e;font-weight:bold;font-size:13px;margin-top:6px;">Lehenga &amp; Half Sarees</div>
          </td>
          <td style="width:4%;"></td>
          <td style="padding:12px 8px;text-align:center;background:#fff9f2;border-radius:8px;width:30%;">
            <div style="font-size:30px;">✨</div>
            <div style="color:#7c1d2e;font-weight:bold;font-size:13px;margin-top:6px;">Party Wears</div>
          </td>
        </tr>
      </table>
      {_btn("Start Shopping →", STORE_URL)}
      <hr style="border:none;border-top:1px solid #ede8e3;margin:24px 0;">
      <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
        Questions? Email us at
        <a href="mailto:{SUPPORT_EMAIL}" style="color:#7c1d2e;">{SUPPORT_EMAIL}</a> — we reply within 24 hours.
      </p>
    """)
    _bg(email, f"Welcome to {STORE_NAME}! 🎉 Your account is ready", html)


# ── 2. Order confirmation ──────────────────────────────────────────────────────
def send_order_confirmation_email(email: str, name: str, order):
    first = name.split()[0]
    rows = "".join(f"""
      <tr>
        <td style="padding:10px 0;color:#444;border-bottom:1px solid #f0ebe5;font-size:14px;">{i.get('name','')}</td>
        <td style="padding:10px 0;color:#666;border-bottom:1px solid #f0ebe5;font-size:14px;text-align:center;">×{i.get('quantity',1)}</td>
        <td style="padding:10px 0;color:#444;border-bottom:1px solid #f0ebe5;font-size:14px;text-align:right;font-weight:bold;">₹{i.get('price',0):,.0f}</td>
      </tr>""" for i in (order.items_snapshot or []))

    addr = order.shipping_address or {}
    addr2 = (", " + addr.get("address_line2", "")) if addr.get("address_line2") else ""
    html = _wrap(f"""
      <div style="display:inline-block;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 20px;margin-bottom:20px;">
        <span style="color:#15803d;font-weight:bold;font-size:14px;">✅ Order Confirmed</span>
      </div>
      <h2 style="color:#1e293b;margin-top:0;font-size:21px;">Hi {first}, your order is placed!</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">We've received your order and our team is getting it ready for you.</p>

      <div style="background:#f8f4f0;border-left:4px solid #7c1d2e;border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0;color:#888;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Order Number</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#7c1d2e;letter-spacing:2px;">{order.order_number}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e0db;">Product</th>
            <th style="text-align:center;padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e0db;">Qty</th>
            <th style="text-align:right;padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e5e0db;">Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>

      <div style="background:#f8f4f0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;color:#666;font-size:14px;">Subtotal &nbsp;<strong style="color:#444;float:right;">₹{order.subtotal:,.0f}</strong></p>
        <p style="margin:0 0 6px;color:#666;font-size:14px;">Shipping &nbsp;<strong style="color:#16a34a;float:right;">{"FREE" if order.shipping_fee == 0 else f"₹{order.shipping_fee:,.0f}"}</strong></p>
        <hr style="border:none;border-top:1px solid #ddd;margin:10px 0;">
        <p style="margin:0;color:#1e293b;font-weight:bold;font-size:16px;">Total &nbsp;<strong style="color:#7c1d2e;font-size:18px;float:right;">₹{order.total:,.0f}</strong></p>
      </div>

      <div style="margin:20px 0;">
        <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Delivering to</p>
        <p style="color:#444;font-size:14px;margin:0;line-height:1.8;">
          <strong>{addr.get('full_name','')}</strong><br>
          {addr.get('address_line1','')}{addr2}<br>
          {addr.get('city','')}, {addr.get('state','')} — {addr.get('pincode','')}<br>
          📞 {addr.get('phone','')}
        </p>
      </div>
      {_btn("Track Your Order →", f"{STORE_URL}/orders/{order.id}")}
    """)
    _bg(email, f"Order Confirmed — {order.order_number} | {STORE_NAME}", html)


# ── 3. Payment success ─────────────────────────────────────────────────────────
def send_payment_success_email(email: str, name: str, order):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#16a34a;margin-top:0;font-size:22px;">💚 Payment Successful!</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, your payment of <strong style="color:#7c1d2e;">₹{order.total:,.0f}</strong>
        for order <strong>{order.order_number}</strong> has been received.
      </p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
        <p style="margin:0;color:#15803d;font-size:16px;font-weight:bold;">✅ Payment Confirmed</p>
        <p style="margin:8px 0 0;color:#166534;font-size:13px;">Your order is being prepared and will be shipped soon.</p>
      </div>
      <table style="width:100%;font-size:14px;margin:16px 0;">
        <tr><td style="color:#888;padding:6px 0;">Payment Method</td><td style="color:#444;font-weight:bold;text-align:right;">{order.payment_method.upper()}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Amount Paid</td><td style="color:#7c1d2e;font-weight:bold;text-align:right;">₹{order.total:,.0f}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Order Number</td><td style="color:#444;font-weight:bold;text-align:right;">{order.order_number}</td></tr>
      </table>
      {_btn("View Order Details →", f"{STORE_URL}/orders/{order.id}")}
    """)
    _bg(email, f"Payment Successful ₹{order.total:,.0f} — {order.order_number} | {STORE_NAME}", html)


# ── 4. Payment failed ──────────────────────────────────────────────────────────
def send_payment_failed_email(email: str, name: str, order):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#dc2626;margin-top:0;font-size:22px;">❌ Payment Failed</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, we couldn't process your payment for order <strong>{order.order_number}</strong>.
      </p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0;color:#dc2626;font-weight:bold;">❌ Order cancelled — no amount has been deducted.</p>
        <p style="margin:8px 0 0;color:#991b1b;font-size:13px;">Please try again with a different payment method.</p>
      </div>
      {_btn("Try Again →", STORE_URL, "#dc2626")}
      <p style="color:#888;font-size:13px;margin-top:20px;">
        If you were charged, contact us at
        <a href="mailto:{SUPPORT_EMAIL}" style="color:#7c1d2e;">{SUPPORT_EMAIL}</a>.
      </p>
    """)
    _bg(email, f"Payment Failed — Order {order.order_number} | {STORE_NAME}", html)


# ── 5. Order status update ─────────────────────────────────────────────────────
_STATUS_MAP = {
    "processing": ("🔄 Order Being Processed", "#2563eb", "#eff6ff", "Your order is being prepared by our team."),
    "shipped":    ("📦 Your Order is Shipped!", "#7c3aed", "#f5f3ff", "Your order is on its way — expect it soon!"),
    "delivered":  ("✅ Order Delivered!",        "#16a34a", "#f0fdf4", "Your order has been delivered. We hope you love it!"),
    "cancelled":  ("❌ Order Cancelled",          "#dc2626", "#fef2f2", "Your order has been cancelled."),
}

def send_order_status_email(email: str, name: str, order, new_status: str):
    first = name.split()[0]
    title, color, bg, msg = _STATUS_MAP.get(
        new_status, (f"Order Update: {new_status.title()}", "#7c1d2e", "#f8f4f0", f"Status: {new_status}")
    )
    tracking = (f'<p style="color:#444;font-size:14px;margin-top:12px;">'
                f'Tracking Number: <strong>{order.tracking_number}</strong></p>'
                if getattr(order, "tracking_number", None) else "")
    html = _wrap(f"""
      <h2 style="color:{color};margin-top:0;font-size:22px;">{title}</h2>
      <p style="color:#444;font-size:14px;">
        Hi {first}, here's an update on your order <strong>{order.order_number}</strong>.
      </p>
      <div style="background:{bg};border-left:4px solid {color};border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0;color:{color};font-weight:bold;font-size:14px;">{msg}</p>
      </div>
      {tracking}
      {_btn("Track Your Order →", f"{STORE_URL}/orders/{order.id}")}
    """)
    _bg(email, f"{title} — {order.order_number} | {STORE_NAME}", html)


# ── 6. Review request (after delivery) ────────────────────────────────────────
def send_review_request_email(email: str, name: str, order):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">How did we do? ⭐</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, we hope you're loving your purchase from order <strong>{order.order_number}</strong>!
      </p>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Your review helps other shoppers find the right product and helps us improve.
        It takes less than 2 minutes!
      </p>
      {_btn("⭐ Write a Review", f"{STORE_URL}/orders/{order.id}", "#f5c842")}
      <p style="color:#888;font-size:12px;text-align:center;margin-top:8px;">
        Click above to rate and review your purchase.
      </p>
    """)
    _bg(email, f"How was your order? Share your feedback | {STORE_NAME}", html)


# ── 7. Account deletion OTP ────────────────────────────────────────────────────
def send_deletion_otp_email(email: str, name: str, otp: str):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#dc2626;margin-top:0;font-size:22px;">⚠️ Account Deletion Request</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, we received a request to permanently delete your <strong>{STORE_NAME}</strong> account.
      </p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:24px;margin:20px 0;text-align:center;">
        <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your Deletion OTP</p>
        <p style="margin:12px 0 4px;font-size:40px;font-weight:bold;color:#dc2626;letter-spacing:10px;font-family:monospace;">{otp}</p>
        <p style="margin:0;color:#888;font-size:12px;">Valid for 10 minutes only</p>
      </div>
      <div style="background:#fff8e1;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-weight:bold;font-size:14px;">
          ⏳ Your account will be permanently deleted after 5 minutes.
        </p>
        <p style="margin:8px 0 0;color:#92400e;font-size:13px;">
          To cancel: simply log in to your account within 5 minutes.
        </p>
      </div>
      <p style="color:#888;font-size:13px;">
        If you did NOT request this, ignore this email — your account remains safe.
      </p>
    """)
    _bg(email, f"⚠️ Account Deletion OTP — {STORE_NAME}", html)


# ── 8. Deletion confirmed ──────────────────────────────────────────────────────
def send_deletion_scheduled_email(email: str, name: str, delete_at):
    first = name.split()[0]
    delete_str = delete_at.strftime("%d %B %Y at %I:%M %p UTC")
    html = _wrap(f"""
      <h2 style="color:#dc2626;margin-top:0;font-size:22px;">Account Scheduled for Deletion</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, your account deletion request has been confirmed.
      </p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
        <p style="margin:0;color:#dc2626;font-weight:bold;font-size:14px;">Permanent deletion scheduled for:</p>
        <p style="margin:10px 0 0;color:#991b1b;font-size:18px;font-weight:bold;">{delete_str}</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;color:#15803d;font-size:14px;">
          Changed your mind? <strong>Simply log in within 5 minutes</strong> to cancel.
        </p>
      </div>
      <p style="color:#888;font-size:13px;">
        Questions? Contact <a href="mailto:{SUPPORT_EMAIL}" style="color:#7c1d2e;">{SUPPORT_EMAIL}</a>.
      </p>
    """)
    _bg(email, f"Account Deletion Scheduled — {STORE_NAME}", html)


# ── 9. Optional SMS via Twilio ─────────────────────────────────────────────────
def _send_sms(to_phone: str, message: str):
    if not to_phone.startswith("+"):
        to_phone = "+91" + to_phone
    sid   = os.getenv("TWILIO_ACCOUNT_SID", "")
    token = os.getenv("TWILIO_AUTH_TOKEN",  "")
    frm   = os.getenv("TWILIO_PHONE",       "")
    if not all([sid, token, frm]):
        print(f"[SMS] {to_phone}: {message}")
        return
    try:
        from twilio.rest import Client
        Client(sid, token).messages.create(body=message, from_=frm, to=to_phone)
    except Exception as e:
        print(f"[SMS Error] {e}")

def send_welcome_sms(phone: str, name: str):
    _send_sms(phone, f"Welcome to {STORE_NAME}, {name.split()[0]}! Shop at {STORE_URL}")

def send_order_sms(phone: str, order_number: str, total: float):
    _send_sms(phone, f"{STORE_NAME}: Order {order_number} confirmed! Total ₹{total:,.0f}. Track: {STORE_URL}/orders")

def send_otp_sms(phone: str, otp: str, purpose: str = "Login"):
    _send_sms(phone, f"{STORE_NAME} {purpose} OTP: {otp}. Valid 10 min. Do not share.")
