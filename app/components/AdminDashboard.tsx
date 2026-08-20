"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  CalendarPlus,
  ImagePlus,
  LockKeyhole,
  ShieldAlert,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import { Visibility } from "@/lib/types";
import { useClubMap } from "./AppProvider";
export default function AdminDashboard() {
  const { role } = useClubMap();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [eventCount, setEventCount] = useState(0);
  const [visibility, setVisibility] = useState<Visibility>("campus");
  function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }
  useEffect(() => {
    fetch("/api/events")
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => setEventCount(items.length));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    let imageUrl = "";
    if (file) {
      const uploadData = new FormData();
      uploadData.set("file", file);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });
      if (!uploadResponse.ok) {
        setError((await uploadResponse.json()).error);
        return;
      }
      imageUrl = (await uploadResponse.json()).url;
    }
    const title = String(data.get("title"));
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: data.get("description"),
        location: data.get("location"),
        startsAt: data.get("starts"),
        latitude: Number(data.get("latitude")),
        longitude: Number(data.get("longitude")),
        visibility,
        imageUrl,
      }),
    });
    if (!response.ok) {
      setError((await response.json()).error);
      return;
    }
    setCreated(title);
    setEventCount((count) => count + 1);
    setPreview(null);
    setFile(null);
    form.reset();
  }
  if (role !== "organizer" && role !== "admin")
    return (
      <div className="large-empty">
        <ShieldAlert size={36} />
        <h2>Organizer access required</h2>
        <p>Switch to an organizer or admin profile to manage campus events.</p>
      </div>
    );
  return (
    <div className="content-page admin-page">
      <header className="content-header">
        <div>
          <p>ORGANIZER STUDIO</p>
          <h1>Manage events</h1>
          <span>
            Create experiences, control access, and watch attendance grow.
          </span>
        </div>
        <span className="role-badge">{role}</span>
      </header>
      {created && (
        <div className="success-banner">
          “{created}” was created and your followers were notified.
        </div>
      )}
      {error && <div className="auth-error">{error}</div>}
      <div className="admin-layout">
        <form className="create-form" onSubmit={submit}>
          <h2>
            <CalendarPlus size={20} /> Create an event
          </h2>
          <div className="form-grid">
            <label>
              Event title
              <input
                required
                name="title"
                placeholder="e.g. Open studio night"
              />
            </label>
            <label>
              Category
              <select name="category">
                <option>Technology</option>
                <option>Arts</option>
                <option>Wellness</option>
                <option>Service</option>
              </select>
            </label>
            <label className="wide">
              Description
              <textarea
                required
                name="description"
                placeholder="What should students know?"
              />
            </label>
            <label>
              Date & time
              <input required name="starts" type="datetime-local" />
            </label>
            <label>
              Campus location
              <input required name="location" placeholder="Building · Room" />
            </label>
            <label>
              Latitude
              <input
                name="latitude"
                type="number"
                step="any"
                defaultValue="40.7308"
              />
            </label>
            <label>
              Longitude
              <input
                name="longitude"
                type="number"
                step="any"
                defaultValue="-73.9973"
              />
            </label>
          </div>
          <fieldset>
            <legend>Who can see this event?</legend>
            <div className="visibility-options">
              {(["public", "campus", "members"] as Visibility[]).map((v) => (
                <button
                  type="button"
                  key={v}
                  className={visibility === v ? "active" : ""}
                  onClick={() => setVisibility(v)}
                >
                  <LockKeyhole size={14} />
                  <b>{v}</b>
                  <small>
                    {v === "public"
                      ? "Anyone can discover"
                      : v === "campus"
                        ? "Verified university users"
                        : "Organization members"}
                  </small>
                </button>
              ))}
            </div>
          </fieldset>
          <label
            className="upload-zone"
            style={
              preview
                ? {
                    backgroundImage: `linear-gradient(#07101899,#07101899),url(${preview})`,
                  }
                : {}
            }
          >
            <input type="file" accept="image/*" onChange={upload} />
            {preview ? (
              <>
                <ImagePlus />
                <b>Change cover media</b>
              </>
            ) : (
              <>
                <UploadCloud />
                <b>Upload event media</b>
                <span>PNG, JPG, or WebP · up to 10 MB</span>
              </>
            )}
          </label>
          <button className="primary-button" type="submit">
            Publish event
          </button>
        </form>
        <aside className="admin-overview">
          <h2>At a glance</h2>
          <div className="metric">
            <CalendarPlus />
            <span>
              <b>{eventCount}</b>Active events
            </span>
          </div>
          <div className="metric">
            <UsersRound />
            <span>
              <b>181</b>Total RSVPs
            </span>
          </div>
          <h3>Administrative workflow</h3>
          <ol>
            <li className="done">Draft reviewed</li>
            <li className="done">Location verified</li>
            <li>Publish & notify followers</li>
          </ol>
          {role === "admin" && (
            <div className="admin-callout">
              <ShieldAlert size={17} />
              <span>
                <b>Admin controls enabled</b> You can moderate all organizations
                and private events.
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
