import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import NavBar from "./components/NavBar";
import { AppProvider } from "./components/AppProvider";
export const metadata: Metadata = {
  title: "ClubMap — Find your people",
  description: "Discover campus organizations, events, and communities.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <NavBar />
          <main className="app-main">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
