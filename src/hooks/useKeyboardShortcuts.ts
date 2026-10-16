import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onOpenOmnibox: () => void;
  onQuickBook: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onOpenOmnibox,
  onQuickBook,
  onEscape
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // 'Ctrl+K' or 'Cmd+K' -> Always opens Omnibox even if an input is focused
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenOmnibox();
        return;
      }

      // 'Escape' -> Close open modals
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        }
        return;
      }

      // 'N' key -> Triggers Quick Booking Modal directly (ONLY when not typing in an input)
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInputFocused) {
        e.preventDefault();
        onQuickBook();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenOmnibox, onQuickBook, onEscape]);
}

export default useKeyboardShortcuts;
