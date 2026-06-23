<p align="center">
  <img src="https://raw.githubusercontent.com/dragonofmercy/Dragon-Better-History/master/public/icons/icon_128.png" alt="Dragon Better History" width="96" height="96">
</p>

<h1 align="center">Dragon Better History</h1>

<p align="center">A better browsing history for Google Chrome and Microsoft Edge.</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/dragonofmercy/Dragon-Better-History?color=2563eb&label=version" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-2563eb" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-supported-4285F4?logo=googlechrome&logoColor=white" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-supported-0078D7?logo=microsoftedge&logoColor=white" alt="Edge">
  <img src="https://img.shields.io/badge/i18n-9%20languages-f59e0b" alt="9 languages">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-16a34a" alt="License: MIT"></a>
  <a href="https://github.com/dragonofmercy/Dragon-Better-History/stargazers"><img src="https://img.shields.io/github/stars/dragonofmercy/Dragon-Better-History?style=flat&color=eab308" alt="Stars"></a>
  <a href="https://ko-fi.com/dragonofmercy"><img src="https://img.shields.io/badge/Donate-Ko--fi-ff5e5b?logo=kofi&logoColor=white" alt="Donate on Ko-fi"></a>
</p>

Dragon Better History replaces the browser's built-in history page with a fast, modern UI,
and adds a toolbar popup that shows your most recent visits at a glance.

## Features

- **Redesigned history page** - a clean Vue interface grouped by day, in place of the
  native `chrome://history`.
- **Toolbar popup** - your latest entries one click away, with a configurable item count.
- **Instant search** - debounced full-text filtering across titles and URLs.
- **Date picker** - a locale-aware calendar to jump to any day (week start and formatting
  follow your language; future dates are disabled).
- **Multi-select & delete** - click, Shift-range and Ctrl+A selection, then remove entries
  in bulk.
- **Favicons** - page icons via the native MV3 favicon endpoint.
- **Light / dark / system theme** and a 12h or 24h time format.
- **Localized** in 9 languages: English, French, German, Italian, Spanish, Turkish,
  Simplified Chinese, Bulgarian and Russian.

## Download

Download the latest release from [GitHub Releases](https://github.com/dragonofmercy/Dragon-Better-History/releases):

- **Chrome Version** - Replaces the built-in `chrome://history` page
- **Edge Version** - Access via toolbar icon click (Edge no longer supports history page replacement)

## Installation

1. Download the appropriate version for your browser from [GitHub Releases](https://github.com/dragonofmercy/Dragon-Better-History/releases).
2. Extract the downloaded zip file.
3. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder.

## Known Issues

> **Note:** Due to a recent Microsoft Edge update, the history page override feature is temporarily unavailable. The extension cannot replace the built-in `edge://history` page. As a workaround, please pin the extension to the toolbar and click the icon to access the history interface.

## Development

Built with Vite, `@crxjs/vite-plugin`, Vue 3, TypeScript and Tailwind v4.

```sh
git clone https://github.com/dragonofmercy/Dragon-Better-History.git
cd Dragon-Better-History
npm install
npm run dev          # Vite dev server with HMR; load dist/ as an unpacked extension
npm run build        # type-check + production build (default: Chrome)
npm run build:chrome # build Chrome version with history page replacement
npm run build:edge   # build Edge version (toolbar icon only)
npm test             # run the Vitest suite
```

Load `dist/` as an unpacked extension at `chrome://extensions` (or `edge://extensions`)
with developer mode enabled.

## License

MIT - Copyright (c) Dragon.

## Support

If this project helps to increase your productivity, you can give me a cup of coffee :)

<a href="https://ko-fi.com/dragonofmercy" target="_blank"><img src="https://cdn.ko-fi.com/cdn/kofi2.png?v=3" alt="Donate" width="160px" /></a>
