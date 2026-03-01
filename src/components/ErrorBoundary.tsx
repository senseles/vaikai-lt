'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nepavyko užkrauti šios dalies. Pabandykite perkrauti puslapį.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
