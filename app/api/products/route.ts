import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import "@/models/User"; // Ensure User schema is registered for populate

// GET: List all products (Public/Marketplace)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query: any = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case insensitive search
    }

    const products = await Product.find(query)
      .populate("farmerId", "name city rating sales")
      .sort({ createdAt: -1 });

    return NextResponse.json(products);

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
