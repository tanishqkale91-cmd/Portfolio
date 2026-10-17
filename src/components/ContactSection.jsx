import { CONTACT_EMAIL, GITHUB_URL, LEETCODE_URL } from '../config/site.js';

const channels = [
  { label: 'EMAIL', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, email: true },
  { label: 'GITHUB', value: 'tanishqkale91-cmd', href: GITHUB_URL, external: true },
  { label: 'LEETCODE', value: 'Tann_ishq', href: LEETCODE_URL, external: true },
];

export default function ContactSection() {
  return <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="contact-section section-anchor py-20 md:py-28">
    <div className="site-container">
      <p className="eyebrow">//06 CONTACT</p>
      <h2 id="contact-title" className="heading-xl mt-3">Contact.</h2>
      <p className="lede mt-5 max-w-3xl">Good design starts with hello. Have a project in mind, a half-formed idea, or just want to say hi?</p>
      <nav className="contact-channels mt-10" aria-label="Contact channels">
        {channels.map((channel) => <a
          className={`contact-channel${channel.email ? ' contact-channel--email' : ''}`}
          href={channel.href}
          key={channel.label}
          target={channel.external ? '_blank' : undefined}
          rel={channel.external ? 'noreferrer' : undefined}
        >
          <span className="contact-channel__label">{channel.label}</span>
          <span className="contact-channel__value">{channel.value}</span>
          <span className="contact-channel__arrow" aria-hidden="true">↗</span>
        </a>)}
      </nav>
    </div>
  </section>;
}
