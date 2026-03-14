import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    cookie: request.headers.get("cookie"),
    authorization: request.headers.get("authorization"),
  });
}
