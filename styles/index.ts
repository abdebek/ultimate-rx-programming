/*
 * Slidev auto-injects styles/index.* into the app root. This is the
 * single import entry — it pulls in the shared design tokens that
 * every component and lesson consumes.
 *
 * Per Slidev docs, global CSS here also applies to the presenter UI,
 * so tokens.css scopes its :root/.dark blocks to palette definitions
 * only (no layout rules), avoiding unwanted leakage into presenter mode.
 *
 * PostCSS + UnoCSS process this file, so CSS nesting + at-directives
 * are available if needed later.
 */
import './tokens.css';