"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Header from "../../components/Header"
import type { WeatherResponse, ForecastItem, IrrigationSchedule } from "../../lib/weather"

export default function WeatherPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null)
  const [forecast, setForecast] = useState<ForecastItem[]>([])
  const [irrigation, setIrrigation] = useState<IrrigationSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [soilType, setSoilType] = useState("Loamy")

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
      const forecastResponse = await fetch(`/api/weather/forecast?location=${encodeURIComponent(searchTerm)}&days=7`)
      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }
      const forecastData = await forecastResponse.json()
      // API returns { forecast, irrigation }
      if (forecastData.forecast) {
        setForecast(forecastData.forecast)
        setIrrigation(forecastData.irrigation || [])
      } else {
        // Fallback for old API structure if any
        setForecast(forecastData as any)
      }

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
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem("user")
        }}
      />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1 style={{ margin: 0, color: "#2d5016" }}>Weather Information</h1>
            <span style={{
              backgroundColor: "#ff4444",
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              animation: "pulse 2s infinite"
            }}>
              LIVE 🔴
            </span>
          </div>

          <style jsx>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.7; }
              100% { opacity: 1; }
            }
          `}</style>

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
            <>
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
                      <div style={{ fontWeight: "bold" }}>{currentWeather.windSpeed} km/h</div>
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

              {/* Windy Map Embed */}
              <div style={{ marginBottom: "2rem", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginBottom: "1rem", color: "#2d5016" }}>Live Weather Map</h3>
                <iframe
                  width="100%"
                  height="450"
                  src={`https://embed.windy.com/embed2.html?lat=${currentWeather.lat}&lon=${currentWeather.lon}&detailLat=${currentWeather.lat}&detailLon=${currentWeather.lon}&width=650&height=450&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                  frameBorder="0"
                  style={{ border: 0, width: "100%", height: "450px" }}
                ></iframe>

              </div>

              {/* Soil Type Selector */}
              <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                <label htmlFor="soilType" style={{ marginRight: "1rem", fontWeight: "bold" }}>Select Soil Type:</label>
                <select
                  id="soilType"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "1rem"
                  }}
                >
                  <option value="Loamy">Loamy (Default)</option>
                  <option value="Black">Black</option>
                  <option value="Red">Red</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Laterite">Laterite</option>
                </select>
              </div>

              {/* Bot Advice Button */}
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <button
                  onClick={() => window.location.href = `/chat?location=${encodeURIComponent(currentWeather.location)}&soilType=${encodeURIComponent(soilType)}`}
                  style={{
                    backgroundColor: "#7cb342",
                    color: "white",
                    padding: "1rem 2rem",
                    border: "none",
                    borderRadius: "30px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <span>🤖</span>
                  Get AI Crop Advice for {currentWeather.location}
                </button>
              </div>
            </>
          )}

          {/* 7-Day Forecast */}
          {forecast.length > 0 && !loading && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#2d5016" }}>7-Day Forecast</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
                overflowX: "auto"
              }}>
                {forecast.slice(0, 7).map((day, index) => (
                  <div key={index} className="card" style={{ textAlign: "center", padding: "1rem", minWidth: "120px" }}>
                    <div style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
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
                            return "Date unavailable"
                          }
                        })()}
                    </div>
                    <div style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{getWeatherIcon(day.icon)}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#7cb342" }}>{day.temperature}°C</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {day.maxTemp}° / {day.minTemp}°
                    </div>
                    <div style={{ fontSize: "0.9rem", textTransform: "capitalize", marginBottom: "0.5rem", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {day.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Irrigation Schedule */}
          {irrigation.length > 0 && !loading && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#2d5016" }}>Recommended Irrigation Schedule</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f7e6", textAlign: "left" }}>
                      <th style={{ padding: "1rem", borderBottom: "2px solid #ddd" }}>Date</th>
                      <th style={{ padding: "1rem", borderBottom: "2px solid #ddd" }}>Watering Plan</th>
                      <th style={{ padding: "1rem", borderBottom: "2px solid #ddd" }}>Recommendation</th>
                      <th style={{ padding: "1rem", borderBottom: "2px solid #ddd" }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {irrigation.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "1rem" }}>
                          {(() => {
                            try {
                              const date = new Date(item.date)
                              return date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })
                            } catch (e) { return item.date }
                          })()}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            backgroundColor:
                              item.waterAmount === "Heavy" ? "#e3f2fd" :
                                item.waterAmount === "Moderate" ? "#e8f5e9" :
                                  item.waterAmount === "Light" ? "#fff3e0" : "#ffebee",
                            color:
                              item.waterAmount === "Heavy" ? "#1565c0" :
                                item.waterAmount === "Moderate" ? "#2e7d32" :
                                  item.waterAmount === "Light" ? "#ef6c00" : "#c62828"
                          }}>
                            {item.waterAmount}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{item.recommendation}</td>
                        <td style={{ padding: "1rem", color: "#666", fontSize: "0.9rem" }}>{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Agricultural Tips based on weather */}
          {currentWeather && !loading && (
            <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f8f9fa" }}>
              <h3 style={{ color: "#2d5016", marginBottom: "1rem" }}>General Agricultural Tips</h3>
              <div className="grid grid-2">
                <div>
                  <h4>Today's Conditions:</h4>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    {currentWeather.temperature > 30 && (
                      <li>High temperature - ensure adequate irrigation for crops</li>
                    )}
                    {currentWeather.humidity > 80 && <li>High humidity - monitor for fungal diseases</li>}
                    {currentWeather.windSpeed > 15 && <li>Strong winds - secure young plants and check for damage</li>}
                    {currentWeather.description.includes("rain") && (
                      <li>Rain conditions - postpone spraying activities</li>
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
