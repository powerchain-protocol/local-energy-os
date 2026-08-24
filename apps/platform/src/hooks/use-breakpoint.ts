'use client';

import { useEffect, useState } from 'react';
import {
  BREAKPOINTS,
  breakpointMax,
  breakpointMin,
  type BreakpointName,
} from '@/config/breakpoints';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function useBreakpoint(name: BreakpointName): boolean {
  return useMediaQuery(breakpointMin(name));
}

export function useBreakpointDown(name: BreakpointName): boolean {
  return useMediaQuery(breakpointMax(name));
}

export function useViewport(): {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return {
    width,
    isMobile: width > 0 && width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
}
