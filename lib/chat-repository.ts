import { and, asc, eq, or, sql } from "drizzle-orm";
import db from "./supabase/db";
import {
  eventRsvps,
  events,
  groupChats,
  messages,
  users,
} from "./supabase/schema";

type Viewer = { id: string; role: string };

export async function listChats(viewer: Viewer) {
  return db
    .select({
      id: groupChats.id,
      eventId: groupChats.eventId,
      title: events.title,
      attendees: sql<number>`(select count(*)::int from ${eventRsvps} r where r.event_id = ${events.id})`,
      lastMessage: sql<
        string | null
      >`(select content from ${messages} m where m.chat_id = ${groupChats.id} order by m.sent_at desc limit 1)`,
    })
    .from(groupChats)
    .innerJoin(events, eq(groupChats.eventId, events.id))
    .leftJoin(
      eventRsvps,
      and(eq(eventRsvps.eventId, events.id), eq(eventRsvps.userId, viewer.id)),
    )
    .where(
      viewer.role === "admin"
        ? undefined
        : or(
            eq(events.organizerID, viewer.id),
            eq(eventRsvps.userId, viewer.id),
          ),
    );
}

export async function canAccessChat(chatId: string, viewer: Viewer) {
  const [chat] = await db
    .select({
      id: groupChats.id,
      adminOnly: groupChats.adminOnly,
      organizerId: events.organizerID,
      attendeeId: eventRsvps.userId,
    })
    .from(groupChats)
    .innerJoin(events, eq(groupChats.eventId, events.id))
    .leftJoin(
      eventRsvps,
      and(eq(eventRsvps.eventId, events.id), eq(eventRsvps.userId, viewer.id)),
    )
    .where(eq(groupChats.id, chatId))
    .limit(1);
  if (!chat) return false;
  return (
    viewer.role === "admin" ||
    chat.organizerId === viewer.id ||
    (!chat.adminOnly && chat.attendeeId === viewer.id)
  );
}

export async function listMessages(chatId: string) {
  return db
    .select({
      id: messages.id,
      body: messages.content,
      sentAt: messages.sentAt,
      senderId: messages.senderId,
      sender: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.sentAt))
    .limit(200);
}
