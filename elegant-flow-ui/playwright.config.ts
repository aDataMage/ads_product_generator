import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Edit Page testing
 */
export default defineConfig({
    testDir: './',
    testMatch: '**/*{visual,interactive,workflow}-test.spec.ts',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Test execution settings
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list']
    ],

    // Shared settings for all tests
    use: {
        // Base URL for navigation
        baseURL: 'http://localhost:5175',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',
    },

    // Configure projects for major browsers and viewports
    projects: [
        {
            name: 'chromium-desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        {
            name: 'chromium-tablet',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 768, height: 1024 }
            },
        },
        {
            name: 'chromium-mobile',
            use: {
                ...devices['iPhone 12'],
                viewport: { width: 375, height: 667 }
            },
        },
        {
            name: 'chromium-small-mobile',
            use: {
                ...devices['iPhone SE'],
                viewport: { width: 320, height: 568 }
            },
        },
    ],

    // Run dev server before starting tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
});
