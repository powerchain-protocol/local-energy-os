/**
 * PowerChain responsive breakpoints.
 * Keep these values synchronized with tailwind.config.ts.
 */
export const BREAKPOINTS = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export const breakpointMin = (name: BreakpointName): string =>
  `(min-width: ${BREAKPOINTS[name]}px)`;

export const breakpointMax = (name: BreakpointName): string =>
  `(max-width: ${BREAKPOINTS[name] - 1}px)`;

export const breakpointRange = (
  from: BreakpointName,
  to: BreakpointName,
): string => `(min-width: ${BREAKPOINTS[from]}px) and (max-width: ${BREAKPOINTS[to] - 1}px)`;
