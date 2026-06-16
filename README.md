# Medjet

A personal spiritual companion app for Android. Built with React, Vite, and Capacitor.

## Features

**Home** — At-a-glance dashboard showing the current moon phase and illumination, moon sign, sun sign, planetary day, and a countdown to the next lunar event. Also surfaces recent activity across all sections.

**Journal** — Three tabbed sections:
- *Journal* — freeform entries
- *Deities* — deity profiles and notes
- *Spells* — spell and ritual records

**Tarot** — Draw and log tarot readings with multiple spread options. Each reading is saved with the cards drawn and any notes.

**Guide** — Reference material covering astrology, alchemy, crystals, herbs, mushrooms, and recipes.

All data is stored locally on-device via `localStorage`.

## Stack

- React 19 + React Router 7
- Vite 8
- Capacitor 8 (Android)

## Development

```bash
npm install
npm run dev
```

To build and sync to Android:

```bash
npm run build
npx cap sync android
```

Then open `android/` in Android Studio to run on a device or emulator.

## CI

Pushes to `master` that touch app source files automatically build a debug APK via GitHub Actions and attach it to a versioned GitHub Release.
