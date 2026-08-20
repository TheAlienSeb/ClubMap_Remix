"use client";
import Link from "next/link";
import { BadgeCheck, LogIn, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useClubMap } from "./AppProvider";
export default function MyProfile() {
  const { role, universityVerified, authenticated, userName } = useClubMap();
  if (!authenticated)
    return (
      <div className="large-empty">
        <LogIn />
        <h2>Sign in to view your profile</h2>
        <Link href="/login" className="primary-button">
          Sign in
        </Link>
      </div>
    );
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="content-page profile-page">
      <header className="content-header">
        <div>
          <p>ACCOUNT</p>
          <h1>Your profile</h1>
          <span>Your identity and verified campus access.</span>
        </div>
      </header>
      <div className="profile-card">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h2>
            {userName}
            <BadgeCheck />
          </h2>
          <span className="verified-pill">
            <ShieldCheck />
            {universityVerified
              ? "University verified"
              : "Verification pending"}
          </span>
          <p>Role: {role}</p>
        </div>
      </div>
      <section className="settings-card">
        <h2>Account security</h2>
        <p>
          Your access level is assigned by the university and cannot be changed
          in the browser.
        </p>
        <button
          className="share-button"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
