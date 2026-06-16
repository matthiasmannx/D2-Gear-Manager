import { getValidAccessToken } from "@/lib/auth";
import { loadGear, GearData } from "@/lib/gear";
import GearBoard from "@/components/GearBoard";

export const metadata = { title: "Gear — Guardian Hub" };

export default async function GearPage() {
  const token = await getValidAccessToken();
  if (!token) return <LoginPrompt />;

  let data: GearData | null = null;
  let error: string | null = null;
  try {
    data = await loadGear(token);
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return (
      <>
        <h1>Gear</h1>
        <div className="notice error">Kon je gear niet laden: {error}</div>
      </>
    );
  }
  if (!data || data.characters.length === 0) {
    return (
      <>
        <h1>Gear</h1>
        <div className="empty">Geen Destiny 2 characters gevonden op dit account.</div>
      </>
    );
  }

  return (
    <>
      <h1>Gear</h1>
      <p className="muted">
        Uitrusting van {data.name}. <strong>Sleep</strong> een item naar een andere
        guardian of de vault, of <strong>klik</strong> erop voor equip/verplaats-opties.
      </p>
      <GearBoard
        characters={data.characters}
        vault={data.vault}
        membershipType={data.membershipType}
      />
    </>
  );
}

function LoginPrompt() {
  return (
    <>
      <h1>Gear</h1>
      <div className="notice">
        Log in met je Bungie-account om je characters en uitrusting te beheren.
      </div>
      <a href="/api/auth/login" className="btn" style={{ marginTop: "1rem" }}>
        Login met Bungie
      </a>
    </>
  );
}
