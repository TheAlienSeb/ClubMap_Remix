"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Notice, Role } from "@/lib/types";
type AppContextValue = {
  role: Role;
  universityVerified: boolean;
  authenticated: boolean;
  userName: string;
  rsvps: string[];
  toggleRsvp: (eventId: string) => Promise<boolean>;
  notices: Notice[];
  unread: number;
  markNoticesRead: () => void;
};
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [verified, setVerified] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [rsvps, setRsvps] = useState<string[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (session?.user) {
          setAuthenticated(true);
          setRole(session.user.role === "user" ? "student" : session.user.role);
          setVerified(Boolean(session.user.universityVerified));
          setUserName(session.user.name || "Member");
        }
      });
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : []))
      .then((items) =>
        setRsvps(
          items
            .filter((e: { isRsvped: boolean }) => e.isRsvped)
            .map((e: { id: string }) => e.id),
        ),
      );
  }, []);
  const toggleRsvp = useCallback(async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
    });
    if (response.status === 401) {
      window.location.href = "/login";
      return false;
    }
    if (!response.ok) return false;
    const result = await response.json();
    setRsvps((all) =>
      result.isRsvped
        ? [...new Set([...all, eventId])]
        : all.filter((id) => id !== eventId),
    );
    setNotices((all) => [
      {
        id: crypto.randomUUID(),
        title: result.isRsvped ? "You’re on the list" : "RSVP canceled",
        body: "Your event calendar has been updated.",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...all,
    ]);
    return result.isRsvped;
  }, []);
  const value = useMemo(
    () => ({
      role,
      universityVerified: verified,
      authenticated,
      userName,
      rsvps,
      toggleRsvp,
      notices,
      unread: notices.filter((n) => !n.read).length,
      markNoticesRead: () =>
        setNotices((all) => all.map((n) => ({ ...n, read: true }))),
    }),
    [role, verified, authenticated, userName, rsvps, toggleRsvp, notices],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useClubMap() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useClubMap must be used inside AppProvider");
  return value;
}
