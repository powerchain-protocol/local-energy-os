'use client';

import { useBreakpointDown, useViewport } from '@/hooks/use-breakpoint';

/** @deprecated Prefer useBreakpointDown('md') for new components. */
export function useMobile(): boolean {
  return useBreakpointDown('md');
}

export { useViewport };
