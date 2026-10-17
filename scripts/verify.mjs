import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const origin = 'http://127.0.0.1:4179';
const sizes = [{ width: 1440, height: 810 }, { width: 1440, height: 1002 }, { width: 768, height: 1024 }, { width: 390, height: 844 }];
const errors = [];
const output = [];
const checks = {};
const contactEmail = 'tanishqkale91@gmail.com';
await mkdir('verify', { recursive: true });
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4179', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 60; i += 1) {
    try { const response = await fetch(origin); if (response.ok) break; } catch { /* wait for Vite */ }
    await delay(500);
  }
  browser = await chromium.launch({ headless: true });
  for (const viewport of sizes) {
    const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`${viewport.width}x${viewport.height}: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`${viewport.width}x${viewport.height}: ${error.message}`));
    await page.addInitScript(() => sessionStorage.setItem('tanishq-portfolio-loaded', '1'));
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#stack .stack-cluster');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Loading GitHub contribution graph"]') && !document.querySelector('[aria-label="Loading LeetCode submission activity"]'), { timeout: 15000 });
    await page.waitForTimeout(350);
    const sizesLabel = `${viewport.width}x${viewport.height}`;
    const measure = await page.evaluate(() => {
      const wordmark = document.querySelector('.site-header .site-container > a').getBoundingClientRect();
      const grid = document.querySelector('#stack .stack-dom-overlay').getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(document.querySelector('#stack .stack-dom-overlay')).columnGap);
      const clusters = [...document.querySelectorAll('#stack .stack-cluster')].map((node) => ({ name: node.querySelector('.stack-cluster-label').textContent, left: node.getBoundingClientRect().left }));
      const contact = document.querySelector('.contact-channels').getBoundingClientRect();
      const footer = document.querySelector('.footer-grid').getBoundingClientRect();
      const rows = [...document.querySelectorAll('.contact-channel')].map((node) => ({ label: node.querySelector('.contact-channel__label').textContent, left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right }));
      return { headerLeft: wordmark.left, gridLeft: grid.left, gridWidth: grid.width, gap, clusters, contactLeft: contact.left, footerLeft: footer.left, rows, scrollWidth: document.documentElement.scrollWidth, innerWidth };
    });
    const tolerance = 2;
    if (measure.scrollWidth > viewport.width) errors.push(`${sizesLabel}: horizontal overflow ${measure.scrollWidth}px`);
    if (Math.abs(measure.contactLeft - measure.headerLeft) > tolerance) errors.push(`${sizesLabel}: contact rows do not align with header gutter`);
    if (Math.abs(measure.footerLeft - measure.headerLeft) > tolerance) errors.push(`${sizesLabel}: footer columns do not align with header gutter`);
    for (const row of measure.rows) if (row.left < 0 || row.right > viewport.width) errors.push(`${sizesLabel}: ${row.label} channel row overflows viewport`);
    for (const cluster of measure.clusters) if (Math.abs(cluster.left - measure.headerLeft) > tolerance && viewport.width < 767) errors.push(`${sizesLabel}: ${cluster.name} left ${cluster.left}px differs from header ${measure.headerLeft}px`);
    if (viewport.width >= 767) {
      for (const cluster of measure.clusters) {
        const index = measure.clusters.findIndex((item) => item.name === cluster.name);
        const expected = measure.gridLeft + (index % 2) * ((measure.gridWidth - measure.gap) / 2 + measure.gap);
        if (Math.abs(cluster.left - expected) > tolerance) errors.push(`${sizesLabel}: ${cluster.name} left ${cluster.left}px differs from grid start ${expected}px`);
      }
    }
    output.push({ viewport: sizesLabel, ...measure });
    await page.screenshot({ path: `verify/${viewport.width}x${viewport.height}-full.png`, fullPage: true, animations: 'disabled' });
    await page.locator('#contact').screenshot({ path: `verify/${viewport.width}x${viewport.height}-contact.png`, animations: 'disabled' });
    await page.locator('.site-footer').screenshot({ path: `verify/${viewport.width}x${viewport.height}-footer.png`, animations: 'disabled' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;}' });
    for (const [name, selector] of [['stack', '#stack'], ['activity', '#activity']]) {
      await page.evaluate((targetSelector) => {
        const target = document.querySelector(targetSelector);
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 88);
      }, selector);
      await page.waitForTimeout(80);
      await page.screenshot({ path: `verify/${viewport.width}x${viewport.height}-${name}.png`, clip: { x: 0, y: 0, ...viewport } });
    }
    await page.close();
  }

  async function assertNavigation(page, mode) {
    const targets = await page.locator('footer nav[aria-label="Footer navigation"] a[href^="#"]').evaluateAll((links) => links.map((link) => ({ href: link.getAttribute('href'), label: link.textContent.trim() })));
    for (const { href, label } of targets) {
      await page.locator(`footer nav[aria-label="Footer navigation"] a[href="${href}"]`).click();
      await page.waitForTimeout(mode === 'reduced-motion' ? 100 : 1250);
      const result = await page.evaluate((hash) => {
        const target = document.getElementById(hash.slice(1));
        return { hash: location.hash, focused: document.activeElement === target, top: target.getBoundingClientRect().top, header: document.querySelector('.site-header').getBoundingClientRect().bottom };
      }, href);
      const expectedTop = href === '#top' ? result.header : result.header + 24;
      if (result.hash !== href || !result.focused || Math.abs(result.top - expectedTop) > 4) errors.push(`${mode}: footer navigation ${label} failed: ${JSON.stringify(result)}`);
    }
    await page.locator('.footer-back-top').click();
    await page.waitForTimeout(mode === 'reduced-motion' ? 100 : 1250);
    const backToTop = await page.evaluate(() => ({ hash: location.hash, focused: document.activeElement === document.getElementById('top'), top: document.getElementById('top').getBoundingClientRect().top, header: document.querySelector('.site-header').getBoundingClientRect().bottom }));
    if (backToTop.hash !== '#top' || !backToTop.focused || Math.abs(backToTop.top - backToTop.header) > 4) errors.push(`${mode}: Back to top failed: ${JSON.stringify(backToTop)}`);
    const headerTargets = await page.locator('header a[href^="#"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    for (const href of [...new Set(headerTargets)]) {
      await page.locator(`header a[href="${href}"]`).first().click();
      await page.waitForTimeout(mode === 'reduced-motion' ? 100 : 1250);
      const result = await page.evaluate((hash) => {
        const target = document.getElementById(hash.slice(1));
        return { hash: location.hash, focused: document.activeElement === target, top: target.getBoundingClientRect().top, header: document.querySelector('.site-header').getBoundingClientRect().bottom };
      }, href);
      const expectedTop = href === '#top' ? result.header : result.header + 24;
      if (result.hash !== href || !result.focused || Math.abs(result.top - expectedTop) > 4) errors.push(`${mode}: header navigation ${href} failed: ${JSON.stringify(result)}`);
    }
  }

  const normalNavigation = await browser.newPage({ viewport: sizes[0], reducedMotion: 'no-preference' });
  await normalNavigation.addInitScript(() => sessionStorage.setItem('tanishq-portfolio-loaded', '1'));
  await normalNavigation.goto(origin, { waitUntil: 'domcontentloaded' });
  await normalNavigation.waitForSelector('#contact .contact-channel');
  const mailto = await normalNavigation.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  if (!mailto.length || mailto.some((href) => href !== `mailto:${contactEmail}`)) errors.push(`mailto links did not all use the configured address: ${JSON.stringify(mailto)}`);
  await normalNavigation.locator('[data-key-id="p"]').click();
  const dialogMailto = await normalNavigation.locator('dialog a[href^="mailto:"]').getAttribute('href');
  if (dialogMailto !== `mailto:${contactEmail}`) errors.push(`keyboard dialog mailto was ${dialogMailto}`);
  await normalNavigation.locator('dialog .site-dialog__close').click();
  await assertNavigation(normalNavigation, 'normal');
  checks.mailtoLinks = mailto.length;
  checks.normalNavigation = 'footer navigation, header anchors, and Back to top landed, updated hash, and focused target';
  await normalNavigation.close();

  const reduced = await browser.newPage({ viewport: sizes[0], reducedMotion: 'reduce' });
  reduced.on('console', (message) => { if (message.type() === 'error') errors.push(`reduced: ${message.text()}`); });
  reduced.on('pageerror', (error) => errors.push(`reduced: ${error.message}`));
  await reduced.addInitScript(() => sessionStorage.setItem('tanishq-portfolio-loaded', '1'));
  await reduced.goto(`${origin}/?reduced=1`, { waitUntil: 'domcontentloaded' });
  await reduced.waitForSelector('#stack .stack-cluster');
  await reduced.waitForTimeout(500);
  const motion = await reduced.evaluate(() => ({ stackAnimation: getComputedStyle(document.querySelector('.stack-tag')).animationName, pressedKeys: document.querySelectorAll('.kb-key.is-pressed').length, marqueeAnimation: getComputedStyle(document.querySelector('.marquee__track')).animationName, marqueeDuration: getComputedStyle(document.querySelector('.marquee__track')).animationDuration, staticGrid: document.querySelector('.stack-grid.is-static') !== null }));
  if (!motion.staticGrid || motion.stackAnimation !== 'none' || motion.pressedKeys || motion.marqueeAnimation !== 'none') errors.push(`reduced motion assertion failed: ${JSON.stringify(motion)}`);
  checks.reducedMotion = motion;
  await assertNavigation(reduced, 'reduced-motion');
  checks.reducedMotionNavigation = 'footer navigation, header anchors, and Back to top passed';
  await reduced.close();

  const noWebglBrowser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--disable-webgl'] });
  const noWebgl = await noWebglBrowser.newPage({ viewport: sizes[2] });
  noWebgl.on('console', (message) => { if (message.type() === 'error') errors.push(`webgl-off: ${message.text()}`); });
  noWebgl.on('pageerror', (error) => errors.push(`webgl-off: ${error.message}`));
  await noWebgl.addInitScript(() => sessionStorage.setItem('tanishq-portfolio-loaded', '1'));
  await noWebgl.goto(origin, { waitUntil: 'domcontentloaded' });
  await noWebgl.waitForSelector('#stack .stack-grid.is-static');
  const fallback = await noWebgl.locator('#stack .stack-cluster').count();
  if (fallback !== 4) errors.push(`webgl-off: expected 4 aligned fallback clusters, found ${fallback}`);
  await assertNavigation(noWebgl, 'webgl-off');
  checks.webglOffNavigation = 'footer navigation, header anchors, and Back to top passed';
  await noWebgl.close();
  await noWebglBrowser.close();
  checks.webglDisabledFallbackClusters = fallback;

  const failedSources = await browser.newPage({ viewport: sizes[0] });
  let abortingExpectedRequests = true;
  failedSources.on('console', (message) => {
    if (message.type() !== 'error') return;
    // Chromium emits this browser diagnostic for the deliberate route.abort()
    // calls below; all application console errors and other browser errors fail.
    if (abortingExpectedRequests && message.text() === 'Failed to load resource: net::ERR_FAILED') return;
    errors.push(`network failure states: ${message.text()}`);
  });
  failedSources.on('pageerror', (error) => errors.push(`network failure states: ${error.message}`));
  await failedSources.addInitScript(() => sessionStorage.setItem('tanishq-portfolio-loaded', '1'));
  await failedSources.route('**/v4/**', async (route) => { await delay(500); await route.abort(); });
  await failedSources.route('**/api/leetcode**', async (route) => { await delay(500); await route.abort(); });
  await failedSources.route('**/leetcode-stats-api.herokuapp.com/**', async (route) => { await delay(500); await route.abort(); });
  await failedSources.goto(origin, { waitUntil: 'domcontentloaded' });
  await failedSources.getByLabel('Loading GitHub contribution graph').waitFor({ timeout: 10000 });
  await failedSources.getByLabel('Loading LeetCode submission activity').waitFor({ timeout: 10000 });
  await failedSources.getByText('Contribution activity could not be loaded.').waitFor({ timeout: 15000 });
  await failedSources.getByText('LeetCode activity could not be loaded.').waitFor({ timeout: 15000 });
  abortingExpectedRequests = false;
  checks.abortedSourceStates = 'GitHub and LeetCode skeletons appeared, then both error states appeared';
  await failedSources.close();
} catch (error) {
  errors.push(error.stack || String(error));
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
await writeFile('verify/report.json', JSON.stringify({ measurements: output, checks, errors }, null, 2));
console.log(JSON.stringify({ measurements: output, checks, errors }, null, 2));
if (errors.length) process.exitCode = 1;
