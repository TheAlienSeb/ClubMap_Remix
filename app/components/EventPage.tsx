"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Share2,
  UsersRound,
} from "lucide-react";
import { useClubMap } from "./AppProvider";
type EventDetail = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  visibility: string;
  capacity: number;
  attendees: number;
  image: string;
  organizerName: string;
  isRsvped: boolean;
};
export default function EventPage({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  const { toggleRsvp, authenticated } = useClubMap();
  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error);
        return response.json();
      })
      .then(setEvent)
      .catch((reason) => setError(reason.message));
  }, [eventId]);
  if (error)
    return (
      <div className="large-empty">
        <h2>{error}</h2>
        <Link href="/user/me/MyMap">Back to map</Link>
      </div>
    );
  if (!event)
    return (
      <div className="large-empty">
        <LoaderCircle className="spin" />
        <p>Loading event…</p>
      </div>
    );
  async function rsvp() {
    const joined = await toggleRsvp(event!.id);
    setEvent((current) =>
      current
        ? {
            ...current,
            isRsvped: joined,
            attendees: current.attendees + (joined ? 1 : -1),
          }
        : current,
    );
  }
  return (
    <div className="event-detail">
      <Link href="/user/me/MyMap" className="back-link">
        <ArrowLeft />
        Back to map
      </Link>
      <div
        className="event-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.96) 10%,rgba(0,0,0,.2)),url(${event.image})`,
        }}
      >
        <div>
          <span className="event-category">{event.visibility} event</span>
          <h1>{event.title}</h1>
          <p>
            Hosted by <b>{event.organizerName}</b>
          </p>
        </div>
      </div>
      <div className="detail-layout">
        <article className="detail-copy">
          <h2>About this event</h2>
          <p>{event.description}</p>
          <h2>Hosted by</h2>
          <div className="club-summary">
            <div>{event.organizerName.slice(0, 2).toUpperCase()}</div>
            <span>
              <b>{event.organizerName}</b>
              <p>Verified campus organization</p>
            </span>
          </div>
        </article>
        <aside className="rsvp-card">
          <div className="detail-row">
            <CalendarDays />
            <span>
              <b>
                {new Date(event.startsAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </b>
              <small>
                {new Date(event.startsAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </small>
            </span>
          </div>
          <div className="detail-row">
            <MapPin />
            <span>
              <b>{event.location}</b>
              <small>Shown precisely on the campus map</small>
            </span>
          </div>
          <div className="detail-row">
            <UsersRound />
            <span>
              <b>{event.attendees} attending</b>
              <small>
                {Math.max(0, event.capacity - event.attendees)} spots remaining
              </small>
            </span>
          </div>
          {event.visibility !== "public" && (
            <div className="restricted-label">
              <LockKeyhole />
              University access required
            </div>
          )}
          <button
            onClick={rsvp}
            className={`rsvp-button ${event.isRsvped ? "joined" : ""}`}
          >
            {event.isRsvped ? (
              <>
                <Check />
                You’re going
              </>
            ) : authenticated ? (
              "RSVP to this event"
            ) : (
              "Sign in to RSVP"
            )}
          </button>
          <button
            className="share-button"
            onClick={() =>
              navigator.share?.({ title: event.title, url: location.href })
            }
          >
            <Share2 />
            Share event
          </button>
        </aside>
      </div>
    </div>
  );
}
