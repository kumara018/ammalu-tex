"""
Delhivery Direct API client for Ammalu Tex.

Env vars required:
  DELHIVERY_API_TOKEN      — from Delhivery dashboard → Settings → API
  DELHIVERY_PICKUP_NAME    — pickup location name in Delhivery dashboard (default: Primary)
  DELHIVERY_RETURN_PIN     — your shop pincode e.g. 638001
  DELHIVERY_RETURN_CITY    — your city e.g. Gangapuram
  DELHIVERY_RETURN_STATE   — Tamil Nadu
  DELHIVERY_RETURN_PHONE   — your shop phone
  DELHIVERY_RETURN_NAME    — Ammalu Tex
  DELHIVERY_RETURN_ADDRESS — Shop Ground Floor No 129, Texvalley Gangapuram
  DELHIVERY_MODE           — production (default) or test

Delhivery API docs: https://dev.delhivery.com
"""
import os, json
import urllib.request as _req
import urllib.error   as _uerr
import urllib.parse   as _parse


def _base() -> str:
    mode = os.getenv("DELHIVERY_MODE", "production").strip().lower()
    if mode == "test":
        return "https://staging-express.delhivery.com"
    return "https://track.delhivery.com"


def _token() -> str:
    return os.getenv("DELHIVERY_API_TOKEN", "").strip()


def _headers() -> dict:
    return {
        "Authorization": f"Token {_token()}",
        "Content-Type":  "application/json",
    }


def is_configured() -> bool:
    return bool(_token())


# ── Create shipment (generate waybill) ────────────────────────────────────────
def create_shipment(order, user) -> dict | None:
    """
    Creates a shipment on Delhivery and returns the response dict.
    On success, response contains 'packages' list with 'waybill' (AWB) inside.
    """
    addr = order.shipping_address or {}

    # Build items description
    items = order.items_snapshot or []
    products_desc = ", ".join(
        f"{i.get('name', 'Product')} x{i.get('quantity', 1)}" for i in items
    ) or "Textile Products"

    cod_amount = str(round(order.total, 2)) if order.payment_method == "cod" else "0"

    shipment = {
        "name":           addr.get("full_name") or (user.full_name if user else "Customer"),
        "add":            " ".join(filter(None, [
                              addr.get("address_line1", ""),
                              addr.get("address_line2", ""),
                          ])),
        "pin":            str(addr.get("pincode", "")),
        "city":           addr.get("city", ""),
        "state":          addr.get("state", "Tamil Nadu"),
        "country":        "India",
        "phone":          str(addr.get("phone") or (user.phone if user else "")),
        "order":          order.order_number,
        "payment":        "COD" if order.payment_method == "cod" else "Prepaid",
        "return_pin":     os.getenv("DELHIVERY_RETURN_PIN",     "638001"),
        "return_city":    os.getenv("DELHIVERY_RETURN_CITY",    "Gangapuram"),
        "return_state":   os.getenv("DELHIVERY_RETURN_STATE",   "Tamil Nadu"),
        "return_country": "India",
        "return_phone":   os.getenv("DELHIVERY_RETURN_PHONE",   ""),
        "return_name":    os.getenv("DELHIVERY_RETURN_NAME",    "Ammalu Tex"),
        "return_add":     os.getenv("DELHIVERY_RETURN_ADDRESS", "Shop Ground Floor No 129, Texvalley Gangapuram"),
        "return_time":    "72",
        "products_desc":  products_desc,
        "hsn_code":       "",
        "cod_amount":     cod_amount,
        "total_amount":   str(round(order.total, 2)),
        "shipment_width":  20,
        "shipment_height": 5,
        "shipment_length": 25,
        "weight":          500,     # grams — adjust if needed
        "quantity":        len(items) or 1,
        "waybill":         "",      # leave empty → Delhivery auto-assigns
        "seller_tin":      "",
        "seller_gst_tin":  "",
    }

    payload = {
        "shipments":       [shipment],
        "pickup_location": {"name": os.getenv("DELHIVERY_PICKUP_NAME", "Primary")},
    }

    try:
        data = json.dumps(payload).encode()
        req  = _req.Request(
            f"{_base()}/api/cmu/create.json",
            data    = data,
            headers = _headers(),
            method  = "POST",
        )
        with _req.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            print(f"[Delhivery] Create shipment response: {result}")
            return result
    except _uerr.HTTPError as e:
        body = e.read().decode(errors="ignore")
        print(f"[Delhivery] Create shipment HTTP {e.code}: {body}")
        return None
    except Exception as e:
        print(f"[Delhivery] Create shipment error: {e}")
        return None


# ── Track by AWB ──────────────────────────────────────────────────────────────
def track_awb(awb: str) -> dict | None:
    """
    Returns full tracking data for a waybill.
    Key fields in response:
      ShipmentData[0].Shipment.Status.Status         → current status string
      ShipmentData[0].Shipment.Status.StatusLocation → current city/hub
      ShipmentData[0].Shipment.Scans[]               → scan events with location + time
      ShipmentData[0].Shipment.ExpectedDeliveryDate  → EDD
    """
    if not is_configured():
        return None
    try:
        url = f"{_base()}/api/v1/packages/json/?waybill={awb}&verbose=true"
        req = _req.Request(url, headers=_headers(), method="GET")
        with _req.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"[Delhivery] Track error: {e}")
        return None


# ── Cancel shipment ───────────────────────────────────────────────────────────
def cancel_shipment(awb: str) -> dict | None:
    if not is_configured():
        return None
    try:
        url = f"{_base()}/api/p/edit?wbn={awb}&cancellation=true"
        req = _req.Request(url, headers=_headers(), method="POST", data=b"")
        with _req.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"[Delhivery] Cancel error: {e}")
        return None


# ── Check serviceability (pincode reachable?) ─────────────────────────────────
def check_serviceability(origin_pin: str, dest_pin: str, weight_grams: int = 500) -> dict | None:
    if not is_configured():
        return None
    try:
        params = _parse.urlencode({
            "md":  "E",
            "cgm": weight_grams,
            "o_pin": origin_pin,
            "d_pin": dest_pin,
            "ss":  "DTO",
            "pt":  "Pre-paid",
        })
        url = f"{_base()}/api/kinko/v1/invoice/charges/?{params}"
        req = _req.Request(url, headers=_headers(), method="GET")
        with _req.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"[Delhivery] Serviceability error: {e}")
        return None


# ── Parse tracking events into a clean list ───────────────────────────────────
def parse_tracking_events(raw: dict) -> list:
    """
    Convert raw Delhivery track response into a clean list of events:
    [{ "status": str, "location": str, "datetime": str }]
    """
    try:
        shipment = raw["ShipmentData"][0]["Shipment"]
        scans    = shipment.get("Scans", [])
        events   = []
        for s in scans:
            detail = s.get("ScanDetail", {})
            events.append({
                "status":   detail.get("Scan") or detail.get("Instructions", ""),
                "activity": detail.get("Instructions") or detail.get("Scan", ""),
                "location": detail.get("ScannedLocation", ""),
                "datetime": detail.get("ScanDateTime") or detail.get("StatusDateTime", ""),
            })
        return events
    except Exception:
        return []


def parse_current_status(raw: dict) -> dict:
    """Extract current status and EDD from raw tracking response."""
    try:
        shipment = raw["ShipmentData"][0]["Shipment"]
        status   = shipment.get("Status", {})
        return {
            "status":           status.get("Status", ""),
            "location":         status.get("StatusLocation", ""),
            "datetime":         status.get("StatusDateTime", ""),
            "expected_delivery":shipment.get("ExpectedDeliveryDate", ""),
        }
    except Exception:
        return {}
