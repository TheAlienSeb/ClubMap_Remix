import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessChat, listMessages } from "@/lib/chat-repository";
import db from "@/lib/supabase/db";
import { messages } from "@/lib/supabase/schema";
import {
  localCanAccessChat,
  localListMessages,
  localMode,
  localSendMessage,
} from "@/lib/local-store";
async function viewer() {
  const session = await auth();
  return session?.user
    ? { session, user: { id: session.user.id, role: session.user.role } }
    : null;
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const current = await viewer();
  if (!current)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { chatId } = await params;
  if (localMode) {
    if (!(await localCanAccessChat(chatId, current.user)))
      return NextResponse.json(
        { error: "Chat access denied." },
        { status: 403 },
      );
    return NextResponse.json(await localListMessages(chatId, current.user.id));
  }
  if (!(await canAccessChat(chatId, current.user)))
    return NextResponse.json({ error: "Chat access denied." }, { status: 403 });
  return NextResponse.json(
    (await listMessages(chatId)).map((message) => ({
      ...message,
      mine: message.senderId === current.user.id,
    })),
  );
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const current = await viewer();
  if (!current)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { chatId } = await params;
  if (localMode) {
    if (!(await localCanAccessChat(chatId, current.user)))
      return NextResponse.json(
        { error: "Chat access denied." },
        { status: 403 },
      );
    const body = String((await request.json()).body || "").trim();
    if (!body || body.length > 2000)
      return NextResponse.json(
        { error: "Messages must be between 1 and 2,000 characters." },
        { status: 400 },
      );
    return NextResponse.json(
      await localSendMessage(chatId, body, {
        id: current.user.id,
        name: current.session.user.name || "You",
      }),
      { status: 201 },
    );
  }
  if (!(await canAccessChat(chatId, current.user)))
    return NextResponse.json({ error: "Chat access denied." }, { status: 403 });
  const body = String((await request.json()).body || "").trim();
  if (!body || body.length > 2000)
    return NextResponse.json(
      { error: "Messages must be between 1 and 2,000 characters." },
      { status: 400 },
    );
  const [message] = await db
    .insert(messages)
    .values({ chatId, senderId: current.user.id, content: body })
    .returning({
      id: messages.id,
      body: messages.content,
      sentAt: messages.sentAt,
      senderId: messages.senderId,
    });
  return NextResponse.json(
    { ...message, sender: current.session.user.name || "You" },
    { status: 201 },
  );
}
