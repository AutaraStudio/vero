import Link from 'next/link'
import Button from '@/components/ui/Button'

const navColumns = [
  {
    heading: 'Platform',
    links: [
      { label: 'How it works', href: '/#how-it-works', external: false },
      { label: 'Pricing', href: '/#pricing', external: false },
      { label: 'Categories', href: '/categories', external: false },
      { label: 'Get started', href: '/get-started', external: false },
    ],
  },
  {
    heading: 'Categories',
    links: [
      { label: 'Administration', href: '/categories/administration', external: false },
      { label: 'Sales', href: '/categories/sales', external: false },
      { label: 'Health and Social Care', href: '/categories/health-and-social-care', external: false },
      { label: 'Graduates', href: '/categories/graduates', external: false },
      { label: 'Apprentices', href: '/categories/apprentices', external: false },
      { label: 'Browse all', href: '/categories', external: false },
    ],
  },
  {
    heading: 'Tazio',
    links: [
      { label: 'About Tazio', href: 'https://tazio.io', external: true },
      { label: 'Visit tazio.io', href: 'https://tazio.io', external: true },
      { label: 'Contact us', href: '/contact', external: false },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/tazio', external: true },
      { label: 'Twitter / X', href: 'https://x.com/tazio', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy', external: false },
      { label: 'Terms & Conditions', href: '/terms', external: false },
      { label: 'Acceptable Use', href: '/acceptable-use', external: false },
    ],
  },
]

const complianceBadges = [
  'ISO 27001',
  'ISO 9001',
  'Cyber Essentials Plus',
  'WCAG 2.2',
]

export default function Footer() {
  return (
    <>
      <style>{`
        /* ============================================================
           FOOTER — WRAPPER
        ============================================================ */

        .footer {
          background: var(--color--page-bg);
          border-top: 1px solid var(--color--border-default);
        }

        /* ============================================================
           FOOTER — INNER CONTAINER
           Left + right border to continue the grid line feel
        ============================================================ */

        .footer__container {
          max-width: var(--space--container-max);
          margin: 0 auto;
          padding: 0 var(--space--container-padding);
          border-left: 1px solid var(--color--border-subtle);
          border-right: 1px solid var(--color--border-subtle);
        }

        /* ============================================================
           FOOTER — TOP ZONE
           Logo, big headline, subtext, CTA
        ============================================================ */

        .footer__top {
          padding: 80px var(--space--footer-padding-x) 64px var(--space--footer-padding-x);
        }

        .footer__logo {
          display: block;
          margin-bottom: 48px;
        }

        .footer__logo svg {
          height: 32px;
          width: auto;
        }

        .footer__top-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: calc(var(--space--section) * 1.5);
          align-items: start;
        }

        .footer__headline {
          font-size: var(--font--h1);
          font-weight: 800;
          color: var(--color--text-primary);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .footer__cta-col {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-top: 8px;
        }

        .footer__subtext {
          font-size: var(--font--body-lg);
          color: var(--color--text-secondary);
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 380px;
        }

        /* ============================================================
           FOOTER — MIDDLE NAV GRID
           5 columns with vertical dividers
        ============================================================ */

        .footer__nav {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-top: 1px solid var(--color--border-subtle);
        }

        .footer__nav-col {
          padding: 32px 24px;
          border-right: 0.5px solid var(--color--border-subtle);
        }

        .footer__nav-col:last-child {
          border-right: none;
        }

        .footer__nav-heading {
          display: block;
          font-size: var(--font--label);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: var(--font--label-ls);
          color: var(--color--text-primary);
          margin-bottom: 16px;
          line-height: 1;
        }

        .footer__nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .footer__nav-link {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          font-size: var(--font--body-sm);
          font-weight: 400;
          color: var(--color--text-muted);
          line-height: 1.8;
          transition: color 0.2s ease;
          text-decoration: none;
        }

        .footer__nav-link:hover {
          color: var(--color--text-primary);
        }

        /* ============================================================
           FOOTER — BOTTOM ZONE
           Copyright left, compliance badges right
        ============================================================ */

        .footer__bottom {
          border-top: 0.5px solid var(--color--border-subtle);
          padding: 24px var(--space--footer-padding-x);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer__copyright {
          font-size: var(--font--body-sm);
          color: var(--color--text-tertiary);
          line-height: 1;
        }

        .footer__badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .footer__badge {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 10px;
          border: 1px solid var(--color--border-default);
          border-radius: var(--radius--full);
          font-size: var(--font--label-sm);
          font-weight: 500;
          color: var(--color--text-tertiary);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        /* ============================================================
           FOOTER — RESPONSIVE
        ============================================================ */

        @media (max-width: 900px) {
          .footer__top {
            padding: 56px var(--space--footer-padding-x-mobile) 48px var(--space--footer-padding-x-mobile);
          }

          .footer__top-grid {
            grid-template-columns: 1fr;
            gap: var(--space--section-mobile);
          }

          .footer__headline {
            font-size: var(--font--h2);
          }

          .footer__subtext {
            max-width: 100%;
          }

          .footer__nav {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer__nav-col {
            padding: 24px 20px;
          }

          .footer__nav-col:nth-child(2n) {
            border-right: none;
          }

          .footer__nav-col:nth-child(2n+1) {
            border-right: 0.5px solid var(--color--border-subtle);
          }

          .footer__bottom {
            padding: 24px var(--space--footer-padding-x-mobile);
          }
        }

        @media (max-width: 640px) {
          .footer__container {
            border-left: none;
            border-right: none;
          }

          .footer__nav {
            grid-template-columns: 1fr;
          }

          .footer__nav-col {
            border-right: none !important;
            border-bottom: 0.5px solid var(--color--border-subtle);
          }

          .footer__nav-col:last-child {
            border-bottom: none;
          }

          .footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <footer className="footer" data-theme="dark">
        <div className="footer__container">

          {/* ── TOP ZONE ── */}
          <div className="footer__top">

            {/* Logo — inlined from public/logo.svg with wordmark paths set to fill="white" */}
            <Link href="/" className="footer__logo" aria-label="Vero Assess home">
              <svg width="896" height="253" viewBox="0 0 896 253" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#footer-clip0)">
                  <mask id="footer-mask0" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask0)">
                    <path d="M0.961883 18.9584C-0.512784 14.8464 -0.291451 11.3198 1.62322 8.37714C3.53122 5.44247 6.69388 3.82246 11.1019 3.52779C22.5659 2.94113 32.2659 3.08646 40.2032 3.9678C45.4925 4.5598 48.8699 7.35047 50.3432 12.3451C59.1605 40.5625 69.9632 71.2065 82.7499 104.273C95.5365 137.341 106.187 162.253 114.715 179.006C123.237 162.253 133.894 137.341 146.681 104.273C159.466 71.2065 170.269 40.5625 179.087 12.3451C181.141 7.35047 184.666 4.5598 189.669 3.9678C197.013 3.08646 206.423 2.94113 217.886 3.52779C222.297 3.82246 225.45 5.44247 227.367 8.37714C229.274 11.3198 229.494 14.9905 228.027 19.3998C201.862 98.1771 174.526 165.338 146.019 220.893C143.959 225.013 140.577 227.354 135.879 227.946C124.119 228.829 110.155 228.677 93.9912 227.506C89.5832 227.506 86.0565 225.302 83.4112 220.893C55.4819 165.93 28.0019 98.6171 0.961883 18.9584Z" fill="white"/>
                  </g>
                  <mask id="footer-mask1" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask1)">
                    <path d="M351.92 40.5626C333.107 40.5626 318.481 46.0746 308.051 57.096C297.615 68.12 291.516 82.6 289.752 100.527L415.411 99.2026C412.468 81.568 406.296 67.3893 396.892 56.656C387.481 45.9293 372.492 40.5626 351.92 40.5626ZM357.652 231.916C318.852 231.916 289.456 221.409 269.471 200.391C249.479 179.379 239.49 151.085 239.49 115.517C239.49 81.4226 250.071 53.6466 271.233 32.1866C292.397 10.7333 319.141 0 351.479 0C369.997 0 386.531 2.94132 401.08 8.81732C415.631 14.7013 427.164 22.4853 435.692 32.1866C444.213 41.8853 450.903 52.248 455.752 63.2693C460.604 74.292 463.615 85.9773 464.791 98.3213C467.14 123.309 456.704 135.949 433.487 136.24L289.752 138.444C291.805 154.316 298.275 167.179 309.153 177.024C320.023 186.873 336.192 191.793 357.652 191.793C374.992 191.793 394.096 186.061 414.969 174.597C416.437 173.427 418.497 172.835 421.143 172.835C423.787 172.835 425.992 173.572 427.755 175.039C433.929 178.863 439.804 183.857 445.392 190.031C449.504 195.32 449.064 200.027 444.069 204.139C423.492 222.656 394.687 231.916 357.652 231.916Z" fill="white"/>
                  </g>
                  <mask id="footer-mask2" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask2)">
                    <path d="M499.174 215.602C498.294 145.058 497.997 89.8363 498.294 27.5177C498.294 17.0897 519.809 6.9603 536.653 6.07896C539.892 5.90963 542.529 5.51229 544.589 7.71629C546.641 9.92029 547.674 12.4963 547.674 15.431V29.9817C560.901 11.759 580.592 2.64563 606.756 2.64563C617.925 2.64563 628.802 3.96696 639.382 6.61363C642.029 6.90963 644.156 8.15629 645.776 10.3603C647.388 12.5657 648.049 14.991 647.76 17.635C647.464 22.6376 646.141 29.8377 643.792 39.2403C642.029 46.0057 637.026 48.7963 628.802 47.6177C619.39 45.5657 609.69 44.531 599.701 44.531C577.065 44.531 559.869 53.0603 548.117 70.1043C547.524 137.714 546.937 186.214 546.352 215.602C546.352 223.248 542.529 227.354 534.888 227.947C526.953 228.532 518.865 228.532 510.638 227.947C502.992 227.354 499.174 223.248 499.174 215.602Z" fill="white"/>
                  </g>
                  <mask id="footer-mask3" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask3)">
                    <path d="M852.791 62.5989C841.801 72.4695 824.187 80.3789 803.504 83.7869C802.248 98.8175 805.908 117.664 814.697 136.355C815.413 137.878 816.151 139.372 816.909 140.842C821.152 139.84 825.22 139.326 829.019 139.326C837.249 139.326 844.219 141.736 848.988 146.808C856.313 154.6 857.049 167.191 852.319 181.224C858.571 184.839 864.777 186.798 870.531 186.798C873.885 186.798 877.089 186.13 880.052 184.736C899.319 175.675 901.296 139.323 884.468 103.543C876.075 85.6935 864.589 71.3602 852.791 62.5989Z" fill="#6FD08C"/>
                  </g>
                  <mask id="footer-mask4" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask4)">
                    <path d="M816.909 140.842C802.236 144.31 785.46 153.623 770.421 167.762C769.207 168.905 768.02 170.061 766.868 171.229C774.016 182.998 775.972 194.609 771.089 203.517C766.033 212.742 754.583 217.343 740.111 217.343C739.885 217.343 739.66 217.342 739.433 217.341C737.031 228.563 738.557 238.394 744.664 244.889C749.433 249.962 756.405 252.373 764.636 252.373C781.575 252.373 803.847 242.163 823.233 223.935C837.572 210.455 847.631 195.131 852.319 181.223C839.523 173.826 826.543 159.494 816.909 140.842Z" fill="#F15F22"/>
                  </g>
                  <mask id="footer-mask5" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask5)">
                    <path d="M829.019 139.326C825.22 139.326 821.152 139.839 816.909 140.842C826.543 159.494 839.523 173.826 852.319 181.223C857.049 167.19 856.313 154.601 848.988 146.809C844.219 141.735 837.249 139.326 829.019 139.326Z" fill="#82716A"/>
                  </g>
                  <mask id="footer-mask6" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask6)">
                    <path d="M670.076 121.189C658.675 122.384 649.806 126.881 645.523 134.692C635.292 153.363 655.103 183.905 689.775 202.911C707.05 212.379 724.75 217.197 739.434 217.34C742.526 202.893 752.131 186.141 766.867 171.228C759.035 158.328 744.967 145.236 726.836 135.299C725.363 134.491 723.888 133.717 722.411 132.979C714.591 142.048 705.679 147.355 696.931 147.355C695.592 147.355 694.259 147.231 692.934 146.977C682.459 144.975 674.49 135.264 670.076 121.189Z" fill="#463271"/>
                  </g>
                  <mask id="footer-mask7" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask7)">
                    <path d="M766.868 171.228C752.132 186.141 742.526 202.893 739.433 217.34C739.66 217.343 739.886 217.344 740.112 217.344C754.582 217.344 766.033 212.741 771.089 203.516C775.972 194.608 774.016 182.999 766.868 171.228Z" fill="#AB2D4F"/>
                  </g>
                  <mask id="footer-mask8" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask8)">
                    <path d="M715.838 5.96094C696.073 5.96228 675.478 33.041 668.521 69.4156C664.813 88.7996 665.678 107.162 670.077 121.189C672.141 120.973 674.285 120.865 676.503 120.865C690.074 120.864 706.299 124.909 722.411 132.978C732.255 121.558 740.37 104.173 744.249 83.9023C744.565 82.2436 744.85 80.5903 745.101 78.9476C732.387 73.6196 723.974 65.3663 722.694 55.2823C721.347 44.6796 728.142 34.0663 740.205 25.4943C735.565 15.041 728.571 8.01027 719.835 6.33827C718.509 6.08494 717.175 5.96094 715.838 5.96094Z" fill="#20A4F3"/>
                  </g>
                  <mask id="footer-mask9" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask9)">
                    <path d="M676.504 120.865C674.285 120.865 672.141 120.973 670.077 121.189C674.489 135.265 682.458 144.974 692.933 146.977C694.26 147.23 695.592 147.354 696.93 147.354C705.68 147.354 714.592 142.049 722.412 132.978C706.3 124.909 690.074 120.865 676.504 120.865Z" fill="#267282"/>
                  </g>
                  <mask id="footer-mask10" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask10)">
                    <path d="M805.357 6.95972C800.02 6.95972 794.493 7.30238 788.861 8.01838C769.327 10.4984 752.173 16.9917 740.205 25.4944C746.2 38.997 748.271 58.209 745.101 78.9477C755.191 83.177 767.988 85.5637 782.079 85.5637C787.415 85.5637 792.943 85.221 798.573 84.505C800.235 84.2944 801.879 84.0543 803.504 83.7863C804.653 70.0423 809.911 59.489 819.113 55.161C822.077 53.7677 825.28 53.101 828.635 53.0997C836.211 53.0997 844.576 56.4984 852.791 62.5984C861.327 54.9317 865.864 46.0837 864.741 37.241C862.444 19.153 837.2 6.95838 805.357 6.95972Z" fill="#FEC600"/>
                  </g>
                  <mask id="footer-mask11" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask11)">
                    <path d="M828.634 53.1003C825.28 53.1003 822.077 53.767 819.113 55.1617C809.91 59.4897 804.653 70.0417 803.504 83.787C824.188 80.379 841.801 72.4683 852.79 62.599C844.576 56.4977 836.21 53.099 828.634 53.1003Z" fill="#8F0A8C"/>
                  </g>
                  <mask id="footer-mask12" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="-828" y="-626" width="2561" height="1441">
                    <path d="M-827.25 -625.426H1732.75V814.574H-827.25V-625.426Z" fill="white"/>
                  </mask>
                  <g mask="url(#footer-mask12)">
                    <path d="M740.205 25.4946C728.141 34.0653 721.347 44.6786 722.693 55.2826C723.975 65.3666 732.387 73.6186 745.1 78.9479C748.271 58.2079 746.2 38.9973 740.205 25.4946Z" fill="#DE22F3"/>
                  </g>
                </g>
                <defs>
                  <clipPath id="footer-clip0">
                    <rect width="896" height="253" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </Link>

            <div className="footer__top-grid">
              <h2 className="footer__headline">
                Ready to find the right people?
              </h2>
              <div className="footer__cta-col">
                <p className="footer__subtext">
                  Start assessing smarter. Go live within 48 hours of purchase.
                </p>
                <Button variant="cta" href="/get-started">Get started</Button>
              </div>
            </div>
          </div>

          {/* ── MIDDLE NAV GRID ── */}
          <nav className="footer__nav" aria-label="Footer navigation">
            {navColumns.map((col) => (
              <div key={col.heading} className="footer__nav-col">
                <span className="footer__nav-heading">{col.heading}</span>
                <ul className="footer__nav-list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          className="footer__nav-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="footer__nav-link">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* ── BOTTOM ZONE ── */}
          <div className="footer__bottom">
            <span className="footer__copyright">
              &copy; 2026 Tazio. All rights reserved.
            </span>
            <div className="footer__badges">
              {complianceBadges.map((badge) => (
                <span key={badge} className="footer__badge">
                  {badge}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}
