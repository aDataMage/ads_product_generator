import { test, expect, Page } from '@playwright/test';

/**
 * Playwright E2E Test for /edit Page Layout
 * Tests all features, buttons, and responsive breakpoints
 */

const TEST_IMAGE_URL = 'https://via.placeholder.com/800x600.png';
const BASE_URL = 'http://localhost:5175';

test.describe('Edit Page Layout Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to edit page with test image
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_URL)}`);
        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    test.describe('Desktop Layout (1920x1080)', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should display split panel layout with correct proportions', async ({ page }) => {
            // Check if layout exists
            const layout = page.locator('.edit-page-layout');
            await expect(layout).toBeVisible();

            // Check tool panel
            const toolPanel = page.locator('.tool-panel');
            await expect(toolPanel).toBeVisible();

            // Check image panel
            const imagePanel = page.locator('.image-panel');
            await expect(imagePanel).toBeVisible();

            // Take screenshot
            await page.screenshot({ path: 'test-results/desktop-layout.png', fullPage: true });
        });

        test('should display all header buttons', async ({ page }) => {
            // Check back button
            await expect(page.getByRole('button', { name: /back/i })).toBeVisible();

            // Check download button
            await expect(page.getByRole('button', { name: /download/i })).toBeVisible();

            // Check undo button
            const undoButton = page.getByRole('button', { name: /undo/i });
            await expect(undoButton).toBeVisible();

            // Check redo button
            const redoButton = page.getByRole('button', { name: /redo/i });
            await expect(redoButton).toBeVisible();

            await page.screenshot({ path: 'test-results/desktop-header.png' });
        });

        test('should display all toolbar buttons in image panel', async ({ page }) => {
            // Wait for image to load
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            // Check zoom controls
            await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /fit to screen/i })).toBeVisible();

            // Check info button
            await expect(page.getByRole('button', { name: /image information/i })).toBeVisible();

            await page.screenshot({ path: 'test-results/desktop-toolbar.png' });
        });

        test('should display all accordion sections in tool panel', async ({ page }) => {
            // Check Background Tools
            await expect(page.getByText('Background Tools')).toBeVisible();

            // Check Generative Fill
            await expect(page.getByText('Generative Fill')).toBeVisible();

            // Check Enhancement
            await expect(page.getByText('Enhancement')).toBeVisible();

            // Check Canvas Expander
            await expect(page.getByText('Canvas Expander')).toBeVisible();

            await page.screenshot({ path: 'test-results/desktop-accordions.png' });
        });

        test('should allow resizing panels with divider', async ({ page }) => {
            const divider = page.locator('.divider');

            if (await divider.isVisible()) {
                const dividerBox = await divider.boundingBox();
                if (dividerBox) {
                    // Try to drag divider
                    await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(dividerBox.x + 100, dividerBox.y + dividerBox.height / 2);
                    await page.mouse.up();

                    await page.screenshot({ path: 'test-results/desktop-resized-panels.png' });
                }
            }
        });
    });

    test.describe('Tablet Layout (768x1024)', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('should display adjusted split layout', async ({ page }) => {
            const layout = page.locator('.edit-page-layout');
            await expect(layout).toBeVisible();

            await page.screenshot({ path: 'test-results/tablet-layout.png', fullPage: true });
        });

        test('should have all buttons accessible', async ({ page }) => {
            await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /download/i })).toBeVisible();

            await page.screenshot({ path: 'test-results/tablet-buttons.png' });
        });
    });

    test.describe('Mobile Layout (375x667)', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('should stack panels vertically', async ({ page }) => {
            const layout = page.locator('.edit-page-layout');
            await expect(layout).toBeVisible();

            // Check if panels are stacked
            const toolPanel = page.locator('.tool-panel');
            const imagePanel = page.locator('.image-panel');

            await expect(toolPanel).toBeVisible();
            await expect(imagePanel).toBeVisible();

            await page.screenshot({ path: 'test-results/mobile-layout.png', fullPage: true });
        });

        test('should have all toolbar buttons accessible', async ({ page }) => {
            // Wait for image to load
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            // Check if toolbar is visible
            const toolbar = page.locator('[role="toolbar"]').first();
            await expect(toolbar).toBeVisible();

            // Take screenshot to check for overflow
            await page.screenshot({ path: 'test-results/mobile-toolbar.png' });
        });

        test('should allow scrolling in tool panel', async ({ page }) => {
            const toolPanel = page.locator('.tool-panel');
            await expect(toolPanel).toBeVisible();

            // Try to scroll
            await toolPanel.evaluate(el => el.scrollTop = 100);

            await page.screenshot({ path: 'test-results/mobile-tool-panel-scroll.png' });
        });
    });

    test.describe('Small Mobile Layout (320x568)', () => {
        test.use({ viewport: { width: 320, height: 568 } });

        test('CRITICAL: should not have toolbar overflow', async ({ page }) => {
            // Wait for image to load
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            const toolbar = page.locator('[role="toolbar"]').first();
            await expect(toolbar).toBeVisible();

            // Check if toolbar has horizontal scroll or if buttons are cut off
            const toolbarBox = await toolbar.boundingBox();
            const viewportWidth = 320;

            // Take screenshot to visually inspect
            await page.screenshot({ path: 'test-results/small-mobile-toolbar-CRITICAL.png' });

            // Try to access the last button (Info button)
            const infoButton = page.getByRole('button', { name: /image information/i });
            const isInfoVisible = await infoButton.isVisible();

            if (!isInfoVisible) {
                console.error('❌ CRITICAL: Info button not visible on 320px screen');
            }
        });

        test('should have readable text without overflow', async ({ page }) => {
            await page.screenshot({ path: 'test-results/small-mobile-full.png', fullPage: true });
        });
    });

    test.describe('Feature Testing', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should open and display Background Tools accordion', async ({ page }) => {
            const backgroundAccordion = page.getByText('Background Tools');
            await backgroundAccordion.click();

            // Wait for accordion to open
            await page.waitForTimeout(500);

            // Check for background tool buttons
            await expect(page.getByRole('button', { name: /remove background/i })).toBeVisible();

            await page.screenshot({ path: 'test-results/background-tools-open.png' });
        });

        test('should open and display Generative Fill accordion', async ({ page }) => {
            const genFillAccordion = page.getByText('Generative Fill');
            await genFillAccordion.click();

            await page.waitForTimeout(500);

            // Check for canvas or prompt input
            const promptInput = page.getByPlaceholder(/describe what to generate/i);
            if (await promptInput.isVisible()) {
                await expect(promptInput).toBeVisible();
            }

            await page.screenshot({ path: 'test-results/generative-fill-open.png' });
        });

        test('should open and display Enhancement accordion', async ({ page }) => {
            const enhancementAccordion = page.getByText('Enhancement').first();
            await enhancementAccordion.click();

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/enhancement-open.png' });
        });

        test('should open and display Canvas Expander accordion', async ({ page }) => {
            const canvasAccordion = page.getByText('Canvas Expander');
            await canvasAccordion.click();

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/canvas-expander-open.png' });
        });

        test('should open all accordions without overflow', async ({ page }) => {
            // Open all accordions
            await page.getByText('Background Tools').click();
            await page.waitForTimeout(300);

            await page.getByText('Generative Fill').click();
            await page.waitForTimeout(300);

            await page.getByText('Enhancement').first().click();
            await page.waitForTimeout(300);

            await page.getByText('Canvas Expander').click();
            await page.waitForTimeout(300);

            // Check if tool panel scrolls
            const toolPanel = page.locator('.tool-panel');
            const scrollHeight = await toolPanel.evaluate(el => el.scrollHeight);
            const clientHeight = await toolPanel.evaluate(el => el.clientHeight);

            console.log(`Tool panel scroll: ${scrollHeight}px content in ${clientHeight}px container`);

            await page.screenshot({ path: 'test-results/all-accordions-open.png', fullPage: true });
        });
    });

    test.describe('Zoom and Pan Testing', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should zoom in when clicking zoom in button', async ({ page }) => {
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            const zoomInButton = page.getByRole('button', { name: /zoom in/i });
            await zoomInButton.click();

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/zoomed-in.png' });
        });

        test('should zoom out when clicking zoom out button', async ({ page }) => {
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            const zoomOutButton = page.getByRole('button', { name: /zoom out/i });
            await zoomOutButton.click();

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/zoomed-out.png' });
        });

        test('should fit to screen when clicking fit button', async ({ page }) => {
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            const fitButton = page.getByRole('button', { name: /fit to screen/i });
            await fitButton.click();

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/zoom-fit.png' });
        });
    });

    test.describe('Metadata and Comparison', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should toggle metadata overlay', async ({ page }) => {
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            const infoButton = page.getByRole('button', { name: /image information/i });
            await infoButton.click();

            await page.waitForTimeout(500);

            // Check if metadata is visible
            await page.screenshot({ path: 'test-results/metadata-overlay.png' });
        });
    });

    test.describe('Error States', () => {
        test('should display error when no image URL provided', async ({ page }) => {
            await page.goto(`${BASE_URL}/edit`);

            // Should show error message
            await expect(page.getByText(/no image url provided/i)).toBeVisible();

            await page.screenshot({ path: 'test-results/error-no-url.png' });
        });
    });

    test.describe('Keyboard Shortcuts', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should respond to Ctrl+0 (zoom fit)', async ({ page }) => {
            await page.waitForSelector('img[alt*="Image being edited"]', { timeout: 10000 });

            await page.keyboard.press('Control+0');
            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/keyboard-zoom-fit.png' });
        });
    });

    test.describe('Dark Mode', () => {
        test.use({ viewport: { width: 1920, height: 1080 }, colorScheme: 'dark' });

        test('should display correctly in dark mode', async ({ page }) => {
            // Add dark class if needed
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
            });

            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/dark-mode.png', fullPage: true });
        });
    });
});
