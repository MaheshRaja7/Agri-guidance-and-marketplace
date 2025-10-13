export interface WeatherResponse {
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
  feelsLike: number
  pressure: number
  visibility: number
  uvIndex: number
  sunrise: string
  sunset: string
}

export class WeatherService {
  private static readonly API_KEY = process.env.OPENWEATHER_API_KEY
  private static readonly BASE_URL = "https://api.openweathermap.org/data/2.5"

  static async getCurrentWeather(location: string): Promise<WeatherResponse> {
    if (!this.API_KEY || this.API_KEY === "demo-key") {
      console.log("[v0] No valid OpenWeather API key found, using mock data")
      return this.getMockWeatherData(location)
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${this.API_KEY}&units=metric`,
      )

      if (!response.ok) {
        console.log("[v0] Weather API request failed, using mock data")
        return this.getMockWeatherData(location)
      }

      const data = await response.json()

      return {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Would need UV Index API for this
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      }
    } catch (error) {
      console.log("[v0] Weather fetch error, using mock data:", error)
      return this.getMockWeatherData(location)
    }
  }

  private static getMockWeatherData(location: string): WeatherResponse {
    const mockWeatherTypes = [
      { temp: 28, desc: "partly cloudy", icon: "02d" },
      { temp: 32, desc: "sunny", icon: "01d" },
      { temp: 25, desc: "light rain", icon: "10d" },
      { temp: 30, desc: "clear sky", icon: "01d" },
    ]

    const randomWeather = mockWeatherTypes[Math.floor(Math.random() * mockWeatherTypes.length)]

    return {
      location: location,
      temperature: randomWeather.temp,
      humidity: 60 + Math.floor(Math.random() * 25),
      windSpeed: 8 + Math.floor(Math.random() * 10),
      description: randomWeather.desc,
      icon: randomWeather.icon,
      feelsLike: randomWeather.temp + 3,
      pressure: 1013,
      visibility: 10,
      uvIndex: 6,
      sunrise: "6:30 AM",
      sunset: "6:45 PM",
    }
  }

  static async getForecast(location: string, days = 5) {
    if (!this.API_KEY || this.API_KEY === "demo-key") {
      console.log("[v0] No valid OpenWeather API key found, using mock forecast data")
      return this.getMockForecastData(days)
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${this.API_KEY}&units=metric&cnt=${days * 8}`,
      )

      if (!response.ok) {
        console.log("[v0] Forecast API request failed, using mock data")
        return this.getMockForecastData(days)
      }

      const data = await response.json()

      return data.list.map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString().split("T")[0], // Return date as string
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      }))
    } catch (error) {
      console.log("[v0] Forecast fetch error, using mock data:", error)
      return this.getMockForecastData(days)
    }
  }

  private static getMockForecastData(days: number) {
    const mockIcons = ["01d", "02d", "03d", "10d", "11d"]
    const mockDescriptions = ["sunny", "partly cloudy", "cloudy", "light rain", "thunderstorm"]

    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      temperature: 22 + Math.floor(Math.random() * 12),
      description: mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)],
      icon: mockIcons[Math.floor(Math.random() * mockIcons.length)],
      humidity: 55 + Math.floor(Math.random() * 30),
      windSpeed: 6 + Math.floor(Math.random() * 12),
    }))
  }
}
