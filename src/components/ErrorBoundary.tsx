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
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            Nepavyko užkrauti šios dalies.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5"
          >
            Bandyti dar kartą
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
