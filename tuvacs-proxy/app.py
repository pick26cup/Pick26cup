#!/usr/bin/env python3
import hmac, hashlib, time, json, os, threading
from collections import deque
from datetime import datetime, timezone
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ACCESS_ID     = os.environ.get("TUYA_ACCESS_ID", "")
ACCESS_SECRET = os.environ.get("TUYA_ACCESS_SECRET", "")
DEVICE_ID     = os.environ.get("TUYA_DEVICE_ID", "Q10T243608SH0300150")
REGION        = os.environ.get("TUYA_REGION", "us")

BASE_URLS = {
    "us": "https://openapi.tuyaus.com",
    "eu": "https://openapi.tuyaeu.com",
    "cn": "https://openapi.tuyacn.com",
    "in": "https://openapi.tuyain.com",
}

# ── Catálogo de fallas Q10 PRO (bitmap Tuya) ──────────────────────────────────
FAULT_CODES = {
    0:  ("rueda_derecha",      "Error en rueda derecha",              "mecanico"),
    1:  ("rueda_izquierda",    "Error en rueda izquierda",            "mecanico"),
    2:  ("cepillo_central",    "Error en cepillo central",            "mecanico"),
    3:  ("cepillo_lateral",    "Error en cepillo lateral",            "mecanico"),
    4:  ("deposito_lleno",     "Depósito de polvo lleno",             "mantenimiento"),
    5:  ("sensor_pared",       "Error sensor de pared",               "sensor"),
    6:  ("sensor_acantilado",  "Error sensor de acantilado",          "sensor"),
    7:  ("lidar",              "Error LiDAR — percepción AI",         "ai_percepcion"),
    8:  ("bateria",            "Error de batería",                    "energia"),
    9:  ("carga",              "Error de carga / base",               "energia"),
    10: ("vision_ai",          "Error módulo visión AI — obstáculos", "ai_percepcion"),
    11: ("navegacion",         "Error de navegación / mapa",          "ai_percepcion"),
    12: ("filtro",             "Filtro bloqueado o sucio",            "mantenimiento"),
    13: ("bomba_succion",      "Error bomba de succión",              "mecanico"),
}

STATUS_LABELS = {
    "standby":     "En espera",
    "cleaning":    "Limpiando",
    "paused":      "Pausado",
    "goto_charge": "Volviendo a la base",
    "charging":    "Cargando",
    "charged":     "Carga completa",
    "fault":       "FALLA ACTIVA",
}

# ── Historial de eventos en memoria (últimos 200) ─────────────────────────────
event_log = deque(maxlen=200)
_log_lock  = threading.Lock()

def log_event(kind, payload):
    entry = {"ts": datetime.now(timezone.utc).isoformat(), "kind": kind, **payload}
    with _log_lock:
        event_log.appendleft(entry)
    return entry

# ── Auth / firma Tuya ─────────────────────────────────────────────────────────
token_cache = {"token": None, "expires": 0}

def sign(access_id, secret, t, token, method, path, body=""):
    content_hash = hashlib.sha256(body.encode()).hexdigest()
    string_to_sign = "\n".join([method.upper(), content_hash, "", path])
    message = access_id + token + t + string_to_sign
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest().upper()

def get_token():
    now = int(time.time() * 1000)
    if token_cache["token"] and now < token_cache["expires"]:
        return token_cache["token"]
    base = BASE_URLS.get(REGION, BASE_URLS["us"])
    t    = str(now)
    path = "/v1.0/token?grant_type=1"
    sig  = sign(ACCESS_ID, ACCESS_SECRET, t, "", "GET", path)
    headers = {
        "client_id": ACCESS_ID, "sign": sig, "t": t,
        "sign_method": "HMAC-SHA256", "Content-Type": "application/json",
    }
    r = requests.get(base + path, headers=headers, timeout=10)
    data = r.json()
    if data.get("success"):
        token_cache["token"]   = data["result"]["access_token"]
        token_cache["expires"] = now + data["result"]["expire_time"] * 1000 - 60000
        return token_cache["token"]
    raise Exception(f"Token error: {data.get('msg', 'unknown')}")

def tuya_request(method, path, body=None):
    base     = BASE_URLS.get(REGION, BASE_URLS["us"])
    token    = get_token()
    t        = str(int(time.time() * 1000))
    body_str = json.dumps(body) if body else ""
    sig      = sign(ACCESS_ID, ACCESS_SECRET, t, token, method, path, body_str)
    headers  = {
        "client_id": ACCESS_ID, "access_token": token, "sign": sig,
        "t": t, "sign_method": "HMAC-SHA256", "Content-Type": "application/json",
    }
    url = base + path
    r = requests.get(url, headers=headers, timeout=10) if method.upper() == "GET" \
        else requests.post(url, headers=headers, data=body_str, timeout=10)
    return r.json()

# ── Helpers de fallas ─────────────────────────────────────────────────────────

def decode_fault_bitmap(bitmap: int) -> list:
    return [
        {"bit": bit, "code": code, "descripcion": desc, "categoria": cat}
        for bit, (code, desc, cat) in FAULT_CODES.items()
        if bitmap & (1 << bit)
    ]

def parse_dps(dps_list: list) -> dict:
    return {item["code"]: item["value"] for item in dps_list}

def assess_ai_perception(dps: dict) -> dict:
    bitmap    = dps.get("fault", 0)
    ai_bits   = {7: "lidar", 10: "vision_ai", 11: "navegacion"}
    ai_faults = [
        {"code": FAULT_CODES[b][0], "desc": FAULT_CODES[b][1]}
        for b in ai_bits if bitmap & (1 << b)
    ]
    return {
        "ok":            len(ai_faults) == 0,
        "fallas_ai":     ai_faults,
        "estado_robot":  STATUS_LABELS.get(dps.get("status", ""), dps.get("status", "desconocido")),
        "obstacle_notice": dps.get("obstacle_notice"),
        "subsistemas": {
            "lidar":      "OK" if not (bitmap & (1 << 7))  else "FALLA",
            "vision_ai":  "OK" if not (bitmap & (1 << 10)) else "FALLA",
            "navegacion": "OK" if not (bitmap & (1 << 11)) else "FALLA",
        },
    }

# ── Routes base ───────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"service": "TUVACS Q10 PRO Proxy", "status": "running", "device": DEVICE_ID})

@app.route("/ping")
def ping():
    return jsonify({"ok": True, "device": DEVICE_ID})

@app.route("/status")
def status():
    try:
        return jsonify(tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/dps")
def dps():
    try:
        return jsonify(tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Sistema de verificación de fallas ────────────────────────────────────────

@app.route("/faults")
def faults():
    """Decodifica el bitmap de fallas y clasifica por categoría."""
    try:
        raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
        if not raw.get("success"):
            return jsonify({"error": "No se pudo obtener DPS", "raw": raw}), 502

        dps    = parse_dps(raw.get("result", []))
        bitmap = dps.get("fault", 0)
        active = decode_fault_bitmap(bitmap)

        por_cat = {}
        for f in active:
            por_cat.setdefault(f["categoria"], []).append(f["code"])

        if active:
            log_event("falla_detectada", {"fallas": [f["code"] for f in active], "bitmap": bitmap})

        return jsonify({
            "fault_bitmap":   bitmap,
            "fallas_activas": active,
            "total":          len(active),
            "hay_fallas":     len(active) > 0,
            "por_categoria":  por_cat,
            "estado":         dps.get("status", "desconocido"),
            "bateria":        dps.get("battery_percentage"),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/verify")
def verify():
    """Verificación completa: fallas + percepción AI + salud por subsistema."""
    try:
        raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
        if not raw.get("success"):
            return jsonify({"error": "No se pudo obtener DPS", "raw": raw}), 502

        dps    = parse_dps(raw.get("result", []))
        bitmap = dps.get("fault", 0)
        active = decode_fault_bitmap(bitmap)
        ai     = assess_ai_perception(dps)

        cats = {f["categoria"] for f in active}
        health = {
            "mecanico":      "mecanico"      not in cats,
            "sensores":      "sensor"        not in cats,
            "energia":       "energia"       not in cats,
            "mantenimiento": "mantenimiento" not in cats,
            "ai_percepcion": ai["ok"],
        }
        overall = all(health.values())

        result = {
            "verificacion":  "PASÓ" if overall else "FALLA",
            "timestamp":     datetime.now(timezone.utc).isoformat(),
            "device_id":     DEVICE_ID,
            "salud_global":  overall,
            "subsistemas":   health,
            "ai_percepcion": ai,
            "fallas_activas": active,
            "total_fallas":  len(active),
            "dps": {
                "estado":        dps.get("status"),
                "bateria":       dps.get("battery_percentage"),
                "modo":          dps.get("mode"),
                "succion":       dps.get("suction"),
                "fault_bitmap":  bitmap,
            },
        }

        log_event("verificacion", {
            "resultado": result["verificacion"],
            "fallas":    len(active),
            "ai_ok":     ai["ok"],
        })
        return jsonify(result)

    except Exception as e:
        log_event("error_verificacion", {"msg": str(e)})
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health_check():
    """Check rápido de salud — ideal para monitoreo continuo / alertas."""
    try:
        raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
        if not raw.get("success"):
            return jsonify({"ok": False, "error": "API Tuya no disponible"}), 502

        dps    = parse_dps(raw.get("result", []))
        bitmap = dps.get("fault", 0)
        active = decode_fault_bitmap(bitmap)
        ai     = assess_ai_perception(dps)

        return jsonify({
            "ok":              bitmap == 0,
            "fault_bitmap":    bitmap,
            "fallas":          len(active),
            "ai_percepcion_ok": ai["ok"],
            "estado":          dps.get("status"),
            "bateria":         dps.get("battery_percentage"),
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/logs")
def logs():
    """Historial de eventos: fallas, verificaciones, comandos y errores."""
    limit = min(int(request.args.get("limit", 50)), 200)
    kind  = request.args.get("kind")
    with _log_lock:
        entries = list(event_log)
    if kind:
        entries = [e for e in entries if e.get("kind") == kind]
    return jsonify({"total": len(entries), "eventos": entries[:limit]})

@app.route("/command", methods=["POST"])
def command():
    try:
        cmd = request.json.get("command") if request.json else None
        if not cmd:
            return jsonify({"error": "falta campo 'command'"}), 400
        cmap = {
            "start":  [{"code": "start_go",   "value": True}],
            "pause":  [{"code": "pause",       "value": True}],
            "home":   [{"code": "goto_charge", "value": True}],
            "reset":  [{"code": "reset_map",   "value": True}],
        }
        if cmd not in cmap:
            return jsonify({"error": f"comando desconocido: {cmd}", "valid": list(cmap)}), 400
        result = tuya_request("POST", f"/v1.0/devices/{DEVICE_ID}/commands",
                              {"commands": cmap[cmd]})
        log_event("comando", {"cmd": cmd, "success": result.get("success")})
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8765))
    app.run(host="0.0.0.0", port=port, debug=False)
