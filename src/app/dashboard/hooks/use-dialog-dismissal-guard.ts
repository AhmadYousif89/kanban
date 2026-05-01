'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useDialogDismissalGuard() {
  const dialogDismissedRef = useRef(false);
  const dismissResetTimerRef = useRef<number | null>(null);

  const clearGuard = useCallback(() => {
    dialogDismissedRef.current = false;

    if (dismissResetTimerRef.current !== null) {
      window.clearTimeout(dismissResetTimerRef.current);
      dismissResetTimerRef.current = null;
    }
  }, []);

  const setDismissalSuppressed = useCallback((isSuppressed: boolean) => {
    if (dismissResetTimerRef.current !== null) {
      window.clearTimeout(dismissResetTimerRef.current);
      dismissResetTimerRef.current = null;
    }

    if (isSuppressed) {
      dialogDismissedRef.current = true;
      return;
    }

    dismissResetTimerRef.current = window.setTimeout(() => {
      dialogDismissedRef.current = false;
      dismissResetTimerRef.current = null;
    }, 0);
  }, []);

  const preventDialogDismissal = useCallback((e: { preventDefault(): void }) => {
    if (dialogDismissedRef.current) e.preventDefault();
  }, []);

  useEffect(() => clearGuard, [clearGuard]);

  return {
    clearGuard,
    setDismissalSuppressed,
    preventDialogDismissal,
  };
}
