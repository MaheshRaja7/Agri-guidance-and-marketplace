import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import { AuthService } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const paramsResolved = await Promise.resolve(params);

        const deletedProduct = await Product.findOneAndDelete({
            _id: paramsResolved.id,
            farmerId: decoded.userId
        });

        if (!deletedProduct) {
            return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const token = AuthService.extractTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = AuthService.verifyToken(token);
        if (!decoded || decoded.userType !== "farmer") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const paramsResolved = await Promise.resolve(params);
        const body = await request.json();
        
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: paramsResolved.id, farmerId: decoded.userId },
            body,
            { new: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
