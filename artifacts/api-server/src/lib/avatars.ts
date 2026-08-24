// Preset avatars — emoji only, no file uploads/storage needed.
// Keep in sync with artifacts/timedive/src/lib/avatars.ts.
export const AVATAR_OPTIONS = [
  "🐋", "🐬", "🦈", "🐢", "🦑", "⚓", "🧭", "🏛️",
  "🕌", "📜", "⏳", "🏺", "👑", "🦁", "🐉", "🌍",
] as const;

export function isValidAvatar(value: unknown): value is typeof AVATAR_OPTIONS[number] {
  return typeof value === "string" && (AVATAR_OPTIONS as readonly string[]).includes(value);
}
