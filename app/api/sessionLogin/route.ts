import { NextResponse } from "next/server";
import admin from "../../../lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { idToken } = await req.json();
  const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5일

  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, { expiresIn });

  cookies().set({
    name: "session",
    value: sessionCookie,
    httpOnly: true,
    maxAge: expiresIn / 1000,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ status: "success" });
}
