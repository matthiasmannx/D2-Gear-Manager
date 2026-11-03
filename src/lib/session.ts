import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Lichtgewicht sessie zonder externe library: we bewaren de OAuth-tokens in een
 * httpOnly cookie die we ondertekenen met SESSION_SECRET (HMAC-SHA256). Zo kan
 * de inhoud niet ongemerkt worden gewijzigd door de browser.
 */

const COOKIE_NAME = "gh_session";

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Unix-ms tijdstip waarop het access token verloopt. */
  accessExpiresAt: number;
  /** Bungie.net membership id van de ingelogde gebruiker. */
  bungieMembershipId: string;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change_me_to_a_long_random_string") {
    throw new Error(
      "SESSION_SECRET ontbreekt of is nog de standaardwaarde. Zet een lange random string in .env.local."
    );
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): Session | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  // timingSafeEqual voorkomt timing-aanvallen op de handtekening.
  const expected = sign(payload);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const jar = await cookies();
  try {
    jar.set(COOKIE_NAME, encode(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dagen (refresh token leeft zo lang)
    });
  } catch {
    // Cookies kunnen niet geschreven worden tijdens een puur server-component
    // render (alleen in actions/route handlers). De ververste token geldt dan
    // voor deze request; een volgende action/route persisteert 'm alsnog.
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
