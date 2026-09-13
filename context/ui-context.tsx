"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  title: string;
  description?: string;
}

interface UIContextValue {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  setMobileNavOpen: (value: boolean) => void;
  toggleSidebar: () => void;
  toast: (title: string, description?: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, description?: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      mobileNavOpen,
      setSidebarCollapsed,
      setMobileNavOpen,
      toggleSidebar,
      toast,
    }),
    [sidebarCollapsed, mobileNavOpen, toggleSidebar, toast],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2 md:bottom-6">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto rounded-2xl border border-border bg-elevated/95 px-4 py-3 shadow-soft backdrop-blur-md animate-fade-up"
            role="status"
          >
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
