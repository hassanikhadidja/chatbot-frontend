"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getProfileSnapshot,
  getServerSnapshotProfile,
  getServerSnapshotSettings,
  getSettingsSnapshot,
  subscribeClientStore,
  writeProfile,
  writeSettings,
} from "@/lib/client-store";
import type { AppSettings, ThemePreference, UserProfile } from "@/lib/types";

interface SettingsContextValue {
  settings: AppSettings;
  profile: UserProfile;
  resolvedTheme: "dark" | "light";
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function resolveTheme(theme: ThemePreference, prefersLight: boolean): "dark" | "light" {
  if (theme === "system") return prefersLight ? "light" : "dark";
  return theme;
}

function subscribeMedia(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeClientStore,
    getSettingsSnapshot,
    getServerSnapshotSettings,
  );
  const profile = useSyncExternalStore(
    subscribeClientStore,
    getProfileSnapshot,
    getServerSnapshotProfile,
  );
  const prefersLight = useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia("(prefers-color-scheme: light)").matches,
    () => false,
  );
  const resolvedTheme = resolveTheme(settings.theme, prefersLight);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    writeSettings({ ...getSettingsSnapshot(), ...patch });
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    writeProfile({ ...getProfileSnapshot(), ...patch });
  }, []);

  const value = useMemo(
    () => ({ settings, profile, resolvedTheme, updateSettings, updateProfile }),
    [settings, profile, resolvedTheme, updateSettings, updateProfile],
  );

  return (
    <SettingsContext.Provider value={value}>
      <ThemeEffect theme={resolvedTheme} />
      {children}
    </SettingsContext.Provider>
  );
}

function ThemeEffect({ theme }: { theme: "dark" | "light" }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return null;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
