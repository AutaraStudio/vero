'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'

import 'vanilla-cookieconsent/dist/cookieconsent.css'
import './cookie-consent-theme.css'

/**
 * vanilla-cookieconsent (orestbida) wrapper for Vero Assess.
 *
 * Two categories surface to the user:
 *   - `necessary` — always on (Stripe, Sanity admin session, basket sessionStorage)
 *   - `analytics` — opt-in (Google Analytics 4)
 *
 * GA4 is registered as a service inside the analytics category. If the
 * user accepts, vanilla-cookieconsent calls `loadScript()` to inject the
 * gtag library, then we run the standard init snippet. If they reject,
 * GA4 is never loaded and no `_ga`/`_gid` cookies are set.
 *
 * Strictly necessary cookies don't run through this component.
 */

const GA_MEASUREMENT_ID = 'G-T51RBV2C3W'

interface GtagWindow {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
}

function loadGoogleAnalytics() {
  if (typeof window === 'undefined') return
  const w = window as unknown as Partial<GtagWindow>
  if (!w.dataLayer) w.dataLayer = []
  const gtag = (...args: unknown[]) => {
    w.dataLayer!.push(args)
  }
  w.gtag = gtag

  void CookieConsent.loadScript(
    `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
  ).then(() => {
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID)
  })
}

export function CookieConsentBanner() {
  useEffect(() => {
    void CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },

      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [
              { name: /^_ga/ },
              { name: '_gid' },
            ],
          },
          services: {
            googleAnalytics: {
              label: 'Google Analytics 4',
              onAccept: loadGoogleAnalytics,
            },
          },
        },
      },

      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'Vero Assess uses cookies that are strictly necessary for the site to work, plus optional analytics cookies that help us understand how visitors use the site so we can improve it. You can change your choice at any time via "Cookie preferences" in the footer.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject optional',
              showPreferencesBtn: 'Manage preferences',
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject optional',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Strictly necessary',
                  description:
                    'These cookies are essential for the site to function — they keep your basket between pages, secure the checkout, and let signed-in editors use the admin area. They cannot be turned off.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description:
                    'These cookies help us understand how visitors interact with the site (Google Analytics 4) so we can improve it. They never identify you personally to us.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'More information',
                  description:
                    'For more details, see our <a href="/legal/cookies">Cookie Policy</a> and <a href="/legal/privacy">Privacy Policy</a>.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
