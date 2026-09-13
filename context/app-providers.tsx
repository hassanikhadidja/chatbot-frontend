"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { SettingsProvider } from "@/context/settings-context";
import { StoriesProvider } from "@/context/stories-context";
import { UIProvider } from "@/context/ui-context";
import { hydrateStories, persistStories, withoutDemoStories } from "@/lib/api/stories";
import { apiEnabled } from "@/lib/api/http";
import { hydrateClientFromApi } from "@/lib/client-store";

function SyncStore() {
  useEffect(() => {
    if (apiEnabled()) {
      void hydrateClientFromApi();
      return;
    }
    persistStories(withoutDemoStories(hydrateStories()));
  }, []);
  return null;
}

function subscribe() {
  return () => {};
}

function ClientGate({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-accent/30" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClientGate>
      <SettingsProvider>
        <StoriesProvider>
          <SyncStore />
          <UIProvider>{children}</UIProvider>
        </StoriesProvider>
      </SettingsProvider>
    </ClientGate>
  );
}
