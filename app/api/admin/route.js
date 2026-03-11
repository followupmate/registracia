import { NextResponse } from "next/server";

export async function POST(request) {
  const { pin } = await request.json();
  const adminPin = process.env.ADMIN_PIN || "6702";

  if (pin === adminPin) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
