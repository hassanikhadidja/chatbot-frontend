"use client";

import { Copy, Flag, Languages, MoreHorizontal, Pencil, RefreshCw, StepForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

export function MessageActions({
  role,
  onRegenerate,
  onContinue,
  onCopy,
  onEdit,
  onReport,
  onDelete,
  onTranslate,
  translating,
  showingArabic,
}: {
  role: "user" | "assistant";
  onRegenerate?: () => void;
  onContinue?: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  onTranslate?: () => void;
  translating?: boolean;
  showingArabic?: boolean;
}) {
  return (
    <Dropdown
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Message actions"
          className="size-8 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100"
        >
          <MoreHorizontal className="size-3.5" />
        </Button>
      }
    >
      {role === "assistant" ? (
        <>
          <DropdownItem onSelect={onRegenerate}>
            <RefreshCw className="size-3.5" /> Regenerate
          </DropdownItem>
          <DropdownItem onSelect={onContinue}>
            <StepForward className="size-3.5" /> Continue
          </DropdownItem>
          <DropdownItem onSelect={onCopy}>
            <Copy className="size-3.5" /> Copy
          </DropdownItem>
          <DropdownItem onSelect={onTranslate}>
            <Languages className="size-3.5" />
            {translating ? "Translating…" : showingArabic ? "Show original" : "Translate to Arabic"}
          </DropdownItem>
          <DropdownItem onSelect={onEdit}>
            <Pencil className="size-3.5" /> Edit
          </DropdownItem>
          <DropdownItem onSelect={onReport}>
            <Flag className="size-3.5" /> Report
          </DropdownItem>
        </>
      ) : (
        <>
          <DropdownItem onSelect={onEdit}>
            <Pencil className="size-3.5" /> Edit
          </DropdownItem>
          <DropdownItem onSelect={onCopy}>
            <Copy className="size-3.5" /> Copy
          </DropdownItem>
          <DropdownItem onSelect={onTranslate}>
            <Languages className="size-3.5" />
            {translating ? "Translating…" : showingArabic ? "Show original" : "Translate to Arabic"}
          </DropdownItem>
          <DropdownItem danger onSelect={onDelete}>
            <Trash2 className="size-3.5" /> Delete
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
