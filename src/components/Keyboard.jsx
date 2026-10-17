import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AUTO_SEQUENCE, COMPOSITION, KEYS, KEY_SIZE, SEQUENCE_TIMING } from '../config/keyboard.js';
import { DIALOGS } from '../config/dialogs.js';
import { CONTACT_EMAIL } from '../config/site.js';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';
import Dialog from './Dialog.jsx';

/**
 * The Enter key's return-arrow glyph. Purely decorative, the control carries
 * its accessible name via aria-label, so it never receives pointer events.
 */
function EnterArrow() {
  return (
    <svg
      className="kb-key__arrow"
      viewBox="0 0 100 84"
      fill="none"
      stroke="#111111"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      pointerEvents="none"
    >
      <path d="M86 16 V52 H32" />
      <path d="M50 36 L32 52 L50 68" />
    </svg>
  );
}

/**
 * One key. Contact keys are anchors (`mailto:`), everything else is a native
 * <button> that opens a dialog. All press motion is CSS; React only toggles
 * `is-pressed` while the automatic sequence runs.
 */
function Key({ def, pressed, onOpenDialog }) {
  const { id, layer, x, y, w = KEY_SIZE.width, h = KEY_SIZE.height, letter, caption, name, face, base, action } = def;

  const className = `kb-key kb-key--${layer}${pressed ? ' is-pressed' : ''}`;
  const style = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    '--key-face': face,
    '--key-base': base,
  };

  const inner = (
    <>
      <span className="kb-key__face" aria-hidden="true">
        <span className={id === 'enter' ? 'kb-key__caption kb-key__caption--vertical' : 'kb-key__caption'}>
          {caption}
        </span>
        {id === 'enter' ? <EnterArrow /> : <span className="kb-key__letter">{letter}</span>}
        <span className="kb-key__seam" />
      </span>
      <span className="kb-key__wall" aria-hidden="true" />
    </>
  );

  if (action.kind === 'mailto') {
    return (
      <a
        className={className}
        style={style}
        href={`mailto:${CONTACT_EMAIL}`}
        aria-label={name}
        data-key-id={id}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      className={className}
      style={style}
      type="button"
      aria-label={name}
      data-key-id={id}
      onClick={(event) => onOpenDialog(action.dialog, event.currentTarget)}
    >
      {inner}
    </button>
  );
}

/**
 * Sculptural pastel keyboard.
 *
 * • Scales to fit its container: `scale = min(1, available / 900)` with the
 *   wrapper height set to `312 × scale`, so following content always flows on.
 * • Runs an automatic press-and-release loop (P O R T F O L I O → Enter).
 *   The loop pauses while the pointer is over it, while a key has focus, while
 *   a dialog is open, while the tab is hidden and while the keyboard is
 *   off-screen, and is disabled entirely for prefers-reduced-motion.
 * • Opens one shared native <dialog> and returns focus to the triggering key.
 */
export default function Keyboard({ enabled = true }) {
  const stageRef = useRef(null);
  const triggerRef = useRef(null);

  const [layout, setLayout] = useState({ scale: 1, offset: 0 });
  const [pressedId, setPressedId] = useState(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [inView, setInView] = useState(true);
  const [activeDialog, setActiveDialog] = useState(null);

  const reducedMotion = usePrefersReducedMotion();

  // Measure the container and scale the 900×312 composition to fit it.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const available = stage.clientWidth;
      if (available <= 0) return;
      const scale = Math.min(1, available / COMPOSITION.width);
      // Centre the composition when the container is wider than 900px.
      const offset = Math.max(0, (available - COMPOSITION.width * scale) / 2);
      setLayout((prev) =>
        prev.scale === scale && prev.offset === offset ? prev : { scale, offset },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Pause while the page/tab is hidden.
  useEffect(() => {
    const handleChange = () => setPageHidden(document.visibilityState === 'hidden');
    handleChange();
    document.addEventListener('visibilitychange', handleChange);
    return () => document.removeEventListener('visibilitychange', handleChange);
  }, []);

  // Pause while the keyboard is scrolled out of view (nothing animates off-screen).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '80px 0px' },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const paused =
    pointerInside ||
    focusWithin ||
    pageHidden ||
    !inView ||
    activeDialog !== null ||
    reducedMotion;
  const sequencePaused = paused || !enabled;

  // Automatic press-and-release sequence.
  useEffect(() => {
    if (sequencePaused) {
      setPressedId(null);
      return undefined;
    }

    let cancelled = false;
    let timerId;
    let index = 0;

    const step = () => {
      if (cancelled) return;
      setPressedId(AUTO_SEQUENCE[index]);
      timerId = setTimeout(() => {
        if (cancelled) return;
        setPressedId(null); // release smoothly
        timerId = setTimeout(() => {
          index += 1;
          if (index >= AUTO_SEQUENCE.length) {
            index = 0;
            timerId = setTimeout(step, SEQUENCE_TIMING.rest);
          } else {
            step();
          }
        }, SEQUENCE_TIMING.gap);
      }, SEQUENCE_TIMING.hold);
    };

    step();
    return () => {
      cancelled = true;
      clearTimeout(timerId);
      setPressedId(null); // never leave a key stuck pressed
    };
  }, [sequencePaused]);

  const openDialog = useCallback((dialogId, trigger) => {
    triggerRef.current = trigger;
    setActiveDialog(dialogId);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    const trigger = triggerRef.current;
    if (trigger && typeof trigger.focus === 'function') {
      // Hand focus back to the key that opened the dialog.
      requestAnimationFrame(() => trigger.focus());
    }
  }, []);

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
  };

  return (
    <div
      ref={stageRef}
      className="kb-stage"
      style={{ height: `${COMPOSITION.height * layout.scale}px` }}
      onPointerEnter={() => setPointerInside(true)}
      onPointerLeave={() => setPointerInside(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={handleBlur}
    >
      <div
        className="kb-composition"
        style={{ left: `${layout.offset}px`, '--kb-scale': layout.scale }}
        role="group"
        aria-label="Keyboard menu, pick a key"
      >
        {KEYS.map((def) => (
          <Key key={def.id} def={def} pressed={pressedId === def.id} onOpenDialog={openDialog} />
        ))}
      </div>
      <Dialog content={activeDialog ? DIALOGS[activeDialog] : null} onClose={closeDialog} />
    </div>
  );
}
