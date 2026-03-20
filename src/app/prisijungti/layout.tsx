import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prisijungti | ManoVaikai.lt',
  description: 'Prisijunkite prie ManoVaikai.lt paskyros.',
  robots: { index: false },
};

export default function AuthLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
