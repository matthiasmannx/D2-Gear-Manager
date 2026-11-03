import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode } from "@/lib/bungie";
import { setSession } from "@/lib/session";

/**
 * Bungie stuurt de gebruiker hierheen terug met ?code=...&state=...
 * We controleren de state, wisselen de code in voor tokens en bewaren de sessie.
 */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const jar = await cookies();
  const savedState = jar.get("gh_oauth_state")?.value;
  jar.delete("gh_oauth_state");

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=oauth_state_mismatch", origin));
  }

  try {
    const t = await exchangeCode(code);
    await setSession({
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      accessExpiresAt: Date.now() + t.expires_in * 1000,
      bungieMembershipId: t.membership_id,
    });
    return NextResponse.redirect(new URL("/gear", origin));
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(e.message ?? "oauth_failed")}`, origin)
    );
  }
}
