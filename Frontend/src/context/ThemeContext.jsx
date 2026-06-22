import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSettings, updateSettings } from "../services/userService";

const ThemeContext = createContext(null);

const THEME_KEY = "ticketmgr_theme";

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference) {
  if (preference === "system") return getSystemTheme();
  return preference;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme);

  const applyTheme = useCallback((preference) => {
    const resolved = resolveTheme(preference);
    document.documentElement.setAttribute("data-theme", resolved === "dark" ? "dark" : "light");
  }, []);

  const setTheme = useCallback((preference) => {
    setThemeState(preference);
    localStorage.setItem(THEME_KEY, preference);
    applyTheme(preference);
    updateSettings({ theme: preference }).catch(() => {});
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getSavedTheme() === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        if (settings.theme && settings.theme !== getSavedTheme()) {
          setThemeState(settings.theme);
          localStorage.setItem(THEME_KEY, settings.theme);
          applyTheme(settings.theme);
        }
      } catch {
        // Use saved preference
      }
    })();
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
