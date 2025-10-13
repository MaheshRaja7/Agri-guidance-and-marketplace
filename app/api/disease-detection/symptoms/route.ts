import { type NextRequest, NextResponse } from "next/server"
import { DiseaseDetectionService } from "../../../../lib/disease-detection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptoms } = body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 })
    }

    const results = DiseaseDetectionService.getDiseaseBySymptoms(symptoms)

    return NextResponse.json({
      success: true,
      results: results.slice(0, 5), // Return top 5 matches
    })
  } catch (error) {
    console.error("Symptom analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}
