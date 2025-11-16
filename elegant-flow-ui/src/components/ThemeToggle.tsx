/**
 * ThemeToggle Component
 * 
 * Provides a dropdown menu to switch between light, dark, and system themes
 * Task 6.3: Add dark mode support
 */

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Toggle theme"
                    className="transition-colors"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" aria-hidden="true" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="gap-2"
                    aria-current={theme === 'light' ? 'true' : undefined}
                >
                    <Sun className="h-4 w-4" aria-hidden="true" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="gap-2"
                    aria-current={theme === 'dark' ? 'true' : undefined}
                >
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="gap-2"
                    aria-current={theme === 'system' ? 'true' : undefined}
                >
                    <Monitor className="h-4 w-4" aria-hidden="true" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
