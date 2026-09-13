import type { AppSettings, Story, UserProfile } from "@/lib/types";

const TOKEN_KEY = "vesper.token.v1";
const DEVICE_KEY = "vesper.device.v1";

export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

export function apiEnabled() {
  return Boolean(apiBaseUrl());
}

function deviceId() {
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export interface SessionPayload {
  token: string;
  user: UserProfile;
  settings: AppSettings;
  stories: Story[];
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { msg?: string; error?: string };
    return data.msg || data.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function ensureSession(): Promise<SessionPayload> {
  const existing = window.localStorage.getItem(TOKEN_KEY);
  if (existing) {
    const response = await fetch(`${apiBaseUrl()}/user/session`, {
      headers: { Authorization: `Bearer ${existing}` },
    });
    if (response.ok) {
      const data = (await response.json()) as Omit<SessionPayload, "token">;
      return { token: existing, ...data };
    }
    window.localStorage.removeItem(TOKEN_KEY);
  }

  const response = await fetch(`${apiBaseUrl()}/user/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: deviceId() }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const session = (await response.json()) as SessionPayload;
  window.localStorage.setItem(TOKEN_KEY, session.token);
  return session;
}

export async function apiRequest<T>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown } = {},
) {
  const session = await ensureSession();
  const { body, headers, ...rest } = init;
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...(headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
}
