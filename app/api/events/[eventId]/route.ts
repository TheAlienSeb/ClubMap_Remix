import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEvent } from "@/lib/event-repository";
import { localGetEvent, localMode } from "@/lib/local-store";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const session = await auth();
  const viewer = session?.user?.id
    ? {
        id: session.user.id,
        universityVerified: session.user.universityVerified,
      }
    : undefined;
  const event = localMode
    ? await localGetEvent(eventId, viewer)
    : await getEvent(eventId, viewer);
  return event
    ? NextResponse.json(event)
    : NextResponse.json({ error: "Event not found." }, { status: 404 });
}
