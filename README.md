# Guardian Hub — Destiny 2 Companion

Een Next.js-site die de [Bungie API](https://bungie-net.github.io/) gebruikt om
Destiny 2 te tonen. Vijf secties:

| Sectie | Wat | Bron |
| --- | --- | --- |
| **Items** | Zoek door alle wapens/armor/mods | Publieke manifest (alleen API key) |
| **Gear** | Je eigen characters + uitrusting | OAuth (login vereist) |
| **Events Tracker** | Milestones, weeklies, vendors, resets | Publieke milestones + OAuth |
| **Changelog** | Destiny-updates tijdlijn | `src/lib/changelog.ts` |
| **Buffs & Nerfs** | Sandbox-wijzigingen | `src/lib/sandbox.ts` |

De API key en OAuth-secret blijven **server-side** — ze verlaten nooit de browser.

## 1. Een Bungie app aanmaken (gratis)

1. Ga naar <https://www.bungie.net/en/Application> en log in.
2. Klik **Create New App**.
3. Vul in:
   - **Application Name**: bv. `Guardian Hub`
   - **OAuth Client Type**: **Confidential** (geeft je een Client ID **én** Secret)
   - **Redirect URL**: `https://localhost:3000/api/auth/callback`
     (Bungie staat **geen `http`** toe — moet `https`, ook op localhost)
   - **Scope**: minimaal *"Read your Destiny 2 information"*
   - **Origin Header**: `*` (of `http://localhost:3000`)
4. Sla op. Je krijgt nu een **API Key**, **OAuth client_id** en **OAuth client_secret**.

## 2. Configureren

```bash
cp .env.local.example .env.local
```

Vul `.env.local` in:

```ini
BUNGIE_API_KEY=...          # je API Key
BUNGIE_CLIENT_ID=...        # OAuth client_id
BUNGIE_CLIENT_SECRET=...    # OAuth client_secret
BUNGIE_REDIRECT_URI=https://localhost:3000/api/auth/callback
SESSION_SECRET=...          # genereer met: openssl rand -hex 32
```

> De **Redirect URL** in je Bungie-app moet **exact** gelijk zijn aan
> `BUNGIE_REDIRECT_URI`, inclusief `http`/`https` en het pad.

## 3. Draaien (HTTPS lokaal)

Omdat Bungie `https` eist voor de redirect, draait de dev-server met TLS. Je
hebt een lokaal certificaat nodig in `certs/`:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost-key.pem \
  -out certs/localhost.pem \
  -days 825 -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

> Het `dev`-script verwijst naar deze twee bestanden. `certs/` staat in
> `.gitignore`. (Heb je `mkcert` geïnstalleerd, dan werkt `next dev
> --experimental-https` ook zonder eigen cert.)

```bash
npm install
npm run dev
```

Open <https://localhost:3000>. Het is een self-signed certificaat, dus je
browser waarschuwt één keer → **doorgaan/accepteren**.

- **Items / Events** werken meteen zodra de API key staat.
- **Gear** vereist dat je rechtsboven op **Login met Bungie** klikt.

> **Items, eerste keer:** de eerste zoekopdracht downloadt de item-manifest
> (~190 MB) en bouwt een slanke zoekindex (`.cache/`, ~6 MB). Dat duurt enkele
> seconden; daarna is zoeken instant. Bij een nieuwe Destiny-update wordt de
> index automatisch herbouwd.

## Productie / deploy

```bash
npm run build && npm start
```

Op een host als Vercel: zet dezelfde env-vars in de project-settings en voeg een
**tweede Redirect URL** toe in je Bungie-app voor je productie-domein
(bv. `https://jouwdomein.nl/api/auth/callback`), met `BUNGIE_REDIRECT_URI`
daarop afgestemd.

## Projectstructuur

```
src/
  app/
    layout.tsx            # root layout + navbar
    page.tsx              # homepage
    items/                # zoeken + item-detail
    gear/                 # eigen characters/equipment (OAuth)
    events/               # milestones, weeklies, vendors
    changelog/            # Destiny-updates
    sandbox/              # buffs & nerfs
    api/                  # auth + gear-acties (transfer/equip/lock/loadout/postmaster)
  components/             # Nav, GearBoard, etc.
  lib/
    bungie.ts             # server-side API client (X-API-Key, OAuth, profiel)
    manifest.ts           # item-zoekindex uit de manifest (download + cache)
    gear.ts / wishlist.ts / itemDetail.ts / vendors.ts / ...
    auth.ts / session.ts  # OAuth + sessie
```

## Hoe het werkt

- **Publieke data** (items, events) gebruikt alleen de `X-API-Key` header en
  wordt door Next.js gecachet (`revalidate`).
- **Account-data** (gear) gebruikt OAuth: na login bewaren we de tokens in een
  ondertekende httpOnly cookie. `getValidAccessToken()` ververst het access
  token automatisch zodra het (bijna) verloopt.
- **Item-zoeken** gebruikt de manifest: het volledige item-definitiebestand
  wordt één keer gedownload en omgezet in een slanke index (op schijf gecachet),
  omdat Bungie's `SearchDestinyEntities`-endpoint is uitgefaseerd. Losse
  item-details komen via `/Destiny2/Manifest/{type}/{hash}/`.

## Meta builds bijwerken (handmatig)

De Bungie API levert geen "meta"-data, en community-sites blokkeren scraping —
dus meta builds worden via web-research samengesteld. De research wordt gedaan
door Claude Code (een LLM), niet door een los script.

**Zo ververs je de meta builds wanneer je wilt:**

1. Open dit project in Claude Code.
2. Vraag: **"ververs de meta builds"** (of "update de Destiny 2 meta builds").
3. Claude doet een web-research-ronde (Mobalytics, light.gg, blueberries.gg,
   recente community tier lists), werkt [src/lib/builds.ts](src/lib/builds.ts)
   bij (BUILDS + `META_UPDATED` + bron per build) en draait `npm run build`.
4. Herstart/ververs de dev-server.

> Wil je dit tóch volautomatisch dagelijks? Zet het project op GitHub + deploy
> (bv. Vercel); dan kan een geplande cloud-agent (`/schedule`) `builds.ts`
> dagelijks via een PR bijwerken.

## Uitbreiden

- **Meta builds / changelog / buffs & nerfs / weekly highlights**: redactionele
  data in `src/lib/builds.ts`, `changelog.ts`, `sandbox.ts`, `weekly.ts`.
- **Meer gear-detail**: vraag extra profiel-componenten op in `COMPONENTS` in
  [src/lib/gear.ts](src/lib/gear.ts).
