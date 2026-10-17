import { NAV_LINKS, WORDMARK } from '../config/site.js';

/**
 * Compact sticky header: wordmark on the left, anchor navigation on the right,
 * Subtle divider below, with a direct mail link.
 */
export default function Header() {
  return (
    <header className="site-header">
      <div className="site-container flex h-16 items-center justify-between gap-3">
        <a
          href="#top"
          className="font-display text-lg font-black tracking-[-0.05em] text-ink transition-colors hover:text-accent sm:text-2xl"
        >
          {WORDMARK}
          <span className="text-accent">.</span>
        </a>

        <nav aria-label="Main">
          <ul className="flex items-center gap-2 whitespace-nowrap sm:gap-5">
            {NAV_LINKS.map((link, index) => {
              const isContact = index === NAV_LINKS.length - 1;
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={[
                      'flex min-h-[44px] items-center px-0.5 text-[13px] font-semibold transition-colors sm:px-2 sm:text-[15px]',
                      isContact
                        ? 'text-accent hover:text-white'
                        : 'text-ink/75 hover:text-accent',
                    ].join(' ')}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
