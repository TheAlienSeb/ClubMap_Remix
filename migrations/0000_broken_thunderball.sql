CREATE TYPE "public"."roles" AS ENUM('guest', 'user', 'organizer', 'admin');--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"rsvp" integer DEFAULT 0 NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"organizer_id" uuid,
	"event_latitude" double precision NOT NULL,
	"event_longitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_chats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"adminOnly" boolean DEFAULT true NOT NULL,
	CONSTRAINT "group_chats_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chat_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"images" text NOT NULL,
	"website" varchar(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" "roles" NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_organizers_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_chats" ADD CONSTRAINT "group_chats_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_group_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."group_chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");