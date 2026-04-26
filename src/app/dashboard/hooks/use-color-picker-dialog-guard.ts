'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useColorPickerDialogGuard() {
  const suppressDialogDismissalRef = useRef(false);
  const dismissResetTimerRef = useRef<number | null>(null);

  const clearGuard = useCallback(() => {
    suppressDialogDismissalRef.current = false;

    if (dismissResetTimerRef.current !== null) {
      window.clearTimeout(dismissResetTimerRef.current);
      dismissResetTimerRef.current = null;
    }
  }, []);

  const onColorPickerChange = useCallback((isColorPickerOpen: boolean) => {
    if (dismissResetTimerRef.current !== null) {
      window.clearTimeout(dismissResetTimerRef.current);
      dismissResetTimerRef.current = null;
    }

    if (isColorPickerOpen) {
      suppressDialogDismissalRef.current = true;
      return;
    }

    dismissResetTimerRef.current = window.setTimeout(() => {
      suppressDialogDismissalRef.current = false;
      dismissResetTimerRef.current = null;
    }, 0);
  }, []);

  const preventDialogDismissal = useCallback((e: { preventDefault(): void }) => {
    if (suppressDialogDismissalRef.current) e.preventDefault();
  }, []);

  useEffect(() => clearGuard, [clearGuard]);

  return {
    clearGuard,
    onColorPickerChange,
    preventDialogDismissal,
  };
}
