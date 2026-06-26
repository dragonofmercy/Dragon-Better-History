<p align="center">
  <img src="https://raw.githubusercontent.com/dragonofmercy/Dragon-Better-History/master/public/icons/icon_128.png" alt="Dragon Better History" width="96" height="96">
</p>

<h1 align="center">Dragon Better History</h1>

<p align="center">A better browsing history for Google Chrome and Microsoft Edge.</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/dragonofmercy/Dragon-Better-History?color=2563eb&label=version" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-2563eb" alt="Manifest V3">
  <a href="https://chromewebstore.google.com/detail/eagfijenmngbjkbmfaogdknnididhaoa"><img src="https://img.shields.io/chrome-web-store/users/eagfijenmngbjkbmfaogdknnididhaoa?label=Chrome&color=4285F4&logo=googlechrome&logoColor=white" alt="Chrome"></a>
  <a href="https://microsoftedge.microsoft.com/addons/detail/lmnppmohpgndifoijdjcnljcdbffjdoo"><img src="https://img.shields.io/badge/dynamic/json?url=https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/lmnppmohpgndifoijdjcnljcdbffjdoo&query=$.activeInstallCount&label=Edge&color=0078D7&logo=microsoftedge&logoColor=white" alt="Edge"></a>
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
- **Toolbar popup** - your latest entries one click away, with a built-in search bar and a
  configurable item count.
- **Recently closed tabs** - a popup tab to reopen recently closed tabs and windows.
- **Group consecutive visits** - optionally fold runs of consecutive entries from the same
  site under a collapsible header with a count (history page; off by default).
- **Instant search** - debounced full-text filtering across titles and URLs, in the history
  page and the popup.
- **Date picker** - a locale-aware calendar to jump to any day (week start and formatting
  follow your language; future dates are disabled).
- **Multi-select & delete** - click, Shift-range and Ctrl+A selection, then remove entries
  in bulk.
- **Favicons** - page icons via the native MV3 favicon endpoint.
- **Light / dark / system theme** and a 12h or 24h time format.
- **Localized** in 9 languages: English, French, German, Italian, Spanish, Turkish,
  Simplified Chinese, Bulgarian and Russian.

## Installation

Get it from your browser's store:

- **Chrome** (and Chromium browsers) - [Chrome Web Store](https://chromewebstore.google.com/detail/eagfijenmngbjkbmfaogdknnididhaoa)
- **Microsoft Edge** - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/lmnppmohpgndifoijdjcnljcdbffjdoo)

Or build it yourself and load it unpacked (see [Development](#development)):

1. Clone this repository and run a production build.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.

## Development

Built with Vite, `@crxjs/vite-plugin`, Vue 3, TypeScript and Tailwind v4.

```sh
git clone https://github.com/dragonofmercy/Dragon-Better-History.git
cd Dragon-Better-History
npm install
npm run dev      # Vite dev server with HMR; load dist/ as an unpacked extension
npm run build    # type-check + production build into dist/
npm test         # run the Vitest suite
```

Load `dist/` as an unpacked extension at `chrome://extensions` (or `edge://extensions`)
with developer mode enabled.

## License

MIT - Copyright (c) Dragon.

## Support

If this project helps to increase your productivity, you can give me a cup of coffee :)

<a href="https://ko-fi.com/dragonofmercy" target="_blank"><img src="https://cdn.ko-fi.com/cdn/kofi2.png?v=3" alt="Donate" width="160px" /></a>
