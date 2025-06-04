import { boolean, date, doublePrecision, integer, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { pgEnum, pgTable} from "drizzle-orm/pg-core";


export const rolesEnum = pgEnum('roles', ['guest','user','organizer','admin'])

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'string'
    }),
    firstName: varchar("first_name", { length: 256 }).notNull(),
    lastName: varchar("last_name", { length: 256 }).notNull(),
    email: varchar('email',{ length: 320 }).notNull(),
    role: rolesEnum().notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull()
    },
    (table) => [
        uniqueIndex("email_idx").on(table.email)
    ]
)
export const organizers = pgTable("organizers", {
    userId: uuid("user_id").primaryKey().references(() => users.id, {
        onDelete: "cascade"
    }).notNull(),
    description: text("description").notNull(),
    images: text("images").notNull(),
    website: varchar('website', { length: 512 }).notNull(),
  });


export const events = pgTable(
    'events', {
        id:  uuid('event_id').defaultRandom().primaryKey(),
        title: text('title').notNull(),
        description: text('description').notNull(),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'string'
        }),
        startDate: date('start_date').notNull(),
        endDate: date('end_date').notNull(),
        rsvp: integer().default(0).notNull(),
        private: boolean().default(false).notNull(),
        organizerID: uuid('organizer_id').references(() => organizers.userId, {
            onDelete: "cascade"
        }),
        latitude: doublePrecision('event_latitude').notNull(),
        longitude: doublePrecision('event_longitude').notNull()
    })

export const groupChats = pgTable("group_chats", {
    id: uuid("id").primaryKey(),
    eventId: uuid("event_id").unique().references(() => events.id, {
        onDelete: "cascade"
    }).notNull(),
    adminOnly: boolean().default(true).notNull()
    // add other metadata if needed
    });

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey(),
    chatId: uuid("chat_id").references(() => groupChats.id, {
        onDelete: "cascade"
    }).notNull(),
    senderId: uuid("sender_id").references(() => users.id, {
        onDelete: "cascade"
    }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
    content: text("content").notNull(),
    });

