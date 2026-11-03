# iOS-aanpak voor Guardian Hub

## Aanbevolen route

Voor deze codebase is een **native iOS-shell rond de bestaande Next.js app** de
meest logische eerste stap.

Waarom:

- De app gebruikt **server-side secrets** voor Bungie API + OAuth.
- De app heeft **Next.js server routes** (`src/app/api/**`) voor auth en
  gear-acties.
- Een volledig lokale/native iOS-app zou daarom alsnog een backend nodig
  hebben, of een groot deel van de huidige app moeten herschrijven.

## Praktische architectuur

1. Hou deze repository als de **web/backend bron**.
2. Deploy de app naar een vast domein, bijvoorbeeld:
   - `https://guardianhub.app`
3. Maak daarna een iOS-container met bijvoorbeeld:
   - **Capacitor** als je een WebView-shell wilt
   - **React Native / SwiftUI** alleen als je later bewust native schermen wilt
4. Laat de iOS-app de gedeployde webapp openen.
5. Voeg daarna optioneel native features toe:
   - push notifications
   - deeplinks
   - share sheet
   - biometric gate voor gevoelige account-acties

## Bungie/OAuth aandachtspunten

- Registreer in Bungie een productie redirect URL zoals:
  `https://guardianhub.app/api/auth/callback`
- Gebruik voor iOS bij voorkeur dezelfde web-loginflow, zodat tokens en secrets
  server-side blijven.
- Vermijd het inbouwen van Bungie secrets in de iOS-binary.

## Wat al in deze repo is voorbereid

- `src/app/manifest.ts`
- `src/app/apple-icon.tsx`
- iOS-vriendelijke metadata in `src/app/layout.tsx`

Dat maakt de webapp alvast beter geschikt voor:

- iOS home screen install
- standalone weergave
- een latere native wrapper

## Wrapper scaffold

Er staat nu ook een startklare wrapper-map in:

- `mobile/ios-shell`

Met daarin:

- `package.json`
- `capacitor.config.ts`
- `.env.example`
- `README.md`

## Logische vervolgstap

Voer in `mobile/ios-shell` de Capacitor setup uit:

```bash
npm install
npm run cap:add:ios
npm run cap:sync
npm run cap:open
```

Als de machine alleen naar Command Line Tools wijst, zet dan eerst Xcode actief:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
