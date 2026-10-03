'use client';

import Lenis from 'lenis';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SECTION_IDS } from '@/lib/site';
import { clamp } from '@/lib/utils';

export type ScrollState = {
  /** Raw scroll offset in px. */
  y: number;
  /** 0 → 1 across the whole document. */
  progress: number;
  /**
   * Section-relative position: 0 is the top of section 0, 2.5 is halfway
   * through section 2. The 3D rig choreographs against this so section
   * heights can change without desyncing the flight path.
   */
  stage: number;
  /** px per frame, signed. Drives motion blur / bank angle. */
  velocity: number;
};

type Subscriber = (state: ScrollState) => void;

type ScrollApi = {
  /**
   * Live scroll state. Deliberately a ref: reading it inside `useFrame` or a
   * rAF loop costs nothing and never triggers a React render.
   */
  state: React.RefObject<ScrollState>;
  /** Opt in to per-frame updates for DOM work that must stay off the render path. */
  subscribe: (fn: Subscriber) => () => void;
  /**
   * Scroll to a section id, an element, or an absolute offset in px.
   * `immediate` skips the easing — used while dragging the shot scrubber,
   * where the page must track the handle frame for frame.
   */
  scrollTo: (
    target: string | HTMLElement | number,
    options?: { immediate?: boolean },
  ) => void;
};

const ScrollContext = createContext<ScrollApi | null>(null);

/** Scroll offsets marking the start of each narrative stage. */
function measureBoundaries(): number[] {
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  const tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    return el.getBoundingClientRect().top + window.scrollY;
  }).filter((value): value is number => value !== null);

  // Boundaries are monotonic by construction, but guard anyway: a collapsed
  // or hidden section would otherwise produce a divide-by-zero segment.
  const boundaries = [0];
  tops.slice(1).forEach((top) => {
    boundaries.push(Math.max(boundaries[boundaries.length - 1] + 1, top));
  });
  boundaries.push(Math.max(boundaries[boundaries.length - 1] + 1, maxScroll));

  return boundaries;
}

function toStage(y: number, boundaries: number[]): number {
  const last = boundaries.length - 1;
  if (y <= boundaries[0]) return 0;
  if (y >= boundaries[last]) return last - 1;

  for (let i = 0; i < last; i += 1) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (y >= start && y < end) return i + (y - start) / (end - start);
  }
  return last - 1;
}

export function ScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  const state = useRef<ScrollState>({
    y: 0,
    progress: 0,
    stage: 0,
    velocity: 0,
  });
  const boundaries = useRef<number[]>([0, 1]);
  const subscribers = useRef(new Set<Subscriber>());
  const lenis = useRef<Lenis | null>(null);

  const subscribe = useCallback((fn: Subscriber) => {
    subscribers.current.add(fn);
    return () => {
      subscribers.current.delete(fn);
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, options?: { immediate?: boolean }) => {
      const immediate = options?.immediate ?? false;

      if (typeof target === 'number') {
        if (lenis.current) {
          lenis.current.scrollTo(target, {
            immediate,
            duration: immediate ? 0 : 0.9,
          });
        } else {
          window.scrollTo({ top: target, behavior: 'auto' });
        }
        return;
      }

      const el =
        typeof target === 'string'
          ? document.getElementById(target.replace('#', ''))
          : target;
      if (!el) return;

      if (lenis.current) {
        lenis.current.scrollTo(el, {
          offset: 0,
          duration: immediate ? 0 : 1.4,
          immediate,
        });
      } else {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    },
    [],
  );

  useIsomorphicLayoutEffect(() => {
    const remeasure = () => {
      boundaries.current = measureBoundaries();
    };

    const publish = (y: number, velocity: number) => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const next = state.current;
      next.y = y;
      next.progress = clamp(y / maxScroll);
      next.stage = toStage(y, boundaries.current);
      next.velocity = velocity;
      subscribers.current.forEach((fn) => fn(next));
    };

    remeasure();

    let frame = 0;
    let cleanupLenis: (() => void) | undefined;

    if (reducedMotion) {
      // No inertia, no rAF ticker: read the native scroll position directly
      // and only when the browser says it changed.
      const onScroll = () => publish(window.scrollY, 0);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanupLenis = () => window.removeEventListener('scroll', onScroll);
    } else {
      const instance = new Lenis({
        duration: 1.15,
        // Long, gentle tail — the "cinematic" part of the scroll feel.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Never hijack touch scrolling; phones expect native momentum.
        syncTouch: false,
        touchMultiplier: 1.6,
      });
      lenis.current = instance;

      instance.on('scroll', ({ scroll, velocity }: Lenis) => {
        publish(scroll, velocity);
      });

      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);

      cleanupLenis = () => {
        cancelAnimationFrame(frame);
        instance.destroy();
        lenis.current = null;
      };
    }

    const observer = new ResizeObserver(() => {
      remeasure();
      publish(state.current.y, 0);
    });
    observer.observe(document.body);
    window.addEventListener('resize', remeasure);

    // Fonts land after first paint and reflow every section boundary.
    document.fonts?.ready.then(remeasure).catch(() => {});

    return () => {
      cleanupLenis?.();
      observer.disconnect();
      window.removeEventListener('resize', remeasure);
    };
  }, [reducedMotion]);

  const api = useMemo<ScrollApi>(
    () => ({ state, subscribe, scrollTo }),
    [subscribe, scrollTo],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

export function useScrollApi(): ScrollApi {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollApi must be used inside <ScrollProvider>');
  }
  return context;
}

/**
 * Imperative subscription helper for DOM effects that want scroll state
 * without re-rendering (progress bars, headers, counters).
 */
export function useScrollEffect(fn: Subscriber, deps: unknown[] = []) {
  const { subscribe, state } = useScrollApi();
  const callback = useRef(fn);
  callback.current = fn;

  useEffect(() => {
    const unsubscribe = subscribe((next) => callback.current(next));
    callback.current(state.current);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
