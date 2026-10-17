import { useState } from 'react';
import { CONTACT_EMAIL, GITHUB_URL, LEETCODE_URL } from '../config/site.js';

const channels = [
  { label: 'EMAIL', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, email: true },
  { label: 'GITHUB', value: 'tanishqkale91-cmd', href: GITHUB_URL, external: true },
  { label: 'LEETCODE', value: 'Tann_ishq', href: LEETCODE_URL, external: true },
];

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { /* Try the selection-based fallback below. */ }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { copied = false; }
  field.remove();
  return copied;
}

export default function ContactSection({ sceneEnabled = false }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [copyPending, setCopyPending] = useState(false);
  const copyEmail = async () => {
    setCopyPending(true);
    const copied = await copyText(CONTACT_EMAIL);
    setCopyStatus(copied ? 'Copied' : 'Copy failed. Select the email address to copy it.');
    setCopyPending(false);
    window.setTimeout(() => setCopyStatus(''), 2500);
  };

  return <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="contact-section section-anchor py-12 md:py-16">
    <div className="site-container">
      <div className="contact-layout">
        <div className="contact-intro">
          <p className="eyebrow">//06 CONTACT</p>
          <h2 id="contact-title" className="heading-xl mt-3">Contact.</h2>
          <p className="lede mt-5 max-w-3xl">Good design starts with hello. Have a project in mind, a half-formed idea, or just want to say hi?</p>
        </div>
        <div className="contact-stage" id="contact-stage-target" aria-label="Decorative 3D Enter key scene">
          {!sceneEnabled && <div className="contact-stage__fallback" aria-hidden="true">
            <div className="contact-stage__key"><span>ENTER</span><b>↵</b></div>
          </div>}
        </div>
        <div className="contact-channel-wrap">
          <nav className="contact-channels" aria-label="Contact channels">
            {channels.map((channel) => <a
              className={`contact-channel${channel.email ? ' contact-channel--email' : ''}`}
              data-contact-email={channel.email ? 'true' : undefined}
              href={channel.href}
              key={channel.label}
              target={channel.external ? '_blank' : undefined}
              rel={channel.external ? 'noreferrer' : undefined}
              onClick={channel.email ? (event) => {
                const row = event.currentTarget;
                row.dataset.pulse = String(Number(row.dataset.pulse || 0) + 1);
              } : undefined}
            >
              <span className="contact-channel__label">{channel.label}</span>
              <span className="contact-channel__value">{channel.value}</span>
              <span className="contact-channel__arrow" aria-hidden="true">↗</span>
            </a>)}
          </nav>
          <div className="contact-copy-row">
            <span className="contact-copy-address">{CONTACT_EMAIL}</span>
            <button className="contact-copy-button" type="button" onClick={copyEmail} disabled={copyPending}>Copy email</button>
            <span className="contact-copy-status" aria-live="polite">{copyStatus}</span>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
