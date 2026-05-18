import { useEffect, useState } from 'react';

export const ACTIVE_SEMESTER_EVENT = 'active-semester-updated';

interface ActiveSemesterEventDetail {
  universityId?: string | null;
  semesterId: number | null;
}

function parseSemesterId(value: string | null): number | null {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readActiveSemesterId(universityId?: string | null, fallbackSemesterId?: number | null): number | null {
  if (universityId) {
    const scoped = parseSemesterId(localStorage.getItem(`activeSemester:${universityId}`));
    if (scoped) return scoped;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('activeSemester:')) continue;

    const stored = parseSemesterId(localStorage.getItem(key));
    if (stored) return stored;
  }

  return fallbackSemesterId ?? null;
}

export function writeActiveSemesterId(universityId: string, semesterId: number | null): void {
  const key = `activeSemester:${universityId}`;

  if (semesterId) {
    localStorage.setItem(key, String(semesterId));
  } else {
    localStorage.removeItem(key);
  }

  window.dispatchEvent(
    new CustomEvent<ActiveSemesterEventDetail>(ACTIVE_SEMESTER_EVENT, {
      detail: { universityId, semesterId },
    }),
  );
}

export function useActiveSemester(universityId?: string | null, fallbackSemesterId?: number | null) {
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(() =>
    readActiveSemesterId(universityId, fallbackSemesterId),
  );

  useEffect(() => {
    const syncActiveSemester = () => {
      setActiveSemesterId(readActiveSemesterId(universityId, fallbackSemesterId));
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && !event.key.startsWith('activeSemester:')) return;
      syncActiveSemester();
    };

    const onActiveSemesterChanged = (event: Event) => {
      const customEvent = event as CustomEvent<ActiveSemesterEventDetail>;
      if (
        universityId &&
        customEvent.detail?.universityId &&
        customEvent.detail.universityId !== universityId
      ) {
        return;
      }

      syncActiveSemester();
    };

    syncActiveSemester();
    window.addEventListener('storage', onStorage);
    window.addEventListener(ACTIVE_SEMESTER_EVENT, onActiveSemesterChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ACTIVE_SEMESTER_EVENT, onActiveSemesterChanged as EventListener);
    };
  }, [universityId, fallbackSemesterId]);

  return activeSemesterId;
}
