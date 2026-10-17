import { ATTRIBUTION, GITHUB_URL, LEETCODE_URL, WORDMARK } from '../config/site.js';

export default function Footer() {
  return <footer className="site-footer py-8">
    <div className="site-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl font-black tracking-[-0.05em] text-ink">{WORDMARK}<span className="text-accent">.</span></p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a href={GITHUB_URL} className="hover:text-accent">GitHub</a>
          <a href={LEETCODE_URL} className="hover:text-accent">LeetCode</a>
          <span>{ATTRIBUTION}</span>
        </div>
      </div>
      <p className="site-footer__legal mt-5">© 2026 Tanishq Kale. Personal portfolio. Source and designs credited where borrowed.</p>
      <p className="site-footer__legal mt-1">For personal use only.</p>
    </div>
  </footer>;
}
