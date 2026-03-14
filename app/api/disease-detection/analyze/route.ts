
import { type NextRequest, NextResponse } from "next/server"
import { DiseaseDetectionService } from "../../../../lib/disease-detection"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const cropType = formData.get("cropType") as string
    const userId = formData.get("userId") as string

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file too large. Maximum size is 10MB" }, { status: 400 })
    }

    // Call Internal Service (Mock) directly
    // This avoids the need for a separate Python backend
    const result = await DiseaseDetectionService.analyzeImage(imageFile, cropType)

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        timestamp: new Date().toISOString(),
        cropType: cropType || "Unknown",
      },
    })
  } catch (error) {
    console.error("Disease detection error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
