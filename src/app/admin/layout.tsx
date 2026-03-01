import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Administravimas | Vaikai.lt',
  robots: { index: false },
};

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
