import type { Config } from 'tailwindcss';

/**
 * Minimal Tailwind v4 config —main tokens are declared inline in
 * `src/styles.css` via `@theme inline {...}` per TZ-32.
 * Including a config keeps IDE intellisense working for utility class
 * autocompletion. Tailwind v4's CSS-first configuration makes this
 * file strictly optional; safe to delete if IDE tooling is fine.
 */
export default {
  content: ['./src/**/*.{html,ts}'],
} satisfies Config;
