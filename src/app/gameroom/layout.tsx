import { ReactNode } from 'react';

// Force dynamic rendering for all gameroom pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function GameroomLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}