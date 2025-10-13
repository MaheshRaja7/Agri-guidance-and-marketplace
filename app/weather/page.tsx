"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Header from "../../components/Header"
import type { WeatherResponse } from "../../lib/weather"

interface ForecastItem {
  date: string | Date // API returns string, but we can handle both
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

export default function WeatherPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null)
  const [forecast, setForecast] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load user data
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Get user's location or default location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo, we'll use a default city
          setSearchLocation("Mumbai")
          handleSearch("Mumbai")
        },
        () => {
          // Fallback to default location
          setSearchLocation("Delhi")
          handleSearch("Delhi")
        },
      )
    } else {
      setSearchLocation("Delhi")
      handleSearch("Delhi")
    }
  }, [])

  const handleSearch = async (location?: string) => {
    const searchTerm = location || searchLocation
    if (!searchTerm.trim()) return

    setLoading(true)
    setError("")

    try {
      // Fetch current weather
      const weatherResponse = await fetch(`/api/weather/current?location=${encodeURIComponent(searchTerm)}`)
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data")
      }
      const weatherData = await weatherResponse.json()
      setCurrentWeather(weatherData)

      // Fetch forecast
      const forecastResponse = await fetch(`/api/weather/forecast?location=${encodeURIComponent(searchTerm)}&days=5`)
      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }
      const forecastData = await forecastResponse.json()
      setForecast(forecastData)
    } catch (error) {
      setError("Failed to fetch weather data. Please try again.")
      console.error("Weather fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      "01d": "☀️",
      "01n": "🌙",
      "02d": "⛅",
      "02n": "☁️",
      "03d": "☁️",
      "03n": "☁️",
      "04d": "☁️",
      "04n": "☁️",
      "09d": "🌧️",
      "09n": "🌧️",
      "10d": "🌦️",
      "10n": "🌧️",
      "11d": "⛈️",
      "11n": "⛈️",
      "13d": "❄️",
      "13n": "❄️",
      "50d": "🌫️",
      "50n": "🌫️",
    }
    return iconMap[iconCode] || "🌤️"
  }

  return (
    <div>
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="card">
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>Weather Information</h1>

          {/* Search Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "0.75rem",
                  border: "2px solid #ddd",
                  borderRadius: "5px",
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Searching..." : "Search Weather"}
              </button>
            </div>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {loading && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p>Fetching weather data...</p>
            </div>
          )}

          {/* Current Weather */}
          {currentWeather && !loading && (
            <div className="weather-widget" style={{ marginBottom: "2rem" }}>
              <h2 style={{ marginBottom: "1rem" }}>{currentWeather.location}</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "4rem" }}>{getWeatherIcon(currentWeather.icon)}</div>
                  <div style={{ fontSize: "3rem", fontWeight: "bold" }}>{currentWeather.temperature}°C</div>
                  <div style={{ fontSize: "1.2rem", textTransform: "capitalize" }}>{currentWeather.description}</div>
                  <div style={{ fontSize: "1rem", opacity: 0.9 }}>Feels like {currentWeather.feelsLike}°C</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", minWidth: "300px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem" }}>💧</div>
                    <div>Humidity</div>
                    <div style={{ fontWeight: "bold" }}>{currentWeather.humidity}%</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem" }}>💨</div>
                    <div>Wind Speed</div>
                    <div style={{ fontWeight: "bold" }}>{currentWeather.windSpeed} m/s</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem" }}>🌅</div>
                    <div>Sunrise</div>
                    <div style={{ fontWeight: "bold" }}>{currentWeather.sunrise}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem" }}>🌇</div>
                    <div>Sunset</div>
                    <div style={{ fontWeight: "bold" }}>{currentWeather.sunset}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast.length > 0 && !loading && (
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#2d5016" }}>5-Day Forecast</h3>
              <div className="grid grid-3">
                {forecast.slice(0, 5).map((day, index) => (
                  <div key={index} className="card" style={{ textAlign: "center", padding: "1rem" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                      {index === 0
                        ? "Today"
                        : (() => {
                            try {
                              const date = typeof day.date === "string" ? new Date(day.date) : day.date
                              return date.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            } catch (error) {
                              console.error("[v0] Date formatting error:", error)
                              return "Date unavailable"
                            }
                          })()}
                    </div>
                    <div style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{getWeatherIcon(day.icon)}</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#7cb342" }}>{day.temperature}°C</div>
                    <div style={{ fontSize: "0.9rem", textTransform: "capitalize", marginBottom: "0.5rem" }}>
                      {day.description}
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      <div>💧 {day.humidity}%</div>
                      <div>💨 {day.windSpeed} m/s</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agricultural Tips based on weather */}
          {currentWeather && !loading && (
            <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f8f9fa" }}>
              <h3 style={{ color: "#2d5016", marginBottom: "1rem" }}>Agricultural Recommendations</h3>
              <div className="grid grid-2">
                <div>
                  <h4>Today's Farming Tips:</h4>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    {currentWeather.temperature > 30 && (
                      <li>High temperature - ensure adequate irrigation for crops</li>
                    )}
                    {currentWeather.humidity > 80 && <li>High humidity - monitor for fungal diseases</li>}
                    {currentWeather.windSpeed > 15 && <li>Strong winds - secure young plants and check for damage</li>}
                    {currentWeather.description.includes("rain") && (
                      <li>Rainy conditions - postpone spraying activities</li>
                    )}
                    {currentWeather.temperature < 15 && <li>Cool weather - protect sensitive crops from cold</li>}
                  </ul>
                </div>
                <div>
                  <h4>Best Activities:</h4>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    {currentWeather.description.includes("clear") && <li>Perfect for harvesting and field work</li>}
                    {currentWeather.description.includes("cloud") && <li>Good conditions for transplanting</li>}
                    {currentWeather.humidity < 60 && <li>Ideal for applying pesticides and fertilizers</li>}
                    <li>Check soil moisture levels</li>
                    <li>Monitor crop growth and health</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
