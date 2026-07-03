"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-surface-900 dark:text-dark-text">Something went wrong</p>
            <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
