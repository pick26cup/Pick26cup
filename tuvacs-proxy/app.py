#!/usr/bin/env python3
import hmac, hashlib, time, json, os, threading, uuid
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

# ── Estado compartido en memoria ──────────────────────────────────────────────
event_log = deque(maxlen=200)
alerts    = deque(maxlen=100)   # alertas activas (no reconocidas)
_log_lock = threading.Lock()

# Monitor de fondo
_monitor = {
    "running":      False,
    "interval":     30,          # segundos entre checks
    "last_check":   None,
    "last_bitmap":  None,        # bitmap anterior para detectar cambios
    "last_status":  None,        # estado anterior del robot
    "thread":       None,
    "checks_total": 0,
    "faults_found": 0,
}
_monitor_lock = threading.Lock()

def log_event(kind, payload):
    entry = {"ts": datetime.now(timezone.utc).isoformat(), "kind": kind, **payload}
    with _log_lock:
        event_log.appendleft(entry)
    return entry

def add_alert(level, code, description, details=None):
    alert = {
        "id":          str(uuid.uuid4())[:8],
        "ts":          datetime.now(timezone.utc).isoformat(),
        "level":       level,   # "critico" | "advertencia" | "info"
        "code":        code,
        "descripcion": description,
        "detalles":    details or {},
        "ack":         False,
    }
    with _log_lock:
        alerts.appendleft(alert)
    return alert

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

# ── Monitor de fondo ──────────────────────────────────────────────────────────

FAULT_LEVEL = {
    "mecanico":      "critico",
    "sensor":        "critico",
    "ai_percepcion": "critico",
    "energia":       "advertencia",
    "mantenimiento": "advertencia",
}

def _monitor_loop():
    while True:
        with _monitor_lock:
            if not _monitor["running"]:
                break
            interval = _monitor["interval"]

        try:
            raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
            if raw.get("success"):
                dps     = parse_dps(raw.get("result", []))
                bitmap  = dps.get("fault", 0)
                status  = dps.get("status", "")
                battery = dps.get("battery_percentage")

                with _monitor_lock:
                    prev_bitmap = _monitor["last_bitmap"]
                    prev_status = _monitor["last_status"]
                    _monitor["last_check"]  = datetime.now(timezone.utc).isoformat()
                    _monitor["last_bitmap"] = bitmap
                    _monitor["last_status"] = status
                    _monitor["checks_total"] += 1

                # Fallas nuevas (bits que antes no estaban)
                if prev_bitmap is not None:
                    new_bits = bitmap & ~prev_bitmap
                    gone_bits = prev_bitmap & ~bitmap
                else:
                    new_bits  = bitmap
                    gone_bits = 0

                for bit, (code, desc, cat) in FAULT_CODES.items():
                    if new_bits & (1 << bit):
                        level = FAULT_LEVEL.get(cat, "advertencia")
                        add_alert(level, code, desc, {"categoria": cat, "bit": bit})
                        log_event("falla_nueva", {"code": code, "categoria": cat, "bitmap": bitmap})
                        with _monitor_lock:
                            _monitor["faults_found"] += 1

                    elif gone_bits & (1 << bit):
                        log_event("falla_resuelta", {"code": code, "bitmap": bitmap})

                # Cambio de estado relevante
                if prev_status is not None and status != prev_status:
                    log_event("cambio_estado", {"de": prev_status, "a": status, "bateria": battery})
                    if status == "fault":
                        add_alert("critico", "estado_fault",
                                  "El robot entró en estado de FALLA",
                                  {"estado_anterior": prev_status})

                # Batería baja
                if battery is not None and battery <= 15:
                    # Solo alertar una vez (si no hay alerta pendiente)
                    with _log_lock:
                        ya_alerta = any(
                            a["code"] == "bateria_baja" and not a["ack"]
                            for a in alerts
                        )
                    if not ya_alerta:
                        add_alert("advertencia", "bateria_baja",
                                  f"Batería baja: {battery}%", {"bateria": battery})

        except Exception as e:
            log_event("error_monitor", {"msg": str(e)})

        time.sleep(interval)

# ── Routes base ───────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"service": "TUVACS Q-Nitro Proxy", "status": "running", "device": DEVICE_ID})

@app.route("/ping")
def ping():
    return jsonify({"ok": True, "model": "TUVACS Q-Nitro", "device": DEVICE_ID})

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
            "start":       [{"code": "start_go",         "value": True}],
            "pause":       [{"code": "pause",             "value": True}],
            "home":        [{"code": "goto_charge",       "value": True}],
            "reset":       [{"code": "reset_map",         "value": True}],
            # Ciclo de auto-lavado de mopas
            "stop_wash":   [{"code": "water_box_clean",  "value": False}],
            "start_wash":  [{"code": "water_box_clean",  "value": True}],
            "mop_off":     [{"code": "mop_mode",         "value": "off"}],
        }
        if cmd not in cmap:
            return jsonify({"error": f"comando desconocido: {cmd}", "valid": list(cmap)}), 400
        result = tuya_request("POST", f"/v1.0/devices/{DEVICE_ID}/commands",
                              {"commands": cmap[cmd]})
        log_event("comando", {"cmd": cmd, "success": result.get("success")})
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Diagnóstico de mopas ─────────────────────────────────────────────────────

MOP_STATUS_LABELS = {
    "off":      "Apagado",
    "low":      "Bajo",
    "medium":   "Medio",
    "high":     "Alto",
    "auto":     "Automático",
}

@app.route("/mop/diagnose")
def mop_diagnose():
    """
    Diagnostica el estado del sistema de mopas/trapeadores.
    Detecta el ciclo de auto-lavado atascado y recomienda solución.
    """
    try:
        raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
        if not raw.get("success"):
            return jsonify({"error": "No se pudo obtener DPS", "raw": raw}), 502

        dps = parse_dps(raw.get("result", []))

        water_box_clean = dps.get("water_box_clean", None)
        mop_mode        = dps.get("mop_mode",        None)
        status          = dps.get("status",           "")
        charging        = status in ("charging", "charged", "goto_charge")
        battery         = dps.get("battery_percentage")

        # Detección del ciclo atascado:
        # agua activa + robot en base = bucle de lavado atascado
        wash_loop_detected = (water_box_clean is True) and charging

        problemas = []
        pasos_correccion = []

        if wash_loop_detected:
            problemas.append({
                "codigo":      "WASH_LOOP",
                "descripcion": "Ciclo de auto-lavado de mopas atascado",
                "causa":       "El robot intenta lavar las mopas en la base pero no recibe "
                               "confirmación del sensor de agua/bomba, reiniciando el ciclo.",
                "dps_afectado": "water_box_clean = True (debería ser False al terminar)",
            })
            pasos_correccion = [
                {"paso": 1, "accion": "API",     "detalle": "POST /command  {\"command\": \"stop_wash\"}  → apaga water_box_clean"},
                {"paso": 2, "accion": "API",     "detalle": "POST /command  {\"command\": \"mop_off\"}    → (si el anterior no basta)"},
                {"paso": 3, "accion": "API",     "detalle": "POST /command  {\"command\": \"pause\"}      → fuerza pausa"},
                {"paso": 4, "accion": "Físico",  "detalle": "Retira el robot de la base y vuelve a colocarlo"},
                {"paso": 5, "accion": "Físico",  "detalle": "Si persiste: apaga el robot con el botón de encendido 5 seg, enciende y regresa a la base"},
                {"paso": 6, "accion": "Revisión","detalle": "Inspecciona el depósito de agua: vacío o tupido puede causar que el sensor no detecte fin de ciclo"},
            ]

        if mop_mode and mop_mode != "off" and charging:
            if not wash_loop_detected:
                problemas.append({
                    "codigo":      "MOP_ACTIVE_ON_BASE",
                    "descripcion": "Mopa activa mientras carga — comportamiento inusual",
                    "dps_afectado": f"mop_mode = {mop_mode}",
                })
                pasos_correccion.append(
                    {"paso": 1, "accion": "API", "detalle": "POST /command  {\"command\": \"mop_off\"}"}
                )

        dps_relevantes = {
            "water_box_clean": water_box_clean,
            "mop_mode":        mop_mode,
            "mop_mode_label":  MOP_STATUS_LABELS.get(mop_mode, mop_mode),
            "status":          status,
            "charging":        charging,
            "battery":         battery,
        }

        log_event("mop_diagnostico", {
            "wash_loop": wash_loop_detected,
            "problemas": len(problemas),
        })

        return jsonify({
            "wash_loop_detectado": wash_loop_detected,
            "problemas":           problemas,
            "total_problemas":     len(problemas),
            "pasos_correccion":    pasos_correccion,
            "dps":                 dps_relevantes,
            "resumen": (
                "Ciclo de lavado de mopas atascado — sigue los pasos de corrección"
                if wash_loop_detected else
                "Sistema de mopas sin anomalías detectadas"
            ),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/mop/fix", methods=["POST"])
def mop_fix():
    """
    Intenta corregir automáticamente el ciclo de auto-lavado atascado.
    Envía stop_wash → pausa → espera 3s → confirma estado.
    """
    results = []
    try:
        # Paso 1: apagar water_box_clean
        r1 = tuya_request("POST", f"/v1.0/devices/{DEVICE_ID}/commands",
                          {"commands": [{"code": "water_box_clean", "value": False}]})
        results.append({"cmd": "water_box_clean=False", "ok": r1.get("success"), "raw": r1})

        time.sleep(2)

        # Paso 2: pause por si sigue en modo activo
        r2 = tuya_request("POST", f"/v1.0/devices/{DEVICE_ID}/commands",
                          {"commands": [{"code": "pause", "value": True}]})
        results.append({"cmd": "pause", "ok": r2.get("success"), "raw": r2})

        time.sleep(3)

        # Paso 3: verificar estado final
        raw = tuya_request("GET", f"/v1.0/devices/{DEVICE_ID}/status")
        dps = parse_dps(raw.get("result", [])) if raw.get("success") else {}
        still_looping = dps.get("water_box_clean", False)

        log_event("mop_fix_aplicado", {
            "pasos":        len(results),
            "resuelto":     not still_looping,
            "wash_final":   still_looping,
        })

        return jsonify({
            "ok":              not still_looping,
            "resuelto":        not still_looping,
            "pasos_ejecutados": results,
            "estado_final":    dps.get("status"),
            "wash_activo":     still_looping,
            "siguiente_paso":  None if not still_looping else
                               "El bucle persiste — retira el robot de la base físicamente y reinicia",
        })
    except Exception as e:
        return jsonify({"error": str(e), "pasos": results}), 500

# ── Monitor endpoints ─────────────────────────────────────────────────────────

@app.route("/monitor/start", methods=["POST"])
def monitor_start():
    """Inicia el monitor de fondo. Body opcional: {"interval": 30}"""
    with _monitor_lock:
        if _monitor["running"]:
            return jsonify({"ok": False, "error": "Monitor ya está corriendo",
                            "interval": _monitor["interval"]}), 409
        body = request.get_json(silent=True) or {}
        interval = int(body.get("interval", _monitor["interval"]))
        if interval < 5:
            return jsonify({"error": "Intervalo mínimo: 5 segundos"}), 400
        _monitor["running"]  = True
        _monitor["interval"] = interval
        t = threading.Thread(target=_monitor_loop, daemon=True)
        _monitor["thread"] = t
        t.start()
    log_event("monitor_inicio", {"interval": interval})
    return jsonify({"ok": True, "interval": interval, "msg": f"Monitor iniciado cada {interval}s"})

@app.route("/monitor/stop", methods=["POST"])
def monitor_stop():
    """Detiene el monitor de fondo."""
    with _monitor_lock:
        if not _monitor["running"]:
            return jsonify({"ok": False, "error": "Monitor no estaba corriendo"}), 409
        _monitor["running"] = False
    log_event("monitor_parada", {})
    return jsonify({"ok": True, "msg": "Monitor detenido"})

@app.route("/monitor/status")
def monitor_status():
    """Estado actual del monitor y estadísticas."""
    with _monitor_lock:
        snap = {k: v for k, v in _monitor.items() if k != "thread"}
        snap["thread_vivo"] = _monitor["thread"].is_alive() if _monitor["thread"] else False
    with _log_lock:
        pending_alerts = sum(1 for a in alerts if not a["ack"])
    snap["alertas_pendientes"] = pending_alerts
    return jsonify(snap)

# ── Alertas endpoints ─────────────────────────────────────────────────────────

@app.route("/alerts")
def get_alerts():
    """Lista de alertas. ?ack=false para solo las pendientes."""
    only_pending = request.args.get("ack", "false").lower() == "false"
    with _log_lock:
        result = [a for a in alerts if not a["ack"]] if only_pending else list(alerts)
    return jsonify({"total": len(result), "alertas": result})

@app.route("/alerts/<alert_id>/ack", methods=["POST"])
def ack_alert(alert_id):
    """Reconoce (marca como revisada) una alerta por su ID."""
    with _log_lock:
        for a in alerts:
            if a["id"] == alert_id:
                a["ack"] = True
                return jsonify({"ok": True, "alerta": a})
    return jsonify({"error": f"Alerta '{alert_id}' no encontrada"}), 404

@app.route("/alerts/ack-all", methods=["POST"])
def ack_all_alerts():
    """Reconoce todas las alertas pendientes."""
    count = 0
    with _log_lock:
        for a in alerts:
            if not a["ack"]:
                a["ack"] = True
                count += 1
    return jsonify({"ok": True, "reconocidas": count})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8765))
    app.run(host="0.0.0.0", port=port, debug=False)
