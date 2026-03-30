import Button from '@/components/ui/Button';

const themes = [
  { label: 'Light (default)', theme: undefined },
  { label: 'Dark', theme: 'dark' },
  { label: 'Brand Purple', theme: 'brand-purple' },
  { label: 'Brand Purple Deep', theme: 'brand-purple-deep' },
  { label: 'Brand Blue', theme: 'brand-blue' },
  { label: 'Brand Green', theme: 'brand-green' },
  { label: 'Brand Orange', theme: 'brand-orange' },
  { label: 'Brand Yellow', theme: 'brand-yellow' },
];

export default function Home() {
  return (
    <main>
      {themes.map(({ label, theme }) => (
        <div
          key={label}
          data-theme={theme}
          style={{
            backgroundColor: 'var(--color--page-bg)',
            padding: '48px 24px',
            borderBottom: '1px solid var(--color--border-subtle)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color--text-tertiary)',
              marginBottom: '24px',
            }}>
              {label}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="primary" href="#">Get started</Button>
              <Button variant="secondary" href="#">Learn more</Button>
              <Button variant="cta" href="#">Find out more and buy</Button>
              <Button variant="primary" size="sm" href="#">Small</Button>
              <Button variant="secondary" size="lg" href="#">Large secondary</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
