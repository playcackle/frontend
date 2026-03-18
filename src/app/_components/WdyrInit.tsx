'use client';
// Dev-only — initializes why-did-you-render in the browser
// Remove this component after profiling is complete
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  import('@/wdyr').catch(() => {});
}

export function WdyrInit() {
  return null;
}
