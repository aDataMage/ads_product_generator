/**
 * ErrorBoundary Component
 * 
 * React error boundary for catching and handling errors in child components
 * Requirements: 4.4, 7.1, 7.2
 * 
 * Features:
 * - Catches JavaScript errors in child component tree
 * - Displays fallback UI with error message
 * - Provides retry and navigation options
 * - Logs errors for debugging
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary class component
 * 
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        // Reset error state
        this.setState({
            hasError: false,
            error: null,
        });
    };

    handleGoHome = () => {
        // Navigate to home page
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleReset);
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="text-center max-w-md">
                        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" aria-hidden="true" />
                        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
                        <p className="text-muted-foreground mb-6">
                            {this.state.error.message || 'An unexpected error occurred. Please try again.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={this.handleReset} className="gap-2">
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                Try Again
                            </Button>
                            <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
