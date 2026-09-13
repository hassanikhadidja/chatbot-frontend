"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings-context";
import { useUI } from "@/context/ui-context";
import { STORIES_KEY } from "@/lib/api/stories";
import { resetClientData } from "@/lib/client-store";
import type { NarrationStyle, ResponseLength, ThemePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            value === option.value
              ? "border-accent/40 bg-accent-soft"
              : "border-border hover:bg-elevated",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { settings, profile, updateSettings } = useSettings();
  const { toast } = useUI();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-muted">How Vesper writes, looks, and remembers.</p>

      <section className="mt-10">
        <h2 className="text-xs tracking-[0.18em] text-subtle uppercase">Account</h2>
        <Row title="Signed in as" description={profile.username}>
          <p className="text-sm">{profile.displayName}</p>
        </Row>
      </section>

      <section className="mt-4">
        <h2 className="text-xs tracking-[0.18em] text-subtle uppercase">Appearance</h2>
        <Row title="Theme" description="Dark is the intended cinematic reading.">
          <Choice<ThemePreference>
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" },
            ]}
          />
        </Row>
      </section>

      <section className="mt-4">
        <h2 className="text-xs tracking-[0.18em] text-subtle uppercase">Story preferences</h2>
        <Row title="AI response length">
          <Choice<ResponseLength>
            value={settings.responseLength}
            onChange={(responseLength) => updateSettings({ responseLength })}
            options={[
              { value: "short", label: "Short" },
              { value: "balanced", label: "Balanced" },
              { value: "long", label: "Long" },
            ]}
          />
        </Row>
        <Row title="Narration style">
          <Choice<NarrationStyle>
            value={settings.narrationStyle}
            onChange={(narrationStyle) => updateSettings({ narrationStyle })}
            options={[
              { value: "literary", label: "Literary" },
              { value: "cinematic", label: "Cinematic" },
              { value: "conversational", label: "Conversational" },
            ]}
          />
        </Row>
        <Row
          title="Content preferences"
          description="Mature allows explicit adult stories. All characters must still be 18+."
        >
          <Choice<"standard" | "mature">
            value={settings.contentPreference}
            onChange={(contentPreference) => updateSettings({ contentPreference })}
            options={[
              { value: "standard", label: "Standard" },
              { value: "mature", label: "Mature" },
            ]}
          />
        </Row>
      </section>

      <section className="mt-4">
        <h2 className="text-xs tracking-[0.18em] text-subtle uppercase">Chat preferences</h2>
        <Row title="Enter to send" description="Shift + Enter always inserts a new line.">
          <Choice<"on" | "off">
            value={settings.enterToSend ? "on" : "off"}
            onChange={(value) => updateSettings({ enterToSend: value === "on" })}
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
          />
        </Row>
        <Row title="Show timestamps">
          <Choice<"on" | "off">
            value={settings.showTimestamps ? "on" : "off"}
            onChange={(value) => updateSettings({ showTimestamps: value === "on" })}
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
          />
        </Row>
      </section>

      <section className="mt-4">
        <h2 className="text-xs tracking-[0.18em] text-subtle uppercase">Privacy</h2>
        <Row title="Export stories" description="Download a local copy of your worlds.">
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([localStorage.getItem(STORIES_KEY) ?? "[]"], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "vesper-stories.json";
              link.click();
              URL.revokeObjectURL(url);
              toast("Stories exported");
            }}
          >
            Export
          </Button>
        </Row>
        <Row title="Delete account" description="This only clears local mock data on this device.">
          <Button
            variant="danger"
            onClick={() => {
              resetClientData();
              toast("Local account data cleared");
              router.push("/");
            }}
          >
            Delete account
          </Button>
        </Row>
      </section>
    </div>
  );
}
