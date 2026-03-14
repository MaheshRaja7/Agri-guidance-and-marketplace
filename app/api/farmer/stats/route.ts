import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { AuthService } from "@/lib/auth";

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

        const farmerId = decoded.userId;

        // 1. Total Products
        const totalProducts = await Product.countDocuments({ farmerId });

        // 2. Orders Stats
        const orders = await Order.find({ "orderItems.farmerId": farmerId });
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: any) => o.orderStatus === "pending").length;
        const completedOrders = orders.filter((o: any) => o.orderStatus === "delivered").length;

        // 3. Revenue
        const revenue = orders
            .filter((o: any) => o.paymentStatus === "completed" || o.orderStatus === "delivered") // Count revenue for paid or delivered (COD)
            .reduce((sum: number, order: any) => {
                const farmerItems = order.orderItems.filter((item: any) => item.farmerId.toString() === farmerId);
                const orderRevenue = farmerItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                return sum + orderRevenue;
            }, 0);

        return NextResponse.json({
            totalProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            revenue
        });

    } catch (error) {
        console.error("Error fetching farmer stats:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
