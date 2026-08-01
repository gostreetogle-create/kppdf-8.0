/// <reference types="vite/client" />

// Явная декларация *.svelte: ambient-типы пакета svelte не резолвятся
// через `/// <reference types="svelte" />` (у пакета только exports.types),
// поэтому svelte-check/tsc не видят default export без этой декларации.
declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component;
  export default component;
}
