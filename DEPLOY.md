# Guardian Hub online zetten (Vercel)

Je vrienden loggen in met hun **eigen** Bungie-account — elke gebruiker krijgt
z'n eigen sessie. Volg deze stappen één keer.

## 1. Naar GitHub pushen

Het project is al een git-repo met een eerste commit. Maak een lege repo op
GitHub (zonder README) en push:

```bash
git remote add origin https://github.com/<jouw-gebruiker>/guardian-hub.git
git branch -M main
git push -u origin main
```

> `.env.local` en `certs/` worden **niet** meegestuurd (staan in `.gitignore`).
> De map `data/` (voorbewerkte manifest-index, ~8 MB) wordt wél meegestuurd —
> die is nodig zodat de server niet de hele 190 MB-manifest hoeft te downloaden.

## 2. Op Vercel deployen

1. Ga naar <https://vercel.com>, log in met GitHub.
2. **Add New → Project** → kies je `guardian-hub`-repo → **Import**.
3. Framework wordt automatisch herkend als **Next.js**. Niets aanpassen.
4. Vouw **Environment Variables** uit en voeg toe (zie stap 3 hieronder).
5. Klik **Deploy**. Je krijgt een URL zoals `https://guardian-hub-xxx.vercel.app`.

## 3. Environment variables (in Vercel → Settings → Environment Variables)

| Naam | Waarde |
| --- | --- |
| `BUNGIE_API_KEY` | je API key |
| `BUNGIE_CLIENT_ID` | je OAuth client_id |
| `BUNGIE_CLIENT_SECRET` | je OAuth client_secret |
| `BUNGIE_REDIRECT_URI` | `https://<jouw-vercel-domein>/api/auth/callback` |
| `SESSION_SECRET` | nieuwe random string: `openssl rand -hex 32` |

Na het toevoegen: **Redeploy** (Deployments → ⋯ → Redeploy) zodat ze actief worden.

## 4. Bungie-app bijwerken

Op <https://www.bungie.net/en/Application>, bij je app:

- Voeg bij **Redirect URL** je productie-URL toe (naast de localhost-versie):
  `https://<jouw-vercel-domein>/api/auth/callback`
- **Genereer je OAuth client_secret opnieuw** (je oude is eerder gedeeld) en
  zet de nieuwe waarde in Vercel + je lokale `.env.local`.

## 5. Klaar

Deel de Vercel-URL. Vrienden klikken **Login met Bungie** en zien hun eigen
gear, stats en loadouts.

---

## Meta-data verversen na een Destiny-update

De gebundelde `data/`-bestanden zijn een momentopname. Bij een grote
Destiny-update (nieuwe wapens) ververs je ze lokaal en deploy je opnieuw:

```bash
npm run dev                 # lokaal, ingelogd niet nodig
# open https://localhost:3000/items en zoek iets → herbouwt /tmp-cache
# kopieer de verse caches naar data/:
cp "$TMPDIR/guardian-hub/item-index-v3.json" data/
cp "$TMPDIR/guardian-hub/stat-names.json" data/
git commit -am "data: refresh manifest snapshot" && git push
```

Vercel deployt automatisch bij elke push.
