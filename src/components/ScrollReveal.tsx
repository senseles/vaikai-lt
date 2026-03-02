'use client';

import { useInView } from '@/hooks/useInView';

interface ScrollRevealProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly className?: string;
}

export default function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  const { ref, isInView } = useInView({ threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: isInView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
