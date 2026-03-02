# Everything you need

All links in one place – built with Vite + YAML, deployed on GitHub Pages.

## 📁 Dateistruktur

```
my-project/
├── src/
│   ├── data.yaml        ← Hier pflegst du deine Links & Übersetzungen
│   ├── main.js          ← JavaScript-Logik
│   └── styles.css       ← Deine bestehenden Styles
├── index.html
├── vite.config.js
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml   ← Automatischer GitHub Pages Deploy
```

## 🚀 Setup (einmalig)

```bash
# 1. Dependencies installieren
npm install

# 2. Lokalen Dev-Server starten
npm run dev

# 3. Build für Produktion
npm run build
```

## ✏️ Links hinzufügen / bearbeiten

Öffne `src/data.yaml` und füge einen neuen Eintrag hinzu:

```yaml
- title: "Mein neuer Link"
  url: "https://example.com"
  description: "Kurze Beschreibung"
  tags: [tag1, tag2]
```

Danach einfach `git push` → GitHub Actions baut und deployed automatisch!

## ⚙️ GitHub Pages aktivieren

1. Repo auf GitHub → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Fertig! Bei jedem Push auf `main` wird automatisch deployed.

## 🌐 Neue Sprache hinzufügen

In `src/data.yaml` unter `translations:` einen neuen Block hinzufügen:

```yaml
translations:
  fr:
    selectTopic: "Choisir un sujet"
    everythingYouNeed: "Tout ce dont vous avez besoin"
    # ... alle anderen Keys
```

Dann in `index.html` die `<select>` für die Sprache ergänzen.
