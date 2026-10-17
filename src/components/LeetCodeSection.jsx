import { useEffect, useMemo, useState } from 'react';
import { LEETCODE_API_URL, LEETCODE_COMMUNITY_API_URL, LEETCODE_URL, LEETCODE_USERNAME } from '../config/site.js';

function normalize(data) {
  if (data?.status && data.status !== 'success') throw new Error(data.message || 'Community API returned an error.');
  const counts = data?.counts || {};
  const calendarValue = data?.calendar ?? data?.submissionCalendar;
  const calendarObject = typeof calendarValue === 'string' ? JSON.parse(calendarValue) : calendarValue;
  if (!calendarObject || typeof calendarObject !== 'object') throw new Error('Submission calendar was missing.');
  const calendar = Array.isArray(calendarObject)
    ? calendarObject
    : Object.entries(calendarObject).map(([timestamp, count]) => ({ date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10), count: Number(count) }));
  const cutoff = new Date(); cutoff.setUTCHours(0, 0, 0, 0); cutoff.setUTCDate(cutoff.getUTCDate() - 364);
  const dates = calendar.filter((entry) => entry.date >= cutoff.toISOString().slice(0, 10));
  const activeDays = data.activeDays ?? dates.filter((entry) => Number(entry.count) > 0).length;
  const dayMap = new Map(dates.map((entry) => [entry.date, Number(entry.count) || 0]));
  let computedStreak = 0; const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  for (let day = new Date(today); dayMap.get(day.toISOString().slice(0, 10)) > 0; day.setUTCDate(day.getUTCDate() - 1)) computedStreak += 1;
  const summary = {
    totalSolved: Number(data.totalSolved ?? counts.total),
    easy: Number(data.easySolved ?? data.easy ?? counts.easy),
    medium: Number(data.mediumSolved ?? data.medium ?? counts.medium),
    hard: Number(data.hardSolved ?? data.hard ?? counts.hard),
    activeDays: Number(activeDays),
    currentStreak: Number.isFinite(Number(data.currentStreak ?? data.streak)) ? Number(data.currentStreak ?? data.streak) : computedStreak,
    calendar: dates,
  };
  if (![summary.totalSolved, summary.easy, summary.medium, summary.hard, summary.activeDays, summary.currentStreak].every(Number.isFinite)) throw new Error('LeetCode profile statistics were incomplete.');
  return summary;
}

function makeWeeks(entries) {
  const map = new Map(entries.map((entry) => [entry.date, entry.count]));
  const first = new Date(); first.setUTCHours(0, 0, 0, 0); first.setUTCDate(first.getUTCDate() - 364); first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const last = new Date(); last.setUTCHours(0, 0, 0, 0); last.setUTCDate(last.getUTCDate() - last.getUTCDay());
  const weeks = [];
  for (const weekStart = new Date(first); weekStart <= last; weekStart.setUTCDate(weekStart.getUTCDate() + 7)) {
    const week = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(weekStart); date.setUTCDate(date.getUTCDate() + offset);
      const iso = date.toISOString().slice(0, 10);
      week.push({ date: iso, count: map.get(iso) || 0 });
    }
    weeks.push(week);
  }
  return weeks;
}

export default function LeetCodeSection() {
  const [state, setState] = useState({ status: 'loading', data: null });
  useEffect(() => {
    const controller = new AbortController();
    const forced = import.meta.env.DEV && new URLSearchParams(window.location.search).get('graph') === 'error';
    const load = async () => {
      try {
        if (forced) throw new Error('Dev graph error flag enabled.');
        let response = await fetch(LEETCODE_API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Project API returned HTTP ${response.status}.`);
        let data;
        try { data = await response.json(); } catch { throw new Error('Project API returned invalid JSON.'); }
        try { setState({ status: 'ready', data: normalize(data) }); return; } catch { /* Try the documented local-development source below. */ }
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
      try {
        const response = await fetch(forced ? '/__dev/leetcode-error' : LEETCODE_COMMUNITY_API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Community API returned HTTP ${response.status}.`);
        const data = await response.json();
        setState({ status: 'ready', data: normalize(data) });
      } catch (error) {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null });
      }
    };
    load();
    return () => controller.abort();
  }, []);
  const weeks = useMemo(() => state.data ? makeWeeks(state.data.calendar) : [], [state.data]);
  return <section className="leetcode-section" aria-labelledby="leetcode-title">
    <p className="eyebrow">//06 LEETCODE</p>
    <h3 id="leetcode-title" className="heading-lg mt-3">Problem solving, over time.</h3>
    <p className="lede mt-4 max-w-2xl">Submission activity for <span className="font-mono text-ink">{LEETCODE_USERNAME}</span>.</p>
    {state.status === 'loading' && <div className="activity-scroll activity-skeleton leetcode-skeleton mt-6" role="status" aria-label="Loading LeetCode submission activity"><div className="activity-skeleton">{Array.from({ length: 371 }, (_, index) => <i key={index} />)}</div></div>}
    {state.status === 'error' && <div className="activity-error mt-6" role="status">LeetCode activity could not be loaded. <a className="link-underline" href={LEETCODE_URL} target="_blank" rel="noreferrer">View profile</a></div>}
    {state.status === 'ready' && <>
      <p className="leetcode-stats leetcode-total mt-6"><span><strong>{state.data.totalSolved}</strong> solved</span></p>
      <ul className="leetcode-stats mt-2" aria-label="LeetCode summary statistics">
        <li><strong>{state.data.easy}</strong> easy</li><li><strong>{state.data.medium}</strong> medium</li><li><strong>{state.data.hard}</strong> hard</li>
        <li><strong>{state.data.activeDays}</strong> active days</li><li><strong>{state.data.currentStreak}</strong> current streak</li>
      </ul>
      <p className="sr-only">Past year LeetCode submissions. {state.data.totalSolved} solved: {state.data.easy} easy, {state.data.medium} medium, and {state.data.hard} hard. Active days: {state.data.activeDays}. Current streak: {state.data.currentStreak} days.</p>
      <div className="activity-scroll mt-6" role="region" aria-label="LeetCode submissions over the past year" tabIndex="0">
        <div className="activity-months" aria-hidden="true">{weeks.map((week, index) => {
          const first = week.find((cell) => cell.count > 0) || week[0];
          const prev = weeks[index - 1]?.find((cell) => cell.count > 0) || weeks[index - 1]?.[0];
          const label = first && (!prev || first.date.slice(0, 7) !== prev.date.slice(0, 7)) ? new Date(`${first.date}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }) : '';
          return <span className="activity-month" key={index}>{label}</span>;
        })}</div>
        <div className="activity-chart"><div className="activity-weekdays" aria-hidden="true"><span>Sun</span><span /><span>Tue</span><span /><span>Thu</span><span /><span /></div>
          <div className="activity-weeks">{weeks.map((week, wi) => <div className="activity-week" key={wi}>{week.map(({ date, count }) => {
            const level = count === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(count / 4)));
            return <span className="activity-cell" key={date} data-level={level} role="img" title={`${count} submissions on ${date}`} aria-label={`${count} submissions on ${date}`} />;
          })}</div>)}</div>
        </div>
        <div className="activity-legend mt-4" aria-hidden="true"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className="activity-cell" data-level={level} key={level} />)}<span>More</span></div>
      </div>
    </>}
    <p className="mt-5"><a className="link-underline text-sm" href={LEETCODE_URL} target="_blank" rel="noreferrer">View profile</a></p>
  </section>;
}
