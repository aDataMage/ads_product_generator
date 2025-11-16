/**
 * Toast Notifications Tests
 * 
 * Tests for toast notification system in editing operations
 * Task 6.3: Add success/error toast notifications
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

// Test component that uses toast
function TestToastComponent() {
    const { toast } = useToast();

    return (
        <div>
            <Button
                onClick={() =>
                    toast({
                        variant: 'success',
                        title: 'Success',
                        description: 'Operation completed successfully',
                    })
                }
            >
                Show Success Toast
            </Button>
            <Button
                onClick={() =>
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Operation failed',
                    })
                }
            >
                Show Error Toast
            </Button>
            <Toaster />
        </div>
    );
}

describe('Toast Notifications', () => {
    it('should display success toast when triggered', async () => {
        const user = userEvent.setup();
        render(<TestToastComponent />);

        const successButton = screen.getByText('Show Success Toast');
        await user.click(successButton);

        await waitFor(() => {
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
        });
    });

    it('should display error toast when triggered', async () => {
        const user = userEvent.setup();
        render(<TestToastComponent />);

        const errorButton = screen.getByText('Show Error Toast');
        await user.click(errorButton);

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.getByText('Operation failed')).toBeInTheDocument();
        });
    });

    it('should allow closing toast notifications', async () => {
        const user = userEvent.setup();
        render(<TestToastComponent />);

        const successButton = screen.getByText('Show Success Toast');
        await user.click(successButton);

        await waitFor(() => {
            expect(screen.getByText('Success')).toBeInTheDocument();
        });

        // Find and click the close button
        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('Success')).not.toBeInTheDocument();
        });
    });

    it('should support multiple toast variants', async () => {
        const user = userEvent.setup();
        render(<TestToastComponent />);

        // Show success toast
        const successButton = screen.getByText('Show Success Toast');
        await user.click(successButton);

        await waitFor(() => {
            expect(screen.getByText('Success')).toBeInTheDocument();
        });

        // Show error toast
        const errorButton = screen.getByText('Show Error Toast');
        await user.click(errorButton);

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });
});
