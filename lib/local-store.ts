import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./password";

type LocalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "user" | "organizer" | "admin";
  universityVerified: boolean;
};
type LocalEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  visibility: "public" | "campus" | "members";
  capacity: number;
  image: string;
  organizerId: string;
  organizerName: string;
  latitude: number;
  longitude: number;
};
type LocalMessage = {
  id: string;
  chatId: string;
  senderId: string;
  sender: string;
  body: string;
  sentAt: string;
};
type Store = {
  users: LocalUser[];
  events: LocalEvent[];
  rsvps: { eventId: string; userId: string }[];
  chats: { id: string; eventId: string }[];
  messages: LocalMessage[];
};
const directory = path.join(process.cwd(), ".clubmap");
const filename = path.join(directory, "local-data.json");

async function initialStore(): Promise<Store> {
  const adminId = randomUUID();
  const studentId = randomUUID();
  const eventId = randomUUID();
  return {
    users: [
      {
        id: adminId,
        firstName: "ClubMap",
        lastName: "Admin",
        email: "admin@clubmap.test",
        passwordHash: await hashPassword("Admin123!"),
        role: "admin",
        universityVerified: true,
      },
      {
        id: studentId,
        firstName: "Test",
        lastName: "Student",
        email: "student@clubmap.test",
        passwordHash: await hashPassword("Student123!"),
        role: "user",
        universityVerified: true,
      },
    ],
    events: [
      {
        id: eventId,
        title: "Welcome to ClubMap",
        description:
          "A local event for testing map markers, event details, RSVPs, and group chat functionality.",
        location: "Campus Center",
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        endsAt: new Date(Date.now() + 90_000_000).toISOString(),
        visibility: "public",
        capacity: 100,
        image: "/images.jpeg",
        organizerId: adminId,
        organizerName: "ClubMap Admin",
        latitude: 40.7308,
        longitude: -73.9973,
      },
    ],
    rsvps: [{ eventId, userId: studentId }],
    chats: [{ id: randomUUID(), eventId }],
    messages: [],
  };
}
export const localMode =
  process.env.CLUBMAP_LOCAL_MODE === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.CLUBMAP_LOCAL_MODE !== "false");
async function read(): Promise<Store> {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch {
    await mkdir(directory, { recursive: true });
    const data = await initialStore();
    await writeFile(filename, JSON.stringify(data, null, 2));
    return data;
  }
}
async function save(data: Store) {
  await mkdir(directory, { recursive: true });
  await writeFile(filename, JSON.stringify(data, null, 2));
}
export async function localAuthenticate(email: string, password: string) {
  const data = await read();
  const user = data.users.find((item) => item.email === email);
  return user && (await verifyPassword(password, user.passwordHash))
    ? user
    : null;
}
export async function localRegister(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const data = await read();
  if (data.users.some((user) => user.email === input.email))
    throw new Error("EXISTS");
  const user: LocalUser = {
    id: randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: "user",
    universityVerified: input.email.endsWith(".edu"),
  };
  data.users.push(user);
  await save(data);
  return user;
}
export async function localListEvents(user?: {
  id: string;
  universityVerified: boolean;
}) {
  const data = await read();
  return data.events
    .filter(
      (event) => event.visibility === "public" || user?.universityVerified,
    )
    .map((event) => ({
      ...event,
      attendees: data.rsvps.filter((rsvp) => rsvp.eventId === event.id).length,
      isRsvped: Boolean(
        user &&
        data.rsvps.some(
          (rsvp) => rsvp.eventId === event.id && rsvp.userId === user.id,
        ),
      ),
    }));
}
export async function localGetEvent(
  id: string,
  user?: { id: string; universityVerified: boolean },
) {
  return (await localListEvents(user)).find((event) => event.id === id);
}
export async function localCreateEvent(
  body: Record<string, unknown>,
  user: { id: string; name: string },
) {
  const data = await read();
  const event: LocalEvent = {
    id: randomUUID(),
    title: String(body.title),
    description: String(body.description),
    location: String(body.location),
    startsAt: String(body.startsAt),
    endsAt: String(body.endsAt || body.startsAt),
    visibility: (body.visibility || "campus") as LocalEvent["visibility"],
    capacity: Number(body.capacity || 100),
    image: String(body.imageUrl || "/images.jpeg"),
    organizerId: user.id,
    organizerName: user.name,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
  };
  data.events.push(event);
  data.chats.push({ id: randomUUID(), eventId: event.id });
  await save(data);
  return event;
}
export async function localToggleRsvp(eventId: string, userId: string) {
  const data = await read();
  const index = data.rsvps.findIndex(
    (item) => item.eventId === eventId && item.userId === userId,
  );
  const isRsvped = index < 0;
  if (isRsvped) data.rsvps.push({ eventId, userId });
  else data.rsvps.splice(index, 1);
  await save(data);
  return isRsvped;
}
export async function localListChats(user: { id: string; role: string }) {
  const data = await read();
  return data.chats
    .filter((chat) => {
      const event = data.events.find((item) => item.id === chat.eventId);
      return (
        user.role === "admin" ||
        event?.organizerId === user.id ||
        data.rsvps.some(
          (rsvp) => rsvp.eventId === chat.eventId && rsvp.userId === user.id,
        )
      );
    })
    .map((chat) => {
      const event = data.events.find((item) => item.id === chat.eventId)!;
      const latest = data.messages
        .filter((message) => message.chatId === chat.id)
        .at(-1);
      return {
        id: chat.id,
        eventId: event.id,
        title: event.title,
        attendees: data.rsvps.filter((rsvp) => rsvp.eventId === event.id)
          .length,
        lastMessage: latest?.body || null,
      };
    });
}
export async function localCanAccessChat(
  chatId: string,
  user: { id: string; role: string },
) {
  return (await localListChats(user)).some((chat) => chat.id === chatId);
}
export async function localListMessages(chatId: string, userId: string) {
  const data = await read();
  return data.messages
    .filter((message) => message.chatId === chatId)
    .map((message) => ({ ...message, mine: message.senderId === userId }));
}
export async function localSendMessage(
  chatId: string,
  body: string,
  user: { id: string; name: string },
) {
  const data = await read();
  const message: LocalMessage = {
    id: randomUUID(),
    chatId,
    senderId: user.id,
    sender: user.name,
    body,
    sentAt: new Date().toISOString(),
  };
  data.messages.push(message);
  await save(data);
  return { ...message, mine: true };
}
