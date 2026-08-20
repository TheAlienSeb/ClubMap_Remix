"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import {
  CalendarDays,
  LoaderCircle,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Search,
  UsersRound,
} from "lucide-react";

type MapEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  latitude: number;
  longitude: number;
  visibility: "public" | "campus" | "members";
  attendees: number;
  organizerName: string;
  image: string;
};

export default function MapView() {
  const router = useRouter();
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const visible = useMemo(
    () =>
      events.filter((event) =>
        `${event.title} ${event.organizerName} ${event.location}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [events, query],
  );
  useEffect(() => {
    fetch("/api/events")
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error);
        return response.json();
      })
      .then(setEvents)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !container.current || map.current) return;
    mapboxgl.accessToken = token;
    const instance = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-73.9955, 40.7304],
      zoom: 14.5,
      attributionControl: false,
    });
    map.current = instance;
    instance.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    instance.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "bottom-right",
    );
    instance.on("error", () => setError("The campus map could not be loaded."));
    return () => {
      markers.current.forEach((marker) => marker.remove());
      instance.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = visible
      .filter(
        (event) =>
          Number.isFinite(event.longitude) && Number.isFinite(event.latitude),
      )
      .map((event) => {
        const button = document.createElement("button");
        button.className = "precise-event-marker";
        button.type = "button";
        button.setAttribute("aria-label", `Open ${event.title}`);
        const dot = document.createElement("span");
        button.appendChild(dot);
        const content = document.createElement("article");
        content.className = "marker-popover";
        const eyebrow = document.createElement("small");
        eyebrow.textContent = event.organizerName;
        const title = document.createElement("strong");
        title.textContent = event.title;
        const meta = document.createElement("span");
        meta.textContent = `${new Date(event.startsAt).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })} · ${event.attendees} going`;
        content.append(eyebrow, title, meta);
        const popup = new mapboxgl.Popup({
          offset: 28,
          closeButton: false,
          closeOnClick: false,
          className: "event-map-popup",
        }).setDOMContent(content);
        const marker = new mapboxgl.Marker({
          element: button,
          anchor: "bottom",
        })
          .setLngLat([event.longitude, event.latitude])
          .setPopup(popup)
          .addTo(instance);
        button.addEventListener("mouseenter", () => popup.addTo(instance));
        button.addEventListener("mouseleave", () => popup.remove());
        button.addEventListener("focus", () => popup.addTo(instance));
        button.addEventListener("blur", () => popup.remove());
        button.addEventListener("click", (click) => {
          click.preventDefault();
          click.stopPropagation();
          router.push(`/events/${event.id}`);
        });
        return marker;
      });
    if (visible.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      visible.forEach((event) =>
        bounds.extend([event.longitude, event.latitude]),
      );
      instance.fitBounds(bounds, { padding: 100, maxZoom: 16, duration: 700 });
    } else if (visible.length === 1) {
      instance.flyTo({
        center: [visible[0].longitude, visible[0].latitude],
        zoom: 16,
      });
    }
  }, [visible, router]);
  function locate() {
    navigator.geolocation?.getCurrentPosition(({ coords }) =>
      map.current?.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 16,
      }),
    );
  }
  return (
    <div className="map-centered-page">
      <div ref={container} className="map-canvas" />
      <div className="map-command">
        <label>
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events or locations"
          />
        </label>
        <span>
          {loading ? (
            <>
              <LoaderCircle className="spin" />
              Loading events
            </>
          ) : (
            <>
              <MapPin />
              {visible.length} events on map
            </>
          )}
        </span>
      </div>
      <button className="locate-map" onClick={locate}>
        <LocateFixed />
        Center on me
      </button>
      {error && (
        <div className="map-error">
          <LockKeyhole />
          <div>
            <b>Map unavailable</b>
            <span>{error}</span>
          </div>
        </div>
      )}{" "}
      {!loading && !error && !visible.length && (
        <div className="map-empty">
          <CalendarDays />
          <b>No events found</b>
          <span>Try another search or ask an organizer to publish one.</span>
        </div>
      )}
      <div className="map-legend">
        <span>
          <i />
          Event
        </span>
        <span>
          <UsersRound />
          Hover for details · click to open
        </span>
      </div>
    </div>
  );
}
