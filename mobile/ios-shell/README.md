# Guardian Hub iOS Shell

Deze map bevat een kleine **Capacitor iOS-wrapper** rond de gedeployde
Guardian Hub webapp.

## Waarom deze setup

- De bestaande Next.js app blijft de bron voor UI, API-routes en OAuth.
- Bungie secrets blijven server-side.
- iOS kan later native features toevoegen zonder de webapp te herschrijven.

## Voorbereiding

1. Zorg dat de hoofdapp op een echt HTTPS-domein draait.
2. Zet de URL in een `.env` bestand in deze map:

```ini
GUARDIAN_HUB_APP_URL=https://guardianhub.app
```

3. Registreer dezelfde productie callback in je Bungie app:

```text
https://guardianhub.app/api/auth/callback
```

## Eerste setup

```bash
cd mobile/ios-shell
npm install
npm run cap:add:ios
npm run cap:sync
npm run cap:open
```

Daarna opent Xcode het iOS-project en kun je de app signen en draaien.

Als `cap:sync` of `cap:add:ios` meldt dat `xcodebuild` ontbreekt terwijl Xcode
wel is geinstalleerd, zet dan eerst de actieve developer directory goed:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Handige commando's

```bash
npm run doctor
npm run cap:sync
npm run cap:open
```

## Opmerking over lokaal testen

Voor een echte iOS build is een publiek of vertrouwd HTTPS-endpoint het meest
stabiel. Een lokale Next dev-server met self-signed certificaat werkt vaak
onhandig op device en simulator.
