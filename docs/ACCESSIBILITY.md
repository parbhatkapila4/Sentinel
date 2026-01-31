# Accessibility (WCAG 2.1 AA)

Sentinel aims for WCAG 2.1 Level AA compliance where practical.

## Skip Link

- **Skip to main content**: Tab once on page load to focus the skip link. Activate it to jump to the main content (`#main-content`).

## Keyboard Navigation

- **Escape**: Close modals, dialogs, dropdowns.
- **Enter**: Activate buttons/links, submit forms.
- **Space**: Activate buttons, toggle checkboxes.
- **Tab / Shift+Tab**: Move focus; Tab cycles within open modals.
- **↑↓**: Navigate within command palette (⌘K) and list-style dropdowns.

## Screen Reader Testing

Use NVDA (Windows), VoiceOver (macOS), or similar to verify:

- Landmarks (main, nav, banner) are announced.
- Form labels are associated with inputs.
- Icon-only buttons have `aria-label`.
- Dialogs have `aria-modal="true"` and `aria-labelledby`.

## Testing Tools

- **Lighthouse** (Chrome DevTools): Run Accessibility audit.
- **axe DevTools**: Browser extension for automated checks.
- Manual keyboard-only and screen reader flows for critical paths.
