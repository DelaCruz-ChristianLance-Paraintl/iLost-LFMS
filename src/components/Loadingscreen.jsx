import { useEffect, useState } from "react";
import "./Loadingscreen.css";

const EXIT_MS = 380; // must match the il-fade-out duration in Loadingscreen.css

// Positions for the drifting bubbles (kept static so renders stay cheap)
const BUBBLES = [
  { x: "8%",  s: "14px", d: "9s",  delay: "-2s" },
  { x: "22%", s: "9px",  d: "11s", delay: "-6s" },
  { x: "37%", s: "18px", d: "13s", delay: "-4s" },
  { x: "54%", s: "10px", d: "10s", delay: "-8s" },
  { x: "68%", s: "16px", d: "12s", delay: "-1s" },
  { x: "81%", s: "8px",  d: "9.5s", delay: "-5s" },
  { x: "92%", s: "13px", d: "14s", delay: "-9s" },
];

/**
 * Full-screen iLost loading overlay (shared by the user and admin accounts).
 *
 * Props
 *  - visible      boolean  show / hide (fades out, then unmounts)
 *  - message      string   status line, e.g. "Signing you in"
 *  - tagline      string   small line under the progress bar
 *  - pinSrc       string   transparent pin PNG   (public/ilost-pin.png)
 *  - wordmarkSrc  string   transparent wordmark  (public/ilost-wordmark.png)
 *  - instant      boolean  skip the fade-in (used on first paint after a reload)
 */
export default function LoadingScreen({
  visible,
  message = "Loading",
  tagline = "Lost something? Let's find it.",
  pinSrc = "/ilost-pin.png",
  wordmarkSrc = "/ilost-wordmark.png",
  instant = false,
}) {
  const [mounted, setMounted] = useState(visible);

  // keep the overlay mounted long enough to play its exit animation
  useEffect(() => {
    if (visible) {
      if (!mounted) {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
      }
      return undefined;
    }
    if (!mounted) return undefined;
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [visible, mounted]);

  // lock page scroll while the overlay is up
  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted && !visible) return null;

  const cls = ["il-loader", !visible && "is-leaving", instant && "is-instant"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} role="status" aria-live="polite" aria-busy="true">
      <div className="il-bg" aria-hidden="true">
        <span className="il-blob il-blob--a" />
        <span className="il-blob il-blob--b" />
        <span className="il-grid" />
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="il-bubble"
            style={{ "--x": b.x, "--s": b.s, "--d": b.d, "--delay": b.delay }}
          />
        ))}
      </div>

      <div className="il-stage">
        <div className="il-pin-wrap" aria-hidden="true">
          <span className="il-ripple il-ripple--1" />
          <span className="il-ripple il-ripple--2" />
          <span className="il-ripple il-ripple--3" />
          <span className="il-shadow" />
          <img className="il-pin" src={pinSrc} alt="" draggable="false" />
        </div>

        <div className="il-wordmark" style={{ "--il-wordmark": `url(${wordmarkSrc})` }}>
          <img src={wordmarkSrc} alt="iLost" draggable="false" />
        </div>

        {/* key={message} replays the little rise-in whenever the text changes */}
        <p className="il-status" key={message}>
          {message}
          <span className="il-ellipsis" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </p>

        <div className="il-bar" aria-hidden="true">
          <span />
        </div>

        {tagline ? <p className="il-tagline">{tagline}</p> : null}
      </div>
    </div>
  );
}