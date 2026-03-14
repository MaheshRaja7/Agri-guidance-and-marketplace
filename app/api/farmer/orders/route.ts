import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import "@/models/User"; // Ensure User schema is registered for populate
import { AuthService } from "@/lib/auth";

// GET: List orders for the logged-in farmer
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized: Farmer access required" }, { status: 403 });
        }

        // Populate product details and customer details
        const orders = await Order.find({ "orderItems.farmerId": decoded.userId })
            .populate("customerId", "name email phone city address")
            .populate("orderItems.productId", "name image unit")
            .sort({ orderDate: -1 });

        const farmerOrders = orders.map((order: any) => {
             const farmerItems = order.orderItems.filter((item: any) => item.farmerId.toString() === decoded.userId);
             const farmerTotal = farmerItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
             return {
                 _id: order._id,
                 customerId: order.customerId,
                 totalAmount: farmerTotal,
                 orderStatus: order.orderStatus,
                 paymentStatus: order.paymentStatus,
                 orderDate: order.orderDate,
                 orderItems: farmerItems
             };
        });

        return NextResponse.json(farmerOrders);
    } catch (error) {
        console.error("Error fetching farmer orders:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH: Update order status (shipping/payment)
export async function PATCH(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized: Farmer access required" }, { status: 403 });
        }

        const body = await request.json();
        const { orderId, status, paymentStatus } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID required" }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.orderStatus = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        // Verify order belongs to farmer
        const order = await Order.findOne({ _id: orderId, "orderItems.farmerId": decoded.userId });
        if (!order) {
            return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
