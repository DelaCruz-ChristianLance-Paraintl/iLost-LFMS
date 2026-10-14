import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import LoadingScreen from "./Loadingscreen";

/* One place for every status line, so user and admin accounts always match. */
const LOADING_MESSAGES = {
  boot: "Getting things ready", // page (re)load: forced reload, pull-to-refresh, first visit
  signin: "Signing you in",
  signout: "Signing you out",
  reload: "Refreshing iLost", // logo click
  back: "Taking you back to Overview", // Back button
  submit: "Submitting your report", // any report type
};

const MIN_VISIBLE_MS = 800; // stops the screen from flashing when something finishes instantly
const LOGO_RELOAD_KEY = "ilost-logo-reload";

const LoadingContext = createContext(null);

export function LoadingProvider({
  children,
  startVisible = true, // true => the screen is already up on page load (covers forced reload)
  minDuration = MIN_VISIBLE_MS,
  ...screenProps // pinSrc, wordmarkSrc, tagline
}) {
  const [logoReload] = useState(
    () => window.sessionStorage.getItem(LOGO_RELOAD_KEY) === "true"
  );
  const [state, setState] = useState(() => ({
    visible: startVisible,
    message: startVisible
      ? logoReload
        ? LOADING_MESSAGES.reload
        : LOADING_MESSAGES.boot
      : "",
  }));
  const [instant, setInstant] = useState(startVisible);

  // How many things currently want the screen up. It only hides when this reaches 0,
  // so two overlapping actions (e.g. Submit + navigate) can't hide it too early.
  const pending = useRef(startVisible ? 1 : 0);
  const shownAt = useRef(0);
  const hideTimer = useRef(null);
  const reloadStarted = useRef(false);

  // remove the static splash from index.html (see README) once React has painted
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (startVisible && shownAt.current === 0) {
        shownAt.current = Date.now();
      }
      document.getElementById("il-boot")?.remove();
      window.sessionStorage.removeItem(LOGO_RELOAD_KEY);
    });
    return () => cancelAnimationFrame(id);
  }, [logoReload, startVisible]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const showLoading = useCallback((key = "boot") => {
    clearTimeout(hideTimer.current);
    if (pending.current === 0) shownAt.current = Date.now();
    pending.current += 1;
    setState({ visible: true, message: LOADING_MESSAGES[key] ?? key });
  }, []);

  const hideLoading = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    if (pending.current > 0) return;
    if (shownAt.current === 0) shownAt.current = Date.now();
    const wait = Math.max(0, minDuration - (Date.now() - shownAt.current));
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
      setInstant(false);
    }, wait);
  }, [minDuration]);

  /** Wrap any async action: shows the screen, runs it, hides it (even if it throws). */
  const withLoading = useCallback(
    async (task, key) => {
      showLoading(key);
      try {
        return await task();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  /** Logo click: let the single loading animation play on the reloaded page. */
  const reloadApp = useCallback(
    (to) => {
      if (reloadStarted.current) return;
      reloadStarted.current = true;

      const destination =
        typeof to === "string" && to ? to : null;
      const destinationUrl = destination
        ? new URL(destination, window.location.href)
        : window.location;

      if (destinationUrl.origin === window.location.origin) {
        window.sessionStorage.setItem(LOGO_RELOAD_KEY, "true");
      }

      if (destination) window.location.assign(destination);
      else window.location.reload();
    },
    []
  );

  const flash = useCallback(
    (key, action) => {
      showLoading(key);
      try {
        action?.();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const value = useMemo(
    () => ({ showLoading, hideLoading, withLoading, flash, reloadApp }),
    [showLoading, hideLoading, withLoading, flash, reloadApp]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingScreen
        visible={state.visible}
        message={state.message}
        instant={instant}
        {...screenProps}
      />
    </LoadingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside <LoadingProvider>");
  return ctx;
}

/**
 * Show the screen around a quick, synchronous action such as a page switch.
 * It stays up for the minimum display time, then fades out.
 *
 *   const { flash } = useLoading()
 *   <button onClick={() => flash('back', () => setPage('dashboard'))}>Back</button>
 */
/**
 * Call once near the top of <App />, with `true` as soon as your auth/session check is done.
 * This is what dismisses the screen after a forced reload.
 *
 *   useHideBootLoading(!checkingSession);   // put it ABOVE any early return in App
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHideBootLoading(ready) {
  const { hideLoading } = useLoading();
  const released = useRef(false);
  useEffect(() => {
    if (ready && !released.current) {
      released.current = true;
      hideLoading();
    }
  }, [ready, hideLoading]);
}