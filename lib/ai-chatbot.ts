export interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: Date
  category: "general" | "disease" | "crop_recommendation" | "weather" | "farming_techniques" | "pest_control"
}

export class AgriculturalAI {
  private static agriculturalKeywords = {
    crops: [
      "rice",
      "wheat",
      "corn",
      "maize",
      "barley",
      "oats",
      "millet",
      "sorghum",
      "cotton",
      "sugarcane",
      "potato",
      "tomato",
      "onion",
      "garlic",
      "carrot",
      "cabbage",
      "cauliflower",
      "broccoli",
      "spinach",
      "lettuce",
      "cucumber",
      "pumpkin",
      "watermelon",
      "mango",
      "banana",
      "apple",
      "orange",
      "grapes",
      "coconut",
      "groundnut",
      "soybean",
      "mustard",
      "sunflower",
      "tea",
      "coffee",
    ],
    diseases: [
      "blight",
      "rust",
      "mildew",
      "wilt",
      "rot",
      "spot",
      "mosaic",
      "virus",
      "fungal",
      "bacterial",
      "nematode",
      "aphid",
      "thrips",
      "whitefly",
      "bollworm",
      "stem borer",
      "leaf miner",
      "scale insects",
    ],
    farming: [
      "irrigation",
      "fertilizer",
      "pesticide",
      "herbicide",
      "planting",
      "harvesting",
      "soil",
      "seed",
      "germination",
      "transplanting",
      "pruning",
      "mulching",
      "composting",
      "organic",
      "hydroponics",
      "greenhouse",
      "crop rotation",
    ],
    weather: [
      "rainfall",
      "drought",
      "temperature",
      "humidity",
      "frost",
      "hail",
      "monsoon",
      "season",
      "climate",
      "weather forecast",
    ],
  }

  private static responses = {
    greeting: [
      "Hello! I'm AgriBot, your agricultural assistant. How can I help you with your farming needs today?",
      "Welcome to AgriBot! I'm here to help with all your agricultural questions. What would you like to know?",
      "Hi there! I'm your AI farming expert. Ask me about crops, diseases, weather, or any farming techniques!",
    ],

    crop_general: [
      "Crops are the foundation of agriculture. Each crop has specific requirements for soil, water, climate, and care. What specific crop are you interested in?",
      "Different crops thrive in different conditions. Tell me about your location and the crop you want to grow, and I'll provide specific guidance.",
      "Successful crop cultivation depends on proper timing, soil preparation, and care. Which crop would you like to learn about?",
    ],

    disease_general: [
      "Plant diseases can significantly impact crop yield. Early detection and proper treatment are crucial. Can you describe the symptoms you're seeing?",
      "Common plant diseases include fungal infections, bacterial diseases, and viral infections. What symptoms are you observing in your crops?",
      "Disease management involves prevention, early detection, and appropriate treatment. Tell me more about the specific issue you're facing.",
    ],

    soil_management: [
      "Healthy soil is the foundation of successful farming. Regular soil testing helps determine nutrient levels and pH. Have you tested your soil recently?",
      "Soil health can be improved through organic matter addition, proper drainage, and avoiding over-cultivation. What's your current soil condition?",
      "Good soil management includes maintaining proper pH (6.0-7.0 for most crops), adequate organic matter, and proper drainage.",
    ],

    irrigation: [
      "Proper irrigation is crucial for crop success. The amount and frequency depend on crop type, soil, and weather conditions.",
      "Over-watering can be as harmful as under-watering. Most crops need consistent moisture but not waterlogged conditions.",
      "Drip irrigation and sprinkler systems can help conserve water while ensuring adequate crop hydration.",
    ],

    fertilizer: [
      "Fertilizers provide essential nutrients: Nitrogen (N) for leaf growth, Phosphorus (P) for roots and flowers, and Potassium (K) for overall plant health.",
      "Organic fertilizers like compost and manure improve soil structure and provide slow-release nutrients.",
      "Always follow soil test recommendations for fertilizer application to avoid over-fertilization.",
    ],

    pest_control: [
      "Integrated Pest Management (IPM) combines biological, cultural, and chemical methods for effective pest control.",
      "Regular monitoring helps detect pest problems early when they're easier to manage.",
      "Beneficial insects, crop rotation, and resistant varieties are important components of sustainable pest management.",
    ],

    weather_farming: [
      "Weather significantly impacts farming decisions. Monitor forecasts for planting, spraying, and harvesting activities.",
      "Protect crops from extreme weather using mulching, row covers, or greenhouse structures.",
      "Adjust irrigation and fertilization based on rainfall and temperature patterns.",
    ],
  }

  static categorizeQuery(message: string): string {
    const lowerMessage = message.toLowerCase()

    if (this.containsKeywords(lowerMessage, ["hello", "hi", "hey", "greetings"])) {
      return "greeting"
    }

    if (this.containsKeywords(lowerMessage, this.agriculturalKeywords.diseases)) {
      return "disease"
    }

    if (this.containsKeywords(lowerMessage, this.agriculturalKeywords.crops)) {
      return "crop_recommendation"
    }

    if (this.containsKeywords(lowerMessage, ["soil", "fertilizer", "nutrient", "compost"])) {
      return "soil_management"
    }

    if (this.containsKeywords(lowerMessage, ["water", "irrigation", "drought", "watering"])) {
      return "irrigation"
    }

    if (this.containsKeywords(lowerMessage, ["pest", "insect", "bug", "control", "spray"])) {
      return "pest_control"
    }

    if (this.containsKeywords(lowerMessage, this.agriculturalKeywords.weather)) {
      return "weather"
    }

    return "general"
  }

  private static containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword))
  }

  static generateResponse(message: string, category: string): string {
    const lowerMessage = message.toLowerCase()

    // Specific crop responses
    if (category === "crop_recommendation") {
      if (lowerMessage.includes("rice")) {
        return "Rice cultivation requires flooded fields and warm temperatures. Plant during monsoon season, maintain 2-5cm water depth, and harvest when grains are golden yellow. Key varieties include Basmati, Jasmine, and IR64."
      }
      if (lowerMessage.includes("wheat")) {
        return "Wheat grows best in cool, dry climates. Sow in October-December, requires well-drained soil with pH 6.0-7.5. Harvest when moisture content is 12-14%. Popular varieties include HD2967, PBW343."
      }
      if (lowerMessage.includes("tomato")) {
        return "Tomatoes need warm weather and well-drained soil. Start seeds indoors 6-8 weeks before last frost. Provide support stakes, regular watering, and balanced fertilizer. Watch for blight and hornworms."
      }
      if (lowerMessage.includes("potato")) {
        return "Potatoes prefer cool weather and loose, well-drained soil. Plant seed potatoes 2-3 weeks before last frost. Hill soil around plants as they grow. Harvest when foliage dies back."
      }
    }

    // Disease-specific responses
    if (category === "disease") {
      if (lowerMessage.includes("blight")) {
        return "Blight is a serious fungal disease. Remove affected leaves immediately, improve air circulation, avoid overhead watering, and apply copper-based fungicides. Plant resistant varieties when possible."
      }
      if (lowerMessage.includes("rust")) {
        return "Rust appears as orange/brown spots on leaves. Remove infected parts, ensure good air circulation, and apply fungicides containing propiconazole or tebuconazole. Avoid overhead irrigation."
      }
      if (lowerMessage.includes("wilt")) {
        return "Wilting can be caused by various factors: overwatering, underwatering, root rot, or vascular diseases. Check soil moisture, examine roots, and ensure proper drainage."
      }
    }

    // Pest control responses
    if (category === "pest_control") {
      if (lowerMessage.includes("aphid")) {
        return "Aphids can be controlled with insecticidal soap, neem oil, or beneficial insects like ladybugs. Remove heavily infested leaves and avoid over-fertilizing with nitrogen."
      }
      if (lowerMessage.includes("bollworm") || lowerMessage.includes("caterpillar")) {
        return "Use Bt (Bacillus thuringiensis) spray for caterpillars, install pheromone traps, and encourage beneficial insects. Hand-picking is effective for small infestations."
      }
    }

    // Seasonal advice
    if (lowerMessage.includes("monsoon") || lowerMessage.includes("rainy season")) {
      return "During monsoon: ensure proper drainage, watch for fungal diseases, delay fertilizer application during heavy rains, and harvest mature crops before excessive moisture causes damage."
    }

    if (lowerMessage.includes("winter")) {
      return "Winter farming tips: protect sensitive plants from frost, reduce watering frequency, plant cool-season crops like wheat and peas, and prepare soil for spring planting."
    }

    if (lowerMessage.includes("summer")) {
      return "Summer care: increase watering frequency, provide shade for sensitive crops, mulch to retain moisture, plant heat-tolerant varieties, and harvest early morning to avoid heat stress."
    }

    // Default responses by category
    const responseCategory =
      category === "greeting"
        ? "greeting"
        : category === "disease"
          ? "disease_general"
          : category === "crop_recommendation"
            ? "crop_general"
            : category.includes("soil")
              ? "soil_management"
              : category.includes("irrigation")
                ? "irrigation"
                : category.includes("pest")
                  ? "pest_control"
                  : category.includes("weather")
                    ? "weather_farming"
                    : "crop_general"

    const responses = this.responses[responseCategory as keyof typeof this.responses] || this.responses.crop_general
    return responses[Math.floor(Math.random() * responses.length)]
  }

  static isAgriculturalQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    const allKeywords = [
      ...this.agriculturalKeywords.crops,
      ...this.agriculturalKeywords.diseases,
      ...this.agriculturalKeywords.farming,
      ...this.agriculturalKeywords.weather,
      "farming",
      "agriculture",
      "crop",
      "plant",
      "grow",
      "harvest",
      "soil",
      "seed",
    ]

    return allKeywords.some((keyword) => lowerMessage.includes(keyword))
  }
}
