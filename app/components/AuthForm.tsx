"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
export default function AuthForm({ admin = false }: { admin?: boolean }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === "register") {
      const registration = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!registration.ok) {
        setError((await registration.json()).error);
        setLoading(false);
        return;
      }
    }
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Email or password is incorrect.");
      setLoading(false);
      return;
    }
    const session = await fetch("/api/auth/session").then((r) => r.json());
    if (admin && !["organizer", "admin"].includes(session?.user?.role)) {
      setError("This account does not have administrative access.");
      setLoading(false);
      return;
    }
    window.location.href = admin ? "/user/me/Admin" : "/user/me/MyMap";
  }
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link href="/" className="auth-brand">
          <MapPin />
          ClubMap
        </Link>
        <div>
          <span>{admin ? "ORGANIZATION PORTAL" : "CAMPUS, MAPPED"}</span>
          <h1>{admin ? "Lead your community." : "Find where you belong."}</h1>
          <p>
            {admin
              ? "Publish events, manage attendance, and connect with your members."
              : "One map for every club, gathering, and opportunity on campus."}
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <form onSubmit={submit}>
          <div className="auth-icon">
            {admin ? <ShieldCheck /> : <LockKeyhole />}
          </div>
          <p>{admin ? "SECURE ACCESS" : "WELCOME TO CLUBMAP"}</p>
          <h2>
            {mode === "register"
              ? "Create your account"
              : admin
                ? "Organizer & admin login"
                : "Sign in"}
          </h2>
          {mode === "register" && (
            <div className="auth-name-row">
              <label>
                First name
                <input name="firstName" required autoComplete="given-name" />
              </label>
              <label>
                Last name
                <input name="lastName" required autoComplete="family-name" />
              </label>
            </div>
          )}
          <label>
            University email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@university.edu"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "register"
                ? "Create account"
                : "Continue"}
            <ArrowRight size={17} />
          </button>
          {!admin && (
            <small>
              {mode === "login"
                ? "New to ClubMap? "
                : "Already have an account? "}
              <a
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </a>
            </small>
          )}
        </form>
      </section>
    </main>
  );
}
