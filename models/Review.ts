import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
    {
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        targetType: { type: String, enum: ["product", "farmer"], required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to Product or User depending on targetType
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
