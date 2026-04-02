import Link from 'next/link';
import Image from 'next/image';
import ConditionalProgressBar from './components/ConditionalProgressBar';
import GetStartedShell from './components/GetStartedShell';
import './get-started.css';

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return (
    <GetStartedShell theme="brand-purple">
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

      <main className="get-started-main">
        {children}
      </main>
    </GetStartedShell>
  );
}
