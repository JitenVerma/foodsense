
/* Food Sense V3 — Retro Arcade Health Tracker Design Tokens
   Format: CSS custom properties
   Usage:
   - import once globally (e.g. app/globals.css)
   - reference with var(--token-name)
*/

:root {
  /* COLORS — CORE */
  --color-bg-app: #0f1226;
  --color-bg-canvas: #141935;
  --color-surface-1: #1a1f3a;
  --color-surface-2: #242b4d;
  --color-surface-3: #2d3560;
  --color-panel-elevated: #313a69;

  --color-border-subtle: #48517c;
  --color-border-default: #5b648f;
  --color-border-strong: #7a84b3;

  --color-text-primary: #f2f5ff;
  --color-text-secondary: #aab3d9;
  --color-text-muted: #7f89b3;
  --color-text-inverse: #0f1226;

  /* COLORS — BRAND / ARCADE */
  --color-brand-primary: #7c5cff;
  --color-brand-secondary: #4cc9ff;
  --color-brand-accent: #ff5da2;
  --color-brand-highlight: #3be8b0;

  /* COLORS — MACRO SEMANTICS */
  --color-protein: #3be8b0;
  --color-carbs: #4cc9ff;
  --color-fat: #ffb347;
  --color-calories: #ff5da2;

  /* COLORS — STATE */
  --color-success: #3be8b0;
  --color-warning: #f7e26b;
  --color-error: #ff4d6d;
  --color-info: #4cc9ff;

  /* COLORS — INTERACTIVE */
  --color-button-primary-bg: #7c5cff;
  --color-button-primary-bg-hover: #8b6dff;
  --color-button-primary-text: #f2f5ff;
  --color-button-primary-border: #b6a6ff;

  --color-button-secondary-bg: #242b4d;
  --color-button-secondary-bg-hover: #313a69;
  --color-button-secondary-text: #f2f5ff;
  --color-button-secondary-border: #7a84b3;

  --color-button-ghost-bg: transparent;
  --color-button-ghost-bg-hover: rgba(124, 92, 255, 0.12);
  --color-button-ghost-text: #f2f5ff;
  --color-button-ghost-border: #5b648f;

  --color-focus-ring: #4cc9ff;
  --color-selection: rgba(124, 92, 255, 0.28);

  /* GLOWS */
  --glow-protein: rgba(59, 232, 176, 0.35);
  --glow-carbs: rgba(76, 201, 255, 0.35);
  --glow-fat: rgba(255, 179, 71, 0.35);
  --glow-calories: rgba(255, 93, 162, 0.35);
  --glow-brand: rgba(124, 92, 255, 0.35);

  /* SPACING */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* LAYOUT */
  --container-max-width: 1200px;
  --header-height: 72px;
  --sidebar-width: 280px;
  --card-padding-sm: var(--space-4);
  --card-padding-md: var(--space-5);
  --card-padding-lg: var(--space-6);
  --section-gap: var(--space-6);
  --grid-gap: var(--space-6);

  /* RADII */
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* BORDERS */
  --border-width-thin: 1px;
  --border-width-default: 2px;
  --border-width-strong: 3px;

  /* SHADOWS — PIXEL / HARD OFFSET */
  --shadow-pixel-sm: 2px 2px 0 0 rgba(10, 13, 29, 0.9);
  --shadow-pixel-md: 4px 4px 0 0 rgba(10, 13, 29, 0.9);
  --shadow-pixel-lg: 6px 6px 0 0 rgba(10, 13, 29, 0.9);

  --shadow-inset-panel:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -2px 0 rgba(10, 13, 29, 0.35);

  --shadow-card:
    var(--shadow-pixel-md),
    var(--shadow-inset-panel);

  --shadow-button:
    0 0 0 2px var(--color-button-primary-border),
    var(--shadow-pixel-sm);

  --shadow-glow-brand: 0 0 0 2px rgba(124, 92, 255, 0.25), 0 0 24px var(--glow-brand);
  --shadow-glow-protein: 0 0 0 2px rgba(59, 232, 176, 0.25), 0 0 20px var(--glow-protein);
  --shadow-glow-carbs: 0 0 0 2px rgba(76, 201, 255, 0.25), 0 0 20px var(--glow-carbs);
  --shadow-glow-fat: 0 0 0 2px rgba(255, 179, 71, 0.25), 0 0 20px var(--glow-fat);
  --shadow-glow-calories: 0 0 0 2px rgba(255, 93, 162, 0.25), 0 0 20px var(--glow-calories);

  /* TYPOGRAPHY */
  --font-family-display: "Press Start 2P", "Silkscreen", monospace;
  --font-family-body: "Inter", "Segoe UI", system-ui, sans-serif;

  --font-size-xs: 0.6875rem;
  --font-size-sm: 0.8125rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.5rem;

  --line-height-tight: 1.1;
  --line-height-snug: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  --tracking-pixel: 0.08em;
  --tracking-label: 0.12em;
  --tracking-normal: 0;

  /* COMPONENT HEIGHTS */
  --button-height-sm: 2.25rem;
  --button-height-md: 2.75rem;
  --button-height-lg: 3.25rem;
  --input-height-md: 2.75rem;
  --hud-bar-height: 4.5rem;

  /* MOTION */
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --duration-slow: 260ms;
  --ease-arcade: cubic-bezier(0.2, 0.8, 0.2, 1);

  /* Z-INDEX */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-toast: 300;
  --z-modal: 400;
}

/* Optional reference classes */

.token-demo-panel {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--card-padding-md);
}

.token-demo-button-primary {
  height: var(--button-height-md);
  padding-inline: var(--space-5);
  background: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
  border: var(--border-width-default) solid var(--color-button-primary-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-button);
  transition:
    transform var(--duration-fast) var(--ease-arcade),
    background-color var(--duration-fast) var(--ease-arcade),
    box-shadow var(--duration-fast) var(--ease-arcade);
}

.token-demo-button-primary:hover {
  background: var(--color-button-primary-bg-hover);
  transform: translate(-1px, -1px);
}

.token-demo-button-primary:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm);
}

.token-demo-stat-protein {
  box-shadow: var(--shadow-card), var(--shadow-glow-protein);
}

/* Food Sense V3 — Retro Arcade Health Tracker Design Tokens
   Format: CSS custom properties
   Usage:
   - import once globally (e.g. app/globals.css)
   - reference with var(--token-name)
*/

:root {
  /* COLORS — CORE */
  --color-bg-app: #0f1226;
  --color-bg-canvas: #141935;
  --color-surface-1: #1a1f3a;
  --color-surface-2: #242b4d;
  --color-surface-3: #2d3560;
  --color-panel-elevated: #313a69;

  --color-border-subtle: #48517c;
  --color-border-default: #5b648f;
  --color-border-strong: #7a84b3;

  --color-text-primary: #f2f5ff;
  --color-text-secondary: #aab3d9;
  --color-text-muted: #7f89b3;
  --color-text-inverse: #0f1226;

  /* COLORS — BRAND / ARCADE */
  --color-brand-primary: #7c5cff;
  --color-brand-secondary: #4cc9ff;
  --color-brand-accent: #ff5da2;
  --color-brand-highlight: #3be8b0;

  /* COLORS — MACRO SEMANTICS */
  --color-protein: #3be8b0;
  --color-carbs: #4cc9ff;
  --color-fat: #ffb347;
  --color-calories: #ff5da2;

  /* COLORS — STATE */
  --color-success: #3be8b0;
  --color-warning: #f7e26b;
  --color-error: #ff4d6d;
  --color-info: #4cc9ff;

  /* COLORS — INTERACTIVE */
  --color-button-primary-bg: #7c5cff;
  --color-button-primary-bg-hover: #8b6dff;
  --color-button-primary-text: #f2f5ff;
  --color-button-primary-border: #b6a6ff;

  --color-button-secondary-bg: #242b4d;
  --color-button-secondary-bg-hover: #313a69;
  --color-button-secondary-text: #f2f5ff;
  --color-button-secondary-border: #7a84b3;

  --color-button-ghost-bg: transparent;
  --color-button-ghost-bg-hover: rgba(124, 92, 255, 0.12);
  --color-button-ghost-text: #f2f5ff;
  --color-button-ghost-border: #5b648f;

  --color-focus-ring: #4cc9ff;
  --color-selection: rgba(124, 92, 255, 0.28);

  /* GLOWS */
  --glow-protein: rgba(59, 232, 176, 0.35);
  --glow-carbs: rgba(76, 201, 255, 0.35);
  --glow-fat: rgba(255, 179, 71, 0.35);
  --glow-calories: rgba(255, 93, 162, 0.35);
  --glow-brand: rgba(124, 92, 255, 0.35);

  /* SPACING */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* LAYOUT */
  --container-max-width: 1200px;
  --header-height: 72px;
  --sidebar-width: 280px;
  --card-padding-sm: var(--space-4);
  --card-padding-md: var(--space-5);
  --card-padding-lg: var(--space-6);
  --section-gap: var(--space-6);
  --grid-gap: var(--space-6);

  /* RADII */
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* BORDERS */
  --border-width-thin: 1px;
  --border-width-default: 2px;
  --border-width-strong: 3px;

  /* SHADOWS — PIXEL / HARD OFFSET */
  --shadow-pixel-sm: 2px 2px 0 0 rgba(10, 13, 29, 0.9);
  --shadow-pixel-md: 4px 4px 0 0 rgba(10, 13, 29, 0.9);
  --shadow-pixel-lg: 6px 6px 0 0 rgba(10, 13, 29, 0.9);

  --shadow-inset-panel:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -2px 0 rgba(10, 13, 29, 0.35);

  --shadow-card:
    var(--shadow-pixel-md),
    var(--shadow-inset-panel);

  --shadow-button:
    0 0 0 2px var(--color-button-primary-border),
    var(--shadow-pixel-sm);

  --shadow-glow-brand: 0 0 0 2px rgba(124, 92, 255, 0.25), 0 0 24px var(--glow-brand);
  --shadow-glow-protein: 0 0 0 2px rgba(59, 232, 176, 0.25), 0 0 20px var(--glow-protein);
  --shadow-glow-carbs: 0 0 0 2px rgba(76, 201, 255, 0.25), 0 0 20px var(--glow-carbs);
  --shadow-glow-fat: 0 0 0 2px rgba(255, 179, 71, 0.25), 0 0 20px var(--glow-fat);
  --shadow-glow-calories: 0 0 0 2px rgba(255, 93, 162, 0.25), 0 0 20px var(--glow-calories);

  /* TYPOGRAPHY */
  --font-family-display: "Press Start 2P", "Silkscreen", monospace;
  --font-family-body: "Inter", "Segoe UI", system-ui, sans-serif;

  --font-size-xs: 0.6875rem;
  --font-size-sm: 0.8125rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 2.5rem;

  --line-height-tight: 1.1;
  --line-height-snug: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  --tracking-pixel: 0.08em;
  --tracking-label: 0.12em;
  --tracking-normal: 0;

  /* COMPONENT HEIGHTS */
  --button-height-sm: 2.25rem;
  --button-height-md: 2.75rem;
  --button-height-lg: 3.25rem;
  --input-height-md: 2.75rem;
  --hud-bar-height: 4.5rem;

  /* MOTION */
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --duration-slow: 260ms;
  --ease-arcade: cubic-bezier(0.2, 0.8, 0.2, 1);

  /* Z-INDEX */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-toast: 300;
  --z-modal: 400;
}

/* Optional reference classes */

.token-demo-panel {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--card-padding-md);
}

.token-demo-button-primary {
  height: var(--button-height-md);
  padding-inline: var(--space-5);
  background: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
  border: var(--border-width-default) solid var(--color-button-primary-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-button);
  transition:
    transform var(--duration-fast) var(--ease-arcade),
    background-color var(--duration-fast) var(--ease-arcade),
    box-shadow var(--duration-fast) var(--ease-arcade);
}

.token-demo-button-primary:hover {
  background: var(--color-button-primary-bg-hover);
  transform: translate(-1px, -1px);
}

.token-demo-button-primary:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm);
}

.token-demo-stat-protein {
  box-shadow: var(--shadow-card), var(--shadow-glow-protein);
}
