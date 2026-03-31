import Link from 'next/link';
import ProgressBar from './components/ProgressBar';
import './get-started.css';

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="get-started-shell">
      <header className="get-started-header">
        <div className="container">
          <div className="get-started-header__inner">
            <Link href="/" className="get-started-logo">
              Vero Assess
            </Link>
          </div>
        </div>
      </header>

      <ProgressBar />

      <main className="get-started-main">
        {children}
      </main>
    </div>
  );
}
