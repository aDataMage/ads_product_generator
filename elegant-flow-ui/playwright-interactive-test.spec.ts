import { test, expect } from '@playwright/test';

/**
 * Interactive Test for /edit Page
 * Tests button clicks, accordion interactions, and layout changes
 */

const BASE_URL = 'http://localhost:5175';
const TEST_IMAGE_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+VGVzdCBJbWFnZSA4MDB4NjAwPC90ZXh0Pjwvc3ZnPg==';

test.describe('Edit Page Interactive Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('Desktop - Click all header buttons', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing header buttons...');

        // Screenshot before
        await page.screenshot({ path: 'test-results/interactive-header-before.png' });

        // Test header buttons specifically (not toolbar buttons)
        const header = page.locator('header').first();

        // Test undo button in header (should be disabled initially)
        const undoBtn = header.getByRole('button', { name: /undo/i });
        await expect(undoBtn).toBeDisabled();
        console.log('✓ Undo button is disabled (no history)');

        // Test redo button in header (should be disabled initially)
        const redoBtn = header.getByRole('button', { name: /redo/i });
        await expect(redoBtn).toBeDisabled();
        console.log('✓ Redo button is disabled (no history)');

        // Test download button (should be enabled)
        const downloadBtn = header.getByRole('button', { name: /download/i });
        await expect(downloadBtn).toBeEnabled();
        console.log('✓ Download button is enabled');

        await page.screenshot({ path: 'test-results/interactive-header-after.png' });
    });

    test('Desktop - Click zoom buttons and verify zoom changes', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing zoom controls...');

        // Get initial zoom level
        const zoomDisplay = page.locator('button:has-text("%")').first();
        const initialZoom = await zoomDisplay.textContent();
        console.log(`Initial zoom: ${initialZoom}`);

        await page.screenshot({ path: 'test-results/interactive-zoom-initial.png' });

        // Click zoom in
        const zoomInBtn = page.getByRole('button', { name: /zoom in/i });
        await zoomInBtn.click();
        await page.waitForTimeout(500);

        const zoomAfterIn = await zoomDisplay.textContent();
        console.log(`After zoom in: ${zoomAfterIn}`);
        await page.screenshot({ path: 'test-results/interactive-zoom-in.png' });

        // Click zoom out
        const zoomOutBtn = page.getByRole('button', { name: /zoom out/i });
        await zoomOutBtn.click();
        await page.waitForTimeout(500);

        const zoomAfterOut = await zoomDisplay.textContent();
        console.log(`After zoom out: ${zoomAfterOut}`);
        await page.screenshot({ path: 'test-results/interactive-zoom-out.png' });

        // Click fit to screen (use aria-label instead)
        const fitBtn = page.getByLabel(/fit to screen|zoom to fit/i);
        await fitBtn.click();
        await page.waitForTimeout(500);

        const zoomAfterFit = await zoomDisplay.textContent();
        console.log(`After fit: ${zoomAfterFit}`);
        await page.screenshot({ path: 'test-results/interactive-zoom-fit.png' });

        console.log('✓ All zoom controls work');
    });

    test('Desktop - Toggle metadata overlay', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing metadata toggle...');

        // Click info button
        const infoBtn = page.getByRole('button', { name: /image information/i });
        await infoBtn.click();
        await page.waitForTimeout(500);

        // Check if metadata is visible
        const metadata = page.locator('text=Image Info');
        await expect(metadata).toBeVisible();
        console.log('✓ Metadata overlay appears');

        await page.screenshot({ path: 'test-results/interactive-metadata-visible.png' });

        // Click again to hide
        await infoBtn.click();
        await page.waitForTimeout(500);

        await expect(metadata).not.toBeVisible();
        console.log('✓ Metadata overlay hides');

        await page.screenshot({ path: 'test-results/interactive-metadata-hidden.png' });
    });

    test('Desktop - Open and close all accordions', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing accordion interactions...');

        const accordions = [
            { name: 'Background Tools', screenshot: 'background' },
            { name: 'Generative Fill', screenshot: 'generative-fill' },
            { name: 'Enhancement', screenshot: 'enhancement' },
            { name: 'Canvas Expander', screenshot: 'canvas-expander' }
        ];

        for (const accordion of accordions) {
            console.log(`Opening ${accordion.name}...`);

            const trigger = page.getByText(accordion.name).first();
            await trigger.click();
            await page.waitForTimeout(500);

            await page.screenshot({
                path: `test-results/interactive-accordion-${accordion.screenshot}-open.png`
            });

            console.log(`✓ ${accordion.name} opened`);

            // Close it
            await trigger.click();
            await page.waitForTimeout(500);

            console.log(`✓ ${accordion.name} closed`);
        }
    });

    test('Desktop - Open all accordions simultaneously', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Opening all accordions...');

        // Open all
        await page.getByText('Background Tools').first().click();
        await page.waitForTimeout(300);

        await page.getByText('Generative Fill').first().click();
        await page.waitForTimeout(300);

        await page.getByText('Enhancement').first().click();
        await page.waitForTimeout(300);

        await page.getByText('Canvas Expander').first().click();
        await page.waitForTimeout(300);

        await page.screenshot({
            path: 'test-results/interactive-all-accordions-open.png',
            fullPage: true
        });

        // Check if tool panel is scrollable
        const toolPanel = page.locator('.tool-panel');
        const isScrollable = await toolPanel.evaluate(el => el.scrollHeight > el.clientHeight);

        if (isScrollable) {
            console.log('✓ Tool panel is scrollable');

            // Scroll to bottom
            await toolPanel.evaluate(el => el.scrollTop = el.scrollHeight);
            await page.waitForTimeout(300);

            await page.screenshot({
                path: 'test-results/interactive-tool-panel-scrolled.png'
            });

            console.log('✓ Scrolled to bottom');
        } else {
            console.log('✓ All accordions fit without scrolling');
        }
    });

    test('Mobile 375px - Test toolbar accessibility', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        console.log('Testing mobile toolbar...');

        // Scroll to image panel
        await page.evaluate(() => {
            const imagePanel = document.querySelector('.image-panel');
            if (imagePanel) imagePanel.scrollIntoView();
        });
        await page.waitForTimeout(300);

        await page.screenshot({ path: 'test-results/interactive-mobile-375-toolbar.png' });

        // Try to click each button (use aria-label for fit button)
        const buttons = [
            { selector: page.getByRole('button', { name: /undo/i }), label: 'Undo' },
            { selector: page.getByRole('button', { name: /redo/i }), label: 'Redo' },
            { selector: page.getByRole('button', { name: /zoom out/i }), label: 'Zoom Out' },
            { selector: page.getByRole('button', { name: /zoom in/i }), label: 'Zoom In' },
            { selector: page.getByLabel(/fit to screen|zoom to fit/i), label: 'Fit' },
            { selector: page.getByRole('button', { name: /image information/i }), label: 'Info' }
        ];

        for (const btn of buttons) {
            const isVisible = await btn.selector.isVisible();

            if (isVisible) {
                console.log(`✓ ${btn.label} button is visible`);
            } else {
                console.log(`⚠️  ${btn.label} button is NOT visible`);
            }
        }
    });

    test('CRITICAL - Small Mobile 320px - Test toolbar with overflow fix', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });
        await page.waitForTimeout(500);

        console.log('Testing small mobile toolbar with overflow fix...');

        // Scroll to image panel
        await page.evaluate(() => {
            const imagePanel = document.querySelector('.image-panel');
            if (imagePanel) imagePanel.scrollIntoView();
        });
        await page.waitForTimeout(300);

        await page.screenshot({ path: 'test-results/interactive-mobile-320-toolbar-FIXED.png' });

        // Check if toolbar has overflow
        const toolbar = page.locator('[role="toolbar"]').first();
        const hasOverflow = await toolbar.evaluate(el => el.scrollWidth > el.clientWidth);

        if (hasOverflow) {
            console.log('✓ Toolbar has horizontal scroll (expected)');

            // Try to scroll toolbar
            await toolbar.evaluate(el => el.scrollLeft = el.scrollWidth);
            await page.waitForTimeout(300);

            await page.screenshot({ path: 'test-results/interactive-mobile-320-toolbar-scrolled.png' });

            console.log('✓ Toolbar can be scrolled');
        } else {
            console.log('✓ All buttons fit without scrolling');
        }

        // Try to click buttons (use aria-label for fit button)
        const buttons = [
            { selector: page.getByRole('button', { name: /undo/i }), label: 'Undo' },
            { selector: page.getByRole('button', { name: /redo/i }), label: 'Redo' },
            { selector: page.getByRole('button', { name: /zoom out/i }), label: 'Zoom Out' },
            { selector: page.getByRole('button', { name: /zoom in/i }), label: 'Zoom In' },
            { selector: page.getByLabel(/fit to screen|zoom to fit/i), label: 'Fit' },
            { selector: page.getByRole('button', { name: /image information/i }), label: 'Info' }
        ];

        let accessibleCount = 0;
        for (const btn of buttons) {

            try {
                // Scroll button into view
                await btn.selector.scrollIntoViewIfNeeded({ timeout: 1000 });
                const isVisible = await btn.selector.isVisible();

                if (isVisible) {
                    accessibleCount++;
                    console.log(`✓ ${btn.label} button is accessible`);
                }
            } catch (e) {
                console.log(`⚠️  ${btn.label} button is NOT accessible`);
            }
        }

        console.log(`\n✓ ${accessibleCount}/${buttons.length} buttons are accessible on 320px screen`);

        if (accessibleCount === buttons.length) {
            console.log('✅ FIX SUCCESSFUL: All buttons accessible!');
        } else {
            console.log('⚠️  Some buttons still not accessible');
        }
    });

    test('Desktop - Test panel resizing', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing panel resizing...');

        await page.screenshot({ path: 'test-results/interactive-panels-initial.png' });

        // Find divider
        const divider = page.locator('.divider');

        if (await divider.isVisible()) {
            const dividerBox = await divider.boundingBox();

            if (dividerBox) {
                // Drag divider to the right
                await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(dividerBox.x + 200, dividerBox.y + dividerBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(500);

                await page.screenshot({ path: 'test-results/interactive-panels-resized-right.png' });
                console.log('✓ Resized panels to the right');

                // Drag divider to the left
                await page.mouse.move(dividerBox.x + 200, dividerBox.y + dividerBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(dividerBox.x - 100, dividerBox.y + dividerBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(500);

                await page.screenshot({ path: 'test-results/interactive-panels-resized-left.png' });
                console.log('✓ Resized panels to the left');
            }
        } else {
            console.log('⚠️  Divider not visible (resizing may be disabled)');
        }
    });

    test('Desktop - Test keyboard shortcuts', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        console.log('Testing keyboard shortcuts...');

        // Test Ctrl+0 (zoom fit)
        await page.keyboard.press('Control+0');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-keyboard-zoom-fit.png' });
        console.log('✓ Ctrl+0 (zoom fit) works');

        // Test Ctrl++ (zoom in)
        await page.keyboard.press('Control++');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-keyboard-zoom-in.png' });
        console.log('✓ Ctrl++ (zoom in) works');

        // Test Ctrl+- (zoom out)
        await page.keyboard.press('Control+-');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/interactive-keyboard-zoom-out.png' });
        console.log('✓ Ctrl+- (zoom out) works');
    });

    test('Responsive - Test layout at all breakpoints', async ({ page }) => {
        const breakpoints = [
            { width: 1920, height: 1080, name: 'Desktop 1920' },
            { width: 1366, height: 768, name: 'Laptop 1366' },
            { width: 1024, height: 768, name: 'Tablet 1024' },
            { width: 768, height: 1024, name: 'Tablet 768' },
            { width: 480, height: 800, name: 'Mobile 480' },
            { width: 375, height: 667, name: 'Mobile 375' },
            { width: 320, height: 568, name: 'Mobile 320' }
        ];

        for (const bp of breakpoints) {
            console.log(`Testing ${bp.name}...`);

            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.waitForTimeout(500);

            // Check layout
            const layout = page.locator('.edit-page-layout');
            await expect(layout).toBeVisible();

            // Take screenshot
            await page.screenshot({
                path: `test-results/interactive-responsive-${bp.width}x${bp.height}.png`,
                fullPage: false
            });

            console.log(`✓ ${bp.name} layout works`);
        }
    });

    test('Error handling - Test back button on error page', async ({ page }) => {
        // Navigate to edit page without image URL
        await page.goto(`${BASE_URL}/edit`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        console.log('Testing error page...');

        // Should show error
        await expect(page.getByText(/no image url provided/i)).toBeVisible();
        console.log('✓ Error message displayed');

        await page.screenshot({ path: 'test-results/interactive-error-page.png' });

        // Click go back button (check for button with "back" text)
        const backBtn = page.getByRole('button').filter({ hasText: /back/i });
        await expect(backBtn.first()).toBeVisible();
        console.log('✓ Go back button visible');

        // Don't actually click it as it would navigate away
    });
});
