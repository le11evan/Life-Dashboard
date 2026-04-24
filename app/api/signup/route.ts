import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { createSession } from "@/lib/session";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || typeof username !== "string" || !USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–20 chars, letters/numbers/underscore only" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Username is taken" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { username, passwordHash, isAdmin: false },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
