"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import QR from "@/app/components/QR";
type Pass = { token: string; expiresAt: number; name: string; email: string };
export default function Page() {
  const [pass, setPass] = useState<Pass | null>(null);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(300);
  async function load() {
    setError("");
    const response = await fetch("/api/passes/me", { cache: "no-store" });
    if (response.status === 401) {
      setError("Sign in to generate your campus pass.");
      return;
    }
    if (!response.ok) {
      setError("Your pass could not be generated.");
      return;
    }
    setPass(await response.json());
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!pass) return;
    const timer = setInterval(
      () =>
        setSeconds(
          Math.max(0, Math.ceil((pass.expiresAt - Date.now()) / 1000)),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [pass]);
  return (
    <div className="pass-page">
      <header>
        <p>DIGITAL CAMPUS PASS</p>
        <h1>Quick check-in.</h1>
        <span>A secure, rotating pass for the events you attend.</span>
      </header>
      {error ? (
        <div className="large-empty">
          <QrCode />
          <h2>{error}</h2>
          <Link href="/login" className="primary-button">
            Sign in
          </Link>
        </div>
      ) : (
        <div className="pass-layout">
          <section className="digital-pass">
            <div className="pass-top">
              <span>
                <ShieldCheck />
                CLUBMAP PASS
              </span>
              <small>LIVE</small>
            </div>
            <div className="qr-frame">
              {pass ? (
                <QR text={pass.token} size={270} />
              ) : (
                <LoaderCircle className="spin" />
              )}
            </div>
            <div className="pass-person">
              <div>
                {pass?.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("") || "CM"}
              </div>
              <span>
                <b>
                  {pass?.name || "Loading…"}
                  <BadgeCheck />
                </b>
                <small>{pass?.email}</small>
              </span>
            </div>
            <div className="pass-expiry">
              <Clock3 />
              <span>
                <small>REFRESHES IN</small>
                <b>
                  {Math.floor(seconds / 60)}:
                  {String(seconds % 60).padStart(2, "0")}
                </b>
              </span>
              <button onClick={load}>
                <RefreshCw />
                Refresh
              </button>
            </div>
          </section>
          <aside className="pass-instructions">
            <span>01</span>
            <h2>Arrive at your event</h2>
            <p>Open this pass before reaching the check-in table.</p>
            <span>02</span>
            <h2>Present the code</h2>
            <p>The organizer scans it to confirm your identity and RSVP.</p>
            <span>03</span>
            <h2>You’re in</h2>
            <p>The pass rotates every five minutes to prevent reuse.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
