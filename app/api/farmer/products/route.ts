import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import { AuthService } from "@/lib/auth";

// GET: List products for the logged-in farmer
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized: Farmer access required" }, { status: 403 });
        }

        const products = await Product.find({ farmerId: decoded.userId }).sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching farmer products:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST: Add a new product
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized: Farmer access required" }, { status: 403 });
        }

        const body = await request.json();
        const { name, category, price, stock, description, image, unit, location } = body;

        if (!name || !category || !price || !stock || !description || !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProduct = await Product.create({
            name,
            category,
            price,
            stock,
            description,
            image,
            farmerId: decoded.userId,
            unit: unit || "kg",
            location: location || "Unknown" // Should ideally fetch from user/farmer profile
        });

        return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });

    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
