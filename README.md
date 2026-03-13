# Simple Chat (Browser)

Ein kleines, modernes Chat-UI, das vollständig im Browser läuft (ohne Backend).

## Features

- Chats erstellen + Join-Code erhalten
- Chats per Code beitreten
- Nachrichten lokal (LocalStorage) speichern
- Responsives Layout + modernes Design

## Nutzung

1. Öffne `index.html` im Browser.
2. Erstelle einen neuen Chat oder trete einem mit dem Join-Code bei.
3. Nachrichten werden lokal im Browser gespeichert.

## Deployment auf GitHub Pages

1. Erstelle ein neues GitHub-Repository (z. B. `simple-chat`).
2. Push den Inhalt dieses Ordners ins Repo.
3. Aktiviere GitHub Pages in den Repository-Einstellungen (Branch `main`, Ordner `/ (root)`).
4. Öffne die Seite unter `https://<dein-benutzername>.github.io/<repo-name>/`.

## Aktivieren von mehreren Geräten (Sync)

Damit mehrere Geräte denselben Chat teilen und Nachrichtenaustausch möglich ist, kannst du Firebase nutzen:

1. Erstelle ein Firebase-Projekt unter https://console.firebase.google.com/
2. Aktiviere die **Realtime Database** (am schnellsten) oder **Firestore**.
3. Öffne `firebase-config.js` und trage dort deine Firebase-Konfiguration ein (wird dir in der Firebase-Konsole angezeigt).
4. Lade die Seite neu. Alle Geräte, die dieselbe Chat-ID/Join-Code nutzen, sehen dann dieselben Nachrichten.

> Hinweis: Ohne Firebase funktioniert der Chat weiterhin lokal, aber nur auf dem aktuellen Gerät.

---

© 2026
