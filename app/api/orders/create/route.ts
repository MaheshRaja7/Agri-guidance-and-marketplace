import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import { AuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token); // Can be customer

        const body = await request.json();
        const { items, totalAmount, paymentMethod, shippingAddress, contactPhone } = body;

        if (!items || items.length === 0 || !totalAmount || !shippingAddress || !contactPhone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const orderItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
            }

            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
            }

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                farmerId: product.farmerId
            });

            calculatedTotal += product.price * item.quantity;
        }

        const paymentStatus = paymentMethod === "cash_on_delivery" || paymentMethod === "cod" ? "pending" : "completed";
        const standardizedPaymentMethod = paymentMethod === "cod" ? "cash_on_delivery" : paymentMethod === "upi" ? "upi" : "online_payment";

        const newOrder = await Order.create({
            customerId: decoded.userId,
            orderItems,
            totalAmount: calculatedTotal,
            paymentMethod: standardizedPaymentMethod,
            paymentStatus,
            shippingAddress,
            contactPhone
        });

        const newPayment = await Payment.create({
            orderId: newOrder._id,
            amount: calculatedTotal,
            paymentMethod: standardizedPaymentMethod,
            paymentStatus,
            transactionId: `TXN${Date.now()}` // Dummy transaction ID
        });

        // Reduce Stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, sales: item.quantity } });
        }

        return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 201 });

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
