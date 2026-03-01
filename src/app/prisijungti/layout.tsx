import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prisijungti | Vaikai.lt',
  description: 'Prisijunkite prie Vaikai.lt paskyros.',
  robots: { index: false },
};

export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
