import fs from 'fs';
import path from 'path';

// Interfaces based on CSV headers
interface CropData {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    crop: string;
}

interface IrrigationData {
    CropType: string;
    CropDays: number;
    SoilMoisture: number;
    temperature: number;
    Humidity: number;
    Irrigation: number; // 0 or 1
}

export class AdvisoryService {
    private static cropData: CropData[] = [];
    private static irrigationData: IrrigationData[] = [];
    private static isInitialized = false;

    private static parseCSV<T>(content: string, mapFn: (row: any) => T): T[] {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].trim().split(',').map(h => h.trim());
        const result: T[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            const row: any = {};

            headers.forEach((header, index) => {
                row[header] = values[index]?.trim();
            });

            try {
                result.push(mapFn(row));
            } catch (e) {
                // Skip invalid rows
            }
        }
        return result;
    }

    // Initialize and load datasets
    static initialize() {
        if (this.isInitialized) return;

        try {
            // Load Crop Recommendation Dataset
            const cropCsvPath = path.join(process.cwd(), 'crop recommendation', 'crop_recommendation (1).csv');
            const cropFileContent = fs.readFileSync(cropCsvPath, 'utf-8');

            this.cropData = this.parseCSV<CropData>(cropFileContent, (row) => ({
                N: parseFloat(row.N),
                P: parseFloat(row.P),
                K: parseFloat(row.K),
                temperature: parseFloat(row.temperature),
                humidity: parseFloat(row.humidity),
                ph: parseFloat(row.ph),
                rainfall: parseFloat(row.rainfall),
                crop: row.crop
            }));

            // Load Irrigation Dataset
            const irrigationCsvPath = path.join(process.cwd(), 'irrigation schedule', 'datasets - datasets.csv');
            const irrigationFileContent = fs.readFileSync(irrigationCsvPath, 'utf-8');

            this.irrigationData = this.parseCSV<IrrigationData>(irrigationFileContent, (row) => ({
                CropType: row.CropType,
                CropDays: parseFloat(row.CropDays),
                SoilMoisture: parseFloat(row.SoilMoisture),
                temperature: parseFloat(row.temperature),
                Humidity: parseFloat(row.Humidity),
                Irrigation: parseFloat(row.Irrigation)
            }));

            this.isInitialized = true;
            console.log(`AdvisoryService initialized. Loaded ${this.cropData.length} crop records and ${this.irrigationData.length} irrigation records.`);
        } catch (error) {
            console.error("Failed to initialize AdvisoryService:", error);
        }
    }

    // K-Nearest Neighbors to find best crop
    static recommendCrop(input: { N: number, P: number, K: number, ph: number, rainfall: number, temperature: number, humidity: number }): string[] {
        if (!this.isInitialized) this.initialize();

        // Simple Euclidean distance
        const distances = this.cropData.map(record => {
            const dist = Math.sqrt(
                Math.pow(record.N - input.N, 2) +
                Math.pow(record.P - input.P, 2) +
                Math.pow(record.K - input.K, 2) +
                Math.pow(record.ph - input.ph, 2) +
                Math.pow(record.rainfall - input.rainfall, 2) +
                Math.pow(record.temperature - input.temperature, 2) +
                Math.pow(record.humidity - input.humidity, 2)
            );
            return { crop: record.crop, distance: dist };
        });

        // Sort by distance (ascending) and get top matches
        distances.sort((a, b) => a.distance - b.distance);

        // Return unique top 3 crops
        const topCrops = new Set<string>();
        for (const d of distances) {
            topCrops.add(d.crop);
            if (topCrops.size >= 3) break;
        }

        return Array.from(topCrops);
    }

    // Predict Irrigation
    static predictIrrigation(input: { CropType: string, CropDays: number, SoilMoisture: number, temperature: number, Humidity: number }): boolean {
        if (!this.isInitialized) this.initialize();

        // Filter by crop type first to narrow down
        const cropRecords = this.irrigationData.filter(r => r.CropType && input.CropType && r.CropType.toLowerCase() === input.CropType.toLowerCase());

        if (cropRecords.length === 0) {
            // Fallback if crop not in irrigation DB: General rule
            return input.SoilMoisture < 400; // Assuming < 400 needs water based on CSV trends
        }

        // Find closest record in specific crop data
        let closestRecord = cropRecords[0];
        let minDist = Infinity;

        for (const record of cropRecords) {
            const dist = Math.sqrt(
                Math.pow(record.CropDays - input.CropDays, 2) +
                Math.pow(record.SoilMoisture - input.SoilMoisture, 2) +
                Math.pow(record.temperature - input.temperature, 2) +
                Math.pow(record.Humidity - input.Humidity, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                closestRecord = record;
            }
        }

        return closestRecord.Irrigation === 1;
    }

    static getPestControlAdvice(weather: { humidity: number, temperature: number, description: string }): string {
        const advice: string[] = [];

        const isRainy = weather.description.toLowerCase().includes("rain");

        if (weather.humidity > 80) {
            advice.push(`High humidity detected (${weather.humidity}%). This creates favorable conditions for fungal diseases like Blight and Mildew. Ensure good field drainage and consider applying a preventive fungicide.`);
        }

        if (weather.temperature > 30) {
            advice.push(`High temperatures (${weather.temperature}°C) can lead to rapid reproduction of pests like Aphids and Whiteflies. Monitor the undersides of leaves closely.`);
        } else if (weather.temperature < 15) {
            advice.push("Cool temperatures observed. Watch for cold-tolerant pests and protect sensitive crops if frost is forecasted.");
        }

        if (isRainy) {
            advice.push("Rainy weather can wash away pesticide applications. avoid spraying until the rain stops. Monitor for waterlogging which can weaken roots.");
        }

        if (advice.length === 0) {
            advice.push("Current weather conditions are moderate. Maintain regular field scouting to catch any pest issues early.");
        }

        return advice.join(" ");
    }

    static getSoilProfile(type: string): { N: number, P: number, K: number, ph: number } {
        const lowerType = type.toLowerCase();

        // Profiles adapted for Indian Agriculture context
        if (lowerType.includes("black")) return { N: 40, P: 30, K: 50, ph: 7.5 };
        if (lowerType.includes("red")) return { N: 30, P: 15, K: 20, ph: 5.5 };
        if (lowerType.includes("clay")) return { N: 60, P: 25, K: 30, ph: 8.0 };
        if (lowerType.includes("sandy")) return { N: 20, P: 10, K: 10, ph: 6.0 };
        if (lowerType.includes("alluvial")) return { N: 50, P: 20, K: 30, ph: 7.0 };
        if (lowerType.includes("laterite")) return { N: 25, P: 10, K: 15, ph: 5.0 };

        // Default (Loamy / Balanced)
        return { N: 80, P: 40, K: 40, ph: 6.5 };
    }
}
