"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  Map,
  MessageCircle,
  QrCode,
  UserRound,
} from "lucide-react";
import { useClubMap } from "./AppProvider";

const baseLinks = [
  { href: "/user/1/MyMap", label: "Discover", icon: Map },
  { href: "/user/1/MyEvents", label: "My events", icon: CalendarDays },
  { href: "/user/1/GroupChats", label: "Messages", icon: MessageCircle },
  { href: "/user/1/QR", label: "My pass", icon: QrCode },
  { href: "/user/1/Profile", label: "Profile", icon: UserRound },
];
export default function NavBar() {
  const pathname = usePathname();
  const { role, unread, authenticated, userName } = useClubMap();
  const links =
    role === "organizer" || role === "admin"
      ? [
          ...baseLinks,
          { href: "/user/1/Admin", label: "Manage", icon: LayoutDashboard },
        ]
      : baseLinks;
  return (
    <aside className="sidebar-shell">
      <Link href="/user/1/MyMap" className="brand" aria-label="ClubMap home">
        <Image
          src="/generated-image.png"
          alt="ClubMap"
          width={180}
          height={180}
          priority
        />
      </Link>
      <p className="nav-eyebrow">Campus explorer</p>
      <nav className="nav-links">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
            {label === "Messages" && unread > 0 && <b>{unread}</b>}
          </Link>
        ))}
      </nav>
      <div className="nav-account">
        <div className="avatar">
          {authenticated
            ? userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
            : "?"}
        </div>
        <div>
          <strong>{authenticated ? userName : "Guest"}</strong>
          <span>
            {authenticated ? role : <Link href="/login">Sign in</Link>}
          </span>
        </div>
        <Bell size={18} />
      </div>
    </aside>
  );
}
