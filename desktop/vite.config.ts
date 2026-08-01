import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Порт 1420 — стандартный dev-порт Tauri. Менять можно, но тогда
// синхронизируй `devUrl` в src-tauri/tauri.conf.json.
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Не перезапускать сборку при изменениях в Rust-части.
      ignored: ['**/src-tauri/**'],
    },
  },
});
