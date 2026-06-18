import "server-only";
import { getSession, setSession, Session } from "./session";
import { refreshTokens } from "./bungie";

/**
 * Geeft een geldig access token terug. Ververst automatisch als het verlopen
 * is (of bijna). Retourneert null als de gebruiker niet is ingelogd of als
 * verversen mislukt (dan moet de gebruiker opnieuw inloggen).
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  // 60s marge zodat we niet net tijdens een call verlopen.
  if (Date.now() < session.accessExpiresAt - 60_000) {
    return session.accessToken;
  }

  try {
    const t = await refreshTokens(session.refreshToken);
    const next: Session = {
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      accessExpiresAt: Date.now() + t.expires_in * 1000,
      bungieMembershipId: t.membership_id,
    };
    await setSession(next);
    return next.accessToken;
  } catch {
    return null;
  }
}

/**
 * Echt ingelogd = er is een bruikbaar (geldig of verversbaar) token. Voorkomt
 * dat de nav "Uitloggen" toont terwijl het token dood is en API-calls falen.
 */
export async function isLoggedIn(): Promise<boolean> {
  return (await getValidAccessToken()) !== null;
}
