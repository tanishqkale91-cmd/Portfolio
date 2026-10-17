/**
 * Keyboard geometry + content.
 *
 * Coordinates live in an unscaled 900 × 312 "composition" space; the whole
 * composition is scaled to fit its container with `transform: scale()`, so
 * these numbers stay readable and are never fudged per breakpoint.
 */

export const COMPOSITION = { width: 900, height: 312 };
export const KEY_SIZE = { width: 146, height: 161 };

/**
 * Nine normal keys + one tall Enter key.
 *
 * x / y , position in composition pixels (w / h default to KEY_SIZE)
 * layer , stacking: 'top' row, 'lower' row (overlaps top), 'enter'
 * action, { kind: 'dialog', dialog } opens a native <dialog>
 *          { kind: 'anchor', href } is an in-page contact anchor
 * name  , the accessible name of the key control
 */
export const KEYS = [
  // Upper row: P O R T
  {
    id: 'p',
    layer: 'top',
    x: 73,
    y: 0,
    letter: 'P',
    caption: 'Selected work',
    name: 'Selected work',
    face: '#ffb7d5',
    base: '#d94f8a',
    action: { kind: 'dialog', dialog: 'work' },
  },
  {
    id: 'o-upper',
    layer: 'top',
    x: 219,
    y: 0,
    letter: 'O',
    caption: 'About me',
    name: 'About me',
    face: '#c8b6ff',
    base: '#7153c7',
    action: { kind: 'dialog', dialog: 'about' },
  },
  {
    id: 'r',
    layer: 'top',
    x: 365,
    y: 0,
    letter: 'R',
    caption: 'My process',
    name: 'My process',
    face: '#b9f2df',
    base: '#2caa85',
    action: { kind: 'dialog', dialog: 'process' },
  },
  {
    id: 't',
    layer: 'top',
    x: 511,
    y: 0,
    letter: 'T',
    caption: 'What I do',
    name: 'What I do',
    face: '#ffd98e',
    base: '#d28a24',
    action: { kind: 'dialog', dialog: 'approach' },
  },

  // Lower row: F O L I O (overlaps the upper row slightly)
  {
    id: 'f',
    layer: 'lower',
    x: 0,
    y: 139,
    letter: 'F',
    caption: 'Explore',
    name: 'Explore',
    face: '#a9ddff',
    base: '#3886c9',
    action: { kind: 'dialog', dialog: 'work' },
  },
  {
    id: 'o-lower',
    layer: 'lower',
    x: 146,
    y: 139,
    letter: 'O',
    caption: 'A little about me',
    name: 'A little about me',
    face: '#f4b8ff',
    base: '#a34cbf',
    action: { kind: 'dialog', dialog: 'about' },
  },
  {
    id: 'l',
    layer: 'lower',
    x: 292,
    y: 139,
    letter: 'L',
    caption: 'The process',
    name: 'The process',
    face: '#ffc3a0',
    base: '#d96c44',
    action: { kind: 'dialog', dialog: 'process' },
  },
  {
    id: 'i',
    layer: 'lower',
    x: 438,
    y: 139,
    letter: 'I',
    caption: 'My approach',
    name: 'My approach',
    face: '#c6d7ff',
    base: '#5a78c9',
    action: { kind: 'dialog', dialog: 'approach' },
  },
  {
    // Final O, accessible name must be "Contact Me".
    id: 'o-final',
    layer: 'lower',
    x: 584,
    y: 139,
    letter: 'O',
    caption: 'Contact me',
    name: 'Contact Me',
    face: '#d9f28f',
    base: '#7aa52d',
    action: { kind: 'anchor', href: '#contact' },
  },

  // Tall Enter key spanning both rows (the final O overlaps its left part).
  {
    id: 'enter',
    layer: 'enter',
    x: 657,
    y: 0,
    w: 218,
    h: 300,
    letter: '',
    caption: "Let's talk",
    name: "Let's talk",
    face: '#ffe446',
    base: '#eab800',
    action: { kind: 'anchor', href: '#contact' },
  },
];

/** Order of the automatic press-and-release loop (Enter participates). */
export const AUTO_SEQUENCE = [
  'p',
  'o-upper',
  'r',
  't',
  'f',
  'o-lower',
  'l',
  'i',
  'o-final',
  'enter',
];

/** Timing for the automatic sequence, all in milliseconds. */
export const SEQUENCE_TIMING = {
  hold: 150, // key stays pressed
  gap: 190, // released before the next key → 340ms per key
  rest: 900, // pause after Enter, before the loop restarts
};
