import './StickyTabs.css';

export interface StickyTabItem {
  theme?: string;
  label: string;
  children: React.ReactNode;
}

interface StickyTabsProps {
  tabs: StickyTabItem[];
}

export default function StickyTabs({ tabs }: StickyTabsProps) {
  return (
    <div className="sticky-tab-group">
      <div className="sticky-tab-group__nav-bg" />

      {tabs.map((tab, index) => (
        <section key={index} className="sticky-tab" data-theme={tab.theme}>
          {/* Sticky heading bar */}
          <div className="sticky-tab__sticky">
            <div className="sticky-tab__inner border--top border--bottom">
              <div className="container">
                <div className="sticky-tab__content flex--between">
                  <h3 className="sticky-tab__title text-h3 color--primary">
                    {tab.label}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Tab body */}
          <div className="container">
            <div className="sticky-tab__body bordered-section">
              <div className="sticky-tab__body-inner">
                {tab.children}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
