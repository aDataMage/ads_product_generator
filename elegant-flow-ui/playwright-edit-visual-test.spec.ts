import { test, expect } from '@playwright/test';

/**
 * Visual Layout Test for /edit Page
 * Uses a data URL image to avoid CORS issues
 */

const BASE_URL = 'http://localhost:5175';

// Create a simple test image as data URL (800x600 gray rectangle)
const TEST_IMAGE_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+VGVzdCBJbWFnZSA4MDB4NjAwPC90ZXh0Pjwvc3ZnPg==';

test.describe('Edit Page Visual Layout Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Give time for layout to settle
    });

    test('Desktop 1920x1080 - Full Layout', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Take full page screenshot
        await page.screenshot({
            path: 'test-results/desktop-1920-full.png',
            fullPage: true
        });

        // Check split layout exists
        const layout = page.locator('.edit-page-layout');
        await expect(layout).toBeVisible();

        console.log('✓ Desktop 1920x1080 screenshot saved');
    });

    test('Desktop 1920x1080 - Header Buttons', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Screenshot just the header
        const header = page.locator('header').first();
        await header.screenshot({ path: 'test-results/desktop-header.png' });

        console.log('✓ Header screenshot saved');
    });

    test('Desktop 1920x1080 - Tool Panel', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Screenshot tool panel
        const toolPanel = page.locator('.tool-panel');
        if (await toolPanel.isVisible()) {
            await toolPanel.screenshot({ path: 'test-results/desktop-tool-panel.png' });
        }

        console.log('✓ Tool panel screenshot saved');
    });

    test('Desktop 1920x1080 - Image Panel Toolbar', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Screenshot image panel toolbar
        const toolbar = page.locator('[role="toolbar"]').first();
        if (await toolbar.isVisible()) {
            await toolbar.screenshot({ path: 'test-results/desktop-image-toolbar.png' });
        }

        console.log('✓ Image toolbar screenshot saved');
    });

    test('Tablet 768x1024 - Full Layout', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'test-results/tablet-768-full.png',
            fullPage: true
        });

        console.log('✓ Tablet 768x1024 screenshot saved');
    });

    test('Mobile 375x667 - Full Layout', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'test-results/mobile-375-full.png',
            fullPage: true
        });

        console.log('✓ Mobile 375x667 screenshot saved');
    });

    test('Mobile 375x667 - Toolbar Detail', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        // Scroll to image panel
        await page.evaluate(() => {
            const imagePanel = document.querySelector('.image-panel');
            if (imagePanel) imagePanel.scrollIntoView();
        });

        await page.waitForTimeout(300);

        const toolbar = page.locator('[role="toolbar"]').first();
        if (await toolbar.isVisible()) {
            await toolbar.screenshot({ path: 'test-results/mobile-375-toolbar.png' });
        }

        console.log('✓ Mobile toolbar screenshot saved');
    });

    test('CRITICAL: Small Mobile 320x568 - Full Layout', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'test-results/CRITICAL-small-mobile-320-full.png',
            fullPage: true
        });

        console.log('✓ CRITICAL: Small mobile 320x568 screenshot saved');
    });

    test('CRITICAL: Small Mobile 320x568 - Toolbar Overflow Check', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });
        await page.waitForTimeout(500);

        // Scroll to image panel
        await page.evaluate(() => {
            const imagePanel = document.querySelector('.image-panel');
            if (imagePanel) imagePanel.scrollIntoView();
        });

        await page.waitForTimeout(300);

        const toolbar = page.locator('[role="toolbar"]').first();
        if (await toolbar.isVisible()) {
            await toolbar.screenshot({ path: 'test-results/CRITICAL-small-mobile-320-toolbar.png' });

            // Check if toolbar has horizontal overflow
            const hasOverflow = await toolbar.evaluate(el => {
                return el.scrollWidth > el.clientWidth;
            });

            if (hasOverflow) {
                console.log('⚠️  WARNING: Toolbar has horizontal overflow on 320px screen!');
            } else {
                console.log('✓ Toolbar fits within 320px screen');
            }
        }

        console.log('✓ CRITICAL: Small mobile toolbar screenshot saved');
    });

    test('All Accordions Open - Scroll Test', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Open all accordions
        const accordions = [
            'Background Tools',
            'Generative Fill',
            'Enhancement',
            'Canvas Expander'
        ];

        for (const accordion of accordions) {
            const trigger = page.getByText(accordion).first();
            if (await trigger.isVisible()) {
                await trigger.click();
                await page.waitForTimeout(300);
            }
        }

        // Screenshot tool panel with all open
        const toolPanel = page.locator('.tool-panel');
        if (await toolPanel.isVisible()) {
            await toolPanel.screenshot({ path: 'test-results/all-accordions-open.png' });

            // Check if scrollable
            const isScrollable = await toolPanel.evaluate(el => {
                return el.scrollHeight > el.clientHeight;
            });

            if (isScrollable) {
                console.log('✓ Tool panel is scrollable with all accordions open');
            } else {
                console.log('✓ All accordions fit without scrolling');
            }
        }

        console.log('✓ All accordions screenshot saved');
    });

    test('Zoom Controls Test', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Click zoom in
        const zoomInBtn = page.getByRole('button', { name: /zoom in/i });
        if (await zoomInBtn.isVisible()) {
            await zoomInBtn.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/zoomed-in.png' });
            console.log('✓ Zoomed in screenshot saved');
        }
    });

    test('Metadata Overlay Test', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        // Click info button
        const infoBtn = page.getByRole('button', { name: /image information/i });
        if (await infoBtn.isVisible()) {
            await infoBtn.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/metadata-overlay.png' });
            console.log('✓ Metadata overlay screenshot saved');
        }
    });

    test('Error State - No Image URL', async ({ page }) => {
        await page.goto(`${BASE_URL}/edit`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await page.screenshot({ path: 'test-results/error-no-image-url.png' });
        console.log('✓ Error state screenshot saved');
    });

    test('Responsive Breakpoints Comparison', async ({ page }) => {
        const breakpoints = [
            { width: 1920, height: 1080, name: 'desktop-1920' },
            { width: 1366, height: 768, name: 'laptop-1366' },
            { width: 1024, height: 768, name: 'tablet-1024' },
            { width: 768, height: 1024, name: 'tablet-768' },
            { width: 480, height: 800, name: 'mobile-480' },
            { width: 375, height: 667, name: 'mobile-375' },
            { width: 320, height: 568, name: 'mobile-320' },
        ];

        for (const bp of breakpoints) {
            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.waitForTimeout(500);

            await page.screenshot({
                path: `test-results/breakpoint-${bp.name}.png`,
                fullPage: false // Just viewport
            });

            console.log(`✓ Breakpoint ${bp.name} screenshot saved`);
        }
    });
});
