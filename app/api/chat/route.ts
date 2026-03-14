import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "../../../lib/database"
import { AgriculturalAI } from "../../../lib/ai-chatbot"
import { AdvisoryService } from "../../../lib/advisory-service"
import { WeatherService } from "../../../lib/weather"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, location } = body // Expect location to be passed from frontend if available

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const lowerMessage = message.toLowerCase();
    let response = "";
    let category = "general";

    // 1. Pest Control Strategy (Real-time climate based)
    if (lowerMessage.includes("pest") || lowerMessage.includes("insect") || lowerMessage.includes("disease")) {
      category = "pest_control";
      try {
        // Fetch real-time weather (default to Mumbai if no location)
        const searchLocation = location || "Mumbai";
        const weather = await WeatherService.getCurrentWeather(searchLocation);

        const advice = AdvisoryService.getPestControlAdvice({
          humidity: weather.humidity,
          temperature: weather.temperature,
          description: weather.description
        });
        response = `Based on current weather in ${searchLocation} (Temp: ${weather.temperature}°C, Humidity: ${weather.humidity}%), here is your pest control strategy: ${advice}`;

      } catch (e) {
        console.error("Error fetching weather for pest advice:", e);
        // Fallback with mock data
        const advice = AdvisoryService.getPestControlAdvice({ humidity: 60, temperature: 25, description: "Clear" });
        response = `(Could not fetch live weather) Here is a general pest control strategy: ${advice}`;
      }
    }
    // 2. Crop Recommendation (Dataset based)
    else if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("what crop") || lowerMessage.includes("grow")) {
      category = "crop_recommendation";
      // In a real app, we'd ask for these values. For now, we use a "Standard Fertile Soil" profile + Real Weather
      try {
        const searchLocation = location || "Mumbai";
        let weather = { temperature: 25, humidity: 60, rainfall: 150 }; // Defaults

        try {
          const current = await WeatherService.getCurrentWeather(searchLocation);
          weather = {
            temperature: current.temperature,
            humidity: current.humidity,
            rainfall: 150 // Annual rainfall estimate or current condition proxy
          };
        } catch (weatherError) {
          console.log("Weather fetch failed, using defaults");
        }

        // Check if message contains soil type keywords
        let soilProfile = AdvisoryService.getSoilProfile("loamy"); // Default

        const soilTypes = ["black", "red", "clay", "sandy", "alluvial", "laterite", "loamy"];
        const foundSoil = soilTypes.find(t => lowerMessage.includes(t));

        if (foundSoil) {
          soilProfile = AdvisoryService.getSoilProfile(foundSoil);
        }

        const soilInput = {
          ...soilProfile,
          ...weather
        };

        const recommendations = AdvisoryService.recommendCrop(soilInput);
        const soilMsg = foundSoil ? `**${foundSoil} soil**` : "standard soil profile (Loamy)";

        response = `Based on your local weather (${weather.temperature}°C) and ${soilMsg}, I recommend growing: **${recommendations.join(", ")}**. \n\n(Tip: You can specify your soil type like 'Black soil' or 'Red soil' for better accuracy).`;
      } catch (e) {
        console.error("Error in crop recommendation:", e);
        response = AgriculturalAI.generateResponse(message, "crop_recommendation");
      }
    }
    // 3. Irrigation Schedule (Dataset based)
    else if (lowerMessage.includes("water") || lowerMessage.includes("irrigation")) {
      category = "irrigation";
      // Extract crop name
      const crops = ["wheat", "rice", "maize", "sugarcane", "cotton", "soybean", "barley", "potato", "groundnuts", "coffee", "pulse"];
      const foundCrop = crops.find(c => lowerMessage.includes(c));

      if (foundCrop) {
        try {
          // Mock current conditions
          const conditions = {
            CropType: foundCrop,
            CropDays: 30, // Default to mid-stage
            SoilMoisture: 300, // Default dry-ish
            temperature: 28,
            Humidity: 50
          };

          const needsWater = AdvisoryService.predictIrrigation(conditions);
          const advice = needsWater ? "Yes, you should irrigate now." : "No, irrigation is not needed at this moment.";
          response = `For **${foundCrop}** (Day 30), based on typical moisture requirements: ${advice} \n\n(Data analysis from irrigation records)`;
        } catch (e) {
          console.error("Error in irrigation prediction:", e);
          response = AgriculturalAI.generateResponse(message, "irrigation");
        }
      } else {
        response = "Which crop are you asking about? (e.g., Wheat, Rice, Sugarcane...)";
      }
    }
    // 4. General Fallback
    else {
      // Check if the query is agriculture-related
      if (!AgriculturalAI.isAgriculturalQuery(message)) {
        return NextResponse.json({
          response:
            "I'm AgriBot, specialized in agricultural guidance. Please ask me questions related to farming, crops, plant diseases, soil management, irrigation, or other agricultural topics. How can I help you with your farming needs?",
          category: "general",
        })
      }
      category = AgriculturalAI.categorizeQuery(message);
      response = AgriculturalAI.generateResponse(message, category);
    }

    // Save chat message to database if userId is provided
    if (userId) {
      await DatabaseService.saveChatMessage({
        userId,
        message: message.trim(),
        response,
        category: category as any,
      })
    }

    return NextResponse.json({
      response,
      category,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

