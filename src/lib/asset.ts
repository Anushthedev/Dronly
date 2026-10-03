/**
 * Prefixes a file in `public/` with the deployment's base path.
 *
 * Next rewrites its own routes and everything under `_next/` when `basePath`
 * is set, but it deliberately leaves string literals alone — a `src="/x.jpg"`
 * is just markup to it. Public files are therefore ours to prefix: on GitHub
 * Pages the site lives under `/Dronly`, so `/hero.mp4` has to resolve to
 * `/Dronly/hero.mp4` there while staying `/hero.mp4` under `next dev`.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so this costs nothing at
 * runtime and works the same in server and client components.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string) {
  return `${BASE}${path}`;
}
