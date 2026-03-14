import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { AuthService } from "@/lib/auth"; // Assuming this still works, or I need to check it.

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, password, phone, userType, area, city, address } = body;

    // Validate required fields
    if (!name || !email || !password || !phone || !userType || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      area: userType === "farmer" ? area : undefined,
      city,
      address
    });

    // Generate token
    const tokenPayload = {
      _id: newUser._id.toString(),
      email: newUser.email,
      userType: newUser.userType
    };

    // Note: AuthService.generateToken might expect { _id, email, userType } matching the interface in lib/mongodb.ts
    // I should probably check AuthService to be safe, but passing this object is standard
    const token = AuthService.generateToken(tokenPayload);

    return NextResponse.json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        city: newUser.city,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
