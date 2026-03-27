import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

// ──────────────────────────────────────────────
// API Key Validation
// ──────────────────────────────────────────────
function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it to your .env.local file."
    );
  }
  return key;
}

// ──────────────────────────────────────────────
// Local Agriculture FAQ Fallback
// ──────────────────────────────────────────────
interface FaqEntry {
  keywords: string[];
  answer: string;
}

const AGRICULTURE_FAQS: FaqEntry[] = [
  {
    keywords: ["red soil", "summer", "summer crop"],
    answer: `🌾 **Summer Crops for Red Soil:**

Red soil is well-suited for several summer crops:
- **Groundnut (Peanut)** — thrives in well-drained red soil, sow in March-April
- **Millets (Ragi, Bajra)** — drought-tolerant and perfect for red soil
- **Pulses (Green Gram, Black Gram)** — improve soil nitrogen, harvest in 60-70 days
- **Sesame (Til)** — grows well in light red soil with minimal water
- **Sunflower** — good oil crop for red soil in summer

💡 **Tips:** Add organic compost before sowing to improve water retention. Red soil is often low in nitrogen and phosphorus, so apply DAP fertilizer at sowing.`,
  },
  {
    keywords: ["black soil", "crop", "black cotton soil"],
    answer: `🌱 **Best Crops for Black Soil (Black Cotton Soil):**

Black soil is rich in calcium, magnesium, and iron — ideal for:
- **Cotton** — the classic black soil crop, sow in June-July
- **Soybean** — excellent kharif crop, matures in 90-100 days
- **Wheat** — best rabi crop for black soil, sow in October-November
- **Chickpea (Chana)** — thrives in residual moisture after monsoon
- **Sugarcane** — deep black soil with irrigation is ideal
- **Jowar (Sorghum)** — drought-resistant, grows well in deep black soil

💡 **Tips:** Black soil has excellent water-holding capacity but can crack when dry. Avoid waterlogging — ensure proper drainage during heavy rains.`,
  },
  {
    keywords: ["rainy season", "monsoon", "kharif", "rain"],
    answer: `🌧️ **Rainy Season (Kharif) Crops:**

The monsoon season (June–October) is ideal for:
- **Rice (Paddy)** — needs abundant water, transplant in June-July
- **Maize (Corn)** — sow at the onset of monsoon
- **Cotton** — sow in June, needs well-drained soil
- **Soybean** — major kharif oilseed, sow in June-July
- **Groundnut** — sow with first rains
- **Pigeon Pea (Tur/Arhar)** — long-duration pulse, sow in June
- **Green Gram (Moong)** — short-duration, can be harvested before monsoon ends

💡 **Tips:** Prepare fields before monsoon. Ensure drainage channels are clear. Watch for fungal diseases in high humidity — use neem oil or copper-based fungicides preventively.`,
  },
  {
    keywords: ["winter", "rabi", "cold season"],
    answer: `❄️ **Winter (Rabi) Crops:**

Sow in October-November, harvest in March-April:
- **Wheat** — the staple rabi crop
- **Mustard** — oil crop, sow in October
- **Chickpea (Chana)** — needs cool weather
- **Peas** — ready in 60-70 days
- **Barley** — tolerant to cold
- **Linseed** — grows on residual moisture

💡 **Tips:** Provide 1-2 irrigations during critical growth stages. Use mulching to protect seedlings from frost.`,
  },
  {
    keywords: ["organic farming", "organic", "natural farming"],
    answer: `🌿 **Organic Farming Basics:**

- **Compost & Vermicompost** — best organic manure, apply 5-10 tons/acre
- **Green Manure** — grow dhaincha or sunhemp and plough into soil before sowing
- **Bio-fertilizers** — Rhizobium for pulses, Azotobacter for cereals, PSB for phosphorus
- **Pest Control** — Neem oil spray (5ml/L), Trichoderma for soil-borne diseases
- **Crop Rotation** — alternate cereals with legumes to maintain soil health

💡 **Tip:** Organic farming improves soil health over time. First 2-3 seasons may see lower yield, but long-term results are excellent.`,
  },
  {
    keywords: ["fertilizer", "npk", "urea", "dap"],
    answer: `🧪 **Fertilizer Guide:**

- **Urea (46-0-0)** — nitrogen source, apply in 2-3 splits during crop growth
- **DAP (18-46-0)** — phosphorus + nitrogen, apply at sowing
- **MOP (0-0-60)** — potassium, apply at sowing or first irrigation
- **NPK Complex (12-32-16)** — balanced, good for most crops at sowing

💡 **Tips:** Always do a soil test before applying fertilizers. Over-fertilization wastes money and harms soil. Combine chemical fertilizers with organic manure for best results.`,
  },
  {
    keywords: ["irrigation", "water", "drip", "watering"],
    answer: `💧 **Irrigation Guide:**

- **Drip Irrigation** — saves 30-50% water, best for vegetables, fruits, sugarcane
- **Sprinkler** — good for wheat, groundnut, pulses
- **Flood Irrigation** — traditional, use for rice paddies only
- **Furrow Irrigation** — suitable for row crops like cotton, maize

💡 **Tips:** Water early morning or evening to reduce evaporation. Mulching reduces water need by 25-30%. Critical stages: flowering and grain filling — never skip irrigation at these stages.`,
  },
];

/**
 * Try to match the user's question to a local FAQ.
 * Returns the answer string if matched, or null if no match.
 */
export function getLocalAnswer(question: string): string | null {
  const lower = question.toLowerCase();

  for (const faq of AGRICULTURE_FAQS) {
    const matched = faq.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      return faq.answer;
    }
  }

  return null;
}

// ──────────────────────────────────────────────
// System Prompt
// ──────────────────────────────────────────────
const AGRICULTURE_SYSTEM_PROMPT = `You are AgriBot, an expert AI agricultural advisor and farming assistant. You specialize in:

1. **Crop Recommendations**: Based on weather, soil type, season, and location, recommend the best crops to grow. Use real-time weather data when provided.

2. **Plant Disease Detection & Diagnosis**: When a user sends an image of a plant/crop, analyze it for diseases. Identify the disease, explain symptoms, causes, and provide:
   - **Natural/Organic Solutions**: Neem oil, bio-agents (Trichoderma, Pseudomonas), crop rotation, companion planting, handpicking, etc.
   - **Chemical Pesticides**: Specific fungicides, bactericides, insecticides with dosage recommendations.
   - **Prevention Measures**: Cultural practices, resistant varieties, proper spacing, drainage, etc.

3. **Weather-Based Advice**: When weather data is provided, give specific farming recommendations considering temperature, humidity, rainfall, and wind.

4. **Irrigation Management**: Advise on watering schedules, drip vs flood irrigation, moisture management.

5. **Soil Management**: Guidance on soil health, pH management, fertilizers (organic & chemical), composting.

6. **Pest Control (IPM)**: Integrated pest management combining biological, cultural, and chemical methods.

7. **General Agriculture**: Farming techniques, harvesting, post-harvest handling, market advice.

IMPORTANT RULES:
- RESPOND IN THE SAME LANGUAGE the user uses. If the user writes in Tamil, respond in Tamil. If in Hindi, respond in Hindi. If in English, respond in English. You support all Indian languages.
- Always respond in a well-structured, readable format using markdown.
- When analyzing plant images, be thorough about disease identification and always suggest BOTH natural AND chemical treatments.
- Include dosage and application timing when recommending pesticides.
- If weather context is provided, factor it into ALL recommendations.
- For crop recommendations, consider the local season, climate zone, and soil type.
- Be conversational and supportive — many users are small-scale farmers who need practical, actionable advice.
- If the question is NOT related to agriculture/farming, politely redirect the user to ask agriculture-related questions.
- Use emojis sparingly to make responses friendly (🌾 🌱 💧 🦠 etc.)`;

export interface GeminiMessage {
  role: "user" | "model";
  parts: Part[];
}

// ──────────────────────────────────────────────
// Retry Helper — max 2 retries, fixed 3s delay
// ──────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 3000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("Too Many Requests") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("RESOURCE_EXHAUSTED");

      if (is429 && attempt < maxRetries) {
        console.log(
          `⏳ Rate limited (429). Retrying in ${delayMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// ──────────────────────────────────────────────
// Chat with Gemini (with local fallback)
// ──────────────────────────────────────────────
export async function chatWithGemini(
  userMessage: string,
  history: GeminiMessage[] = [],
  imageBase64?: string,
  mimeType?: string,
  weatherContext?: string
): Promise<string> {
  // 1️⃣ Pre-compute local fallback (used only if API fails)
  const localAnswer = getLocalAnswer(userMessage);

  // 2️⃣ Validate API key — fall back to local answer if missing
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    if (localAnswer) {
      console.log("⚡ No API key — serving local FAQ as fallback");
      return localAnswer;
    }
    return "⚠️ AI service is not configured. Please contact the administrator to set up the GEMINI_API_KEY.";
  }

  // 3️⃣ Call Gemini API
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: AGRICULTURE_SYSTEM_PROMPT,
    });

    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const parts: Part[] = [];

    let fullMessage = userMessage;
    if (weatherContext) {
      fullMessage = `[Current Weather Context: ${weatherContext}]\n\nUser Question: ${userMessage}`;
    }

    parts.push({ text: fullMessage });

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    const result = await withRetry(() => chat.sendMessage(parts));
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);

    // 4️⃣ Fallback: return local answer if available, else user-friendly message
    if (localAnswer) {
      console.log("⚡ API failed — serving local FAQ as fallback");
      return localAnswer;
    }

    if (
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return "⏳ AI is currently busy (rate limit reached). Please wait 15-30 seconds and try again. Free Gemini API has limited requests per minute.";
    }

    return "⚠️ AI server is temporarily unavailable. Please try again in a few moments.";
  }
}

// ──────────────────────────────────────────────
// Analyze Image with Gemini
// ──────────────────────────────────────────────
export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string,
  cropType?: string
): Promise<string> {
  // Validate API key
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    return "⚠️ AI service is not configured for image analysis. Please contact the administrator.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `You are an expert plant pathologist. Analyze this plant/crop image for diseases.

${cropType ? `The user says this is a ${cropType} plant.` : "Identify the plant/crop type first."}

Respond in the language that appears most natural for the image context. If unsure, respond in English.

Provide a detailed analysis in this exact format:

## 🔬 Disease Analysis

**Plant/Crop**: [Identified plant]
**Disease**: [Disease name or "Healthy" if no disease detected]
**Confidence**: [High/Medium/Low]
**Severity**: [Critical/High/Medium/Low]

### 🔍 Symptoms Identified
- [List visible symptoms]

### 🦠 Causes
- [What causes this disease]

### 💊 Treatment

#### 🌿 Natural/Organic Solutions
- [Natural remedy 1 with application method]
- [Natural remedy 2 with application method]
- [Bio-agents to use]

#### 🧪 Chemical Pesticides
- [Chemical 1 - Name, dosage, frequency]
- [Chemical 2 - Name, dosage, frequency]

### 🛡️ Prevention
- [Prevention measure 1]
- [Prevention measure 2]
- [Prevention measure 3]

### ⚠️ Important Notes
- [Any critical timing or safety information]`;

    const result = await withRetry(() =>
      model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
      ])
    );

    return result.response.text();
  } catch (error: any) {
    console.error("Gemini image analysis error:", error?.message || error);

    if (
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return "⏳ AI is currently busy (rate limit reached). Please wait 15-30 seconds and try again.";
    }

    return "⚠️ Failed to analyze image. Please try again later.";
  }
}
