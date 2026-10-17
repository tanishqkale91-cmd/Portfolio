import { useEffect, useState } from 'react';
import { CONTACT_EMAIL, GITHUB_URL, LEETCODE_URL, WORDMARK } from '../config/site.js';

const navigation = [
  ['Home', '#top'], ['Work', '#work'], ['About', '#about'],
  ['Experience', '#experience'], ['Stack', '#stack'], ['Activity', '#activity'], ['Contact', '#contact'],
];

function formatTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
}

export default function Footer({ sceneEnabled = false }) {
  const [time, setTime] = useState(formatTime);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <footer id="footer" className={`site-footer py-10 md:py-12${sceneEnabled ? '' : ' site-footer--fallback'}`}>
    <div className="site-container site-footer__content">
      <div className="footer-grid">
        <nav aria-label="Footer navigation">
          <h2 className="footer-heading">NAVIGATE</h2>
          <ul>{navigation.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        </nav>
        <nav aria-label="Footer channels">
          <h2 className="footer-heading">CHANNELS</h2>
          <ul>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>Email</a></li>
            <li><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href={LEETCODE_URL} target="_blank" rel="noreferrer">LeetCode</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer-heading">INFO</h2>
          <p className="footer-time" aria-hidden="true">IST {time}</p>
          <p className="sr-only">Local time in India Standard Time.</p>
          <a href="#top" className="footer-back-top">Back to top ↑</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="site-footer__legal">© 2026 Tanishq Kale. Personal portfolio.</p>
        <p className="site-footer__legal">Thanks for stopping by.</p>
      </div>
      <p className="footer-wordmark" aria-hidden="true">{WORDMARK}<span>.</span></p>
    </div>
  </footer>;
}
