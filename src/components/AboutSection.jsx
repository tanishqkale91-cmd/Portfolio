import { ABOUT_POINTS } from '../config/content.js';

export default function AboutSection() {
  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="about-section section-anchor py-20 md:py-28">
      <div className="site-container">
        <p className="eyebrow">//02 ABOUT</p>
        <h2 id="about-title" className="heading-xl mt-3">A little about me.</h2>
        <p className="about-copy mt-7">{ABOUT_POINTS.join(' ')}</p>
      </div>
    </section>
  );
}
