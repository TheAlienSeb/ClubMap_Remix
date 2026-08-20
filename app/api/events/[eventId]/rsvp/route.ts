import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import db from "@/lib/supabase/db";
import { eventRsvps } from "@/lib/supabase/schema";
import { localMode, localToggleRsvp } from "@/lib/local-store";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Sign in to RSVP." }, { status: 401 });
  const { eventId } = await params;
  if (localMode)
    return NextResponse.json({
      isRsvped: await localToggleRsvp(eventId, session.user.id),
    });
  const [existing] = await db
    .select()
    .from(eventRsvps)
    .where(
      and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, session.user.id),
      ),
    )
    .limit(1);
  if (existing) {
    await db
      .delete(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, session.user.id),
        ),
      );
    return NextResponse.json({ isRsvped: false });
  }
  await db
    .insert(eventRsvps)
    .values({ eventId, userId: session.user.id })
    .onConflictDoNothing();
  return NextResponse.json({ isRsvped: true });
}
