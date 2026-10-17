import { CONTACT_EMAIL, GITHUB_URL } from '../config/site.js';

export default function ContactSection() {
  return <section id="contact" aria-labelledby="contact-title" className="contact-section section-anchor py-20 md:py-28">
    <div className="site-container">
      <p className="eyebrow">//06 CONTACT</p>
      <h2 id="contact-title" className="heading-xl mt-3">Good design<br />starts with hello.</h2>
      <p className="lede mt-7">Have a project in mind, a half-formed idea, or just want to say hi?</p>
      <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <a href={`mailto:${CONTACT_EMAIL}`} className="contact-email font-display text-xl font-bold underline decoration-1 underline-offset-4 sm:text-2xl">{CONTACT_EMAIL}</a>
        <a href={GITHUB_URL} className="link-underline">GitHub</a>
      </div>
    </div>
  </section>;
}
