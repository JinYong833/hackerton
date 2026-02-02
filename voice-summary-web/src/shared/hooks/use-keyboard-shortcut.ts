import { useEffect, useCallback } from 'react';

interface Modifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  modifiers?: Modifiers
) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (!modifiers?.ctrl || e.ctrlKey) &&
        (!modifiers?.shift || e.shiftKey) &&
        (!modifiers?.alt || e.altKey) &&
        (!modifiers?.meta || e.metaKey)
      ) {
        // Don't trigger if focused on input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        callback();
      }
    },
    [key, callback, modifiers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
