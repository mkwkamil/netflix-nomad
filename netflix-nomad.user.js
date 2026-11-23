// ==UserScript==
// @name         Netflix Nomad
// @namespace    https://github.com/mkwkamil/netflix-nomad
// @version      3.0.0
// @description  Custom native-style player controls for Netflix with Cadmium API seek, audio/subtitles menu, AirPlay support, and modal hider.
// @author       mkwkamil
// @license      MIT
// @match        https://www.netflix.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=netflix.com
// @homepageURL  https://github.com/mkwkamil/netflix-nomad
// @supportURL   https://github.com/mkwkamil/netflix-nomad/issues
// @downloadURL  https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js
// @updateURL    https://raw.githubusercontent.com/mkwkamil/netflix-nomad/main/netflix-nomad.user.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const MODAL_SELECTOR = 'div[data-no-focus-lock="true"]';
    const MODAL_HIDDEN_ATTR = 'data-nf-hidden';

    const IDS = {
        modalStyle: 'nf-hide-modal-style',
        style: 'nf-custom-controls-style',
        wrapper: 'nf-custom-player-overlay',
        topBar: 'nf-custom-top-bar',
        bridge: 'nf-custom-cadmium-bridge'
    };

    const BRIDGE_REQ = 'NF_CUSTOM_BRIDGE_REQ';
    const BRIDGE_RES = 'NF_CUSTOM_BRIDGE_RES';
    const HIDE_DELAY_MS = 2500;
    const SPEEDS = [1, 1.25, 1.5];

    const ICONS = {
        play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l16 9-16 9V3z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
        back10: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-3.3L9 13v-.7l1.8-.6h.1V16zm4.3-1.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1.3.2.5.3.2.3.3.6.1.5.1.8v.7zm-.9-.8v-.5s-.1-.2-.1-.3-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5z"/></svg>',
        fwd10: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11H10v-3.3L9 13v-.7l1.8-.6h.1V16zm4.3-1.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1-.4 0-.6-.1-.3-.2-.5-.3-.2-.3-.3-.6-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1.4 0 .6.1.3.2.5.3.2.3.3.6.1.5.1.8v.7zm-.9-.8v-.5s-.1-.2-.1-.3-.1-.1-.2-.2-.2-.1-.3-.1-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3.1.1.2.2.2.1.3.1.2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5z"/></svg>',
        volHigh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
        volLow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
        volMute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
        subtitles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z"/></svg>',
        fullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
        exitFullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
        backArrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
        airplay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>',
        check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
    };

    const state = {
        video: null,
        wrapper: null,
        topBar: null,
        uiController: null,
        isDragging: false,
        isDraggingVol: false,
        isMenuOpen: false,
        pendingSeekTime: null,
        hideTimer: null,
        cadmiumTime: null,
        cadmiumDuration: null,
        lastTimeSync: 0,
        bridgeInjected: false,
        reqCounter: 0,
        pendingBridgeCalls: new Map()
    };

    const ensureModalStyles = () => {
        if (document.getElementById(IDS.modalStyle)) return;
        const style = document.createElement('style');
        style.id = IDS.modalStyle;
        style.textContent = `
            ${MODAL_SELECTOR} {
                position: fixed !important;
                left: -99999px !important;
                top: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
                z-index: -1 !important;
                transform: none !important;
                animation: none !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    };

    const hideModalEl = (el) => {
        if (!el || el.hasAttribute(MODAL_HIDDEN_ATTR)) return;
        el.setAttribute(MODAL_HIDDEN_ATTR, '1');
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('left', '-99999px', 'important');
        el.style.setProperty('top', '0', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('z-index', '-1', 'important');
    };

    const hideAllModals = () => {
        document.querySelectorAll(MODAL_SELECTOR).forEach(hideModalEl);
    };

    const isWatchPage = () => window.location.pathname.includes('/watch');

    const isEditableElement = (el) => {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const total = Math.floor(seconds);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = String(total % 60).padStart(2, '0');
        return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
    };

    const getVolumeIcon = (v) => {
        if (v.muted || v.volume === 0) return ICONS.volMute;
        return v.volume < 0.5 ? ICONS.volLow : ICONS.volHigh;
    };

    const getEffectiveDuration = (v) => {
        if (Number.isFinite(state.cadmiumDuration) && state.cadmiumDuration > 0) {
            return state.cadmiumDuration;
        }
        return v && Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
    };

    const getEffectiveCurrentTime = (v) => {
        if (Number.isFinite(state.cadmiumTime) && state.cadmiumTime >= 0) {
            return state.cadmiumTime;
        }
        return v && Number.isFinite(v.currentTime) && v.currentTime >= 0 ? v.currentTime : 0;
    };

    const BRIDGE_LOGIC_SOURCE = `
        const getActivePlayer = () => {
            const vp = window.netflix?.appContext?.state?.playerApp?.getAPI?.()?.videoPlayer;
            if (!vp) return null;
            const sessions = vp.getAllPlayerSessionIds?.() || [];
            const sessionId = sessions.find((s) => typeof s === 'string' && s.startsWith('watch-')) || sessions[sessions.length - 1];
            return sessionId ? vp.getVideoPlayerBySessionId?.(sessionId) : null;
        };

        const unwrapVal = (node) => {
            if (node == null) return '';
            if (typeof node === 'string' || typeof node === 'number') return String(node);
            if (typeof node === 'object' && 'value' in node) return unwrapVal(node.value);
            return '';
        };

        const getCurrentMovieId = (player) => {
            const urlMatch = window.location.pathname.match(/\\/watch\\/(\\d+)/);
            return String(player?.getMovieId?.() || urlMatch?.[1] || '');
        };

        const getMetadata = (player) => {
            let title = '';
            let subtitle = '';

            const movieId = getCurrentMovieId(player);
            const cache = window.netflix?.falcorCache;
            const videoNode = movieId && cache?.videos?.[movieId] ? cache.videos[movieId] : null;

            if (videoNode) {
                title =
                    unwrapVal(videoNode.title) ||
                    unwrapVal(videoNode.summary?.value?.title) ||
                    unwrapVal(videoNode.jawSummary?.value?.title);

                const seasonNum = unwrapVal(videoNode.seasonNumber) || unwrapVal(videoNode.season?.value);
                const epNum = unwrapVal(videoNode.episodeNumber) || unwrapVal(videoNode.episode?.value);
                const ancestorRef = videoNode.ancestor?.value;
                const showId = Array.isArray(ancestorRef) ? ancestorRef[1] : null;
                const showTitle = showId && cache?.videos?.[showId] ? unwrapVal(cache.videos[showId].title) : '';

                if (showTitle && showTitle !== title) {
                    const epTag = [seasonNum ? 'S' + seasonNum : '', epNum ? 'E' + epNum : ''].filter(Boolean).join(':');
                    subtitle = [epTag, title].filter(Boolean).join(' ');
                    title = showTitle;
                }
            }

            if (!title) {
                try {
                    const pState = window.netflix?.appContext?.state?.playerApp?.getState?.();
                    const metaMap = pState?.videoPlayer?.videoMetadata;
                    const entry = (movieId && metaMap?.[movieId]) || (metaMap && Object.values(metaMap)[0]);
                    const vMeta = entry?._video || entry?.video || entry;
                    if (vMeta) {
                        const rawTitle = unwrapVal(vMeta.title);
                        if (rawTitle) title = rawTitle;
                    }
                } catch (_) {}
            }

            if (!title && navigator.mediaSession?.metadata) {
                const ms = navigator.mediaSession.metadata;
                if (ms.album && ms.title && ms.album !== ms.title) {
                    title = ms.album;
                    subtitle = ms.title;
                } else if (ms.artist && ms.title && ms.artist !== ms.title && ms.artist.toLowerCase() !== 'netflix') {
                    title = ms.artist;
                    subtitle = ms.title;
                } else if (ms.title && ms.title.toLowerCase() !== 'netflix') {
                    title = ms.title;
                }
            }

            if (!title) {
                const domTitleEl = document.querySelector('[data-uia="video-title"], [data-uia="player-title"]');
                if (domTitleEl) {
                    const parts = Array.from(domTitleEl.querySelectorAll('h4, span')).map((el) => el.textContent.trim()).filter(Boolean);
                    if (parts.length > 0) {
                        title = parts[0];
                        if (parts.length > 1) subtitle = parts.slice(1).join(' ');
                    } else {
                        title = domTitleEl.textContent.trim();
                    }
                }
            }

            if (!title) {
                const docTitle = document.title.replace(/\\s*[-|–]\\s*Netflix$/i, '').trim();
                if (docTitle && docTitle.toLowerCase() !== 'netflix') title = docTitle;
            }

            return { title, subtitle };
        };

        const handleAction = (action, payload) => {
            const player = getActivePlayer();
            if (action === 'GET_META') {
                return { ok: true, data: getMetadata(player) };
            }
            if (!player) return { ok: false };

            if (action === 'GET_TIME') {
                const curMs = player.getCurrentTime?.();
                const durMs = player.getDuration?.();
                if (Number.isFinite(curMs) && Number.isFinite(durMs) && durMs > 0) {
                    return {
                        ok: true,
                        data: { currentTime: curMs / 1000, duration: durMs / 1000 }
                    };
                }
                return { ok: false };
            }

            if (action === 'SEEK') {
                if (typeof player.seek !== 'function') return { ok: false };
                player.seek(payload.timeMs);
                if (payload.shouldResume && typeof player.play === 'function') {
                    player.play();
                }
                return { ok: true };
            }

            if (action === 'GET_TRACKS') {
                const audioList = player.getAudioTrackList?.() || [];
                const activeAudio = player.getAudioTrack?.();
                const textList = player.getTimedTextTrackList?.() || [];
                const activeText = player.getTimedTextTrack?.();

                const audio = audioList.map((t) => ({
                    id: t.trackId,
                    name: t.displayName || t.bcp47 || 'Audio',
                    active: activeAudio ? t.trackId === activeAudio.trackId : false
                }));

                const subtitles = textList
                    .filter((t) => !t.isForcedNarrative && t.trackType !== 'FORCED_NARRATIVE')
                    .map((t) => ({
                        id: t.trackId,
                        name: t.isNoneTrack ? 'Wyłączone' : (t.displayName || t.bcp47 || 'Napisy'),
                        isNone: Boolean(t.isNoneTrack),
                        active: activeText ? t.trackId === activeText.trackId : false
                    }));

                return { ok: true, data: { audio, subtitles } };
            }

            if (action === 'SET_AUDIO') {
                const list = player.getAudioTrackList?.() || [];
                const target = list.find((t) => t.trackId === payload.trackId);
                if (target && typeof player.setAudioTrack === 'function') {
                    player.setAudioTrack(target);
                    return { ok: true };
                }
                return { ok: false };
            }

            if (action === 'SET_SUBTITLE') {
                const list = player.getTimedTextTrackList?.() || [];
                const target = list.find((t) => t.trackId === payload.trackId);
                if (target && typeof player.setTimedTextTrack === 'function') {
                    player.setTimedTextTrack(target);
                    return { ok: true };
                }
                return { ok: false };
            }

            return { ok: false };
        };
    `;

    const injectPageBridge = () => {
        if (state.bridgeInjected || document.getElementById(IDS.bridge)) return;
        const script = document.createElement('script');
        script.id = IDS.bridge;
        script.textContent = `
            (() => {
                if (window.__nfCustomBridgeInstalled) return;
                window.__nfCustomBridgeInstalled = true;
                ${BRIDGE_LOGIC_SOURCE}
                window.addEventListener('message', (event) => {
                    if (event.source !== window || !event.data || event.data.type !== '${BRIDGE_REQ}') return;
                    const { id, action, payload } = event.data;
                    let result = { ok: false };
                    try {
                        result = handleAction(action, payload || {});
                    } catch (_) {}
                    window.postMessage({ type: '${BRIDGE_RES}', id, ...result }, '*');
                });
            })();
        `;
        (document.head || document.documentElement).appendChild(script);
        state.bridgeInjected = true;
    };

    window.addEventListener('message', (event) => {
        if (event.source !== window || !event.data || event.data.type !== BRIDGE_RES) return;
        const resolver = state.pendingBridgeCalls.get(event.data.id);
        if (resolver) {
            state.pendingBridgeCalls.delete(event.data.id);
            resolver({ ok: Boolean(event.data.ok), data: event.data.data });
        }
    });

    const callBridge = (action, payload = {}) => new Promise((resolve) => {
        injectPageBridge();
        const id = ++state.reqCounter;
        const timer = setTimeout(() => {
            if (state.pendingBridgeCalls.has(id)) {
                state.pendingBridgeCalls.delete(id);
                resolve({ ok: false, data: null });
            }
        }, 120);

        state.pendingBridgeCalls.set(id, (res) => {
            clearTimeout(timer);
            resolve(res);
        });

        window.postMessage({ type: BRIDGE_REQ, id, action, payload }, '*');
    });

    const syncCadmiumTime = async (force = false) => {
        const now = Date.now();
        if (!force && now - state.lastTimeSync < 220) return;
        state.lastTimeSync = now;

        const res = await callBridge('GET_TIME');
        if (res.ok && res.data && Number.isFinite(res.data.duration) && res.data.duration > 0) {
            state.cadmiumTime = res.data.currentTime;
            state.cadmiumDuration = res.data.duration;
        }
    };

    const fallbackVideoSeek = (clampedSeconds, shouldResume) => {
        const v = state.video;
        if (!v) return;
        try {
            v.currentTime = clampedSeconds;
            if (shouldResume) {
                v.play().catch(() => {});
            }
        } catch (_) {}
    };

    const scheduleResumeAfterSeek = (videoEl) => {
        const onSeeked = () => {
            clearTimeout(cleanupTimer);
            if (videoEl === state.video && videoEl.paused) {
                videoEl.play().catch(() => {});
            }
        };
        const cleanupTimer = setTimeout(() => {
            videoEl.removeEventListener('seeked', onSeeked);
        }, 1500);
        videoEl.addEventListener('seeked', onSeeked, { once: true });
    };

    const seekTo = async (targetSeconds, { resumeIfPlaying = false } = {}) => {
        const v = state.video;
        const duration = getEffectiveDuration(v);
        if (!v || duration <= 0) return;

        const shouldResume = resumeIfPlaying && !v.paused;
        const clamped = Math.max(0, Math.min(duration, targetSeconds));
        const timeMs = Math.round(clamped * 1000);

        if (state.cadmiumDuration !== null) {
            state.cadmiumTime = clamped;
        }

        if (shouldResume) {
            scheduleResumeAfterSeek(v);
        }

        const res = await callBridge('SEEK', { timeMs, shouldResume });
        if (!res.ok) {
            fallbackVideoSeek(clamped, shouldResume);
        }
    };

    const ensurePlayerStyles = () => {
        if (document.getElementById(IDS.style)) return;
        const style = document.createElement('style');
        style.id = IDS.style;
        style.textContent = `
            #${IDS.topBar} {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                padding: 24px 36px 48px 36px !important;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78) 0%, transparent 100%) !important;
                z-index: 2147483646 !important;
                font-family: 'Netflix Sans', 'Helvetica Neue', Segoe UI, Roboto, Ubuntu, sans-serif !important;
                color: #ffffff !important;
                user-select: none !important;
                transition: opacity 0.22s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                box-sizing: border-box !important;
                pointer-events: none !important;
            }
            #${IDS.topBar} > * {
                pointer-events: auto !important;
            }
            #${IDS.topBar}.nf-hidden,
            #${IDS.topBar}.nf-hidden > * {
                opacity: 0 !important;
                pointer-events: none !important;
            }
            .nf-btn-airplay {
                opacity: 0.42 !important;
            }
            .nf-btn-airplay svg {
                fill: rgba(220, 220, 220, 0.85) !important;
            }
            .nf-btn-airplay:hover {
                opacity: 0.82 !important;
            }
            #${IDS.wrapper} {
                position: fixed !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                padding: 64px 36px 24px 36px !important;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.55) 48%, transparent 100%) !important;
                z-index: 2147483647 !important;
                font-family: 'Netflix Sans', 'Helvetica Neue', Segoe UI, Roboto, Ubuntu, sans-serif !important;
                color: #ffffff !important;
                user-select: none !important;
                transition: opacity 0.22s ease !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 14px !important;
                box-sizing: border-box !important;
            }
            #${IDS.wrapper}.nf-hidden {
                opacity: 0 !important;
                pointer-events: none !important;
            }
            body.nf-hide-cursor,
            body.nf-hide-cursor * {
                cursor: none !important;
            }
            .nf-timeline-row {
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
            }
            .nf-progress-container {
                position: relative;
                flex: 1;
                height: 22px;
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .nf-progress-track {
                position: relative;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.26);
                border-radius: 2px;
                transition: height 0.12s ease;
            }
            .nf-progress-container:hover .nf-progress-track,
            .nf-progress-container.dragging .nf-progress-track {
                height: 6px;
            }
            .nf-progress-buffer {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: rgba(255, 255, 255, 0.42);
                border-radius: 2px;
                width: 0%;
                pointer-events: none;
            }
            .nf-progress-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: #e50914;
                border-radius: 2px;
                width: 0%;
                pointer-events: none;
            }
            .nf-progress-thumb {
                position: absolute;
                top: 50%;
                left: 0%;
                width: 14px;
                height: 14px;
                background: #e50914;
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                transition: transform 0.12s ease;
                pointer-events: none;
            }
            .nf-progress-container:hover .nf-progress-thumb,
            .nf-progress-container.dragging .nf-progress-thumb {
                transform: translate(-50%, -50%) scale(1.15);
            }
            .nf-time-tooltip {
                position: absolute;
                bottom: 24px;
                left: 0;
                transform: translateX(-50%);
                background: rgba(20, 20, 20, 0.92);
                color: #fff;
                font-size: 13px;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                padding: 4px 8px;
                border-radius: 3px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.1s ease;
                white-space: nowrap;
            }
            .nf-progress-container:hover .nf-time-tooltip,
            .nf-progress-container.dragging .nf-time-tooltip {
                opacity: 1;
            }
            .nf-time-display {
                font-size: 14px;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                color: rgba(255, 255, 255, 0.92);
                min-width: 56px;
                text-align: right;
            }
            .nf-controls-row {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
            }
            .nf-controls-left,
            .nf-controls-right {
                display: flex;
                align-items: center;
                gap: 18px;
                position: relative;
                z-index: 2;
            }
            .nf-controls-center {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                max-width: 46%;
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: 10px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                pointer-events: none;
            }
            .nf-meta-title {
                font-size: 16px;
                font-weight: 700;
                color: #ffffff;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .nf-meta-subtitle {
                font-size: 15px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.65);
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .nf-btn {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.88;
                transition: transform 0.14s ease, opacity 0.14s ease;
            }
            .nf-btn:hover {
                opacity: 1;
                transform: scale(1.12);
            }
            .nf-btn:active {
                transform: scale(0.95);
            }
            .nf-btn svg {
                width: 28px;
                height: 28px;
                fill: #fff;
            }
            .nf-speed-btn {
                font-size: 15px;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                min-width: 42px;
            }
            .nf-volume-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .nf-vol-container {
                position: relative;
                width: 0;
                height: 22px;
                opacity: 0;
                overflow: hidden;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: width 0.18s ease, opacity 0.18s ease;
            }
            .nf-volume-group:hover .nf-vol-container,
            .nf-vol-container.dragging {
                width: 96px;
                opacity: 1;
                overflow: visible;
            }
            .nf-vol-track {
                position: relative;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.26);
                border-radius: 2px;
                transition: height 0.12s ease;
            }
            .nf-vol-container:hover .nf-vol-track,
            .nf-vol-container.dragging .nf-vol-track {
                height: 5px;
            }
            .nf-vol-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: #e50914;
                border-radius: 2px;
                width: 100%;
                pointer-events: none;
            }
            .nf-vol-thumb {
                position: absolute;
                top: 50%;
                left: 100%;
                width: 12px;
                height: 12px;
                background: #e50914;
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                transition: transform 0.12s ease;
                pointer-events: none;
            }
            .nf-vol-container:hover .nf-vol-thumb,
            .nf-vol-container.dragging .nf-vol-thumb {
                transform: translate(-50%, -50%) scale(1.15);
            }
            .nf-tracks-menu {
                position: absolute;
                bottom: 50px;
                right: 0;
                display: none;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                min-width: 380px;
                max-width: 520px;
                background: rgba(24, 24, 24, 0.96);
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 6px;
                padding: 18px 20px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.85);
                z-index: 2147483647;
            }
            .nf-tracks-menu.open {
                display: grid;
            }
            .nf-tracks-col {
                display: flex;
                flex-direction: column;
                min-width: 0;
            }
            .nf-tracks-heading {
                font-size: 16px;
                font-weight: 700;
                color: #fff;
                margin: 0 0 12px 0;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.14);
            }
            .nf-scroll-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                max-height: 280px;
                overflow-y: auto;
                padding-right: 4px;
            }
            .nf-list-item {
                display: flex;
                align-items: center;
                gap: 10px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.78);
                font-family: inherit;
                font-size: 14px;
                text-align: left;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.12s ease, color 0.12s ease;
            }
            .nf-list-item:hover {
                background: rgba(255, 255, 255, 0.12);
                color: #fff;
            }
            .nf-list-item.active {
                color: #fff;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.08);
            }
            .nf-track-check {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .nf-track-check svg {
                width: 16px;
                height: 16px;
                fill: #e50914;
                opacity: 0;
            }
            .nf-list-item.active .nf-track-check svg {
                opacity: 1;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    };

    const showControls = () => {
        if (!state.wrapper || !isWatchPage()) return;
        state.wrapper.classList.remove('nf-hidden');
        state.topBar?.classList.remove('nf-hidden');
        document.body?.classList.remove('nf-hide-cursor');
        clearTimeout(state.hideTimer);

        state.hideTimer = setTimeout(() => {
            if (
                state.video &&
                !state.video.paused &&
                !state.isDragging &&
                !state.isDraggingVol &&
                !state.isMenuOpen &&
                state.wrapper
            ) {
                state.wrapper.classList.add('nf-hidden');
                state.topBar?.classList.add('nf-hidden');
                document.body?.classList.add('nf-hide-cursor');
            }
        }, HIDE_DELAY_MS);
    };

    const togglePlay = () => {
        const v = state.video;
        if (!v) return;
        if (v.paused) {
            v.play().catch(() => {});
        } else {
            v.pause();
        }
    };

    const toggleMute = () => {
        const v = state.video;
        if (!v) return;
        v.muted = !v.muted;
        if (!v.muted && v.volume === 0) {
            v.volume = 0.5;
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    };

    window.addEventListener('mousemove', showControls, { capture: true, passive: true });

    window.addEventListener('keydown', (e) => {
        if (!state.video || !isWatchPage() || isEditableElement(document.activeElement)) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                e.stopPropagation();
                togglePlay();
                showControls();
                break;
            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation();
                seekTo(getEffectiveCurrentTime(state.video) + 10, { resumeIfPlaying: true });
                showControls();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                e.stopPropagation();
                seekTo(getEffectiveCurrentTime(state.video) - 10, { resumeIfPlaying: true });
                showControls();
                break;
            case 'KeyF':
                e.preventDefault();
                e.stopPropagation();
                toggleFullscreen();
                showControls();
                break;
            case 'KeyM':
                e.preventDefault();
                e.stopPropagation();
                toggleMute();
                showControls();
                break;
            default:
                break;
        }
    }, { capture: true });

    const destroyUI = () => {
        if (state.uiController) {
            state.uiController.abort();
            state.uiController = null;
        }
        if (state.wrapper) {
            state.wrapper.remove();
            state.wrapper = null;
        }
        if (state.topBar) {
            state.topBar.remove();
            state.topBar = null;
        }
        state.video = null;
        state.isDragging = false;
        state.isDraggingVol = false;
        state.isMenuOpen = false;
        state.pendingSeekTime = null;
        state.cadmiumTime = null;
        state.cadmiumDuration = null;
        state.lastTimeSync = 0;
        clearTimeout(state.hideTimer);
        document.body?.classList.remove('nf-hide-cursor');
    };

    const buildUI = (videoEl) => {
        if (!videoEl || !isWatchPage() || !document.body) return;

        destroyUI();
        ensurePlayerStyles();
        injectPageBridge();

        state.video = videoEl;
        const controller = new AbortController();
        state.uiController = controller;
        const { signal } = controller;

        const topBar = document.createElement('div');
        topBar.id = IDS.topBar;
        state.topBar = topBar;

        const backPageBtn = document.createElement('button');
        backPageBtn.type = 'button';
        backPageBtn.className = 'nf-btn';
        backPageBtn.title = 'Wróć do przeglądania';
        backPageBtn.innerHTML = ICONS.backArrow;
        backPageBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'https://www.netflix.com/browse';
            }
        }, { signal });

        topBar.appendChild(backPageBtn);

        if (typeof videoEl.webkitShowPlaybackTargetPicker === 'function') {
            const airplayBtn = document.createElement('button');
            airplayBtn.type = 'button';
            airplayBtn.className = 'nf-btn nf-btn-airplay';
            airplayBtn.title = 'AirPlay';
            airplayBtn.innerHTML = ICONS.airplay;
            airplayBtn.addEventListener('click', () => {
                try {
                    videoEl.webkitShowPlaybackTargetPicker();
                } catch (_) {}
            }, { signal });
            topBar.appendChild(airplayBtn);
        }

        document.body.appendChild(topBar);

        const wrapper = document.createElement('div');
        wrapper.id = IDS.wrapper;
        state.wrapper = wrapper;

        const timelineRow = document.createElement('div');
        timelineRow.className = 'nf-timeline-row';

        const progressContainer = document.createElement('div');
        progressContainer.className = 'nf-progress-container';

        const track = document.createElement('div');
        track.className = 'nf-progress-track';

        const bufferBar = document.createElement('div');
        bufferBar.className = 'nf-progress-buffer';

        const fillBar = document.createElement('div');
        fillBar.className = 'nf-progress-fill';

        const thumb = document.createElement('div');
        thumb.className = 'nf-progress-thumb';

        const tooltip = document.createElement('div');
        tooltip.className = 'nf-time-tooltip';
        tooltip.textContent = '0:00';

        track.append(bufferBar, fillBar, thumb);
        progressContainer.append(track, tooltip);

        const timeRemaining = document.createElement('span');
        timeRemaining.className = 'nf-time-display';
        timeRemaining.textContent = '0:00';

        timelineRow.append(progressContainer, timeRemaining);

        const controlsRow = document.createElement('div');
        controlsRow.className = 'nf-controls-row';

        const leftGroup = document.createElement('div');
        leftGroup.className = 'nf-controls-left';

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'nf-btn';
        playBtn.title = 'Odtwarzaj / Pauza (Spacja)';
        playBtn.addEventListener('click', togglePlay, { signal });

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'nf-btn';
        backBtn.title = 'Cofnij o 10s (Strzałka w lewo)';
        backBtn.innerHTML = ICONS.back10;
        backBtn.addEventListener('click', () => seekTo(getEffectiveCurrentTime(videoEl) - 10, { resumeIfPlaying: true }), { signal });

        const fwdBtn = document.createElement('button');
        fwdBtn.type = 'button';
        fwdBtn.className = 'nf-btn';
        fwdBtn.title = 'Przewiń o 10s (Strzałka w prawo)';
        fwdBtn.innerHTML = ICONS.fwd10;
        fwdBtn.addEventListener('click', () => seekTo(getEffectiveCurrentTime(videoEl) + 10, { resumeIfPlaying: true }), { signal });

        const volGroup = document.createElement('div');
        volGroup.className = 'nf-volume-group';

        const volBtn = document.createElement('button');
        volBtn.type = 'button';
        volBtn.className = 'nf-btn';
        volBtn.title = 'Wycisz (M)';
        volBtn.addEventListener('click', toggleMute, { signal });

        const volContainer = document.createElement('div');
        volContainer.className = 'nf-vol-container';

        const volTrack = document.createElement('div');
        volTrack.className = 'nf-vol-track';

        const volFill = document.createElement('div');
        volFill.className = 'nf-vol-fill';

        const volThumb = document.createElement('div');
        volThumb.className = 'nf-vol-thumb';

        volTrack.append(volFill, volThumb);
        volContainer.appendChild(volTrack);

        const setVolumeFromClientX = (clientX) => {
            const rect = volContainer.getBoundingClientRect();
            if (rect.width <= 0) return;
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            videoEl.volume = ratio;
            videoEl.muted = ratio === 0;
        };

        volContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            state.isDraggingVol = true;
            volContainer.classList.add('dragging');
            setVolumeFromClientX(e.clientX);
        }, { signal });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDraggingVol) return;
            setVolumeFromClientX(e.clientX);
        }, { capture: true, signal });

        window.addEventListener('mouseup', () => {
            if (!state.isDraggingVol) return;
            state.isDraggingVol = false;
            volContainer.classList.remove('dragging');
            showControls();
        }, { capture: true, signal });

        volGroup.append(volBtn, volContainer);
        leftGroup.append(playBtn, backBtn, fwdBtn, volGroup);

        const centerGroup = document.createElement('div');
        centerGroup.className = 'nf-controls-center';

        const titleEl = document.createElement('span');
        titleEl.className = 'nf-meta-title';

        const subtitleEl = document.createElement('span');
        subtitleEl.className = 'nf-meta-subtitle';

        centerGroup.append(titleEl, subtitleEl);

        const refreshMetadata = async () => {
            const res = await callBridge('GET_META');
            if (!res.ok || !res.data || signal.aborted) return false;
            if (res.data.title) {
                titleEl.textContent = res.data.title;
                subtitleEl.textContent = res.data.subtitle || '';
                return true;
            }
            return false;
        };

        let metaAttempts = 0;
        const pollMetadata = async () => {
            if (signal.aborted) return;
            const found = await refreshMetadata();
            if (!found && metaAttempts < 12 && !signal.aborted) {
                metaAttempts++;
                setTimeout(pollMetadata, 1000);
            }
        };

        const rightGroup = document.createElement('div');
        rightGroup.className = 'nf-controls-right';

        const tracksMenu = document.createElement('div');
        tracksMenu.className = 'nf-tracks-menu';

        const audioCol = document.createElement('div');
        audioCol.className = 'nf-tracks-col';
        const audioHeading = document.createElement('div');
        audioHeading.className = 'nf-tracks-heading';
        audioHeading.textContent = 'Audio';
        const audioListEl = document.createElement('div');
        audioListEl.className = 'nf-scroll-list';
        audioCol.append(audioHeading, audioListEl);

        const subCol = document.createElement('div');
        subCol.className = 'nf-tracks-col';
        const subHeading = document.createElement('div');
        subHeading.className = 'nf-tracks-heading';
        subHeading.textContent = 'Napisy';
        const subListEl = document.createElement('div');
        subListEl.className = 'nf-scroll-list';
        subCol.append(subHeading, subListEl);

        tracksMenu.append(audioCol, subCol);

        const closeTracksMenu = () => {
            if (!state.isMenuOpen) return;
            state.isMenuOpen = false;
            tracksMenu.classList.remove('open');
            showControls();
        };

        const renderTracks = async () => {
            const res = await callBridge('GET_TRACKS');
            if (!res.ok || !res.data || signal.aborted) return;

            audioListEl.innerHTML = '';
            subListEl.innerHTML = '';

            res.data.audio.forEach((track) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = `nf-list-item${track.active ? ' active' : ''}`;
                item.innerHTML = `<span class="nf-track-check">${ICONS.check}</span><span></span>`;
                item.lastElementChild.textContent = track.name;
                item.addEventListener('click', async () => {
                    await callBridge('SET_AUDIO', { trackId: track.id });
                    await renderTracks();
                }, { signal });
                audioListEl.appendChild(item);
            });

            res.data.subtitles.forEach((track) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = `nf-list-item${track.active ? ' active' : ''}`;
                item.innerHTML = `<span class="nf-track-check">${ICONS.check}</span><span></span>`;
                item.lastElementChild.textContent = track.name;
                item.addEventListener('click', async () => {
                    await callBridge('SET_SUBTITLE', { trackId: track.id });
                    await renderTracks();
                }, { signal });
                subListEl.appendChild(item);
            });
        };

        const tracksBtn = document.createElement('button');
        tracksBtn.type = 'button';
        tracksBtn.className = 'nf-btn';
        tracksBtn.title = 'Audio i napisy';
        tracksBtn.innerHTML = ICONS.subtitles;
        tracksBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (state.isMenuOpen) {
                closeTracksMenu();
            } else {
                state.isMenuOpen = true;
                tracksMenu.classList.add('open');
                showControls();
                await renderTracks();
            }
        }, { signal });

        tracksMenu.addEventListener('click', (e) => e.stopPropagation(), { signal });

        document.addEventListener('click', (e) => {
            if (e.button !== 0 || state.isDragging || state.isDraggingVol) return;
            if (wrapper.contains(e.target) || topBar.contains(e.target)) return;

            if (state.isMenuOpen) {
                e.preventDefault();
                e.stopPropagation();
                closeTracksMenu();
                return;
            }

            if (e.target.closest('button, a, input, [role="button"]')) return;

            e.preventDefault();
            e.stopPropagation();
            togglePlay();
            showControls();
        }, { capture: true, signal });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && state.isMenuOpen) {
                e.preventDefault();
                e.stopPropagation();
                closeTracksMenu();
            }
        }, { capture: true, signal });

        const speedBtn = document.createElement('button');
        speedBtn.type = 'button';
        speedBtn.className = 'nf-btn nf-speed-btn';
        speedBtn.title = 'Prędkość odtwarzania';
        speedBtn.textContent = `${videoEl.playbackRate}x`;
        speedBtn.addEventListener('click', () => {
            const currentIdx = SPEEDS.indexOf(videoEl.playbackRate);
            const nextRate = SPEEDS[(currentIdx + 1) % SPEEDS.length];
            videoEl.playbackRate = nextRate;
        }, { signal });

        const fsBtn = document.createElement('button');
        fsBtn.type = 'button';
        fsBtn.className = 'nf-btn';
        fsBtn.title = 'Pełny ekran (F)';
        fsBtn.addEventListener('click', toggleFullscreen, { signal });

        rightGroup.append(tracksMenu, tracksBtn, speedBtn, fsBtn);
        controlsRow.append(leftGroup, centerGroup, rightGroup);
        wrapper.append(timelineRow, controlsRow);
        document.body.appendChild(wrapper);

        const getPointerRatio = (clientX) => {
            const rect = progressContainer.getBoundingClientRect();
            if (rect.width <= 0) return 0;
            return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        };

        const updateTooltip = (clientX) => {
            const duration = getEffectiveDuration(videoEl);
            if (duration <= 0) return;
            const ratio = getPointerRatio(clientX);
            tooltip.textContent = formatTime(ratio * duration);
            tooltip.style.left = `${ratio * 100}%`;
        };

        const updateScrubVisual = (clientX) => {
            const duration = getEffectiveDuration(videoEl);
            if (duration <= 0) return null;
            const ratio = getPointerRatio(clientX);
            const targetTime = ratio * duration;
            fillBar.style.width = `${ratio * 100}%`;
            thumb.style.left = `${ratio * 100}%`;
            timeRemaining.textContent = formatTime(duration - targetTime);
            updateTooltip(clientX);
            return targetTime;
        };

        const updatePlayState = () => {
            playBtn.innerHTML = videoEl.paused ? ICONS.play : ICONS.pause;
            if (videoEl.paused) showControls();
        };

        const updateVolumeState = () => {
            const effectiveVol = videoEl.muted ? 0 : videoEl.volume;
            const pct = Math.round(effectiveVol * 100);
            volBtn.innerHTML = getVolumeIcon(videoEl);
            volFill.style.width = `${pct}%`;
            volThumb.style.left = `${pct}%`;
        };

        const updateRateState = () => {
            speedBtn.textContent = `${videoEl.playbackRate}x`;
        };

        const updateFullscreenState = () => {
            fsBtn.innerHTML = document.fullscreenElement ? ICONS.exitFullscreen : ICONS.fullscreen;
        };

        const renderProgressBar = () => {
            if (state.isDragging) return;
            const duration = getEffectiveDuration(videoEl);
            if (duration <= 0) return;

            const currentTime = Math.min(duration, getEffectiveCurrentTime(videoEl));
            const pct = (currentTime / duration) * 100;
            fillBar.style.width = `${pct}%`;
            thumb.style.left = `${pct}%`;
            timeRemaining.textContent = formatTime(duration - currentTime);

            if (videoEl.buffered.length > 0) {
                let bufferedEnd = 0;
                for (let i = 0; i < videoEl.buffered.length; i++) {
                    if (videoEl.buffered.start(i) <= videoEl.currentTime && videoEl.buffered.end(i) >= videoEl.currentTime) {
                        bufferedEnd = videoEl.buffered.end(i);
                        break;
                    }
                }
                if (bufferedEnd === 0) {
                    bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
                }
                bufferBar.style.width = `${Math.min(100, (bufferedEnd / duration) * 100)}%`;
            }
        };

        const updateProgress = async (forceSync = false) => {
            await syncCadmiumTime(forceSync);
            if (!signal.aborted) {
                renderProgressBar();
            }
        };

        progressContainer.addEventListener('mousemove', (e) => {
            updateTooltip(e.clientX);
        }, { signal });

        progressContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            state.isDragging = true;
            progressContainer.classList.add('dragging');
            state.pendingSeekTime = updateScrubVisual(e.clientX);
        }, { signal });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            state.pendingSeekTime = updateScrubVisual(e.clientX);
        }, { capture: true, signal });

        window.addEventListener('mouseup', () => {
            if (!state.isDragging) return;
            state.isDragging = false;
            progressContainer.classList.remove('dragging');
            if (state.pendingSeekTime !== null) {
                const target = state.pendingSeekTime;
                state.pendingSeekTime = null;
                seekTo(target, { resumeIfPlaying: false });
            }
            showControls();
        }, { capture: true, signal });

        ['play', 'playing', 'pause', 'waiting', 'seeking', 'seeked'].forEach((evt) => {
            videoEl.addEventListener(evt, updatePlayState, { signal });
        });
        ['timeupdate', 'progress'].forEach((evt) => {
            videoEl.addEventListener(evt, () => updateProgress(false), { signal });
        });
        ['loadedmetadata', 'durationchange', 'seeked'].forEach((evt) => {
            videoEl.addEventListener(evt, () => updateProgress(true), { signal });
        });
        videoEl.addEventListener('loadedmetadata', refreshMetadata, { signal });
        videoEl.addEventListener('playing', refreshMetadata, { signal });
        videoEl.addEventListener('volumechange', updateVolumeState, { signal });
        videoEl.addEventListener('ratechange', updateRateState, { signal });
        document.addEventListener('fullscreenchange', updateFullscreenState, { signal });

        updatePlayState();
        updateVolumeState();
        updateRateState();
        updateFullscreenState();
        updateProgress(true);
        pollMetadata();
        showControls();
    };

    const syncLifecycle = () => {
        if (!isWatchPage()) {
            if (state.wrapper || state.video) destroyUI();
            return;
        }

        const currentVideo = document.querySelector('video');
        if (!currentVideo) {
            if (state.wrapper || state.video) destroyUI();
            return;
        }

        if (
            currentVideo !== state.video ||
            !state.wrapper ||
            !document.body.contains(state.wrapper) ||
            !state.topBar ||
            !document.body.contains(state.topBar)
        ) {
            buildUI(currentVideo);
        }
    };

    const boot = () => {
        ensureModalStyles();

        if (!document.body) {
            setTimeout(boot, 100);
            return;
        }

        hideAllModals();
        syncLifecycle();

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.matches?.(MODAL_SELECTOR)) hideModalEl(node);
                    node.querySelectorAll?.(MODAL_SELECTOR).forEach(hideModalEl);
                });
            }
            syncLifecycle();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('popstate', syncLifecycle);
        setInterval(syncLifecycle, 600);
    };

    boot();
})();
