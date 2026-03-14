import { type NextRequest, NextResponse } from "next/server"
import { WeatherService } from "../../../../lib/weather"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const days = Number(searchParams.get("days")) || 7

    if (!location) {
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
    }

    const forecastData = await WeatherService.getForecast(location, days)

    return NextResponse.json(forecastData)
  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}
