/**
 * LiveTVPlayer — universal live-stream player.
 *
 * Supports:
 *   • HLS  (.m3u8 / application/vnd.apple.mpegurl)  via hls.js
 *   • MPEG-DASH  (.mpd)  via dash.js
 *   • Direct MP4 / WebM / any native src  via HTML5 <video>
 *
 * Anti-theft: src getter locked to "" for extensions, DevTools blanks screen.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import Hls from "hls.js";
// @ts-ignore – dashjs types optional
import dashjs from "dashjs";

/* ── DevTools detection ─────────────────────────────────────────────────── */
function useDevToolsBlock(onOpen: () => void, onClose: () => void) {
  useEffect(() => {
    let open = false;
    const check = () => {
      const detected = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
      if (detected && !open) { open = true; onOpen(); }
      else if (!detected && open) { open = false; onClose(); }
      if (open) { try { console.clear(); performance.clearResourceTimings(); } catch (_) {} }
    };
    const id = setInterval(check, 600);
    return () => clearInterval(id);
  }, [onOpen, onClose]);
}

function lockVideoSrc(el: HTMLVideoElement) {
  try {
    const d = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, "src");
    if (!d) return;
    let _real = el.src;
    Object.defineProperty(el, "src", {
      get: () => "",
      set: (v: string) => { _real = v; d.set?.call(el, v); },
      configurable: true,
    });
    if (_real) d.set?.call(el, _real);
  } catch (_) {}
}

/* ── Format detection ───────────────────────────────────────────────────── */
function detectFormat(url: string): "hls" | "dash" | "native" {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".m3u8") || u.includes("application/vnd.apple.mpegurl")) return "hls";
  if (u.endsWith(".mpd") || u.includes("application/dash+xml")) return "dash";
  return "native";
}

/* ── SVG icons ──────────────────────────────────────────────────────────── */
function PlayIc() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>; }
function PauseIc() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>; }
function FsIc() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>; }
function ExFsIc() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>; }
function VolHi() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>; }
function VolMt() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>; }

interface LiveTVPlayerProps {
  src: string;
  channelName?: string;
  channelLogo?: string;
  onError?: () => void;
}

export default function LiveTVPlayer({ src, channelName, channelLogo, onError }: LiveTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVol, setShowVol] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [devBlock, setDevBlock] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const resetHide = useCallback(() => {
    setShowCtrl(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
  }, []);

  useDevToolsBlock(
    useCallback(() => { videoRef.current?.pause(); setDevBlock(true); }, []),
    useCallback(() => setDevBlock(false), []),
  );

  /* ── Load stream ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    // Destroy previous instances
    hlsRef.current?.destroy();
    hlsRef.current = null;
    dashRef.current?.reset();
    dashRef.current = null;
    setStreamError(null);
    setBuffering(true);
    setPlaying(false);

    const fmt = detectFormat(src);

    if (fmt === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          liveSyncDurationCount: 3,
          lowLatencyMode: false,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          v.play().catch(() => {});
          setTimeout(() => lockVideoSrc(v), 300);
        });
        hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
          if (data.fatal) {
            setStreamError("Stream failed to load. Check the URL.");
            onError?.();
          }
        });
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        v.src = src;
        v.play().catch(() => {});
      }
    } else if (fmt === "dash") {
      const player = dashjs.MediaPlayer().create();
      player.initialize(v, src, true);
      player.on(dashjs.MediaPlayer.events.ERROR, () => {
        setStreamError("DASH stream error. Check the MPD URL.");
        onError?.();
      });
      dashRef.current = player;
      setTimeout(() => lockVideoSrc(v), 300);
    } else {
      // Native direct link
      const d = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, "src");
      if (d?.set) d.set.call(v, src);
      else v.src = src;
      v.load();
      v.play().catch(() => {});
      setTimeout(() => lockVideoSrc(v), 300);
    }

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWait = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWait);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("playing", onCanPlay);
    document.addEventListener("fullscreenchange", onFs);

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      try { dashRef.current?.reset(); } catch (_) {}
      dashRef.current = null;
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWait);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("playing", onCanPlay);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [src]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || devBlock) return;
    if (v.paused) v.play(); else v.pause();
    resetHide();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const changeVol = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };
  const toggleFs = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={resetHide}
      onMouseLeave={() => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowCtrl(false); }}
      onMouseEnter={resetHide}
      style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden", userSelect: "none" }}
    >
      <video
        ref={videoRef}
        disablePictureInPicture
        playsInline
        muted={muted}
        controlsList="nodownload noremoteplayback"
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
      />

      {/* DevTools block */}
      {devBlock && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,60,60,0.12)", border: "2px solid rgba(255,60,60,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>Playback Paused</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, textAlign: "center", maxWidth: 240, lineHeight: 1.6 }}>Close developer tools to continue watching.</p>
        </div>
      )}

      {/* Error */}
      {streamError && !devBlock && (
        <div style={{ position: "absolute", inset: 0, zIndex: 15, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6060" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <p style={{ color: "#ff8080", fontSize: 14, fontWeight: 600, margin: 0 }}>{streamError}</p>
        </div>
      )}

      {/* Buffering spinner */}
      {buffering && !devBlock && !streamError && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(255,255,255,0.12)", borderTop: "3px solid #00a9f5", borderRadius: "50%", animation: "ltvSpin 0.8s linear infinite" }} />
          <style>{`@keyframes ltvSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Click area */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, cursor: showCtrl ? "default" : "none" }}
        onClick={devBlock ? undefined : togglePlay}
        onDoubleClick={devBlock ? undefined : toggleFs}
      />

      {/* Controls */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
        padding: "32px 14px 12px",
        opacity: showCtrl ? 1 : 0, transition: "opacity 0.3s",
        pointerEvents: showCtrl ? "auto" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#fff" }}>
              {playing ? <PauseIc /> : <PlayIc />}
            </button>
            {/* Live badge */}
            <span style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,40,40,0.85)", borderRadius: 4, padding: "3px 8px", fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.06em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "ltvSpin 1s linear infinite" }} /> LIVE
            </span>
            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} onMouseEnter={() => setShowVol(true)} onMouseLeave={() => setShowVol(false)}>
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#fff" }}>
                {muted || volume === 0 ? <VolMt /> : <VolHi />}
              </button>
              <div style={{ width: showVol ? 70 : 0, overflow: "hidden", transition: "width 0.2s", display: "flex", alignItems: "center" }}>
                <input type="range" min={0} max={1} step={0.02} value={muted ? 0 : volume}
                  onChange={(e) => changeVol(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 70, accentColor: "#00a9f5", cursor: "pointer" }} />
              </div>
            </div>
            {/* Channel info */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
              {channelLogo && <img src={channelLogo} alt="" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3 }} />}
              {channelName && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{channelName}</span>}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleFs(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#fff" }}>
            {fullscreen ? <ExFsIc /> : <FsIc />}
          </button>
        </div>
      </div>
    </div>
  );
}
