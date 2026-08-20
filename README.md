# ClubMap

ClubMap is a map-centered campus discovery platform that brings student
organizations, events, locations, RSVPs, event conversations, and check-in
passes into one application.

The current interface uses ClubMap's original black and grayscale design, with
the map serving as the primary discovery surface instead of a secondary panel.

## Features

### Map-centered event discovery

- Full-screen Mapbox campus map using the dark map style
- Precise geographic markers anchored to each event's latitude and longitude
- Larger accessible marker hit areas without changing the mapped coordinate
- Hover and keyboard-focus previews with event, organization, time, and
  attendance information
- Direct marker click-through to `/events/[eventId]`
- Event and location search directly over the map
- Browser geolocation and standard Mapbox navigation controls
- Automatic map bounds based on the currently visible events
- Loading, empty, configuration, and map-error states

### Events and organizations

- Standalone event detail pages
- Event date, time, location, capacity, visibility, organizer, cover media, and
  attendee count
- Public, university-only, and organization-member visibility levels
- Authenticated RSVP creation and cancellation
- Database-backed **My Events** calendar
- Organizer event publishing with coordinates and Supabase media uploads
- Automatic group-chat creation when an event is published

### Authentication and authorization

- NextAuth credentials-based sessions
- Password hashing with Node's `scrypt` implementation
- Student registration and login at `/login`
- Dedicated organizer and administrator login at `/admin/login`
- Guest, student, organizer, and administrator access levels
- University-email verification support
- Organizer/admin checks on protected event and upload APIs
- Attendee and organizer access checks on event conversations
- Optional bootstrap administrator configured through the environment

### Event conversations

- Conversations generated from actual events rather than static examples
- Chats available to RSVPed attendees, event organizers, and administrators
- Persisted sender identity, message content, and timestamps
- Latest-message conversation previews
- Automatic active-chat refresh
- Real loading, empty, access-denied, and error states
- 2,000-character server-side message limit

### Digital campus pass

- Modern responsive QR pass interface
- Short-lived, signed check-in tokens tied to the authenticated user
- Five-minute token rotation and visible expiration countdown
- Manual pass refresh
- User identity and university-verification display
- Step-by-step event check-in instructions

### Organizer and administrator tools

- Role-restricted management navigation and dashboard
- Event creation with title, description, schedule, location, coordinates,
  capacity, visibility, and cover image
- Local file uploads during development
- Supabase Storage uploads in database-backed environments
- Organizer records and event-chat creation handled automatically
- Administrative overview and moderation-ready role infrastructure

## Technology

- Next.js 15 App Router and React 19
- TypeScript
- Mapbox GL JS
- NextAuth 5
- PostgreSQL with Drizzle ORM and Drizzle Kit
- Supabase Storage
- Tailwind CSS and custom responsive CSS
- `next-qrcode`
- Lucide icons
- ESLint and Prettier

## Local development without a database

No PostgreSQL instance or migration is required for local testing.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Development mode automatically uses a file-backed store. Local users, events,
RSVPs, conversations, and messages persist in:

```text
.clubmap/local-data.json
```

Local event images are stored under `public/uploads/`. Both locations are
excluded from Git.

A Mapbox token is still required to render the interactive map. Add it to
`.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
AUTH_SECRET=your-local-random-secret
```

### Included local accounts

| Access        | Email                  | Password      |
| ------------- | ---------------------- | ------------- |
| Administrator | `admin@clubmap.test`   | `Admin123!`   |
| Student       | `student@clubmap.test` | `Student123!` |

The initial local student is RSVPed to a starter event, allowing the map,
event-detail, My Events, and conversation workflows to be tested immediately.

To reset local data, stop the development server, delete
`.clubmap/local-data.json`, and restart the app.

To explicitly test against PostgreSQL during development, set:

```env
CLUBMAP_LOCAL_MODE=false
```

## PostgreSQL and Supabase setup

Copy `.env.example` to `.env.local` and configure the required services:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres
CLUBMAP_LOCAL_MODE=false
AUTH_SECRET=replace-with-a-random-32-byte-secret
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
UNIVERSITY_EMAIL_DOMAIN=.edu
CLUBMAP_BOOTSTRAP_ADMIN_EMAIL=admin@university.edu
```

Create a public Supabase Storage bucket named `event-media`, then apply the
schema:

```bash
npm run migrate
```

The migration adds:

- Password hashes and university-verification state
- Event locations, timestamps, visibility, capacity, and media URLs
- RSVP records with event/user uniqueness
- Notification records
- Group-chat and message defaults
- Chats for events that existed before the migration

The email configured as `CLUBMAP_BOOTSTRAP_ADMIN_EMAIL` receives the `admin`
role when that account is registered.

### Optional database test accounts

After migrating a non-production development database, the same test accounts
can be inserted with:

```bash
npm run seed:test-users
```

The seed script hashes both passwords, safely upserts the users, creates the
administrator's organizer record, and refuses to run when
`NODE_ENV=production`.

## Application routes

| Route                   | Purpose                               |
| ----------------------- | ------------------------------------- |
| `/`                     | Public map discovery                  |
| `/login`                | Student login and registration        |
| `/admin/login`          | Organizer and administrator login     |
| `/events/[eventId]`     | Individual event details and RSVP     |
| `/user/[id]/MyMap`      | Auth-aware map discovery              |
| `/user/[id]/MyEvents`   | The signed-in user's RSVPs            |
| `/user/[id]/GroupChats` | Event conversations                   |
| `/user/[id]/QR`         | Rotating digital campus pass          |
| `/user/[id]/Profile`    | Identity, verification, and sign-out  |
| `/user/[id]/Admin`      | Organizer and administrator dashboard |

## API routes

| Endpoint                       | Methods       | Purpose                                 |
| ------------------------------ | ------------- | --------------------------------------- |
| `/api/auth/[...nextauth]`      | NextAuth      | Sessions and credentials authentication |
| `/api/auth/register`           | `POST`        | Student registration                    |
| `/api/events`                  | `GET`, `POST` | Discover or publish events              |
| `/api/events/[eventId]`        | `GET`         | Retrieve one authorized event           |
| `/api/events/[eventId]/rsvp`   | `POST`        | Toggle the current user's RSVP          |
| `/api/chats`                   | `GET`         | Retrieve accessible event conversations |
| `/api/chats/[chatId]/messages` | `GET`, `POST` | Read or send persisted messages         |
| `/api/passes/me`               | `GET`         | Generate a signed short-lived QR token  |
| `/api/uploads`                 | `POST`        | Upload organizer event media            |

## Scripts

| Command                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `npm run dev`             | Start the Turbopack development server            |
| `npm run build`           | Create a production build and run type validation |
| `npm start`               | Start the production server                       |
| `npm run lint`            | Run ESLint over the repository                    |
| `npm run migrate`         | Apply Drizzle migrations                          |
| `npm run generate`        | Generate a Drizzle migration                      |
| `npm run seed:test-users` | Seed development-only test accounts               |

For direct formatting checks:

```bash
npm exec prettier -- --check "app/**/*.{ts,tsx,css}" "lib/**/*.{ts,tsx}"
```

## Data architecture

Production uses PostgreSQL as the source of truth for users, organizers,
events, RSVPs, chats, messages, and notifications. Server-side repositories
apply visibility and membership rules before returning data to the browser.

Development uses the same API contracts through a JSON-backed adapter. This
keeps local testing migration-free without introducing client-side hardcoded
state or maintaining a separate UI implementation.

## Security notes

- Production should always provide a strong `AUTH_SECRET`.
- `SERVICE_ROLE_KEY` is read only by the server-side upload route and must never
  use a `NEXT_PUBLIC_` prefix.
- QR passes contain a signed, expiring payload rather than a reusable user ID.
- Test credentials are development-only and should not be seeded in production.
- API authorization is enforced server-side; hiding navigation items is not
  treated as a security boundary.
