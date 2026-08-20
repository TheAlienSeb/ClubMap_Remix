import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listEvents } from "@/lib/event-repository";
import db from "@/lib/supabase/db";
import { events, groupChats, organizers } from "@/lib/supabase/schema";
import {
  localCreateEvent,
  localListEvents,
  localMode,
} from "@/lib/local-store";

export async function GET() {
  try {
    const session = await auth();
    const viewer = session?.user?.id
      ? {
          id: session.user.id,
          universityVerified: session.user.universityVerified,
        }
      : undefined;
    if (localMode) return NextResponse.json(await localListEvents(viewer));
    return NextResponse.json(await listEvents(viewer));
  } catch (error) {
    console.error("Unable to list events", error);
    return NextResponse.json(
      { error: "Events are temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["organizer", "admin"].includes(session.user.role))
    return NextResponse.json(
      { error: "Organizer access required." },
      { status: 403 },
    );
  const body = await request.json();
  if (
    !body.title ||
    !body.description ||
    !body.location ||
    !body.startsAt ||
    !Number.isFinite(Number(body.latitude)) ||
    !Number.isFinite(Number(body.longitude))
  )
    return NextResponse.json(
      { error: "Missing required event details." },
      { status: 400 },
    );
  if (localMode)
    return NextResponse.json(
      await localCreateEvent(body, {
        id: session.user.id,
        name: session.user.name || "Organizer",
      }),
      { status: 201 },
    );
  await db
    .insert(organizers)
    .values({
      userId: session.user.id,
      description: "ClubMap organizer",
      images: "",
      website: "",
    })
    .onConflictDoNothing();
  const [event] = await db
    .insert(events)
    .values({
      title: body.title,
      description: body.description,
      location: body.location,
      startDate: new Date(body.startsAt),
      endDate: new Date(body.endsAt || body.startsAt),
      visibility: body.visibility || "campus",
      imageUrl: body.imageUrl || null,
      capacity: Number(body.capacity || 100),
      organizerID: session.user.id,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
    })
    .returning();
  await db.insert(groupChats).values({ eventId: event.id });
  return NextResponse.json(event, { status: 201 });
}
