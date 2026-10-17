import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const origin = 'http://127.0.0.1:4179';
const sizes = [{ width: 1440, height: 810 }, { width: 1440, height: 1002 }, { width: 768, height: 1024 }, { width: 390, height: 844 }];
const errors = [];
const output = [];
const checks = {};
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
      return { headerLeft: wordmark.left, gridLeft: grid.left, gridWidth: grid.width, gap, clusters, scrollWidth: document.documentElement.scrollWidth, innerWidth };
    });
    const tolerance = 2;
    if (measure.scrollWidth > viewport.width) errors.push(`${sizesLabel}: horizontal overflow ${measure.scrollWidth}px`);
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
