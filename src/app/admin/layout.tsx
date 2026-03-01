import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administravimas | Vaikai.lt',
  robots: { index: false },
};

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
