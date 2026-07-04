import { ClaudeClient } from "./claudeClient.js";

export async function generateScene(prompt, apiKey) {
  const client = new ClaudeClient(apiKey);

  const text = await client.send(
    [{
      role: "user",
      content: `Eres un director cinematográfico 3D.
Devuelve SOLO JSON válido para un engine Three.js.

Escena: ${prompt}`
    }]
  );

  // Extraer JSON de la respuesta (maneja markdown code blocks)
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("La IA no devolvió JSON válido");
  return JSON.parse(match[0]);
}
