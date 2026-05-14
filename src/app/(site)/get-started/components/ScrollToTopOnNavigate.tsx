'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Resets the window scroll position to the top whenever the checkout
 * step changes. The get-started flow shares one layout, so navigating
 * between steps (role picker → details → contract → payment) doesn't
 * remount the scroll container — without this the new step would open
 * at the previous step's scroll offset, often mid-page.
 *
 * Mounted once in the get-started layout; renders nothing.
 */
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
