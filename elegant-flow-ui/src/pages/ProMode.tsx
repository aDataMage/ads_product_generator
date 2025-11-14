/**
 * Pro Mode Page Component
 * 
 * Lazy-loaded page for Pro Mode - Structured Prompt Builder
 * Requirements: 1.1
 */

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { getAnimationDuration } from '../lib/utils';

// Requirement 14.1: Lazy load ProModeForm component for code splitting
const ProModeForm = lazy(() =>
    import('../components/ProModeForm').then(module => ({ default: module.ProModeForm }))
);

/**
 * ProModeFormFallback component
 * 
 * Loading fallback for lazy-loaded ProModeForm
 */
function ProModeFormFallback() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-2xl">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <Loader2
                        className="h-12 w-12 animate-spin text-primary"
                        aria-hidden="true"
                    />
                    <p className="text-lg font-medium text-muted-foreground">
                        Loading Pro Mode...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * ProMode page component
 * 
 * Requirement 1.1: Pro Mode interface with granular controls
 */
export function ProMode() {
    return (
        <motion.main
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: getAnimationDuration(0.5), ease: 'easeOut' }}
            className="w-full"
        >
            <Suspense fallback={<ProModeFormFallback />}>
                <ProModeForm />
            </Suspense>
        </motion.main>
    );
}
