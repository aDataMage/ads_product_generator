/**
 * Main App Component
 * 
 * Root component with routing for Standard Mode and Pro Mode
 * Requirements: 1.1, 14.1, 14.2
 * 
 * Accessibility Features:
 * - Keyboard navigation with skip-to-main link
 * - ARIA labels on navigation elements
 * - Semantic HTML structure
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StandardMode } from './pages/StandardMode';
import { ProMode } from './pages/ProMode';
import { getAnimationDuration } from './lib/utils';
import { Sparkles, Sliders } from 'lucide-react';
import { Button } from './components/ui/button';

/**
 * AppContent component
 * 
 * Contains the header with navigation and route content
 */
function AppContent() {
  const location = useLocation();
  const isProMode = location.pathname === '/pro-mode';

  return (
    <>
      {/* Requirement 13.3: Implement keyboard navigation support - skip link */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen bg-background text-foreground">
        {/* Main container with padding */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 max-w-7xl">
          {/* Header with navigation */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: getAnimationDuration(0.4), ease: 'easeOut' }}
            className="mb-6 sm:mb-8 lg:mb-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              {/* Title */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  Elegant Flow UI
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Generate professional product images with AI
                </p>
              </div>

              {/* Navigation - Requirement 14.2: Add Pro Mode navigation */}
              <nav aria-label="Mode selection" className="flex gap-2">
                <Button
                  asChild
                  variant={!isProMode ? 'default' : 'outline'}
                  size="default"
                  className="gap-2"
                >
                  <Link to="/" aria-current={!isProMode ? 'page' : undefined}>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>Standard Mode</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isProMode ? 'default' : 'outline'}
                  size="default"
                  className="gap-2"
                >
                  <Link to="/pro-mode" aria-current={isProMode ? 'page' : undefined}>
                    <Sliders className="h-4 w-4" aria-hidden="true" />
                    <span>Pro Mode</span>
                  </Link>
                </Button>
              </nav>
            </div>
          </motion.header>

          {/* Routes - Requirement 14.1: Add route configuration */}
          <Routes>
            <Route path="/" element={<StandardMode />} />
            <Route path="/pro-mode" element={<ProMode />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

/**
 * App component
 * 
 * Requirement 14.1: Add routing with BrowserRouter
 */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
