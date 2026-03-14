import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        userType: { type: String, enum: ["farmer", "customer"], required: true },

        // Farmer specific fields
        area: { type: Number }, // in cents

        // Address fields
        city: { type: String, required: true }, // Village/City
        address: { type: String }, // Full address
        
        rating: { type: Number, default: 0 }, // Farmer rating
        numReviews: { type: Number, default: 0 },
        sales: { type: Number, default: 0 }, // For farmer of the week

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
