/**
 * @angular/build:application's PostCSS auto-detection has a known issue
 * with Tailwind v4: it tries to invoke the bare `tailwindcss` package as
 * a PostCSS plugin, which throws "It looks like you're trying to use
 * `tailwindcss` directly as a PostCSS plugin" (Tailwind v4 moved the
 * PostCSS hook to `@tailwindcss/postcss`).
 *
 * Use array-form with explicit require() so Angular's detection picks
 * up `@tailwindcss/postcss` first. If bare-tailwindcss detection
 * still fires, the .npmrc `public-hoist-pattern[]=*tailwindcss*` strips
 * the pnpm-isolated symlink so both packages resolve to the same root.
 */
module.exports = {
  plugins: [require('@tailwindcss/postcss')],
};
