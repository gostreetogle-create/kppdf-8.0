import type { Route } from '@angular/router';

function joinPath(prefix: string, segment: string): string {
  const parts = [prefix, segment].filter((p) => p.length > 0);
  return parts.join('/');
}

/**
 * Flattens a `Route[]` tree into the set of absolute `/`-prefixed paths
 * that actually render a page (`loadComponent`, no `children`) — used by
 * the nav to hide links to routes that don't exist yet in NX (menu items
 * are ported ahead of the pages themselves, one wave at a time). A route
 * with `children` is a layout container (the shell itself, `/kit`), not a
 * nav target, so it's excluded even when it also carries `loadComponent`.
 */
export function collectPageRoutePaths(routes: readonly Route[], prefix = ''): Set<string> {
  const paths = new Set<string>();
  for (const route of routes) {
    const full = joinPath(prefix, route.path ?? '');
    const isLeafPage = !!route.loadComponent && (!route.children || route.children.length === 0);
    if (isLeafPage) paths.add(`/${full}`);
    if (route.children) {
      for (const p of collectPageRoutePaths(route.children, full)) paths.add(p);
    }
  }
  return paths;
}
