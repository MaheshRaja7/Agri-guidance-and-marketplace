

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
  // Database keys match the normalized filenames from python script (lowercase, spaces instead of underscores/hyphens, no numbers)
  private static diseaseDatabase: Record<string, Omit<DiseaseDetectionResult, "id" | "confidence">> = {
    // APPLES
    "Apple ceder apple rust": {
      diseaseName: "Cedar Apple Rust",
      description: "A fungal disease that requires both apple and cedar/juniper trees to complete its life cycle.",
      symptoms: ["Bright orange-yellow spots on leaves", "Rust-colored lesions on fruit", "Premature leaf drop", "Galls on nearby cedar trees"],
      causes: ["Gymnosporangium juniperi-virginianae fungus", "Presence of nearby Juniperus species", "Wet spring weather"],
      treatments: ["Apply fungicides (Myclobutanil, Sulfur)", "Remove nearby galls from cedar trees", "Prune infected apple twigs"],
      prevention: ["Plant resistant varieties", "Remove nearby cedar/juniper trees", "Apply preventive fungicides in spring"],
      severity: "Medium",
      affectedCrops: ["Apple", "Crabapple"],
    },
    "Apple scab": {
      diseaseName: "Apple Scab",
      description: "A serious fungal disease affecting leaves and fruit of apple trees.",
      symptoms: ["Olive-green to black velvety spots on leaves", "Scabby, corky spots on fruit", "Leaf yellowing and drop", "Deformed fruit"],
      causes: ["Venturia inaequalis fungus", "Cool, wet weather in spring", "Overwintering in fallen leaves"],
      treatments: ["Apply fungicides (Captan, Sulfur)", "Remove microbes with bio-fungicides", "Prune to open canopy"],
      prevention: ["Rake and destroy fallen leaves", "Plant resistant varieties", "Prune for better airflow"],
      severity: "High",
      affectedCrops: ["Apple", "Crabapple", "Pear"],
    },
    "apple black rot": {
      diseaseName: "Black Rot",
      description: "A fungal disease causing fruit rot and leaf spots (frog-eye leaf spot).",
      symptoms: ["Purple spots on leaves enlarging to brown (frog-eye)", "Firm, rotting fruit turning black/mummified", "Cankers on branches"],
      causes: ["Botryosphaeria obtusa fungus", "Warm, bacterial wet weather", "Wounded trees"],
      treatments: ["Remove mummified fruit", "Prune out cankers", "Apply fungicides (Captan, Thiophanate-methyl)"],
      prevention: ["Sanitation (remove dead wood/fruit)", "Avoid wounding trees", "Fungicide sprays from silver tip to harvest"],
      severity: "High",
      affectedCrops: ["Apple", "Pear"],
    },
    "apple healthy": {
      diseaseName: "Healthy Apple",
      description: "The apple plant appears healthy and vigorous.",
      symptoms: ["Green, spotless leaves", "Smooth bark", "Normal fruit development"],
      causes: ["Good management", "Proper nutrition", "Favorable weather"],
      treatments: ["Continue regular maintenance", "Monitor for pests"],
      prevention: ["Regular watering", "Balanced fertilization", "Annual pruning"],
      severity: "Low",
      affectedCrops: ["Apple"],
    },

    // BACKGROUND
    "background without leaves": {
      diseaseName: "Not a Plant / Unclear",
      description: "The image does not appear to contain a clear plant leaf or is background noise.",
      symptoms: [],
      causes: [],
      treatments: ["Please upload a clear image of a plant leaf"],
      prevention: [],
      severity: "Low",
      affectedCrops: [],
    },

    // BLUEBERRY
    "blueberry healthy": {
      diseaseName: "Healthy Blueberry",
      description: "The blueberry plant appears healthy.",
      symptoms: ["Green leaves", "No discoloration", "Vigorous growth"],
      causes: [],
      treatments: ["Maintain acidic soil (pH 4.5-5.5)", "Regular watering"],
      prevention: ["Mulch with pine bark/needles"],
      severity: "Low",
      affectedCrops: ["Blueberry"],
    },

    // CHERRY
    "cherry healthy": {
      diseaseName: "Healthy Cherry",
      description: "The cherry plant appears healthy.",
      symptoms: ["Glossy green leaves", "No spots or mildew"],
      causes: [],
      treatments: ["Regular watering", "Nutrient management"],
      prevention: ["Annual pruning"],
      severity: "Low",
      affectedCrops: ["Cherry"],
    },
    "cherry powdery mildew": {
      diseaseName: "Powdery Mildew",
      description: "A common fungal disease appearing as white powder on new growth.",
      symptoms: ["White powdery patches on leaves", "Curling leaves", "Stunted shoot growth"],
      causes: ["Podosphaera clandestina fungus", "High humidity", "Warm days and cool nights"],
      treatments: ["Sulfur fungicides", "Neem oil", "Prune infected shoots"],
      prevention: ["Improve air circulation", "Avoid overhead watering", "Fungicide sprays at petal fall"],
      severity: "Medium",
      affectedCrops: ["Cherry", "Plum", "Peach"],
    },

    // CORN
    "corn cercospora leaf": {
      diseaseName: "Gray Leaf Spot",
      description: "A fungal disease causing rectangular lesions on corn leaves.",
      symptoms: ["Tan to brown rectangular lesions bounded by veins", "Lesions turn gray with age", "Leaf blight"],
      causes: ["Cercospora zeae-maydis fungus", "High humidity", "No-till farming (residue)"],
      treatments: ["Fungicides (Strobilurins, Triazoles)", "Harvest early if severe"],
      prevention: ["Crop rotation", "Tillage to bury residue", "Resistant hybrids"],
      severity: "High",
      affectedCrops: ["Corn"],
    },
    "corn common rust": {
      diseaseName: "Common Rust",
      description: "A fungal disease causing pustules on both leaf surfaces.",
      symptoms: ["Oval/elongated cinnamon-brown pustules", "Pustules on both upper and lower leaf surfaces", "Leaf chlorosis"],
      causes: ["Puccinia sorghi fungus", "Cool temperatures", "High humidity"],
      treatments: ["Fungicides (usually not economical unless severe)", "Early harvest"],
      prevention: ["Plant resistant hybrids", "Plant early"],
      severity: "Medium",
      affectedCrops: ["Corn"],
    },
    "corn northen leaf blight": {
      diseaseName: "Northern Leaf Blight",
      description: "A fungal disease causing large, cigar-shaped lesions.",
      symptoms: ["Long, elliptical, gray-green to tan lesions", "Cigar-shaped spots", "Leaf curing/death"],
      causes: ["Exserohilum turcicum fungus", "Moderate temperatures", "Heavy dew"],
      treatments: ["Fungicides (at tasseling)", "Crop rotation"],
      prevention: ["Resistant hybrids", "Tillage", "Crop rotation"],
      severity: "High",
      affectedCrops: ["Corn"],
    },
    "corn healthy": {
      diseaseName: "Healthy Corn",
      description: "The corn plant appears healthy.",
      symptoms: ["Dark green leaves", "Robust stalks", "No lesions"],
      causes: [],
      treatments: ["Maintain nitrogen levels", "Adequate irrigation"],
      prevention: ["Weed control"],
      severity: "Low",
      affectedCrops: ["Corn"],
    },

    // GRAPE
    "Grape esca": {
      diseaseName: "Esca (Black Measles)",
      description: "A complex wood disease affecting grapevine trunks and berries.",
      symptoms: ["Tiger-stripe pattern on leaves", "Dark spots on berries (measles)", "Sudden wilting (apoplexy)"],
      causes: ["Complex of fungi (Phaeomoniella, Phaeoacremonium)", "Pruning wounds", "Stressed vines"],
      treatments: ["No cure for infected vines", "Remove infected trunk/vine", "Wound sealants"],
      prevention: ["Protect pruning wounds", "Remove dead wood", "Double-trunking"],
      severity: "Critical",
      affectedCrops: ["Grape"],
    },
    "grape black rot": {
      diseaseName: "Black Rot",
      description: "A fungal disease causing fruit mummification and leaf spots.",
      symptoms: ["Brown circular spots on leaves", "Black fungal fruiting bodies", "Shriveled, black, hard berries"],
      causes: ["Guignardia bidwellii fungus", "Warm, humid weather"],
      treatments: ["Fungicides (Mancozeb, Myclobutanil)", "Remove mummified berries"],
      prevention: ["Sanitation", "Canopy management for airflow", "Fungicide program"],
      severity: "High",
      affectedCrops: ["Grape"],
    },
    "grape leaf blight": {
      diseaseName: "Leaf Blight / Isariopsis Leaf Spot",
      description: "Fungal disease causing spotting and blighting of leaves.",
      symptoms: ["Irregular brown spots on leaves", "Premature defoliation", "Reduced vigor"],
      causes: ["Pseudocercospora vitis fungus", "Wet conditions"],
      treatments: ["Fungicides (Copper, Sulfur)", "Improve airflow"],
      prevention: ["Manage canopy density", "Dormant sprays"],
      severity: "Medium",
      affectedCrops: ["Grape"],
    },
    "grape healthy": {
      diseaseName: "Healthy Grape",
      description: "The grapevine appears healthy.",
      symptoms: ["Green leaves", "Healthy clusters"],
      causes: [],
      treatments: ["Regular pruning", "Pest monitoring"],
      prevention: ["Nutrient management"],
      severity: "Low",
      affectedCrops: ["Grape"],
    },

    // CITRUS
    "orange haunglongbing": {
      diseaseName: "Citrus Greening (HLB)",
      description: "A devastating bacterial disease spread by psyllids.",
      symptoms: ["Yellow mottling on leaves (asymmetrical)", "Misshapen, bitter fruit", "Green fruit", "Tree decline"],
      causes: ["Candidatus Liberibacter bacteria", "Asian Citrus Psyllid vector"],
      treatments: ["No cure known", "Remove infected trees immediately", "Control psyllids"],
      prevention: ["Use disease-free nursery stock", "Aggressive psyllid control", "Remove infected trees"],
      severity: "Critical",
      affectedCrops: ["Orange", "Citrus"],
    },

    // PEACH
    "peach bacterial spot": {
      diseaseName: "Bacterial Spot",
      description: "Bacterial infection causing shot-holes in leaves and fruit spots.",
      symptoms: ["Small, dark spots on leaves", "Shot-hole effect (center falls out)", "Cracked, pitted fruit"],
      causes: ["Xanthomonas campestris bacteria", "Wind-driven rain", "Sandy soil (abrasion)"],
      treatments: ["Copper sprays (dormant)", "Antibiotics (Oxytetracycline) during bloom"],
      prevention: ["Resistant varieties", "Windbreaks", "Maintain tree vigor"],
      severity: "Medium",
      affectedCrops: ["Peach", "Nectarine", "Plum"],
    },
    "peach healthy": {
      diseaseName: "Healthy Peach",
      description: "The peach tree appears healthy.",
      symptoms: ["Green leaves", "Normal fruit"],
      causes: [],
      treatments: ["Regular watering", "Thinning fruit"],
      prevention: ["Pruning"],
      severity: "Low",
      affectedCrops: ["Peach"],
    },

    // PEPPER
    "pepper bacterial spot": {
      diseaseName: "Bacterial Spot",
      description: "Major disease of peppers causing leaf drop and fruit spots.",
      symptoms: ["Small water-soaked spots", "Leaves turning yellow and dropping", "Scabby spots on fruit"],
      causes: ["Xanthomonas euvesicatoria bacteria", "High humidity", "Rain splash"],
      treatments: ["Copper-based bactericides", "Remove infected plants"],
      prevention: ["Certified disease-free seeds", "Crop rotation", "Mulching"],
      severity: "High",
      affectedCrops: ["Pepper", "Tomato"],
    },
    "pepper bell healthy": {
      diseaseName: "Healthy Pepper",
      description: "The pepper plant appears healthy.",
      symptoms: ["Green leaves", "Sturdy stems"],
      causes: [],
      treatments: ["Support/staking", "Regular watering"],
      prevention: [],
      severity: "Low",
      affectedCrops: ["Pepper"],
    },

    // POTATO
    "potato early blight": {
      diseaseName: "Early Blight",
      description: "Fungal disease causing concentric rings on leaves.",
      symptoms: ["Brown spots with concentric rings (target board effect)", "Lower leaves affected first", "Yellowing leaves"],
      causes: ["Alternaria solani fungus", "Warm temperature", "Alternating wet/dry periods"],
      treatments: ["Fungicides (Chlorothalonil, Mancozeb)", "Remove infected leaves"],
      prevention: ["Crop rotation", "Drip irrigation", "Resistant varieties"],
      severity: "Medium",
      affectedCrops: ["Potato", "Tomato"],
    },
    "potato late blight": {
      diseaseName: "Late Blight",
      description: "The disease that caused the Irish Potato Famine. Rapidly destructive.",
      symptoms: ["Water-soaked dark spots on leaves", "White mold on undersides", "Rapid wilting/blackening", "Brown rot in tubers"],
      causes: ["Phytophthora infestans oomycete", "Cool, wet weather"],
      treatments: ["Systemic fungicides (Metalaxyl)", "Kill vines before harvest", "Destroy infected plants"],
      prevention: ["Certified seed potatoes", "Avoid overhead watering", "Resistant varieties"],
      severity: "Critical",
      affectedCrops: ["Potato", "Tomato"],
    },
    "potato healthy": {
      diseaseName: "Healthy Potato",
      description: "The potato plant appears healthy.",
      symptoms: ["Green foliage", "No lesions"],
      causes: [],
      treatments: ["Hilling soil", "Pest control"],
      prevention: [],
      severity: "Low",
      affectedCrops: ["Potato"],
    },

    // RASPBERRY
    "raspberry healthy": {
      diseaseName: "Healthy Raspberry",
      description: "The raspberry cane appears healthy.",
      symptoms: ["Green leaves", "No rust or spots"],
      causes: [],
      treatments: ["Pruning spent canes", "Mulching"],
      prevention: ["Trellising"],
      severity: "Low",
      affectedCrops: ["Raspberry"],
    },

    // SOYBEAN
    "soyaben healthy": {
      diseaseName: "Healthy Soybean",
      description: "The soybean plant appears healthy.",
      symptoms: ["Green trefoil leaves", "No pustules"],
      causes: [],
      treatments: ["Weed control"],
      prevention: [],
      severity: "Low",
      affectedCrops: ["Soybean"],
    },

    // SQUASH
    "squash powdery mildew": {
      diseaseName: "Powdery Mildew",
      description: "White powdery growth on leaves reducing photosynthesis.",
      symptoms: ["White talc-like spots on leaves/stems", "Yellowing leaves", "Sunscald on fruit (due to defoliation)"],
      causes: ["Podosphaera xanthii fungus", "Humid, crowded conditions"],
      treatments: ["Sulfur dust", "Neem oil", "Potassium bicarbonate spray"],
      prevention: ["Resistant varieties", "Plant spacing", "Fungicide program"],
      severity: "Medium",
      affectedCrops: ["Squash", "Pumpkin", "Cucumber"],
    },

    // STRAWBERRY
    "starwberry leaf scorch": {
      diseaseName: "Leaf Scorch",
      description: "Fungal disease causing purple blotches on leaves.",
      symptoms: ["Irregular purple blotches", "Centers turn brown", "Leaves look dried/scorched"],
      causes: ["Diplocarpon earliana fungus", "Wet periods"],
      treatments: ["Fungicides", "Remove infected leaves after harvest"],
      prevention: ["Clean stock", "Good drainage", "Renovate beds"],
      severity: "Medium",
      affectedCrops: ["Strawberry"],
    },
    "starwberry healthy": {
      diseaseName: "Healthy Strawberry",
      description: "The strawberry plant appears healthy.",
      symptoms: ["Green, trifoliate leaves", "Vigorous crown"],
      causes: [],
      treatments: ["Watering", "Straw mulching"],
      prevention: [],
      severity: "Low",
      affectedCrops: ["Strawberry"],
    },

    // TOMATO
    "tomato bacterial spot": {
      diseaseName: "Bacterial Spot",
      description: "Bacterial infection causing spots on leaves and fruit.",
      symptoms: ["Small, dark, water-soaked spots", "Yellowing leaves", "Scabs on fruit"],
      causes: ["Xanthomonas bacteria", "Wet warm weather", "Seed contamination"],
      treatments: ["Copper-mancozeb sprays", "Remove infected plants"],
      prevention: ["Use pathogen-free seed", "Mulching", "Drip irrigation"],
      severity: "High",
      affectedCrops: ["Tomato", "Pepper"],
    },
    "tomato early blight": {
      diseaseName: "Early Blight",
      description: "Common fungal disease affecting older leaves first.",
      symptoms: ["Concentric ring spots (bullseye)", "Yellowing of lower leaves", "Stem cankers"],
      causes: ["Alternaria solani fungus", "Warm, precipitous weather"],
      treatments: ["Fungicides (Chlorothalonil)", "Mulching", "Stake plants"],
      prevention: ["Rotate crops", "Staking/caging", "Remove debris"],
      severity: "Medium",
      affectedCrops: ["Tomato", "Potato"],
    },
    "tomato late blight": {
      diseaseName: "Late Blight",
      description: "Destructive disease that can kill plants rapidly.",
      symptoms: ["Greasy, gray-green spots", "White fuzzy mold in humidity", "Fruit rot"],
      causes: ["Phytophthora infestans", "Cool, wet conditions"],
      treatments: ["Copper fungicides", "Destroy plants immediately if severe"],
      prevention: ["Resistant varieties", "Avoid overhead watering", "Good airflow"],
      severity: "Critical",
      affectedCrops: ["Tomato", "Potato"],
    },
    "tomato leaf curl virus": {
      diseaseName: "Leaf Curl Virus",
      description: "Viral disease transmitted by whiteflies.",
      symptoms: ["Upward curling of leaves", "Yellowing margins", "Stunted growth", "Flower drop"],
      causes: ["Begomovirus species", "Whitefly vector"],
      treatments: ["No cure", "Remove infected plants"],
      prevention: ["Control whiteflies", "Reflective mulches", "Virus-free seedlings"],
      severity: "High",
      affectedCrops: ["Tomato"],
    },
    "tomato yellow leaf curl virus": {
      diseaseName: "Yellow Leaf Curl Virus",
      description: "Severe viral disease causing yellowing and curling.",
      symptoms: ["Yellow leaf margins", "Upward cupping", "Severe stunting", "No fruit set"],
      causes: ["TYLCV (Begomovirus)", "Whiteflies"],
      treatments: ["Remove and destroy plants", "Control whiteflies"],
      prevention: ["Resistant varieties (TY series)", "Mesh screens", "Weed control"],
      severity: "Critical",
      affectedCrops: ["Tomato"],
    },
    "tomato mold": {
      diseaseName: "Leaf Mold",
      description: "Fungal disease common in greenhouses/high tunnels.",
      symptoms: ["Pale yellow spots on upper leaf", "Olive-green velvet mold on underside", "Leaf drop"],
      causes: ["Passalora fulva fungus", "High humidity (>85%)"],
      treatments: ["Fungicides", "Increase ventilation"],
      prevention: ["Reduce humidity", "Resistant varieties", "Pruning"],
      severity: "Medium",
      affectedCrops: ["Tomato"],
    },
    "tomato leaf mold": {
      diseaseName: "Leaf Mold",
      description: "Fungal disease common in humid conditions.",
      symptoms: ["Yellow spots on leaf top", "Olive-green fuzz on bottom", "Defoliation"],
      causes: ["Passalora fulva fungus", "Poor air circulation"],
      treatments: ["Fungicides", "Pruning"],
      prevention: ["Ventilation", "Drip irrigation"],
      severity: "Medium",
      affectedCrops: ["Tomato"],
    },
    "tomato mosaic virus": {
      diseaseName: "Mosaic Virus",
      description: "Viral disease causing mottled leaves.",
      symptoms: ["Mottled light/dark green leaves", "Fern-like leaves", "Stunted growth"],
      causes: ["Tobacco Mosaic Virus (TMV)", "Mechanical transmission (tools, hands)"],
      treatments: ["No cure", "Remove plant"],
      prevention: ["Wash hands (smokers)", "Sanitize tools", "Resistant varieties"],
      severity: "High",
      affectedCrops: ["Tomato", "Tobacco", "Pepper"],
    },
    "tomato septoria leaf spot": {
      diseaseName: "Septoria Leaf Spot",
      description: "Fungal disease causing many small spots.",
      symptoms: ["small circular spots with gray centers", "Black dots in center", "Lower leaves yellow and drop"],
      causes: ["Septoria lycopersici fungus", "Splashing water"],
      treatments: ["Fungicides", "Remove lower leaves"],
      prevention: ["Mulch", "Water at base", "Crop rotation"],
      severity: "Medium",
      affectedCrops: ["Tomato"],
    },
    "tomato spider mites two spotted spider mites": {
      diseaseName: "Two-Spotted Spider Mite",
      description: "Tiny arachnids causing stippling on leaves.",
      symptoms: ["Yellow stippling/speckling", "Fine webbing", "Leaves turn bronze/dry"],
      causes: ["Tetranychus urticae", "Hot, dry conditions", "Dusty environment"],
      treatments: ["Insecticidal soap", "Neem oil", "Water spray to knock them off"],
      prevention: ["Keep plants watered", "Encourage predatory mites"],
      severity: "Medium",
      affectedCrops: ["Tomato", "Many vegetables"],
    },
    "tomato target spot": {
      diseaseName: "Target Spot",
      description: "Fungal disease causing target-like lesions.",
      symptoms: ["Brown-black lesions with concentric rings", "Fruit rot", "Leaf drop"],
      causes: ["Corynespora cassiicola fungus", "Warm, humid conditions"],
      treatments: ["Fungicides", "Improve airflow"],
      prevention: ["Crop rotation", "Weed control", "Avoid overhead irrigation"],
      severity: "High",
      affectedCrops: ["Tomato"],
    },
    "tomato healthy": {
      diseaseName: "Healthy Tomato",
      description: "The tomato plant appears healthy.",
      symptoms: ["Green leaves", "Vigorous growth"],
      causes: [],
      treatments: ["Staking", "Fertilizing"],
      prevention: [],
      severity: "Low",
      affectedCrops: ["Tomato"],
    },
  }

  static async analyzeImage(imageFile: File, cropType?: string): Promise<DiseaseDetectionResult> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (cropType) {
        formData.append("cropType", cropType);
      }

      const response = await fetch("/api/detect-disease", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const result = await response.json();

      // Normalize the returned disease name to lower case to match keys
      const detectedName = result.diseaseName.toLowerCase().trim();

      // Default result structure
      let outputResult: DiseaseDetectionResult = {
        id: Date.now().toString(),
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        description: "Disease detected by AI model. Detailed information may be limited.",
        symptoms: [],
        causes: [],
        treatments: ["Consult a local agricultural extension expert."],
        prevention: [],
        severity: "Medium",
        affectedCrops: cropType ? [cropType] : [],
      };

      // Try to find exact match
      const exactMatchKey = Object.keys(this.diseaseDatabase).find(
        key => key.toLowerCase() === detectedName
      );

      if (exactMatchKey) {
        const data = this.diseaseDatabase[exactMatchKey];
        outputResult = { ...outputResult, ...data };
      }
      // Fallback: Try to find partial match (e.g. "tomato bacterial" matches "tomato bacterial spot")
      else {
        const partialMatchKey = Object.keys(this.diseaseDatabase).find(
          key => detectedName.includes(key.toLowerCase()) || key.toLowerCase().includes(detectedName)
        );
        if (partialMatchKey) {
          const data = this.diseaseDatabase[partialMatchKey];
          outputResult = { ...outputResult, ...data };
        }
      }

      return outputResult;

    } catch (error) {
      console.error("Error analyzing image:", error);
      throw error;
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
      confidence: 0,
    }))
  }
}
