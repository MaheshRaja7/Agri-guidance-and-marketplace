import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true }, // Vegetable, Fruit, Grain, etc.
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        location: { type: String }, // Optional, can inherit from farmer
        unit: { type: String, default: "kg" },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        sales: { type: Number, default: 0 },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;
