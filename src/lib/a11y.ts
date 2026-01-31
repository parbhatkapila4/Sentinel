export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  );
}

export function trapFocus(e: KeyboardEvent, container: HTMLElement): boolean {
  if (e.key !== 'Tab') return false;
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return false;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
      return true;
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
      return true;
    }
  }
  return false;
}
