import { useEffect, useMemo, useState } from 'react';
import { CONTRIBUTIONS_API_URL, GITHUB_URL, LEETCODE_URL } from '../config/site.js';
import LeetCodeSection from './LeetCodeSection.jsx';

function contributionCount(total) {
  if (typeof total === 'number') return total;
  if (total && typeof total === 'object') return Object.values(total).reduce((sum, value) => sum + Number(value || 0), 0);
  return null;
}

function buildWeeks(entries) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  if (!entries.length) return [];
  const start = new Date(`${entries[0].date}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const end = new Date(`${entries.at(-1).date}T00:00:00Z`);
  const weeks = [];
  for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 7)) {
    const cells = [];
    for (let day = 0; day < 7; day += 1) {
      const cellDate = new Date(date); cellDate.setUTCDate(date.getUTCDate() + day);
      const key = cellDate.toISOString().slice(0, 10);
      const entry = byDate.get(key);
      cells.push(entry || null);
    }
    weeks.push(cells);
  }
  return weeks;
}

export default function ActivitySection() {
  const [state, setState] = useState({ status: 'loading', data: null });
  useEffect(() => {
    const controller = new AbortController();
    const forceError = import.meta.env.DEV && new URLSearchParams(window.location.search).get('graph') === 'error';
    fetch(forceError ? '/__dev/graph-error' : CONTRIBUTIONS_API_URL, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Contribution data is unavailable.'); return response.json(); })
      .then((data) => {
        if (!Array.isArray(data.contributions) || !data.contributions.length) throw new Error('Contribution data is unavailable.');
        setState({ status: 'ready', data });
      })
      .catch((error) => { if (error.name !== 'AbortError') setState({ status: 'error', data: null }); });
    return () => controller.abort();
  }, []);
  const weeks = useMemo(() => state.data ? buildWeeks(state.data.contributions) : [], [state.data]);
  const total = state.data ? contributionCount(state.data.total) : null;
  return (
    <section id="activity" aria-labelledby="activity-title" className="activity-section section-anchor py-20 md:py-28">
      <div className="site-container">
        <p className="eyebrow">//04 ACTIVITY</p>
        <h2 id="activity-title" className="heading-xl mt-3">A year of building.</h2>
        <p className="lede mt-5 max-w-2xl">GitHub contributions from the past year.</p>
        {state.status === 'loading' && <div className="activity-scroll mt-8" aria-label="Loading GitHub contribution graph"><div className="activity-skeleton">{Array.from({ length: 371 }, (_, index) => <i key={index} />)}</div></div>}
        {state.status === 'error' && <div className="activity-error mt-8" role="status">Contribution activity could not be loaded. <a className="link-underline" href={GITHUB_URL} target="_blank" rel="noreferrer">View GitHub</a></div>}
        {state.status === 'ready' && <>
          <p className="activity-total mt-8" aria-label={`${total ?? 'Unknown'} contributions in the past year`}>{total === null ? 'Unavailable' : total}<span className="activity-total__label"> contributions</span></p>
          <p className="sr-only">Contribution activity for {weeks.length} weeks, with {total ?? 'an unavailable number of'} total contributions.</p>
          <div className="activity-scroll mt-5" role="region" aria-label="GitHub contributions over the past year" tabIndex="0">
            <div className="activity-months" aria-hidden="true">{weeks.map((week, index) => {
              const first = week.find(Boolean); const prev = weeks[index - 1]?.find(Boolean);
              const label = first && (!prev || first.date.slice(0, 7) !== prev.date.slice(0, 7)) ? new Date(`${first.date}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }) : '';
              return <span className="activity-month" key={index}>{label}</span>;
            })}</div>
            <div className="activity-chart"><div className="activity-weekdays" aria-hidden="true"><span>Sun</span><span /><span>Tue</span><span /><span>Thu</span><span /><span /></div>
              <div className="activity-weeks">{weeks.map((week, wi) => <div className="activity-week" key={wi}>{week.map((entry, di) => {
                if (!entry) return <span className="activity-cell" key={di} data-level="0" aria-hidden="true" />;
                const count = Number(entry.count || 0); const level = count === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(count / 4)));
                return <span className="activity-cell" key={entry.date} role="img" data-level={level} title={`${count} contributions on ${entry.date}`} aria-label={`${count} contributions on ${entry.date}`} />;
              })}</div>)}</div>
            </div>
            <div className="activity-legend mt-4" aria-hidden="true"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className="activity-cell" data-level={level} key={level} />)}<span>More</span></div>
          </div>
        </>}
        <LeetCodeSection />
        <nav className="profiles-row" aria-label="Profiles">
          <span>Profiles</span>
          <a className="link-underline" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a className="link-underline" href={LEETCODE_URL} target="_blank" rel="noreferrer">LeetCode</a>
        </nav>
      </div>
    </section>
  );
}
