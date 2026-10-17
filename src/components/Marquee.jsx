import { useEffect, useRef, useState } from 'react';
import { MARQUEE_MESSAGE } from '../config/content.js';

/** Steady scroll speed (spec: 40–60px/s). */
const SPEED_PX_PER_SECOND = 50;
/** Sentence repeats per group, so one group is at least as wide as a large monitor. */
const COPIES_PER_GROUP = 2;

function Group() {
  return (
    <div className="marquee__group">
      {Array.from({ length: COPIES_PER_GROUP }, (_, i) => (
        <span className="marquee__item" key={i}>
          {MARQUEE_MESSAGE}
        </span>
      ))}
    </div>
  );
}

/**
 * One continuous, edge-to-edge gold strip under the keyboard.
 * Two identical groups inside a `width: max-content` track animate
 * translateX 0 → -50%; because both halves are identical the loop has no jump
 * and no empty gap. The duration is derived from the measured group width so
 * the speed stays constant at any font size or viewport.
 */
export default function Marquee() {
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(70);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let cancelled = false;

    const measure = () => {
      const group = track.querySelector('.marquee__group');
      if (!group || cancelled) return;
      const width = group.getBoundingClientRect().width;
      if (width > 0) setDuration(width / SPEED_PX_PER_SECOND);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    // Web fonts change the rendered width, re-measure once they are ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div className="marquee">
      {/* The sentence is exposed to assistive tech exactly once… */}
      <p className="sr-only">{MARQUEE_MESSAGE}</p>
      {/* …while both visual groups are decorative duplicates. */}
      <div
        ref={trackRef}
        className="marquee__track"
        style={{ '--marquee-duration': `${duration.toFixed(2)}s` }}
        aria-hidden="true"
      >
        <Group />
        <Group />
      </div>
    </div>
  );
}
