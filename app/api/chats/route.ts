import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listChats } from "@/lib/chat-repository";
import { localListChats, localMode } from "@/lib/local-store";
export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const viewer = { id: session.user.id, role: session.user.role };
  return NextResponse.json(
    localMode ? await localListChats(viewer) : await listChats(viewer),
  );
}
