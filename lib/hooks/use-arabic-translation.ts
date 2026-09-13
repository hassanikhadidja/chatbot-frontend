"use client";

import { useEffect, useState } from "react";
import { translateToArabic } from "@/lib/ai/client";
import { apiEnabled, apiRequest } from "@/lib/api/http";

export function useArabicTranslation(source: string) {
  const [arabic, setArabic] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setArabic(null);
    setShowing(false);
    setError(null);
  }, [source]);

  async function toggle() {
    if (showing) {
      setShowing(false);
      return;
    }
    if (arabic) {
      setShowing(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const text = apiEnabled()
        ? (await apiRequest<{ content: string }>("/story/translate", {
            method: "POST",
            body: { text: source },
          })).content
        : await translateToArabic(source);
      setArabic(text);
      setShowing(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Translation failed.");
    } finally {
      setLoading(false);
    }
  }

  return {
    text: showing && arabic ? arabic : source,
    showing,
    loading,
    error,
    toggle,
  };
}
