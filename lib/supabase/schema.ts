import {
  boolean,
  doublePrecision,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", [
  "guest",
  "user",
  "organizer",
  "admin",
]);
export const visibilityEnum = pgEnum("visibility", [
  "public",
  "campus",
  "members",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }),
    firstName: varchar("first_name", { length: 256 }).notNull(),
    lastName: varchar("last_name", { length: 256 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: rolesEnum().notNull(),
    universityVerified: boolean("university_verified").default(false).notNull(),
    latitude: doublePrecision("latitude").default(0).notNull(),
    longitude: doublePrecision("longitude").default(0).notNull(),
  },
  (table) => [uniqueIndex("email_idx").on(table.email)],
);
export const organizers = pgTable("organizers", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  description: text("description").notNull(),
  images: text("images").notNull(),
  website: varchar("website", { length: 512 }).notNull(),
});

export const events = pgTable("events", {
  id: uuid("event_id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  rsvp: integer().default(0).notNull(),
  private: boolean().default(false).notNull(),
  visibility: visibilityEnum().default("public").notNull(),
  imageUrl: text("image_url"),
  capacity: integer("capacity").default(100).notNull(),
  organizerID: uuid("organizer_id").references(() => organizers.userId, {
    onDelete: "cascade",
  }),
  latitude: doublePrecision("event_latitude").notNull(),
  longitude: doublePrecision("event_longitude").notNull(),
});

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    eventId: uuid("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("event_user_rsvp_idx").on(table.eventId, table.userId),
  ],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const groupChats = pgTable("group_chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .unique()
    .references(() => events.id, {
      onDelete: "cascade",
    })
    .notNull(),
  adminOnly: boolean().default(false).notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => groupChats.id, {
      onDelete: "cascade",
    })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  content: text("content").notNull(),
});
