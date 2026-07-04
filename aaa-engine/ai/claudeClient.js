export class ClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async send(messages, system = "", maxTokens = 2000) {
    const body = {
      model: "claude-opus-4-8",
      max_tokens: maxTokens,
      messages,
    };
    if (system) body.system = system;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.content[0].text;
  }
}
