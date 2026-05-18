import { useEffect, useMemo, useState } from 'react';
import { apiClient, SemesterService } from '../api';
import {
  useActiveSemester,
  writeActiveSemesterId,
} from '../contexts/SemesterContext';

interface UseResolvedSemesterOptions {
  universityId?: string | null;
  fallbackSemesterId?: number | null;
  enabled?: boolean;
}

interface UseResolvedSemesterResult {
  semesterId: number | null;
  isLoading: boolean;
  error: string | null;
  scopeId: string | null;
}

function resolveTenantScopeId(universityId?: string | null): string | null {
  if (universityId) return universityId;

  const tenantContext = apiClient.getTenantContext();
  if (tenantContext.isSuperAdmin) return null;

  return `tenant:${tenantContext.subdomain ?? 'current'}`;
}

export function useResolvedSemester({
  universityId,
  fallbackSemesterId = null,
  enabled = true,
}: UseResolvedSemesterOptions = {}): UseResolvedSemesterResult {
  const scopeId = useMemo(() => resolveTenantScopeId(universityId), [universityId]);
  const activeSemesterId = useActiveSemester(scopeId, fallbackSemesterId);
  const [resolvedSemesterId, setResolvedSemesterId] = useState<number | null>(
    activeSemesterId,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSemesterId) {
      setResolvedSemesterId(activeSemesterId);
      setError(null);
    }
  }, [activeSemesterId]);

  useEffect(() => {
    if (!enabled || activeSemesterId) return;

    let isMounted = true;

    const resolveCurrentSemester = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentSemester = await SemesterService.getCurrent();

        if (!isMounted) return;

        setResolvedSemesterId(currentSemester.id);
        if (scopeId) {
          writeActiveSemesterId(scopeId, currentSemester.id);
        }
      } catch (resolveError) {
        if (!isMounted) return;

        const message =
          resolveError instanceof Error
            ? resolveError.message
            : 'Failed to resolve current semester';
        setError(message);
        setResolvedSemesterId(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void resolveCurrentSemester();

    return () => {
      isMounted = false;
    };
  }, [activeSemesterId, enabled, scopeId]);

  return {
    semesterId: activeSemesterId ?? resolvedSemesterId,
    isLoading,
    error,
    scopeId,
  };
}
