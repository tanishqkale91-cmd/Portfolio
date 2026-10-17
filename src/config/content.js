/**
 * Page copy, everything here is the real content for this site.
 * No invented clients, metrics, projects or job titles.
 */

/** About section bullets. */
export const ABOUT_POINTS = [
  'B.Tech student.',
  'Linux and GNOME customization enthusiast.',
  'Currently learning React.js and building full-stack projects.',
  'Strong understanding of Java object-oriented programming.',
  'Goal: become a strong software engineer with expertise in full-stack development.',
];

/**
 * Tech stack, one group per row, rendered as tidy chips with real text labels.
 */
export const STACK_GROUPS = [
  { label: 'Languages', purpose: 'The foundations I use to solve problems and build applications.', items: ['C++', 'Java', 'JavaScript'] },
  { label: 'Frontend and motion', purpose: 'Building responsive interfaces with thoughtful movement.', items: ['React', 'Vite', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'] },
  { label: 'Tools and AI', purpose: 'Tools for designing, coding, collaborating, and customizing my workspace.', items: ['VS Code', 'Antigravity', 'Claude', 'Git', 'GitHub', 'Figma', 'Linux', 'GNOME'] },
  { label: 'Deployment', purpose: 'Platforms for shipping frontends and full stack services.', items: ['Vercel', 'Railway', 'Render'] },
];


/** Exact marquee sentence. The component repeats it inside each group. */
export const MARQUEE_MESSAGE =
  'Playful ideas. Thoughtful websites. · I turn bold ideas into beautiful digital experiences with a lot of heart. · Pick a key.';

/** Hero headline lines, exact line breaks, "developer" is the italic emphasis. */
export const HERO_LINES = [
  [{ text: "Hi, I'm Tanishq." }],
  [{ text: 'A ' }, { text: 'developer', emphasis: true }, { text: ' with' }],
  [{ text: 'a curious mind.' }],
];

