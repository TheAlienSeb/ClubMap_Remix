import { and, eq, inArray, sql } from "drizzle-orm";
import db from "./supabase/db";
import { eventRsvps, events, organizers, users } from "./supabase/schema";

type Viewer = { id: string; universityVerified: boolean };

export async function listEvents(user?: Viewer) {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startsAt: events.startDate,
      endsAt: events.endDate,
      location: events.location,
      latitude: events.latitude,
      longitude: events.longitude,
      visibility: events.visibility,
      capacity: events.capacity,
      attendees: sql<number>`count(${eventRsvps.userId})::int`,
      image: events.imageUrl,
      organizerId: events.organizerID,
      organizerName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(events)
    .leftJoin(organizers, eq(events.organizerID, organizers.userId))
    .leftJoin(users, eq(organizers.userId, users.id))
    .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
    .groupBy(events.id, users.id);
  const allowed = rows.filter(
    (event) => event.visibility === "public" || user?.universityVerified,
  );
  const joined =
    user && allowed.length
      ? await db
          .select({ eventId: eventRsvps.eventId })
          .from(eventRsvps)
          .where(
            and(
              eq(eventRsvps.userId, user.id),
              inArray(
                eventRsvps.eventId,
                allowed.map((event) => event.id),
              ),
            ),
          )
      : [];
  const rsvps = new Set(joined.map((item) => item.eventId));
  return allowed.map((event) => ({
    ...event,
    image: event.image || "/images.jpeg",
    organizerName: event.organizerName || "Campus organization",
    isRsvped: rsvps.has(event.id),
  }));
}

export async function getEvent(id: string, user?: Viewer) {
  return (await listEvents(user)).find((event) => event.id === id);
}
