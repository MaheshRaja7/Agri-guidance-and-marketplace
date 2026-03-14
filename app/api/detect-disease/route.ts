import { NextRequest, NextResponse } from "next/server";

// Allows overriding the ML backend URL when deploying (e.g. in production)
const ML_BACKEND_URL = process.env.ML_SERVER_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        console.log("[detect-disease] proxying request to ML backend:", ML_BACKEND_URL);

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Forward the image to the Python Flask Server running on port 5000
        const backendFormData = new FormData();
        backendFormData.append("image", file);

        try {
            const backendResponse = await fetch(`${ML_BACKEND_URL}/api/predict`, {
                method: "POST",
                body: backendFormData,
            });

            if (!backendResponse.ok) {
                const errorData = await backendResponse.text();
                console.error("ML Backend error:", errorData);
                return NextResponse.json({ error: "Failed to process image on ML server." }, { status: backendResponse.status });
            }

            const data = await backendResponse.json();
            return NextResponse.json(data);
        } catch (fetchError) {
            console.error(`Error connecting to ML Backend (${ML_BACKEND_URL}):`, fetchError);
            return NextResponse.json({ error: `Machine Learning server is unreachable (${ML_BACKEND_URL}).` }, { status: 503 });
        }

    } catch (error: any) {
        console.error("General API error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
