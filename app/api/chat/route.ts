import { type NextRequest, NextResponse } from "next/server";
import { chatWithGemini, analyzeImageWithGemini, type GeminiMessage } from "../../../lib/gemini";
import { WeatherService } from "../../../lib/weather";
import dbConnect from "../../../lib/mongoose";
import ChatSession from "../../../models/ChatSession";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, imageBase64, mimeType, userId } = body;

    if (!message?.trim() && !imageBase64) {
      return NextResponse.json(
        { error: "Message or image is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ sessionId });
    }

    if (!session) {
      const newSessionId =
        sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      session = new ChatSession({
        sessionId: newSessionId,
        userId: userId || "anonymous",
        title: message?.trim().slice(0, 50) || "Image Analysis",
        messages: [],
      });
    }

    // Build history for Gemini context (last 20 messages max)
    const history: GeminiMessage[] = session.messages
      .slice(-20)
      .map((msg: any) => ({
        role: msg.role as "user" | "model",
        parts: [{ text: msg.content }],
      }));

    // Detect if message needs weather context
    const lowerMessage = (message || "").toLowerCase();
    const needsWeather =
      lowerMessage.includes("weather") ||
      lowerMessage.includes("crop") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("grow") ||
      lowerMessage.includes("plant") ||
      lowerMessage.includes("season") ||
      lowerMessage.includes("rain") ||
      lowerMessage.includes("temperature") ||
      lowerMessage.includes("humidity") ||
      lowerMessage.includes("irrigation") ||
      lowerMessage.includes("water");

    let weatherContext = "";
    if (needsWeather) {
      try {
        const locationPatterns = [
          /in\s+([A-Z][a-zA-Z\s]+)/,
          /at\s+([A-Z][a-zA-Z\s]+)/,
          /for\s+([A-Z][a-zA-Z\s]+)/,
          /near\s+([A-Z][a-zA-Z\s]+)/,
        ];
        let location = "Mumbai";
        for (const pattern of locationPatterns) {
          const match = message?.match(pattern);
          if (match) {
            location = match[1].trim();
            break;
          }
        }

        const weather = await WeatherService.getCurrentWeather(location);
        weatherContext = `Location: ${weather.location}, Temperature: ${weather.temperature}°C, Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} km/h, Conditions: ${weather.description}`;
      } catch (e) {
        console.error("Weather fetch failed:", e);
      }
    }

    let response: string;

    if (imageBase64 && mimeType) {
      try {
        const imageAnalysis = await analyzeImageWithGemini(imageBase64, mimeType);

        if (message?.trim()) {
          response = await chatWithGemini(
            `The user sent this message along with an image: "${message}"\n\nHere is the image analysis result:\n${imageAnalysis}\n\nPlease provide a comprehensive response addressing the user's question and incorporating the image analysis.`,
            history,
            undefined,
            undefined,
            weatherContext || undefined
          );
        } else {
          response = imageAnalysis;
        }
      } catch (error) {
        console.error("Image analysis error:", error);
        response =
          "I couldn't analyze the image. Please try uploading a clearer image of the plant/crop.";
      }
    } else {
      try {
        response = await chatWithGemini(
          message,
          history,
          undefined,
          undefined,
          weatherContext || undefined
        );
      } catch (error: any) {
        console.error("Chat error (fallback):", error?.message || error);
        response =
          "⏳ AI is currently busy. Please wait 15-30 seconds and try again. Free Gemini API has limited requests per minute.";
      }
    }

    // Save messages to session
    session.messages.push({
      role: "user",
      content: message || "[Image uploaded]",
      imageUrl: imageBase64 ? "image_attached" : undefined,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "model",
      content: response,
      timestamp: new Date(),
    });

    if (session.messages.length <= 2) {
      session.title = (message || "Image Analysis").slice(0, 60);
    }

    await session.save();

    return NextResponse.json({
      response,
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    // Always return valid JSON with 200 — the frontend should display the message
    return NextResponse.json({
      response:
        "⚠️ Something went wrong. Please try again in a moment.",
      error: error.message || "Failed to process chat message",
      sessionId: null,
      timestamp: new Date().toISOString(),
    });
  }
}
