#!/usr/bin/env python3
import hmac, hashlib, time, json, os
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
    t = str(now)
    path = "/v1.0/token?grant_type=1"
    sig = sign(ACCESS_ID, ACCESS_SECRET, t, "", "GET", path)
    headers = {
        "client_id": ACCESS_ID,
        "sign": sig,
        "t": t,
        "sign_method": "HMAC-SHA256",
        "Content-Type": "application/json",
    }
    r = requests.get(base + path, headers=headers, timeout=10)
    data = r.json()
    if data.get("success"):
        token_cache["token"] = data["result"]["access_token"]
        token_cache["expires"] = now + data["result"]["expire_time"] * 1000 - 60000
        return token_cache["token"]
    raise Exception(f"Token error: {data.get('msg', 'unknown')}")

def tuya_request(method, path, body=None):
    base = BASE_URLS.get(REGION, BASE_URLS["us"])
    token = get_token()
    t = str(int(time.time() * 1000))
    body_str = json.dumps(body) if body else ""
    sig = sign(ACCESS_ID, ACCESS_SECRET, t, token, method, path, body_str)
    headers = {
        "client_id": ACCESS_ID,
        "access_token": token,
        "sign": sig,
        "t": t,
        "sign_method": "HMAC-SHA256",
        "Content-Type": "application/json",
    }
    url = base + path
    if method.upper() == "GET":
        r = requests.get(url, headers=headers, timeout=10)
    else:
        r = requests.post(url, headers=headers, data=body_str, timeout=10)
    return r.json()

# ── Routes ────────────────────────────────────────────────────────────────────

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
    """Raw data-point status (trabajo, batería, modo, etc.)"""
    try:
        return jsonify(tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/command", methods=["POST"])
def command():
    try:
        cmd = request.json.get("command") if request.json else None
        if not cmd:
            return jsonify({"error": "falta campo 'command'"}), 400
        cmap = {
            "start":   [{"code": "start_go",    "value": True}],
            "pause":   [{"code": "pause",        "value": True}],
            "home":    [{"code": "goto_charge",  "value": True}],
            "reset":   [{"code": "reset_map",    "value": True}],
        }
        if cmd not in cmap:
            return jsonify({"error": f"comando desconocido: {cmd}", "valid": list(cmap)}), 400
        return jsonify(tuya_request("POST", f"/v1.0/devices/{DEVICE_ID}/commands",
                                    {"commands": cmap[cmd]}))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8765))
    app.run(host="0.0.0.0", port=port, debug=False)
