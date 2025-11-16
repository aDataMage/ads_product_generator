import { test, expect } from '@playwright/test';

/**
 * Full Workflow Test for Edit Page
 * Tests both desktop (side-by-side) and mobile (tab) layouts
 */

const BASE_URL = 'http://localhost:5173';
const TEST_IMAGE_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRhOTBkOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkJsdWUgU2hvZXMgODAweDYwMDwvdGV4dD48L3N2Zz4=';

test.describe('Full Workflow - Desktop Mode', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('Desktop - Complete workflow test', async ({ page }) => {
        console.log('🖥️  Testing Desktop Mode (1920x1080)');

        // 1. Verify split layout is visible
        console.log('✓ Step 1: Verify split layout');
        const desktopLayout = page.locator('.edit-page-layout').first();
        await expect(desktopLayout).toBeVisible();
        await page.screenshot({ path: 'test-results/workflow-desktop-01-layout.png' });

        // 2. Verify tool panel is visible
        console.log('✓ Step 2: Verify tool panel');
        const toolPanel = page.locator('.tool-panel');
        await expect(toolPanel).toBeVisible();

        // 3. Verify image panel is visible
        console.log('✓ Step 3: Verify image panel');
        const imagePanel = page.locator('.image-panel');
        await expect(imagePanel).toBeVisible();

        // 4. Verify all accordions are present
        console.log('✓ Step 4: Verify all editing tools');
        await expect(page.getByText('Background Tools')).toBeVisible();
        await expect(page.getByText('Generative Fill')).toBeVisible();
        await expect(page.getByText('Enhancement')).toBeVisible();
        await expect(page.getByText('Canvas Expander')).toBeVisible();
        await page.screenshot({ path: 'test-results/workflow-desktop-02-tools.png' });

        // 5. Open Background Tools accordion
        console.log('✓ Step 5: Open Background Tools');
        await page.getByText('Background Tools').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/workflow-desktop-03-background-tools.png' });

        // 6. Test zoom controls
        console.log('✓ Step 6: Test zoom controls');
        const zoomInBtn = page.getByRole('button', { name: /zoom in/i });
        await zoomInBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/workflow-desktop-04-zoomed.png' });

        // 7. Test metadata toggle
        console.log('✓ Step 7: Test metadata overlay');
        const infoBtn = page.getByRole('button', { name: /image information/i });
        await infoBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/workflow-desktop-05-metadata.png' });

        // 8. Test panel resizing
        console.log('✓ Step 8: Test panel resizing');
        const divider = page.locator('.divider');
        if (await divider.isVisible()) {
            const dividerBox = await divider.boundingBox();
            if (dividerBox) {
                await page.mouse.move(dividerBox.x, dividerBox.y + dividerBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(dividerBox.x + 100, dividerBox.y + dividerBox.height / 2);
                await page.mouse.up();
                await page.waitForTimeout(500);
                await page.screenshot({ path: 'test-results/workflow-desktop-06-resized.png' });
            }
        }

        console.log('✅ Desktop workflow complete!');
    });
});

test.describe('Full Workflow - Mobile Mode', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('Mobile - Complete workflow with tabs', async ({ page }) => {
        console.log('📱 Testing Mobile Mode (375x667)');

        // 1. Verify desktop layout is hidden (has hidden class)
        console.log('✓ Step 1: Verify desktop layout is hidden');
        const desktopLayout = page.locator('.edit-page-layout').first();
        await expect(desktopLayout).toHaveClass(/hidden/);

        // 2. Verify tabs are visible
        console.log('✓ Step 2: Verify tab layout');
        const imageTab = page.getByRole('tab', { name: /image/i });
        const toolsTab = page.getByRole('tab', { name: /tools/i });
        await expect(imageTab).toBeVisible();
        await expect(toolsTab).toBeVisible();
        await page.screenshot({ path: 'test-results/workflow-mobile-01-tabs.png', fullPage: true });

        // 3. Verify Image tab is active by default
        console.log('✓ Step 3: Verify Image tab is default');
        await expect(imageTab).toHaveAttribute('data-state', 'active');
        await page.screenshot({ path: 'test-results/workflow-mobile-02-image-tab.png', fullPage: true });

        // 4. Verify image is visible
        console.log('✓ Step 4: Verify image is visible');
        const image = page.locator('img[alt*="Image being edited"]');
        await expect(image).toBeVisible();

        // 5. Switch to Tools tab
        console.log('✓ Step 5: Switch to Tools tab');
        await toolsTab.click();
        await page.waitForTimeout(500);
        await expect(toolsTab).toHaveAttribute('data-state', 'active');
        await page.screenshot({ path: 'test-results/workflow-mobile-03-tools-tab.png', fullPage: true });

        // 6. Verify all tools are visible in Tools tab
        console.log('✓ Step 6: Verify all editing tools');
        await expect(page.getByText('Background Tools')).toBeVisible();
        await expect(page.getByText('Generative Fill')).toBeVisible();
        await expect(page.getByText('Enhancement')).toBeVisible();
        await expect(page.getByText('Canvas Expander')).toBeVisible();

        // 7. Open an accordion in Tools tab
        console.log('✓ Step 7: Open Background Tools');
        await page.getByText('Background Tools').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/workflow-mobile-04-accordion-open.png', fullPage: true });

        // 8. Switch back to Image tab
        console.log('✓ Step 8: Switch back to Image tab');
        await imageTab.click();
        await page.waitForTimeout(500);
        await expect(imageTab).toHaveAttribute('data-state', 'active');
        await page.screenshot({ path: 'test-results/workflow-mobile-05-back-to-image.png', fullPage: true });

        // 9. Test zoom controls on mobile
        console.log('✓ Step 9: Test zoom controls');
        const zoomInBtn = page.getByRole('button', { name: /zoom in/i });
        if (await zoomInBtn.isVisible()) {
            await zoomInBtn.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-results/workflow-mobile-06-zoomed.png', fullPage: true });
        }

        // 10. Test toolbar scrolling
        console.log('✓ Step 10: Test toolbar scrolling');
        const toolbar = page.locator('[role="toolbar"]').first();
        if (await toolbar.isVisible()) {
            const hasOverflow = await toolbar.evaluate(el => el.scrollWidth > el.clientWidth);
            if (hasOverflow) {
                await toolbar.evaluate(el => el.scrollLeft = el.scrollWidth);
                await page.waitForTimeout(300);
                await page.screenshot({ path: 'test-results/workflow-mobile-07-toolbar-scrolled.png' });
            }
        }

        console.log('✅ Mobile workflow complete!');
    });
});

test.describe('Full Workflow - Tablet Mode', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('Tablet - Verify desktop layout is used', async ({ page }) => {
        console.log('📱 Testing Tablet Mode (768x1024)');

        // 1. Verify desktop layout is visible (not mobile tabs)
        console.log('✓ Step 1: Verify desktop layout is used');
        const desktopLayout = page.locator('.edit-page-layout').first();
        await expect(desktopLayout).toBeVisible();

        // 2. Verify split panels
        console.log('✓ Step 2: Verify split panels');
        const toolPanel = page.locator('.tool-panel');
        const imagePanel = page.locator('.image-panel');
        await expect(toolPanel).toBeVisible();
        await expect(imagePanel).toBeVisible();

        await page.screenshot({ path: 'test-results/workflow-tablet-01-layout.png', fullPage: true });

        console.log('✅ Tablet workflow complete!');
    });
});

test.describe('Full Workflow - Responsive Transitions', () => {
    test('Test layout changes across breakpoints', async ({ page }) => {
        console.log('🔄 Testing responsive transitions');

        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');

        const breakpoints = [
            { width: 1920, height: 1080, name: 'Desktop', expectTabs: false },
            { width: 1024, height: 768, name: 'Tablet Large', expectTabs: false },
            { width: 768, height: 1024, name: 'Tablet', expectTabs: false },
            { width: 480, height: 800, name: 'Mobile Large', expectTabs: true },
            { width: 375, height: 667, name: 'Mobile', expectTabs: true },
            { width: 320, height: 568, name: 'Mobile Small', expectTabs: true },
        ];

        for (const bp of breakpoints) {
            console.log(`Testing ${bp.name} (${bp.width}x${bp.height})`);

            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.waitForTimeout(500);

            if (bp.expectTabs) {
                // Mobile: tabs should be visible
                const imageTab = page.getByRole('tab', { name: /image/i });
                await expect(imageTab).toBeVisible();
                console.log(`  ✓ ${bp.name}: Tabs visible`);
            } else {
                // Desktop/Tablet: split layout should be visible
                const desktopLayout = page.locator('.edit-page-layout').first();
                await expect(desktopLayout).toBeVisible();
                console.log(`  ✓ ${bp.name}: Split layout visible`);
            }

            await page.screenshot({
                path: `test-results/workflow-responsive-${bp.width}x${bp.height}.png`,
                fullPage: false
            });
        }

        console.log('✅ Responsive transitions complete!');
    });
});

test.describe('Full Workflow - Tab Interaction', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Mobile - Rapid tab switching', async ({ page }) => {
        console.log('🔄 Testing rapid tab switching');

        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const imageTab = page.getByRole('tab', { name: /image/i });
        const toolsTab = page.getByRole('tab', { name: /tools/i });

        // Rapidly switch tabs
        for (let i = 0; i < 5; i++) {
            await toolsTab.click();
            await page.waitForTimeout(200);
            await imageTab.click();
            await page.waitForTimeout(200);
        }

        // Verify final state
        await expect(imageTab).toHaveAttribute('data-state', 'active');
        await page.screenshot({ path: 'test-results/workflow-tab-switching.png' });

        console.log('✅ Tab switching test complete!');
    });

    test('Mobile - Tab accessibility', async ({ page }) => {
        console.log('♿ Testing tab accessibility');

        await page.goto(`${BASE_URL}/edit?imageUrl=${encodeURIComponent(TEST_IMAGE_DATA_URL)}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Test keyboard navigation
        const imageTab = page.getByRole('tab', { name: /image/i });
        const toolsTab = page.getByRole('tab', { name: /tools/i });

        // Focus on tabs
        await imageTab.focus();
        await page.waitForTimeout(200);

        // Use arrow keys to navigate
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
        await expect(toolsTab).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(200);
        await expect(imageTab).toBeFocused();

        console.log('✅ Tab accessibility test complete!');
    });
});
