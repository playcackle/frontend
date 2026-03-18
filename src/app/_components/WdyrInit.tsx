'use client';
// Dev-only — initializes why-did-you-render in the browser
// Remove this component after profiling is complete
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') require('@/wdyr');

export function WdyrInit() {
  return null;
}
