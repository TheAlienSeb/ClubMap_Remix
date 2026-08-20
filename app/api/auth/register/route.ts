import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/lib/supabase/db";
import { users } from "@/lib/supabase/schema";
import { hashPassword } from "@/lib/password";
import { localMode, localRegister } from "@/lib/local-store";
export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  if (!email || password.length < 8 || !body.firstName || !body.lastName)
    return NextResponse.json(
      { error: "Complete all fields and use at least 8 password characters." },
      { status: 400 },
    );
  if (localMode) {
    try {
      const user = await localRegister({
        firstName: body.firstName,
        lastName: body.lastName,
        email,
        password,
      });
      return NextResponse.json({ id: user.id }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "An account already exists for this email." },
        { status: 409 },
      );
    }
  }
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing)
    return NextResponse.json(
      { error: "An account already exists for this email." },
      { status: 409 },
    );
  const isUniversity = email.endsWith(
    process.env.UNIVERSITY_EMAIL_DOMAIN || ".edu",
  );
  const role =
    email === process.env.CLUBMAP_BOOTSTRAP_ADMIN_EMAIL?.toLowerCase()
      ? "admin"
      : "user";
  const [user] = await db
    .insert(users)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      email,
      passwordHash: await hashPassword(password),
      role,
      universityVerified: isUniversity,
    })
    .returning({ id: users.id });
  return NextResponse.json(user, { status: 201 });
}
