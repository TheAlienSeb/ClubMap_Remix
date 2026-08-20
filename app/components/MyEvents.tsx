"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, LoaderCircle, MapPin, Search } from "lucide-react";
type Event = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  visibility: string;
  image: string;
  organizerName: string;
  isRsvped: boolean;
};
export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  useEffect(() => {
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : []))
      .then((all) => setEvents(all.filter((event: Event) => event.isRsvped)))
      .finally(() => setLoading(false));
  }, []);
  const mine = events.filter((event) =>
    event.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="content-page">
      <header className="content-header">
        <div>
          <p>YOUR CALENDAR</p>
          <h1>My events</h1>
          <span>Everything you’ve said yes to, all in one place.</span>
        </div>
        <label className="mini-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your events"
          />
        </label>
      </header>
      {loading ? (
        <div className="large-empty">
          <LoaderCircle className="spin" />
        </div>
      ) : mine.length ? (
        <div className="event-grid">
          {mine.map((event) => (
            <Link
              href={`/events/${event.id}`}
              className="event-tile"
              key={event.id}
            >
              <div
                className="tile-image"
                style={{
                  backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,.9)),url(${event.image})`,
                }}
              >
                <span>{event.visibility}</span>
                <div>
                  <p>{event.organizerName}</p>
                  <h2>{event.title}</h2>
                </div>
              </div>
              <div className="tile-details">
                <span>
                  <CalendarCheck />
                  {new Date(event.startsAt).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                  })}
                </span>
                <span>
                  <MapPin />
                  {event.location}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="large-empty">
          <CalendarCheck />
          <h2>Your calendar is wide open</h2>
          <p>RSVP to an event and it will appear here.</p>
          <Link href="/user/me/MyMap" className="primary-button">
            Explore the map
          </Link>
        </div>
      )}
    </div>
  );
}
