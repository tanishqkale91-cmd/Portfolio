import { useEffect, useId, useRef } from 'react';
import { setScrollLocked } from '../lib/smoothScroll.js';
import { projects } from '../config/projects.js';

/**
 * A single native <dialog> reused for every key that opens content.
 *
 * Native behaviour gives us exactly what the design asks for: modal focus
 * behaviour (focus trap + inert background), Escape dismissal and the `close`
 * event. The `close` event is also where we hand focus back to the key that
 * opened the dialog.
 */
export default function Dialog({ content, onClose, onSectionNavigate }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Keep the DOM modal in sync with React state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (content && !dialog.open) dialog.showModal();
    if (!content && dialog.open) dialog.close();
  }, [content]);

  // `close` fires for the Close button, for Escape, and for programmatic closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Freeze page scrolling behind the modal.
  useEffect(() => {
    if (!content) return undefined;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [content]);

  const close = () => dialogRef.current?.close();

  return (
    <dialog ref={dialogRef} className="site-dialog" aria-labelledby={content ? titleId : undefined}>
      {content ? (
        <div className="site-dialog__panel">
          <h2 id={titleId} className="site-dialog__title">
            {content.title}
          </h2>
          <button type="button" className="btn-ghost site-dialog__close" onClick={close}>
            Close
          </button>
          <p className="site-dialog__body">{content.body}</p>
          {content.project && projects[0] ? (
            <div className="site-dialog__actions">
              <a className="link-underline" href={projects[0].codeUrl} target="_blank" rel="noreferrer">Code ↗</a>
              <a className="link-underline" href={projects[0].liveUrl} target="_blank" rel="noreferrer">Live demo ↗</a>
              <a className="link-underline" href={projects[0].apiUrl} target="_blank" rel="noreferrer">Backend API ↗</a>
            </div>
          ) : null}
          <div className="site-dialog__actions">
            {content.sectionLink ? (
            <a
              className="btn-solid"
              href={content.sectionLink.href}
              onClick={(event) => {
                if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close();
              }}
              data-dialog-section-link="true"
            >
                {content.sectionLink.label}
              </a>
            ) : null}
            <a
              className="btn-ghost"
              href="#contact"
              onClick={(event) => {
                if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                  setScrollLocked(false);
                  onSectionNavigate();
                  close();
                }
              }}
              data-dialog-contact-link="true"
            >
              Contact me
            </a>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
