import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Порт 1420 — стандартный dev-порт Tauri. Менять можно, но тогда
// синхронизируй `devUrl` в src-tauri/tauri.conf.json.
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  // TZD-31: KPPDF_MCP_HOST_DIR (из desktop/.env) доступен как import.meta.env.KPPDF_MCP_HOST_DIR.
  envPrefix: ['VITE_', 'KPPDF_'],
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Не перезапускать сборку при изменениях в Rust-части.
      ignored: ['**/src-tauri/**'],
    },
  },
});
