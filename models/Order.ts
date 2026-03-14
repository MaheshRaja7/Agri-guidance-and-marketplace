import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        
        orderItems: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            }
        ],

        totalAmount: { type: Number, required: true },

        paymentMethod: { type: String, enum: ["online_payment", "cash_on_delivery", "upi", "card"], required: true },
        paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },

        orderStatus: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },

        shippingAddress: { type: String, required: true },
        contactPhone: { type: String, required: true },

        orderDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);

export default Order;
