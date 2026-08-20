import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const expiresAt = Date.now() + 5 * 60_000;
  const payload = Buffer.from(
    JSON.stringify({
      sub: session.user.id,
      exp: expiresAt,
      type: "clubmap-checkin",
    }),
  ).toString("base64url");
  const signature = createHmac(
    "sha256",
    process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "clubmap-development-secret-change-me",
  )
    .update(payload)
    .digest("base64url");
  return NextResponse.json({
    token: `${payload}.${signature}`,
    expiresAt,
    name: session.user.name,
    email: session.user.email,
  });
}
