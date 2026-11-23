# Netflix Nomad

> Custom native-style player controls & modal hider for Netflix — lightweight, zero-dependency userscript powered by the Cadmium player API.

[![Version](https://img.shields.io/badge/version-3.0.0-e50914?style=flat-square)](https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Userscript](https://img.shields.io/badge/format-Userscript%20(.user.js)-green?style=flat-square)](https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js)

<p align="center">
  <a href="https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js">
    <img src="https://img.shields.io/badge/Install%20Script%20(v3.0.0)-Click%20to%20Install-e50914?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="Install Netflix Nomad Userscript" />
  </a>
</p>

<!--
## Preview

| Custom Player Overlay | Audio & Subtitles Menu |
| :---: | :---: |
| ![Player Preview](assets/player-preview.png) | ![Audio & Subtitles Menu](assets/audio-menu.png) |
-->

## Features

- **Native-Style Player Overlay** — Replaces the player controls on `/watch` with a clean top and bottom overlay that smoothly fades out along with the cursor after 2.5 seconds of inactivity.
- **Direct Cadmium API Bridge** — Communicates with Netflix's internal Cadmium player via `postMessage` for accurate timeline seeking and duration synchronization (with automatic fallback to HTML5 `<video>` seeking).
- **Interactive Timeline Scrubber** — Drag-to-seek progress bar with buffer indicator, hover timestamp tooltip, and remaining-time readout.
- **Audio & Subtitles Menu** — Two-column track selector powered by the Cadmium API, filtering out forced-narrative clutter for cleaner lists.
- **Automatic Title & Episode Metadata** — Displays movie or series title and `S#:E#` episode tag using Falcor cache, player state, Media Session metadata, and DOM fallbacks.
- **Playback Speed & Volume Controls** — Cycle speeds (`1x`, `1.25x`, `1.5x`), mute toggle, and a hover-expandable volume slider.
- **Top Bar & Safari AirPlay** — Quick Back-to-Browse button and native AirPlay picker support (`webkitShowPlaybackTargetPicker`) on Safari/macOS.
- **Site-Wide Modal Hider** — Automatically hides blocking overlay modals (`div[data-no-focus-lock="true"]`) across Netflix using CSS rules and a `MutationObserver`.
- **Single File, Zero Dependencies** — No build tools or external libraries required, with built-in automatic updates.

## Browser Support & Installation

| Browser | Recommended Manager | Notes |
| :--- | :--- | :--- |
| **Chrome / Brave / Edge / Opera** | [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/) | **Important (Manifest V3): You must enable Developer Mode in `chrome://extensions` (or your browser's extensions page), otherwise the userscript manager cannot inject scripts.** |
| **Firefox** | [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/) | Works out of the box with no additional configuration. |
| **Safari (macOS)** | [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (free, open-source on the App Store) | Requires selecting a scripts folder in the extension settings; enables the native **AirPlay** button in the top bar. |

### Quick 3-Step Install

1. Install one of the userscript managers listed above for your browser (and enable **Developer Mode** if using a Chromium-based browser).
2. Click the 1-click install link: **[Install Netflix Nomad (`netflix-nomad.user.js`)](https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js)** — your userscript manager will intercept the `.user.js` file and prompt you to confirm installation.
3. Open [Netflix](https://www.netflix.com/) and start watching any title.

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `←` | Seek backward 10 seconds |
| `→` | Seek forward 10 seconds |
| `F` | Toggle fullscreen |
| `M` | Mute / Unmute |
| `Esc` | Close Audio & Subtitles menu |

Clicking anywhere on the video area (outside controls and interactive elements) also toggles Play / Pause.

## Automatic Updates

The script includes `@downloadURL` and `@updateURL` headers pointing to `raw.githubusercontent.com`. When a new version is published, your userscript manager will check for and apply updates automatically according to its update schedule.

## License & Disclaimer

Licensed under the [MIT License](LICENSE).

This is an independent open-source project and is not affiliated with, endorsed by, or connected to Netflix, Inc.
