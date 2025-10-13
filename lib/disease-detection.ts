export interface DiseaseDetectionResult {
  id: string
  diseaseName: string
  confidence: number
  description: string
  symptoms: string[]
  causes: string[]
  treatments: string[]
  prevention: string[]
  severity: "Low" | "Medium" | "High" | "Critical"
  affectedCrops: string[]
  imageUrl?: string
}

export interface DetectionHistory {
  id: string
  userId: string
  imageUrl: string
  result: DiseaseDetectionResult
  timestamp: Date
  location?: string
  cropType?: string
}

export class DiseaseDetectionService {
  private static diseaseDatabase = {
    late_blight: {
      diseaseName: "Late Blight",
      confidence: 0.92,
      description: "A serious fungal disease that affects tomatoes, potatoes, and other nightshade plants.",
      symptoms: [
        "Dark brown or black spots on leaves",
        "White fuzzy growth on leaf undersides",
        "Rapid wilting and death of plant parts",
        "Brown lesions on stems and fruits",
        "Foul smell from affected areas",
      ],
      causes: [
        "Phytophthora infestans fungus",
        "High humidity and moisture",
        "Cool temperatures (60-70°F)",
        "Poor air circulation",
        "Overhead watering",
      ],
      treatments: [
        "Remove and destroy affected plant parts immediately",
        "Apply copper-based fungicides (Bordeaux mixture)",
        "Use systemic fungicides like chlorothalonil",
        "Improve air circulation around plants",
        "Avoid overhead watering",
        "Apply preventive fungicide sprays weekly",
      ],
      prevention: [
        "Plant resistant varieties",
        "Ensure proper spacing for air circulation",
        "Water at soil level, not on leaves",
        "Remove plant debris at end of season",
        "Rotate crops annually",
        "Apply preventive fungicide treatments",
      ],
      severity: "Critical" as const,
      affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
    },

    powdery_mildew: {
      diseaseName: "Powdery Mildew",
      confidence: 0.88,
      description: "A common fungal disease that appears as white powdery spots on plant surfaces.",
      symptoms: [
        "White powdery spots on leaves and stems",
        "Yellowing and browning of leaves",
        "Stunted growth",
        "Reduced fruit quality",
        "Premature leaf drop",
      ],
      causes: [
        "Various fungal species",
        "High humidity with dry conditions",
        "Poor air circulation",
        "Overcrowded plants",
        "Stress conditions",
      ],
      treatments: [
        "Apply sulfur-based fungicides",
        "Use baking soda spray (1 tsp per quart water)",
        "Apply neem oil treatments",
        "Remove affected plant parts",
        "Improve air circulation",
        "Reduce nitrogen fertilization",
      ],
      prevention: [
        "Plant resistant varieties",
        "Ensure proper plant spacing",
        "Avoid overhead watering",
        "Provide good air circulation",
        "Remove plant debris",
        "Apply preventive treatments early",
      ],
      severity: "Medium" as const,
      affectedCrops: ["Cucumber", "Squash", "Pumpkin", "Melon", "Grapes", "Roses"],
    },

    bacterial_spot: {
      diseaseName: "Bacterial Spot",
      confidence: 0.85,
      description: "A bacterial disease causing dark spots on leaves, stems, and fruits.",
      symptoms: [
        "Small dark spots with yellow halos on leaves",
        "Brown to black lesions on fruits",
        "Leaf yellowing and defoliation",
        "Stem cankers",
        "Reduced fruit quality",
      ],
      causes: [
        "Xanthomonas bacteria",
        "Warm, humid conditions",
        "Water splash from rain or irrigation",
        "Wounds from insects or tools",
        "Contaminated seeds or transplants",
      ],
      treatments: [
        "Apply copper-based bactericides",
        "Use streptomycin treatments (where legal)",
        "Remove and destroy affected plants",
        "Improve air circulation",
        "Avoid overhead irrigation",
        "Disinfect tools between plants",
      ],
      prevention: [
        "Use certified disease-free seeds",
        "Plant resistant varieties",
        "Avoid working with wet plants",
        "Provide adequate plant spacing",
        "Use drip irrigation",
        "Rotate crops for 2-3 years",
      ],
      severity: "High" as const,
      affectedCrops: ["Tomato", "Pepper", "Eggplant"],
    },

    leaf_rust: {
      diseaseName: "Leaf Rust",
      confidence: 0.9,
      description: "A fungal disease causing orange to reddish-brown pustules on leaves.",
      symptoms: [
        "Orange to reddish-brown pustules on leaves",
        "Yellow spots that turn brown",
        "Premature leaf drop",
        "Reduced photosynthesis",
        "Weakened plant vigor",
      ],
      causes: [
        "Rust fungi (Puccinia species)",
        "High humidity and moisture",
        "Moderate temperatures",
        "Poor air circulation",
        "Dense plant growth",
      ],
      treatments: [
        "Apply fungicides containing propiconazole",
        "Use sulfur-based treatments",
        "Remove affected leaves immediately",
        "Improve air circulation",
        "Reduce leaf wetness duration",
        "Apply systemic fungicides",
      ],
      prevention: [
        "Plant rust-resistant varieties",
        "Ensure proper plant spacing",
        "Avoid overhead watering",
        "Remove plant debris",
        "Apply preventive fungicide treatments",
        "Monitor plants regularly",
      ],
      severity: "Medium" as const,
      affectedCrops: ["Wheat", "Corn", "Beans", "Coffee"],
    },

    healthy: {
      diseaseName: "Healthy Plant",
      confidence: 0.95,
      description: "The plant appears healthy with no visible signs of disease.",
      symptoms: ["Green, vibrant foliage", "No spots or lesions", "Normal growth pattern", "Good color and texture"],
      causes: [
        "Good growing conditions",
        "Proper nutrition",
        "Adequate water management",
        "Disease prevention practices",
      ],
      treatments: [
        "Continue current care practices",
        "Monitor regularly for changes",
        "Maintain proper nutrition",
        "Ensure adequate watering",
      ],
      prevention: [
        "Continue good cultural practices",
        "Regular monitoring",
        "Proper nutrition management",
        "Preventive treatments as needed",
      ],
      severity: "Low" as const,
      affectedCrops: ["All crops"],
    },
  }

  static async analyzeImage(imageFile: File, cropType?: string): Promise<DiseaseDetectionResult> {
    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, this would send the image to an AI model
    // For demo purposes, we'll randomly select a disease or return healthy
    const diseases = Object.keys(this.diseaseDatabase)
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]

    // Higher chance of healthy plants
    const isHealthy = Math.random() > 0.3
    const selectedDisease = isHealthy ? "healthy" : randomDisease

    const diseaseData = this.diseaseDatabase[selectedDisease as keyof typeof this.diseaseDatabase]

    return {
      id: Date.now().toString(),
      ...diseaseData,
      // Adjust confidence based on image quality simulation
      confidence: diseaseData.confidence * (0.8 + Math.random() * 0.2),
    }
  }

  static getDiseaseBySymptoms(symptoms: string[]): DiseaseDetectionResult[] {
    const results: DiseaseDetectionResult[] = []

    Object.entries(this.diseaseDatabase).forEach(([key, disease]) => {
      const matchingSymptoms = symptoms.filter((symptom) =>
        disease.symptoms.some(
          (diseaseSymptom) =>
            diseaseSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
            symptom.toLowerCase().includes(diseaseSymptom.toLowerCase()),
        ),
      )

      if (matchingSymptoms.length > 0) {
        results.push({
          id: key,
          ...disease,
          confidence: (matchingSymptoms.length / symptoms.length) * 0.9,
        })
      }
    })

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  static getAllDiseases(): DiseaseDetectionResult[] {
    return Object.entries(this.diseaseDatabase).map(([key, disease]) => ({
      id: key,
      ...disease,
    }))
  }
}
