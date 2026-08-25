import { useCallback, useEffect, useState } from 'react';

// Tracks which Topic Explorer topics a user has generated a story for, so
// the Timeline Path view can show "3 of 14 explored" progress per era.
// Deliberately just a set of ids in localStorage for now — a natural spot
// to hang a real badge/achievement system on later without changing the
// call sites that mark topics explored.
function storageKey(userId: number | undefined): string {
  return `timedive_explored_topics_${userId ?? 'anon'}`;
}

function readExplored(userId: number | undefined): Set<string> {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useExploredTopics(userId: number | undefined) {
  const [explored, setExplored] = useState<Set<string>>(() => readExplored(userId));

  useEffect(() => {
    setExplored(readExplored(userId));
  }, [userId]);

  const markExplored = useCallback((topicId: string) => {
    setExplored(prev => {
      if (prev.has(topicId)) return prev;
      const next = new Set(prev);
      next.add(topicId);
      try {
        window.localStorage.setItem(storageKey(userId), JSON.stringify([...next]));
      } catch {
        // localStorage unavailable (private browsing, etc.) — explored
        // state just won't persist across reloads, which is fine.
      }
      return next;
    });
  }, [userId]);

  return { explored, markExplored };
}
