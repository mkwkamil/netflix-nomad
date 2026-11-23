# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-11-23

### Added
- Initial public GitHub release packaged as a standalone `.user.js` userscript (`netflix-nomad.user.js`) for 1-click installation and automatic updates via `@downloadURL` and `@updateURL`.
- Custom native-style player overlay on `/watch` pages with auto-hide controls and cursor hiding after 2.5 seconds of inactivity.
- Page-context Cadmium API bridge (`postMessage`) supporting accurate seeking, duration/time sync, and HTML5 video fallback.
- Interactive timeline scrubber with buffer progress bar, hover timestamp tooltip, and remaining time display.
- Two-column Audio and Subtitles track selector powered by Cadmium track APIs.
- Automatic title and `S#:E#` episode subtitle resolution via Falcor cache, player state, Media Session API, and DOM fallbacks.
- Playback speed cycling (`1x`, `1.25x`, `1.5x`), hover-expandable volume slider, fullscreen toggle, and top navigation bar with Safari AirPlay picker support.
- Keyboard shortcuts (`Space`, `ArrowLeft`, `ArrowRight`, `F`, `M`, `Escape`) and click-to-toggle playback.
- Site-wide overlay modal hider (`div[data-no-focus-lock="true"]`) via injected CSS and `MutationObserver`.
