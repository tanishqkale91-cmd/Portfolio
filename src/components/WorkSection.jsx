import { projects } from '../config/projects.js';

export default function WorkSection() {
  return (
    <section id="work" tabIndex={-1} aria-labelledby="work-title" className="section-shell section-anchor py-20 md:py-28">
      <div className="site-container">
        <p className="eyebrow">//01 SELECTED WORK</p>
        <h2 id="work-title" className="heading-xl mt-3">A project built for community.</h2>
        {projects.map((project) => (
          <article key={project.title} className="project-card mt-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="eyebrow">FEATURED PROJECT · FULL STACK</p>
                <h3 className="mt-3 font-display text-4xl font-bold text-white">{project.title}</h3>
                <p className="lede mt-4 max-w-3xl">{project.description}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => <li className="chip" key={tag}>{tag}</li>)}
                </ul>
                <div className="mt-7 grid gap-2 text-sm text-muted md:grid-cols-2">
                  {project.details.map((detail) => <p key={detail}>{detail}</p>)}
                </div>
                <p className="mt-6 text-xs text-muted">{project.credit}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:flex-col">
                <a className="btn-solid" href={project.liveUrl} target="_blank" rel="noreferrer">Live demo</a>
                <a className="btn-ghost" href={project.codeUrl} target="_blank" rel="noreferrer">Code</a>
                <a className="link-underline" href={project.apiUrl} target="_blank" rel="noreferrer">Backend API</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
