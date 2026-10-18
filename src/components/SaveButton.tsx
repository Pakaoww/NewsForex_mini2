import { MAX_SAVED, useAppStore } from "../store/useAppStore";
import { BookmarkFilledIcon, BookmarkIcon } from "./Icons";

interface Props {
  id: string;
  size?: "sm" | "md";
}

export default function SaveButton({ id, size = "sm" }: Props) {
  const saved = useAppStore((s) => s.savedIds.includes(id));
  const full = useAppStore((s) => s.savedIds.length >= MAX_SAVED);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const disabled = !saved && full;

  return (
    <button
      type="button"
      className={`btn ${size === "sm" ? "btn-sm" : ""} ${saved ? "btn-primary" : "btn-outline"}`}
      aria-pressed={saved}
      disabled={disabled}
      title={disabled ? `เก็บได้สูงสุด ${MAX_SAVED} รายการ` : undefined}
      onClick={() => toggleSaved(id)}
    >
      {saved ? (
        <BookmarkFilledIcon width={16} height={16} />
      ) : (
        <BookmarkIcon width={16} height={16} />
      )}
      {saved ? "เก็บแล้ว" : "เก็บ"}
    </button>
  );
}
