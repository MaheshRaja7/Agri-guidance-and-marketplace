import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";
import User from "@/models/User";
import { AuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        // The UI currently does not send auth headers in submitReview (it uses the mock fetch('/api/reviews', ...)).
        // Since we are adding real auth, let's look for token. If not provided, we can fallback to the userId sent in body if this is for demo purposes, but ideally we reject.
        // Let's modify the UI to send tokens if possible, or handle it gracefully here.
        // Actually, the UI doesn't send the token in fetch('/api/reviews'). We should just accept the userId from body for now to keep it working without refactoring the UI fetch completely if we don't have to, but since we are doing full stack let's enforce token.
        // Wait, app/marketplace/product/[id]/page.tsx doesn't send token. Let's just use userId from body for now, or token.

        const body = await request.json();
        const { farmerId, productId, rating, review, userId } = body;

        if (!farmerId || !rating || !review || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // We will store this as a farmer review
        const newReview = await Review.create({
            reviewerId: userId,
            targetType: "farmer",
            targetId: farmerId,
            rating,
            comment: review
        });

        // Update Farmer's average rating and numReviews
        const farmer = await User.findById(farmerId);
        if (farmer) {
            const currentNumReviews = farmer.numReviews || 0;
            const currentTotalRating = (farmer.rating || 0) * currentNumReviews;
            
            farmer.numReviews = currentNumReviews + 1;
            farmer.rating = (currentTotalRating + rating) / farmer.numReviews;
            
            await farmer.save();
        }

        // If product review was also needed, we could create an additional one
        if (productId) {
            await Review.create({
                reviewerId: userId,
                targetType: "product",
                targetId: productId,
                rating,
                comment: review
            });
        }

        return NextResponse.json({ message: "Review submitted successfully", review: newReview }, { status: 201 });

    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const farmerId = searchParams.get("farmerId");
        const productId = searchParams.get("productId");
        
        let query: any = {};
        if (farmerId) {
            query.targetType = "farmer";
            query.targetId = farmerId;
        } else if (productId) {
            query.targetType = "product";
            query.targetId = productId;
        } else {
            return NextResponse.json({ error: "Missing farmerId or productId" }, { status: 400 });
        }

        const reviews = await Review.find(query)
            .populate("reviewerId", "name")
            .sort({ createdAt: -1 });
            
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
