import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import ChatSession from "../../../../models/ChatSession";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "anonymous";

    const sessions = await ChatSession.find({ userId })
      .select("sessionId title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Sessions list error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId } = body;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = new ChatSession({
      sessionId,
      userId: userId || "anonymous",
      title: "New Chat",
      messages: [],
    });
    await session.save();

    return NextResponse.json({
      sessionId: session.sessionId,
      title: session.title,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
