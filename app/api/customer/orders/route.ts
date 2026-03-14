import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import { AuthService } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token);

        const orders = await Order.find({ customerId: decoded.userId })
            .populate("orderItems.farmerId", "name city")
            .populate("orderItems.productId", "name image")
            .sort({ orderDate: -1 });

        return NextResponse.json(orders);

    } catch (error) {
        console.error("Error fetching customer orders:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
