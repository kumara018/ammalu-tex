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
    """
    Tries SendGrid HTTP API first (works on Render — no port blocking).
    Falls back to Gmail SMTP only if SENDGRID_API_KEY is not set.
    """
    import json as _json, urllib.request as _req, urllib.error as _uerr

    sg_key = os.getenv("SENDGRID_API_KEY", "")

    # ── Path A: SendGrid (recommended on Render) ───────────────────────────────
    if sg_key:
        from_email = SMTP_EMAIL or "noreply@ammalu-tex.com"
        # Plain-text version strips HTML tags for multipart — improves deliverability
        import re as _re
        plain = _re.sub(r'<[^>]+>', '', html)
        plain = _re.sub(r'\s{2,}', '\n', plain).strip()
        payload = _json.dumps({
            "personalizations": [{"to": [{"email": to}]}],
            "from": {"email": from_email, "name": STORE_NAME},
            "reply_to": {"email": SUPPORT_EMAIL},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": plain},
                {"type": "text/html",  "value": html},
            ],
            # Unsubscribe header — required by Gmail to classify as "wanted" mail
            "headers": {
                "List-Unsubscribe": f"<mailto:{SUPPORT_EMAIL}?subject=Unsubscribe>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                "X-Mailer": "Ammalu Tex Notifications",
            },
            "tracking_settings": {
                "click_tracking":      {"enable": False},
                "open_tracking":       {"enable": False},
                "subscription_tracking": {"enable": False},
            },
        }).encode()
        try:
            request = _req.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=payload,
                headers={
                    "Authorization": f"Bearer {sg_key}",
                    "Content-Type":  "application/json",
                },
            )
            with _req.urlopen(request, timeout=15) as resp:
                print(f"[Email SENT ✓ SendGrid {resp.status}] {subject} → {to}")
        except _uerr.HTTPError as e:
            body = e.read().decode(errors="ignore")
            print(f"[Email SendGrid HTTP {e.code}] {subject} → {to} | {body}")
        except Exception as e:
            print(f"[Email SendGrid ERROR] {type(e).__name__}: {e}")
        return  # never fall through to SMTP when API key is set

    # ── Path B: Gmail SMTP (blocked on Render free tier — local dev only) ──────
    if not SMTP_EMAIL or not SMTP_PASS:
        print(f"[Email SKIP — no SendGrid key and no SMTP config] {subject} → {to}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"]  = subject
        msg["From"]     = f"{STORE_NAME} <{SMTP_EMAIL}>"
        msg["To"]       = to
        msg["Reply-To"] = SUPPORT_EMAIL
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(SMTP_EMAIL, SMTP_PASS)
            s.sendmail(SMTP_EMAIL, to, msg.as_string())
        print(f"[Email SENT ✓ SMTP] {subject} → {to}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"[Email AUTH ERROR] Gmail rejected login. Check App Password. {e}")
    except smtplib.SMTPException as e:
        print(f"[Email SMTP ERROR] {e}")
    except Exception as e:
        print(f"[Email ERROR] {type(e).__name__}: {e}")

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
    "processing":       ("🔄 Order Being Processed",   "#2563eb", "#eff6ff", "Your order is being prepared by our team."),
    "shipped":          ("📦 Your Order is Shipped!",   "#7c3aed", "#f5f3ff", "Your order is on its way — expect it soon!"),
    "out_for_delivery": ("🚚 Out for Delivery Today!",  "#ea580c", "#fff7ed", "Your order is out for delivery — stay at home!"),
    "delivered":        ("✅ Order Delivered!",          "#16a34a", "#f0fdf4", "Your order has been delivered. We hope you love it!"),
    "cancelled":        ("❌ Order Cancelled",            "#dc2626", "#fef2f2", "Your order has been cancelled."),
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
          ⏳ Your account will be permanently deleted after 24 hours.
        </p>
        <p style="margin:8px 0 0;color:#92400e;font-size:13px;">
          To cancel: simply log in to your account within 24 hours.
        </p>
      </div>
      <p style="color:#888;font-size:13px;">
        If you did NOT request this, ignore this email — your account remains safe.
      </p>
    """)
    _bg(email, f"Confirm account deletion — {STORE_NAME}", html)


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
          Changed your mind? <strong>Simply log in within 24 hours</strong> to cancel.
        </p>
      </div>
      <p style="color:#888;font-size:13px;">
        Questions? Contact <a href="mailto:{SUPPORT_EMAIL}" style="color:#7c1d2e;">{SUPPORT_EMAIL}</a>.
      </p>
    """)
    _bg(email, f"Account Deletion Scheduled — {STORE_NAME}", html)


# ── 9. Login OTP email ────────────────────────────────────────────────────────
def send_login_otp_email(email: str, name: str, otp: str):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">🔐 Your Login OTP</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, use the OTP below to complete your sign-in to <strong>{STORE_NAME}</strong>.
      </p>
      <div style="background:#fff9f2;border:2px solid #7c1d2e;border-radius:12px;padding:28px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:3px;">One-Time Password</p>
        <p style="margin:14px 0 6px;font-size:46px;font-weight:bold;color:#7c1d2e;letter-spacing:14px;font-family:monospace;">{otp}</p>
        <p style="margin:0;color:#999;font-size:12px;">Valid for <strong>10 minutes</strong> only</p>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          🛡️ <strong>Security tip:</strong> Never share this OTP with anyone.
          Ammalu Tex staff will never ask for your OTP.
        </p>
      </div>
      <p style="color:#888;font-size:13px;line-height:1.6;">
        Didn't request this? Someone may have tried to sign in with your account.
        You can safely ignore this email — your account is secure.
      </p>
    """)
    _bg(email, f"Your Ammalu Tex sign-in code", html)


# ── 10. Password reset OTP email ──────────────────────────────────────────────
def send_password_reset_otp_email(email: str, name: str, otp: str):
    first = name.split()[0]
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">🔑 Password Reset OTP</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, we received a request to reset your <strong>{STORE_NAME}</strong> password.
        Use the OTP below to continue.
      </p>
      <div style="background:#fff9f2;border:2px solid #7c1d2e;border-radius:12px;padding:28px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:3px;">Password Reset OTP</p>
        <p style="margin:14px 0 6px;font-size:46px;font-weight:bold;color:#7c1d2e;letter-spacing:14px;font-family:monospace;">{otp}</p>
        <p style="margin:0;color:#999;font-size:12px;">Valid for <strong>10 minutes</strong> only</p>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          🛡️ <strong>Security tip:</strong> Never share this OTP with anyone.
          If you did NOT request a password reset, please ignore this email.
        </p>
      </div>
      {_btn("Go to Reset Password →", f"{STORE_URL}/auth/forgot-password")}
    """)
    _bg(email, f"Reset your Ammalu Tex password", html)


# ── helpers ───────────────────────────────────────────────────────────────────
_EMOJI_MAP = {
    "Lehenga": "👗", "Chudithar": "👘", "Half Saree": "🥻",
    "Crop Tops": "🎽", "Tops": "👕", "Party Wears": "✨",
}

def _cart_summary_html(cart_items: list) -> str:
    """Build an HTML table of all items currently in the cart."""
    if not cart_items:
        return "<p style='color:#888;font-size:13px;text-align:center;'>Your cart is now empty.</p>"
    rows = ""
    total_qty   = 0
    total_price = 0.0
    for item in cart_items:
        emoji    = _EMOJI_MAP.get(item.get("category", ""), "🛍️")
        name     = item.get("name", "")
        qty      = item.get("quantity", 1)
        price    = item.get("price", 0)
        subtotal = price * qty
        size_color = ""
        if item.get("size"):  size_color += f"Size: {item['size']}"
        if item.get("color"): size_color += (" · " if size_color else "") + f"Colour: {item['color']}"
        total_qty   += qty
        total_price += subtotal
        rows += f"""
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #f0ebe5;font-size:14px;">
            <span style="font-size:18px;">{emoji}</span>
            <span style="margin-left:8px;font-weight:600;color:#1e293b;">{name}</span>
            {f'<br><span style="font-size:11px;color:#888;margin-left:26px;">{size_color}</span>' if size_color else ''}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f0ebe5;text-align:center;color:#555;font-size:14px;">×{qty}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f0ebe5;text-align:right;font-weight:bold;color:#7c1d2e;font-size:14px;">₹{subtotal:,.0f}</td>
        </tr>"""
    return f"""
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#fff9f2;">
          <th style="text-align:left;padding:10px 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Product</th>
          <th style="text-align:center;padding:10px 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="text-align:right;padding:10px 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px 8px;font-weight:bold;color:#444;font-size:14px;">
            {total_qty} item{"s" if total_qty != 1 else ""} in cart
          </td>
          <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#7c1d2e;font-size:16px;">
            ₹{total_price:,.0f}
          </td>
        </tr>
      </tfoot>
    </table>"""

def _cart_sms(cart_items: list) -> str:
    """One-line SMS summary of the cart."""
    if not cart_items:
        return "Your cart is now empty."
    parts = [f"{item.get('name','Item')} x{item.get('quantity',1)}" for item in cart_items[:3]]
    suffix = f" +{len(cart_items)-3} more" if len(cart_items) > 3 else ""
    total  = sum(item.get("price", 0) * item.get("quantity", 1) for item in cart_items)
    return f"Cart ({len(cart_items)} item{'s' if len(cart_items)!=1 else ''}): {', '.join(parts)}{suffix}. Total ₹{total:,.0f}"


# ── 11a. Cart — item ADDED ────────────────────────────────────────────────────
def send_cart_add_email(email: str, name: str, product_name: str,
                        product_category: str, quantity: int,
                        size: str, color: str, cart_items: list):
    first = name.split()[0]
    emoji   = _EMOJI_MAP.get(product_category, "🛍️")
    details = []
    if size:  details.append(f"Size: <strong>{size}</strong>")
    if color: details.append(f"Colour: <strong>{color}</strong>")
    details_line = " &nbsp;·&nbsp; ".join(details)
    summary_html = _cart_summary_html(cart_items)
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">🛒 Added to your cart!</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, <strong>{product_name}</strong> (×{quantity}) has been added to your cart.
      </p>

      <!-- Added product highlight -->
      <div style="background:#fff9f2;border:2px solid #f97316;border-radius:12px;padding:20px;margin:20px 0;display:flex;align-items:center;gap:16px;">
        <div style="font-size:52px;flex-shrink:0;">{emoji}</div>
        <div>
          <p style="margin:0;font-size:16px;font-weight:bold;color:#7c1d2e;">{product_name}</p>
          <p style="margin:4px 0 0;color:#888;font-size:13px;">Quantity: {quantity}</p>
          {f'<p style="margin:4px 0 0;color:#888;font-size:12px;">{details_line}</p>' if details_line else ''}
        </div>
      </div>

      <!-- Full cart summary -->
      <p style="color:#7c1d2e;font-weight:bold;font-size:15px;margin-bottom:4px;">🧺 Your Cart Summary</p>
      {summary_html}

      <!-- Urgency nudge -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          ⚡ <strong>Stock is limited!</strong> Complete your order before someone else grabs it.
        </p>
      </div>
      {_btn("Go to Cart & Order →", f"{STORE_URL}/cart", "#f97316")}
    """)
    _bg(email, f"Added to cart: {product_name} | {STORE_NAME}", html)


# ── 11b. Cart — item REMOVED ──────────────────────────────────────────────────
def send_cart_remove_email(email: str, name: str, product_name: str,
                           product_category: str, cart_items: list):
    first     = name.split()[0]
    emoji     = _EMOJI_MAP.get(product_category, "🛍️")
    summary_html = _cart_summary_html(cart_items)
    remaining = len(cart_items)
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">🗑️ Item removed from cart</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, <strong>{product_name}</strong> has been removed from your cart.
      </p>

      <!-- Removed product -->
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin:20px 0;display:flex;align-items:center;gap:12px;">
        <div style="font-size:40px;flex-shrink:0;opacity:0.5;">{emoji}</div>
        <div>
          <p style="margin:0;font-size:14px;font-weight:bold;color:#991b1b;text-decoration:line-through;">{product_name}</p>
          <p style="margin:4px 0 0;color:#dc2626;font-size:12px;">Removed from cart</p>
        </div>
      </div>

      <!-- Remaining cart -->
      {f'<p style="color:#7c1d2e;font-weight:bold;font-size:15px;margin-bottom:4px;">🧺 Remaining Cart ({remaining} item{"s" if remaining!=1 else ""})</p>' if remaining > 0 else ''}
      {summary_html}

      {_btn("Continue Shopping →", f"{STORE_URL}/products", "#7c1d2e") if remaining == 0 else _btn("View Cart & Order →", f"{STORE_URL}/cart", "#f97316")}
    """)
    _bg(email, f"Item removed from cart | {STORE_NAME}", html)


# ── 11c. Cart SMS notifications ────────────────────────────────────────────────
def send_cart_add_sms(phone: str, product_name: str, quantity: int, cart_items: list):
    summary = _cart_sms(cart_items)
    _send_sms(phone,
        f"{STORE_NAME}: Added '{product_name}' x{quantity} to cart. {summary} Order: {STORE_URL}/cart"
    )

def send_cart_remove_sms(phone: str, product_name: str, cart_items: list):
    summary = _cart_sms(cart_items)
    _send_sms(phone,
        f"{STORE_NAME}: Removed '{product_name}' from cart. {summary} Shop: {STORE_URL}"
    )


# ── 11d. Keep old function name as alias (backward compat) ────────────────────
def send_cart_reminder_email(email: str, name: str, product_name: str, product_image_emoji: str = "🛍️"):
    """Legacy alias — prefer send_cart_add_email for full cart summary."""
    send_cart_add_email(email, name, product_name, "", 1, "", "", [])


# ── 12. Delivery OTP email ─────────────────────────────────────────────────────
def send_delivery_otp_email(email: str, name: str, otp: str, order_number: str,
                             agent_name: str = "", agent_phone: str = ""):
    first = name.split()[0]
    agent_block = ""
    if agent_name or agent_phone:
        agent_block = f"""
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#0369a1;font-weight:bold;font-size:14px;">📦 Your Delivery Agent</p>
        {"<p style='margin:8px 0 0;color:#0c4a6e;font-size:14px;'>👤 " + agent_name + "</p>" if agent_name else ""}
        {"<p style='margin:6px 0 0;color:#0c4a6e;font-size:14px;'>📞 " + agent_phone + "</p>" if agent_phone else ""}
      </div>"""
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">🚚 Your order is out for delivery!</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, your order <strong>{order_number}</strong> is on its way and will be delivered today!
      </p>
      {agent_block}
      <div style="background:#fff9f2;border:2px solid #7c1d2e;border-radius:12px;padding:28px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:3px;">Your Delivery OTP</p>
        <p style="margin:14px 0 6px;font-size:52px;font-weight:bold;color:#7c1d2e;letter-spacing:14px;font-family:monospace;">{otp}</p>
        <p style="margin:0;color:#666;font-size:13px;">Share this OTP with the delivery agent to confirm receipt</p>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-weight:bold;font-size:14px;">⚠️ Important Security Note</p>
        <p style="margin:8px 0 0;color:#92400e;font-size:13px;line-height:1.6;">
          • Only share this OTP with the delivery person at your door<br>
          • Do NOT share via phone call or message<br>
          • The OTP confirms you received the package
        </p>
      </div>
      {_btn("Track Your Order →", f"{STORE_URL}/orders")}
    """)
    _bg(email, f"🚚 Delivery OTP for order {order_number} — share with delivery agent | {STORE_NAME}", html)


# ── 13. Support rating confirmation (to user) ─────────────────────────────────
def send_support_rating_confirmation(email: str, name: str, rating: int):
    first = name.split()[0]
    stars = "⭐" * rating
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">Thank you for your feedback! 🙏</h2>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Hi {first}, we truly appreciate you taking the time to rate your experience with our support team.
      </p>
      <div style="background:#fff9f2;border:2px solid #7c1d2e;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:36px;">{stars}</p>
        <p style="margin:10px 0 0;color:#7c1d2e;font-weight:bold;font-size:16px;">You rated us {rating}/5</p>
      </div>
      <p style="color:#444;font-size:14px;line-height:1.6;">
        Your feedback helps our support team grow and serve you better. If you have any unresolved issues,
        please don't hesitate to reach out — we're always here to help.
      </p>
      {_btn("Visit Our Store →", STORE_URL)}
    """)
    _bg(email, f"Thank you for rating Ammalu Tex Support — {STORE_NAME}", html)


# ── 14. Support rating admin notification ──────────────────────────────────────
def send_support_rating_admin_notify(name: str, email: str, rating: int, category: str, message: str):
    admin_email = os.getenv("ADMIN_EMAIL", SMTP_EMAIL or SUPPORT_EMAIL)
    if not admin_email:
        return
    stars = "⭐" * rating + "☆" * (5 - rating)
    color = "#16a34a" if rating >= 4 else "#ea580c" if rating == 3 else "#dc2626"
    category_row = (
        f"<tr><td style='color:#888;padding:6px 0;'>Category</td><td style='color:#444;'>{category}</td></tr>"
        if category else ""
    )
    message_block = (
        f"<div style='background:#f8f4f0;border-radius:8px;padding:16px;margin:16px 0;'>"
        f"<p style='margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;'>Customer Comment</p>"
        f"<p style='margin:8px 0 0;color:#444;font-size:14px;line-height:1.6;'>{message}</p></div>"
        if message else ""
    )
    html = _wrap(f"""
      <h2 style="color:#7c1d2e;margin-top:0;font-size:22px;">📊 New Support Rating Received</h2>
      <div style="background:#f8f4f0;border-left:4px solid {color};border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:28px;">{stars}</p>
        <p style="margin:8px 0 0;font-size:22px;font-weight:bold;color:{color};">{rating}/5 Stars</p>
      </div>
      <table style="width:100%;font-size:14px;margin:16px 0;">
        <tr><td style="color:#888;padding:6px 0;width:120px;">Customer</td><td style="color:#444;font-weight:bold;">{name}</td></tr>
        <tr><td style="color:#888;padding:6px 0;">Email</td><td style="color:#444;">{email}</td></tr>
        {category_row}
      </table>
      {message_block}
      <p style="color:#888;font-size:13px;">View all ratings in the Admin Dashboard → Support Ratings tab.</p>
    """)
    _bg(admin_email, f"New {rating}★ Support Rating from {name} — {STORE_NAME}", html)


# ── 15. Optional SMS via Twilio ─────────────────────────────────────────────────
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
