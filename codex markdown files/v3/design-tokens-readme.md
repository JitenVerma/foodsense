
# Food Sense V3 Design Tokens

This file defines the core design tokens for the **Retro Arcade Health Tracker** theme.

## Included token groups
- colors
- spacing
- borders
- radii
- shadows
- typography
- motion
- layout

## Recommended usage
Import the CSS file globally and reference tokens via CSS variables.

Example:

```css
.card {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border: var(--border-width-default) solid var(--color-border-default);
  box-shadow: var(--shadow-card);
  padding: var(--card-padding-md);
}
```

## Notes
- Use hard offset shadows instead of soft blurred shadows
- Use semantic macro colors consistently
- Prefer square or lightly rounded corners
- Use the pixel font sparingly for labels and badges, not body copy
