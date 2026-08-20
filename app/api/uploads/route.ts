import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { localMode } from "@/lib/local-store";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["organizer", "admin"].includes(session.user.role))
    return NextResponse.json(
      { error: "Organizer access required." },
      { status: 403 },
    );
  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size > 10_000_000 ||
    !file.type.startsWith("image/")
  )
    return NextResponse.json(
      { error: "Choose an image under 10 MB." },
      { status: 400 },
    );
  if (localMode) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const name = `${crypto.randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, name),
      Buffer.from(await file.arrayBuffer()),
    );
    return NextResponse.json({ url: `/uploads/${name}` });
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SERVICE_ROLE_KEY;
  if (!base || !key)
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 503 },
    );
  const uploadPath = `${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const upload = await fetch(
    `${base}/storage/v1/object/event-media/${uploadPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    },
  );
  if (!upload.ok)
    return NextResponse.json(
      { error: "Upload failed. Ensure the event-media bucket exists." },
      { status: 502 },
    );
  return NextResponse.json({
    url: `${base}/storage/v1/object/public/event-media/${uploadPath}`,
  });
}
