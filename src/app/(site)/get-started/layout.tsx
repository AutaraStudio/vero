import Link from 'next/link';
import Image from 'next/image';
import ConditionalProgressBar from './components/ConditionalProgressBar';
import GetStartedShell from './components/GetStartedShell';
import './get-started.css';

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return (
    <GetStartedShell theme="brand-purple">
      {/* WCAG 2.4.1 — skip link for keyboard users. Hidden by CSS until focused. */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="get-started-header">
        <div className="container">
          <div className="get-started-header__inner">
            <Link href="/" className="get-started-logo">
              <Image src="/logo.svg" alt="Vero Assess" width={120} height={34} priority />
            </Link>
          </div>
        </div>
      </header>

      <ConditionalProgressBar />

      <main id="main-content" tabIndex={-1} className="get-started-main">
        {children}
      </main>
    </GetStartedShell>
  );
}
