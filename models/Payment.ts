import mongoose, { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, enum: ["online_payment", "cash_on_delivery", "upi", "card"], required: true },
        paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
        transactionId: { type: String }, // For dummy or actual Razorpay tx
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Payment = models.Payment || model("Payment", PaymentSchema);

export default Payment;
