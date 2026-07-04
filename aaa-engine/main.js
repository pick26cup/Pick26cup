import { AAACinematicEngine } from "./engine/renderer.js";
import { generateScene } from "./ai/promptToScene.js";

const container = document.getElementById("container");
const engine = new AAACinematicEngine(container);
engine.render();

// ── Demo: carga la escena de ejemplo ─────────────────────────────────────────
async function loadDemo() {
  setStatus("Cargando demo…");
  try {
    const res = await fetch("./scenes/worldcup_intro.json");
    const json = await res.json();
    await engine.loadScene(json);
    setStatus("Demo activo · Pick26Cup AAA Engine");
  } catch (e) {
    setStatus("Error: " + e.message);
    console.error(e);
  }
}

// ── Genera escena con Claude IA ───────────────────────────────────────────────
async function runGenerate() {
  const apiKey = document.getElementById("api-key").value.trim();
  const prompt = document.getElementById("prompt").value.trim();
  const btn    = document.getElementById("btn-generate");

  if (!apiKey) { alert("Ingresa tu Claude API Key"); return; }
  if (!prompt) { alert("Ingresa un prompt cinematográfico"); return; }

  btn.disabled = true;
  btn.textContent = "⏳ Generando…";
  setStatus("Claude IA generando escena 3D…");

  try {
    const json = await generateScene(prompt, apiKey);
    document.getElementById("json-out").textContent = JSON.stringify(json, null, 2);
    document.getElementById("json-panel").hidden = false;
    await engine.loadScene(json);
    setStatus("Escena IA · " + (json.scene || "custom"));
  } catch (e) {
    alert("Error: " + e.message);
    setStatus("Error al generar");
  } finally {
    btn.disabled = false;
    btn.textContent = "🎬 Generar IA";
  }
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}

// ── Eventos ────────────────────────────────────────────────────────────────────
document.getElementById("btn-demo").addEventListener("click", loadDemo);
document.getElementById("btn-generate").addEventListener("click", runGenerate);

// Persistir API key en localStorage
const stored = localStorage.getItem("claude_api_key");
if (stored) document.getElementById("api-key").value = stored;
document.getElementById("api-key").addEventListener("input", e => {
  localStorage.setItem("claude_api_key", e.target.value);
});

// Auto-load demo
loadDemo();
