import Map from "../components/Map";
import NavBar from "../components/NavBar";
import db from "@/lib/supabase/db";
export default function Layout({children}: Readonly<{ children: React.ReactNode}>) {
    return (
        <main className="font-work-sans">
            {children}
        </main>

    )
}