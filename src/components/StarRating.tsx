'use client';

import { useState } from 'react';

interface StarRatingProps {
  readonly rating: number;
  readonly maxStars?: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly interactive?: boolean;
  readonly onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;
  const cls = sizeClasses[size];

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Įvertinimas: ${rating} iš ${maxStars}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = displayRating >= starValue;
        const halfFilled = !filled && displayRating >= starValue - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={`${cls} ${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {halfFilled && (
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="50%" stopColor="var(--star-empty, #D1D5DB)" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? '#FBBF24' : halfFilled ? `url(#half-${i})` : 'var(--star-empty, #D1D5DB)'}
                stroke={filled || halfFilled ? '#F59E0B' : 'var(--star-empty-stroke, #9CA3AF)'}
                strokeWidth="1"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
