import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { authorizeUrl } from "@/lib/bungie";

/**
 * Start de OAuth-flow: genereer een random `state` (CSRF-bescherming), bewaar
 * die in een korte cookie en stuur de gebruiker naar Bungie.
 */
export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("gh_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });

  try {
    return NextResponse.redirect(authorizeUrl(state));
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(e.message)}`, process.env.BUNGIE_REDIRECT_URI ?? "http://localhost:3000")
    );
  }
}
