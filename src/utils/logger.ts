const isDebugEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true';

export const logger = {
  debug(...args: unknown[]) {
    if (isDebugEnabled) {
      console.debug(...args);
    }
  },
  info(...args: unknown[]) {
    if (isDebugEnabled) {
      console.info(...args);
    }
  },
  warn(...args: unknown[]) {
    console.warn(...args);
  },
  error(...args: unknown[]) {
    console.error(...args);
  },
};
