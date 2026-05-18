export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decodedJson = atob(padded);

    return JSON.parse(decodedJson);
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;

  if (!exp) return false;

  return exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}
