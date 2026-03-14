"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import Header from "../../components/Header"
import { DiseaseDetectionService, type DiseaseDetectionResult } from "../../lib/disease-detection"

export default function DiseaseDetectionPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cropType, setCropType] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<DiseaseDetectionResult | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"upload" | "symptoms">("upload")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomResults, setSymptomResults] = useState<DiseaseDetectionResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cropOptions = [
    "Tomato",
    "Potato",
    "Wheat",
    "Rice",
    "Corn",
    "Cotton",
    "Soybean",
    "Cucumber",
    "Pepper",
    "Eggplant",
    "Cabbage",
    "Lettuce",
    "Spinach",
    "Carrot",
    "Onion",
    "Beans",
    "Peas",
    "Squash",
    "Pumpkin",
    "Melon",
  ]

  const commonSymptoms = [
    "Dark spots on leaves",
    "Yellow leaves",
    "White powdery coating",
    "Brown lesions",
    "Wilting",
    "Stunted growth",
    "Holes in leaves",
    "Curled leaves",
    "Black spots",
    "Orange pustules",
    "Fuzzy growth",
    "Leaf drop",
  ]

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setError("")
      setAnalysisResult(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError("Please select an image first")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const result = await DiseaseDetectionService.analyzeImage(selectedImage, cropType)
      setAnalysisResult(result)
    } catch (error: any) {
      setError(error.message || "Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const handleAnalyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please select at least one symptom")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/disease-detection/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      })

      const data = await response.json()

      if (response.ok) {
        setSymptomResults(data.results)
      } else {
        setError(data.error || "Analysis failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "#4caf50"
      case "Medium":
        return "#ff9800"
      case "High":
        return "#f44336"
      case "Critical":
        return "#d32f2f"
      default:
        return "#666"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Low":
        return "✅"
      case "Medium":
        return "⚠️"
      case "High":
        return "🚨"
      case "Critical":
        return "🔴"
      default:
        return "ℹ️"
    }
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
          <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2d5016" }}>Plant Disease Detection</h1>

          <p style={{ textAlign: "center", marginBottom: "2rem" }}>
            Upload an image of your crop or describe symptoms to get AI-powered disease diagnosis and treatment
            recommendations.
          </p>

          {/* Tab Navigation */}
          <div style={{ display: "flex", marginBottom: "2rem", borderBottom: "2px solid #eee" }}>
            <button
              onClick={() => setActiveTab("upload")}
              style={{
                padding: "1rem 2rem",
                border: "none",
                background: activeTab === "upload" ? "#7cb342" : "transparent",
                color: activeTab === "upload" ? "white" : "#666",
                cursor: "pointer",
                borderRadius: "5px 5px 0 0",
              }}
            >
              📷 Image Analysis
            </button>
            <button
              onClick={() => setActiveTab("symptoms")}
              style={{
                padding: "1rem 2rem",
                border: "none",
                background: activeTab === "symptoms" ? "#7cb342" : "transparent",
                color: activeTab === "symptoms" ? "white" : "#666",
                cursor: "pointer",
                borderRadius: "5px 5px 0 0",
              }}
            >
              📝 Symptom Checker
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Image Upload Tab */}
          {activeTab === "upload" && (
            <div>
              <div className="grid grid-2">
                <div>
                  <div className="form-group">
                    <label htmlFor="cropType">Crop Type (Optional)</label>
                    <select id="cropType" value={cropType} onChange={(e) => setCropType(e.target.value)}>
                      <option value="">Select crop type...</option>
                      {cropOptions.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Upload Plant Image</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ width: "100%", marginBottom: "1rem" }}
                    >
                      📷 Choose Image
                    </button>

                    {selectedImage && (
                      <p style={{ color: "#7cb342", fontSize: "0.9rem" }}>Selected: {selectedImage.name}</p>
                    )}
                  </div>

                  <button
                    onClick={handleAnalyzeImage}
                    disabled={!selectedImage || isAnalyzing}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="spinner" style={{ width: "20px", height: "20px", marginRight: "0.5rem" }}></div>
                        Analyzing...
                      </>
                    ) : (
                      "🔍 Analyze Disease"
                    )}
                  </button>
                </div>

                <div>
                  {imagePreview && (
                    <div style={{ textAlign: "center" }}>
                      <h4>Image Preview</h4>
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Selected crop"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          borderRadius: "10px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Result */}
              {analysisResult && (
                <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f8f9fa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "2rem" }}>{getSeverityIcon(analysisResult.severity)}</span>
                    <div>
                      <h3 style={{ margin: 0, color: getSeverityColor(analysisResult.severity) }}>
                        {analysisResult.diseaseName}
                      </h3>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        Confidence: {(analysisResult.confidence * 100).toFixed(1)}% | Severity:{" "}
                        <strong style={{ color: getSeverityColor(analysisResult.severity) }}>
                          {analysisResult.severity}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <p>{analysisResult.description}</p>

                  <div className="grid grid-2">
                    <div>
                      <h4>🔍 Symptoms</h4>
                      <ul>
                        {analysisResult.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>

                      <h4>🦠 Causes</h4>
                      <ul>
                        {analysisResult.causes.map((cause, index) => (
                          <li key={index}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4>💊 Treatment</h4>
                      <ul>
                        {analysisResult.treatments.map((treatment, index) => (
                          <li key={index}>{treatment}</li>
                        ))}
                      </ul>

                      <h4>🛡️ Prevention</h4>
                      <ul>
                        {analysisResult.prevention.map((prevention, index) => (
                          <li key={index}>{prevention}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#e8f5e8", borderRadius: "5px" }}>
                    <strong>Affected Crops:</strong> {analysisResult.affectedCrops.join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Symptoms Tab */}
          {activeTab === "symptoms" && (
            <div>
              <h3>Select the symptoms you observe:</h3>
              <div className="grid grid-3" style={{ marginBottom: "2rem" }}>
                {commonSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      border: symptoms.includes(symptom) ? "2px solid #7cb342" : "2px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      backgroundColor: symptoms.includes(symptom) ? "#f0f8f0" : "white",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    {symptom}
                  </label>
                ))}
              </div>

              <button
                onClick={handleAnalyzeSymptoms}
                disabled={symptoms.length === 0 || isAnalyzing}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner" style={{ width: "20px", height: "20px", marginRight: "0.5rem" }}></div>
                    Analyzing...
                  </>
                ) : (
                  "🔍 Analyze Symptoms"
                )}
              </button>

              {/* Symptom Results */}
              {symptomResults.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h3>Possible Diseases:</h3>
                  {symptomResults.map((result, index) => (
                    <div key={index} className="card" style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{getSeverityIcon(result.severity)}</span>
                        <div>
                          <h4 style={{ margin: 0, color: getSeverityColor(result.severity) }}>{result.diseaseName}</h4>
                          <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            Match: {(result.confidence * 100).toFixed(1)}% | Severity:{" "}
                            <strong style={{ color: getSeverityColor(result.severity) }}>{result.severity}</strong>
                          </p>
                        </div>
                      </div>
                      <p>{result.description}</p>
                      <details>
                        <summary style={{ cursor: "pointer", fontWeight: "bold" }}>View Treatment Details</summary>
                        <div className="grid grid-2" style={{ marginTop: "1rem" }}>
                          <div>
                            <h5>💊 Treatment</h5>
                            <ul>
                              {result.treatments.slice(0, 3).map((treatment, i) => (
                                <li key={i}>{treatment}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5>🛡️ Prevention</h5>
                            <ul>
                              {result.prevention.slice(0, 3).map((prevention, i) => (
                                <li key={i}>{prevention}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="grid grid-3" style={{ marginTop: "2rem" }}>
          <div className="card">
            <h3>📷 Photo Tips</h3>
            <ul>
              <li>Take clear, well-lit photos</li>
              <li>Focus on affected plant parts</li>
              <li>Include multiple angles if possible</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>
          <div className="card">
            <h3>🕐 Best Time</h3>
            <ul>
              <li>Morning light is ideal</li>
              <li>Avoid direct harsh sunlight</li>
              <li>Take photos when symptoms are visible</li>
              <li>Document progression over time</li>
            </ul>
          </div>
          <div className="card">
            <h3>🚨 Emergency Signs</h3>
            <ul>
              <li>Rapid wilting or death</li>
              <li>Spreading black spots</li>
              <li>Foul odors from plants</li>
              <li>Massive leaf drop</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
