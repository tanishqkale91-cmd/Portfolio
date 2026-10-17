import { useEffect, useState } from 'react';
import { EXPERIENCE_RECORDS } from '../config/experience.js';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';

function OrganizationIcon({ record }) {
  const [failed, setFailed] = useState(false);
  const monogram = record.organization === 'Mechhelp' ? 'M' : 'G';

  return (
    <span className="experience-icon">
      {record.iconPath && !failed ? (
        <img
          src={record.iconPath}
          alt={record.organization}
          width="48"
          height="48"
          onError={() => setFailed(true)}
        />
      ) : <span role="img" aria-label={record.organization}>{monogram}</span>}
    </span>
  );
}

function ExperienceRecord({ record, index, visible }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li
      className={`experience-row${visible ? ' is-visible' : ''}`}
      data-experience-id={record.id}
      style={{ '--record-index': index }}
    >
      <OrganizationIcon record={record} />
      <span className="experience-record">REC_{String(index + 1).padStart(2, '0')}</span>
      <h3 className="experience-role">{record.role}</h3>
      <p className="experience-organization">{record.organization}</p>
      <p className="experience-dates">
        <time>{record.start}</time> to <time>{record.end || 'Present'}</time>
      </p>
      <div className="experience-actions">
        {record.active && <span className="experience-status" aria-label="Current role">ACTIVE</span>}
        {record.details.trim() && <button
          className="experience-details-toggle"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >{expanded ? 'Hide details' : 'Details +'}</button>}
      </div>
      {expanded && record.details.trim() && <p className="experience-details">{record.details}</p>}
    </li>
  );
}

export default function ExperienceSection() {
  const reducedMotion = usePrefersReducedMotion();
  const [visibleRecords, setVisibleRecords] = useState(() => (reducedMotion ? EXPERIENCE_RECORDS.map(({ id }) => id) : []));

  useEffect(() => {
    if (reducedMotion) {
      setVisibleRecords(EXPERIENCE_RECORDS.map(({ id }) => id));
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setVisibleRecords(EXPERIENCE_RECORDS.map(({ id }) => id));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      setVisibleRecords((visible) => {
        const next = new Set(visible);
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            next.add(entry.target.dataset.experienceId);
            observer.unobserve(entry.target);
          }
        });
        return [...next];
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-experience-id]').forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section id="experience" tabIndex={-1} aria-labelledby="experience-title" className="experience-section section-anchor py-20 md:py-28">
      <div className="site-container">
        <p className="eyebrow">//03 EXPERIENCE</p>
        <h2 id="experience-title" className="heading-xl mt-3">Experience.</h2>
        <p className="lede mt-5 max-w-2xl">Where I have worked and contributed so far.</p>

        <div className="experience-log mt-10">
          <div className="experience-log__header" aria-hidden="true">
            <span>FILE: EXPERIENCE.LOG</span>
            <span>RECORDS: {String(EXPERIENCE_RECORDS.length).padStart(2, '0')}</span>
          </div>
          <ol className="experience-list" aria-label="Experience records, newest first">
            {EXPERIENCE_RECORDS.map((record, index) => (
              <ExperienceRecord
                key={record.id}
                record={record}
                index={index}
                visible={visibleRecords.includes(record.id)}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
