export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface FarmContextPayload {
  location?: string;
  total_land_ha?: number;
  water_budget_m3?: number;
  groundwater_depth_mbgl?: number;
  recommended_crops?: string;
  estimated_profit_inr?: number;
  weather_summary?: string;
}

const LOCAL_STORAGE_KEY = 'aquashift_groq_api_key';
const LOCAL_STORAGE_MODEL = 'aquashift_groq_model';

export function getStoredGroqKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
}

export function setStoredGroqKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
  }
}

export function getStoredGroqModel(): string {
  if (typeof window === 'undefined') return 'llama-3.3-70b-versatile';
  return localStorage.getItem(LOCAL_STORAGE_MODEL) || 'llama-3.3-70b-versatile';
}

export function setStoredGroqModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_MODEL, model);
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  farmContext?: FarmContextPayload,
  userApiKey?: string,
  model?: string
): Promise<{ reply: string; model: string; isFallback: boolean }> {
  const apiKey = userApiKey || getStoredGroqKey();
  const selectedModel = model || getStoredGroqModel();

  // Try direct Groq API first if user provided a key
  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      const contextStr = farmContext ? `
Current Farm Parameters:
- Location: ${farmContext.location || 'Sangrur, Punjab'}
- Total Land: ${farmContext.total_land_ha || 25} ha (${((farmContext.total_land_ha || 25) * 2.471).toFixed(1)} acres)
- Borewell Water Budget: ${(farmContext.water_budget_m3 || 180000).toLocaleString()} m³
- Groundwater Depth: ${farmContext.groundwater_depth_mbgl || '34.6'} m (Overdrawn/Critical)
- Recommended Crops: ${farmContext.recommended_crops || 'Green Gram (Moong), Mustard, Drip Tomato'}
- Estimated Net Profit: ₹${(farmContext.estimated_profit_inr || 3158336).toLocaleString()}
- Weather: ${farmContext.weather_summary || 'Sunny, 28°C'}
` : '';

      const systemPrompt = `You are **Kisan AI Mitra (किसान एआई मित्र)**, the compassionate, multilingual AI Agricultural Advisor and Agronomist built into the AquaShift 2.0 platform.
You help Indian farmers save groundwater, transition from flood paddy to high-profit crops (Moong, Mustard, Maize, Drip Tomatoes), and access government subsidies (PM-KUSUM, PMKSY).

CRITICAL INSTRUCTIONS:
1. Detect the user's language (Hindi, Punjabi, English, Marathi, Telugu, etc.) and ALWAYS reply in that EXACT same language and script. If asked in Punjabi, reply in Punjabi. If Hindi, reply in Hindi. If Hinglish, reply in Hinglish.
2. Be respectful and practical (use 'Aap', 'Tussi', 'Ji').
3. Reference their actual farm parameters when relevant:
${contextStr}
4. Format with clean bullet points and bold key values.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.65,
          max_tokens: 1200
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          reply: data.choices[0].message.content,
          model: data.model || selectedModel,
          isFallback: false
        };
      }
    } catch (err) {
      console.warn("Direct Groq call failed, falling back to backend proxy:", err);
    }
  }

  // Fallback / proxy through AquaShift backend
  try {
    const res = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        messages,
        groq_api_key: apiKey || undefined,
        farm_context: farmContext,
        model: selectedModel
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reply: data.reply,
        model: data.model,
        isFallback: data.is_fallback
      };
    }
  } catch (err) {
    console.error("Backend chat failed:", err);
  }

  return {
    reply: `🙏 **Namaste! (नमस्ते / ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ)**\nI am your **Kisan AI Mitra**. We are ready to assist you in English, Hindi, or Punjabi. Please enter your Groq API key in the top settings to enable full LLaMA-3.3 neural generation!`,
    model: 'Local Fallback',
    isFallback: true
  };
}
