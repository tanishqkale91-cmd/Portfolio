import cplusplus from 'simple-icons/icons/cplusplus.svg?raw';
import openjdk from 'simple-icons/icons/openjdk.svg?raw';
import javascript from 'simple-icons/icons/javascript.svg?raw';
import react from 'simple-icons/icons/react.svg?raw';
import vite from 'simple-icons/icons/vite.svg?raw';
import html5 from 'simple-icons/icons/html5.svg?raw';
import css from 'simple-icons/icons/css.svg?raw';
import tailwindcss from 'simple-icons/icons/tailwindcss.svg?raw';
import framer from 'simple-icons/icons/framer.svg?raw';
import anthropic from 'simple-icons/icons/anthropic.svg?raw';
import git from 'simple-icons/icons/git.svg?raw';
import github from 'simple-icons/icons/github.svg?raw';
import figma from 'simple-icons/icons/figma.svg?raw';
import linux from 'simple-icons/icons/linux.svg?raw';
import gnome from 'simple-icons/icons/gnome.svg?raw';
import vercel from 'simple-icons/icons/vercel.svg?raw';
import railway from 'simple-icons/icons/railway.svg?raw';
import render from 'simple-icons/icons/render.svg?raw';

const iconSvgs = {
  'C++': cplusplus, Java: openjdk, JavaScript: javascript, React: react, Vite: vite,
  HTML5: html5, CSS3: css, 'Tailwind CSS': tailwindcss, 'Framer Motion': framer,
  Claude: anthropic, Git: git, GitHub: github, Figma: figma, Linux: linux, GNOME: gnome,
  Vercel: vercel, Railway: railway, Render: render,
};

export const iconPaths = Object.fromEntries(Object.entries(iconSvgs).map(([name, svg]) => [name, svg.match(/<path d="([^"]+)"/)?.[1]]));
