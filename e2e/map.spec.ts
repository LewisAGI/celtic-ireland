import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __celticMap?: {
      getZoom: () => number;
      getProjection: () => { type: string };
    };
  }
}

const CATALOGUE = 'English translation: The Wooing of Étaín — O. Bergin & R.I. Best (tr.). Cycle: Mythological.';
const LEINSTER =
  "English translation: Táin Bó Cúalnge from the Book of Leinster — Cecile O'Rahilly (tr.) - CELT: academic/teaching use with consent. Cycle: Ulster.";

let faults: string[] = [];

test.beforeEach(async ({ page }) => {
  faults = [];
  page.on('pageerror', (error) => faults.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/gibs\.earthdata\.nasa\.gov/i.test(text)) return;
    if (/^Failed to load resource: /i.test(text) && !/127\.0\.0\.1|\/assets\//.test(text)) return;
    faults.push(text);
  });
  page.on('response', (response) => {
    if (response.status() < 400) return;
    if (!response.url().startsWith('http://127.0.0.1:4173')) return;
    faults.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await page.locator('#app[data-ready="true"]').waitFor();
  await page.waitForFunction(() => window.__celticMap?.getProjection?.().type === 'globe');
});

test.afterEach(() => {
  expect(faults, faults.join('\n')).toEqual([]);
});

test('map, debate, and only the coordinated sites', async ({ page }) => {
  await expandIfNeeded(page);
  await expect(page.getByRole('heading', { name: 'The ‘Celts’ label' })).toBeVisible();
  await expect(page.locator('#entry-h1')).toContainText('Celtoscepticism');
  await expect(page.locator('.badge[data-badge="abstract-only"]').first()).toBeVisible();
  await expect(page.locator('.pin')).toHaveCount(32);
  const icons = page.locator('.icon-button');
  const iconCount = await icons.count();
  expect(iconCount).toBeGreaterThan(0);
  for (let index = 0; index < iconCount; index += 1) {
    expect((await icons.nth(index).innerText()).trim()).toBe('');
    await expect(icons.nth(index)).toHaveAttribute('aria-label', /.+/);
  }
  await expect(page.locator('.pin[data-id="pl9"]')).toHaveCount(1);
  await expect(page.locator('.pin[data-id="pl39"]')).toHaveCount(1);
  await expect(page.locator('.pin[data-id="pl10"]')).toHaveCount(0);
  await expect(page.locator('.pin[data-id="pl3"]')).toHaveCount(0);
  const scroll = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth + 1);

  const layout = await page.locator('#app').getAttribute('data-layout');
  const sheet = await page.locator('.sheet').boundingBox();
  const viewport = page.viewportSize();
  expect(sheet && viewport).toBeTruthy();
  if (layout === 'sheet') {
    expect(sheet!.y + sheet!.height).toBeGreaterThan(viewport!.height - 24);
  } else {
    expect(sheet!.x).toBeLessThan(80);
  }
});

test('places without coordinates stay in the list', async ({ page }) => {
  await page.getByRole('button', { name: 'Places' }).click();
  await expect(page.getByRole('heading', { name: 'No coordinates in this pack' })).toBeVisible();
  await expect(page.locator('[data-unmapped="pl10"]')).toBeVisible();
  await expect(page.locator('#entry-pl10 .entry-text')).toContainText('Navan Fort / Emain Macha');
  await expect(page.locator('[data-entry="pl16"] .badge[data-badge="inference"]')).toBeVisible();
  await expect(page.locator('[data-entry="pl8"] .badge[data-badge="inference"]')).toBeVisible();
  for (const id of ['pl4', 'pl11', 'pl12', 'pl13']) {
    await expect(page.locator(`[data-entry="${id}"] .badge[data-badge="in-the-tale"]`)).toHaveText('in the tale');
  }
  await page.locator('.pin[data-id="pl1"]').click({ force: true });
  await expect(page.locator('#entry-pl1')).toContainText('Brú na Bóinne');
  await expect(page.locator('#entry-pl1 .badge[data-badge="evidence"]')).toBeVisible();
});

test('cycles, timeline, layers, and the sources notice', async ({ page }) => {
  await page.getByRole('button', { name: 'Cycles' }).click();
  const graph = page.locator('#cycle-graph');
  await expect(graph).toContainText('Lug Lámfhota');
  await expect(graph).toContainText('Cú Chulainn');
  await expect(graph).toContainText('Medb');
  await expect(graph).toContainText('Fionn mac Cumhaill');
  await expect(page.locator('#entry-c0')).toContainText('19th-century');

  await page.getByRole('button', { name: 'Timeline' }).click();
  await expect(page.locator('#entry-tl1')).toContainText('Céide');
  await expect(page.locator('#entry-tl1')).toContainText('3800');
  await expect(page.locator('[data-timeline="tl1"]')).toHaveAttribute('data-year', '-3800');
  await expect(page.locator('.period-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Periods' }).click();
  await page.getByRole('button', { name: 'Neolithic' }).click();
  await expect(page.locator('.pin[data-id="pl1"]')).not.toHaveClass(/is-dimmed/);
  await expect(page.locator('.pin[data-id="pl2"]')).toHaveClass(/is-dimmed/);
  await page.getByRole('button', { name: 'Periods' }).click();
  await page.getByRole('button', { name: 'Neolithic' }).click();

  await page.getByRole('button', { name: 'Layers' }).click();
  await page.getByRole('button', { name: 'Myth' }).click();
  await expect(page.locator('.pin[data-id="pl9"]')).not.toHaveClass(/is-dimmed/);
  await expect(page.locator('.pin[data-id="pl17"]')).not.toHaveClass(/is-dimmed/);
  await expect(page.locator('.pin[data-id="pl27"]')).toHaveClass(/is-dimmed/);
  await expect(page.locator('.pin[data-id="pl2"]')).toHaveClass(/is-dimmed/);
  await page.getByRole('button', { name: 'Layers' }).click();
  await page.getByRole('button', { name: 'Present day' }).click();
  await expect(page.locator('.pin')).toHaveCount(0);
  await page.getByRole('button', { name: 'Layers' }).click();
  await page.getByRole('button', { name: 'Archaeology' }).click();
  await expect(page.locator('.pin')).toHaveCount(32);

  await page.getByRole('button', { name: 'People' }).click();
  await expect(page).toHaveURL(/#people$/);
  await expect(page.locator('#entry-pe1')).toContainText('Lug');
  await expect(page.locator('#entry-pe1 .badge[data-badge="unverified-detail"]')).toHaveText('unverified detail');
  await expect(page.locator('#entry-pe1 .badge-note')).toHaveText(
    'Belongs to this cycle; details not yet checked against a translation',
  );
  await expect(page.locator('body')).not.toContainText('verify detail against translation');
  await expect(page.locator('[data-people="scholar"]')).toContainText('Macalister');

  await page.getByRole('button', { name: 'Further reading' }).click();
  await expect(page).toHaveURL(/#further-reading$/);
  await expect(page.locator('#entry-fr3')).toContainText('NMS Monuments to Visit');
  await expect(page.locator('#entry-fr3 a')).toHaveAttribute('href', /arcgis\.com|data\.gov\.ie/);

  await page.getByRole('button', { name: 'Sources' }).click();
  await expect(page.locator('#notice')).toContainText('living communities');
  await expect(page.locator('#notice')).toContainText('Book of Leinster');
  await expect(page.locator('#notice')).toContainText('National Monuments Service');
  await expect(page.locator('#nms-credit')).toContainText('CC BY 4.0');
  await expect(page.locator('#nms-credit')).toContainText('Government of Ireland');
  await expect(page.getByRole('link', { name: 'Brú na Bóinne' })).toHaveAttribute('href', /unesco\.org/);

  const before = await page.evaluate(() => window.__celticMap!.getZoom());
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect.poll(() => page.evaluate(() => window.__celticMap!.getZoom())).toBeGreaterThan(before + 0.4);
});

test('CELT translations are links, and the Book of Leinster Táin is academic use only', async ({ page }) => {
  await page.getByRole('button', { name: 'Texts' }).click();
  await expect(page.locator('#celt-notice')).toContainText('linked, not reproduced');
  const wooing = page.getByRole('link', { name: 'The Wooing of Étaín' });
  await expect(wooing).toHaveAttribute('href', 'https://celt.ucc.ie/published/T300012/index.html');
  const leinster = page.locator('[data-text-link="t6"]');
  await expect(leinster).toHaveAttribute('data-academic', 'true');
  await expect(leinster.getByRole('link')).toHaveAttribute('href', 'https://celt.ucc.ie/published/T301035/index.html');
  await expect(leinster).toContainText('Academic use only');
  const acallam = page.locator('[data-text-link="t16"]');
  await expect(acallam.getByRole('link')).toHaveAttribute('href', 'https://archive.org/details/silvagadelicaixx02ogra');
  await expect(page.locator('[data-text-link="t17"]')).toContainText('Copyright varies by jurisdiction');
  await expect(page.locator('[data-text-gap]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(CATALOGUE);
  await expect(page.locator('body')).not.toContainText(LEINSTER);
  await expect(page.locator('body')).not.toContainText('pp.101-265');
  await expect(page.locator('body')).not.toContainText('Example data');
});

test('a long press shows the icon label on touch', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'hover covers desktop labels');
  const zoom = page.getByRole('button', { name: 'Zoom in' });
  await zoom.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true });
  await expect(zoom).toHaveClass(/is-long-tip/, { timeout: 2000 });
  await zoom.dispatchEvent('pointerup', { pointerType: 'touch', bubbles: true });
});

test('search, glossary, story, site, and comparison', async ({ page }) => {
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('Céide');
  await expect(page.locator('[data-search-hit="pl27"]')).toBeVisible();
  await expect(page.locator('[data-search-hit="tl1"]')).toBeVisible();
  await expect(page.locator('#search-results')).not.toContainText('Example data');
  await page.locator('[data-search-hit="pl27"] button').click();
  await expect(page).toHaveURL(/#place\/pl27$/);
  await expect(page.locator('#entry-pl27')).toContainText('Céide Fields');
  await expect(page.locator('[data-cross="tl1"]')).toBeVisible();

  await page.getByRole('button', { name: 'Glossary' }).click();
  await expect(page).toHaveURL(/#glossary$/);
  await expect(page.locator('#glossary')).toContainText('Celtoscepticism');
  await expect(page.locator('#glossary')).toContainText('Mythological Cycle');
  await expect(page.locator('body')).not.toContainText('pronunciation');

  await page.getByRole('button', { name: 'Cycles' }).click();
  await page.locator('#entry-c2 .text-button').click();
  await expect(page).toHaveURL(/#story\/c2$/);
  await expect(page.locator('[data-cross="t6"]')).toBeVisible();
  await page.locator('[data-cross="t6"]').click();
  await expect(page.locator('[data-text-link="t6"]')).toContainText('Academic use only');
  await expect(page.locator('body')).not.toContainText(LEINSTER);

  await page.getByRole('button', { name: 'Compare' }).click();
  await page.locator('[data-pair="pl1:pl17"]').click();
  await expect(page.locator('#compare-view')).toContainText('Brú na Bóinne');
  await expect(page.locator('#compare-view')).toContainText('Newgrange');
  await expect(page.locator('body')).not.toContainText('pp.101-265');
});

test('security headers', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  const policy = response?.headers()['content-security-policy'] ?? '';
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain('worker-src');
  expect(policy).toContain('https://gibs.earthdata.nasa.gov');
  await page.locator('#app[data-ready="true"]').waitFor();
});

async function expandIfNeeded(page: Page) {
  const expanded = await page.locator('#app').getAttribute('data-expanded');
  if (expanded === 'false') await page.getByRole('button', { name: 'Expand' }).click();
}
