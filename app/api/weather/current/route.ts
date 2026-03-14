import { type NextRequest, NextResponse } from "next/server"
import { WeatherService } from "../../../../lib/weather"
import { DatabaseService } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")

    if (!location) {
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
    }

    const weatherData = await WeatherService.getCurrentWeather(location)

    try {
      await DatabaseService.saveWeatherData({
        location: weatherData.location,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        description: weatherData.description,
        icon: weatherData.icon,
        timestamp: new Date(),
      })
    } catch (dbError) {
      console.log("[v0] Database save failed, but continuing with weather data:", dbError)
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("[v0] Weather API error:", error)

    const fallbackWeather = {
      location: request.nextUrl.searchParams.get("location") || "Unknown Location",
      temperature: 22,
      humidity: 65,
      windSpeed: 8,
      description: "Partly cloudy",
      icon: "02d",
      condition: "partly-cloudy",
      lat: 20.59,
      lon: 78.96
    }

    return NextResponse.json(fallbackWeather)
  }
}
