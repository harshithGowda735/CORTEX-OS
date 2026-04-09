/**
 * OpenRouter AI Service
 * Handles communication with Gemma 3 27B through OpenRouter
 */

const callAI = async (messages, options = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options.model || process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in .env");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cortex-os.hospital", // Optional for OpenRouter
        "X-OpenRouter-Title": "CORTEX-OS"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        ...options
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("❌ [AI SERVICE] Error:", error.message);
    throw error;
  }
};

module.exports = { callAI };
