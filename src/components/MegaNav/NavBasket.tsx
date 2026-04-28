'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useBasket } from '@/store/basketStore';
import {
  TIER_DATA,
  getTierPrice,
  getNudgeContent,
} from '@/lib/tierRecommendation';
import Button from '@/components/ui/Button';
import CheckIcon from '@/components/ui/CheckIcon';
import type { NavCategory } from './MegaNav';
import './NavBasket.css';

interface Props {
  categories?: NavCategory[];
}

function BasketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 9L5 19H19L21 9H3Z" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.75" />
      <path d="M6 9L9 4" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.75" />
      <path d="M18 9L15 4" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.75" />
    </svg>
  );
}

export default function NavBasket({ categories = [] }: Props) {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier, paymentFrequency, nudgeShown } = state;
  const tierInfo = recommendedTier ? TIER_DATA[recommendedTier] : null;
  const { price, priceNote } = tierInfo
    ? getTierPrice(tierInfo, paymentFrequency)
    : { price: '', priceNote: '' };

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);          // is the drawer in the DOM?
  const [animateIn, setAnimateIn] = useState(false); // is the .is-open class applied?
  const [confirmClear, setConfirmClear] = useState(false);

  /* Reset the confirm-clear state whenever the drawer closes */
  useEffect(() => {
    if (!open) setConfirmClear(false);
  }, [open]);

  useEffect(() => setMounted(true), []);

  /* When opened: lock body scroll, defer the .is-open class one frame so the
     CSS transition animates from the off-screen → on-screen position. */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setAnimateIn(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Drop the .is-open class first → wait for the CSS slide-out → then unmount */
  const close = useCallback(() => {
    setAnimateIn(false);
    setTimeout(() => {
      document.body.style.overflow = '';
      setOpen(false);
    }, 320); // slightly longer than the 0.3s slide-out transition
  }, []);

  /* Auto-close if basket is emptied while open */
  useEffect(() => {
    if (open && selectedRoles.length === 0) close();
  }, [open, selectedRoles.length, close]);

  const handleContinue = useCallback(() => {
    close();
    if (recommendedTier === 'bespoke') {
      router.push('/get-started/bespoke');
      return;
    }
    if (!nudgeShown && recommendedTier) {
      const nudgeContent = getNudgeContent(recommendedTier, selectedRoles.length);
      if (nudgeContent) {
        // Defer to give nudge state space; for the drawer we just go straight to details
        // (the nudge UX is checkout-specific)
      }
    }
    router.push('/get-started/details');
  }, [close, recommendedTier, nudgeShown, selectedRoles.length, router]);

  const handleClear = useCallback(() => {
    dispatch({ type: 'CLEAR_BASKET' });
    setConfirmClear(false);
  }, [dispatch]);

  if (selectedRoles.length === 0) return null;

  // Roles grouped by category, in the order categories appear in nav
  const groupedByCategory = categories
    .filter((cat) => selectedRoles.some((r) => r.categorySlug === cat.slug))
    .map((cat) => ({
      ...cat,
      roles: selectedRoles.filter((r) => r.categorySlug === cat.slug),
    }));

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="nav-basket-btn"
        aria-label={`Open basket — ${selectedRoles.length} ${selectedRoles.length === 1 ? 'role' : 'roles'} selected`}
      >
        <span className="nav-basket-btn__inner">
          <span className="nav-basket-btn__icon" aria-hidden="true">
            <BasketIcon />
          </span>
          <span className="nav-basket-btn__count" aria-hidden="true">
            {selectedRoles.length}
          </span>
        </span>
      </Button>

      {mounted && open && createPortal(
        <div
          className={`nav-basket-drawer${animateIn ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Your basket"
        >
          <div
            className="nav-basket-drawer__backdrop"
            onClick={close}
          />
          <aside className="nav-basket-drawer__panel">

            {/* Header */}
            <header className="nav-basket-drawer__header">
              <h2 className="text-h5 color--primary">Your basket</h2>
              <button
                type="button"
                className="nav-basket-drawer__close"
                onClick={close}
                aria-label="Close basket"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            {/* Top summary: tier eyebrow + price + freq toggle + capacity */}
            {tierInfo && (
              <div className="nav-basket-drawer__summary">
                <span className="nav-basket-drawer__tier-eyebrow text-label--sm">
                  {tierInfo.name} plan
                </span>

                <div className="nav-basket-drawer__price-row">
                  <span className="nav-basket-drawer__price">{price}</span>
                  {priceNote && (
                    <span className="nav-basket-drawer__price-note text-body--sm color--tertiary">
                      {priceNote}
                    </span>
                  )}
                </div>

                {tierInfo.hasFrequencyToggle && (
                  <div className="nav-basket-drawer__freq" role="group" aria-label="Billing frequency">
                    <button
                      type="button"
                      className={`nav-basket-drawer__freq-btn${paymentFrequency === 'monthly' ? ' is-active' : ''}`}
                      onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'monthly' })}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`nav-basket-drawer__freq-btn${paymentFrequency === 'annual' ? ' is-active' : ''}`}
                      onClick={() => dispatch({ type: 'SET_PAYMENT_FREQUENCY', payload: 'annual' })}
                    >
                      Annual
                    </button>
                  </div>
                )}

                <ul className="nav-basket-drawer__capacity">
                  <li className="text-body--xs color--tertiary">
                    <CheckIcon size={14} className="nav-basket-drawer__capacity-icon" />
                    <span>{tierInfo.candidateLimit}</span>
                  </li>
                  <li className="text-body--xs color--tertiary">
                    <CheckIcon size={14} className="nav-basket-drawer__capacity-icon" />
                    <span>{tierInfo.roleLimit}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Scrollable middle: roles by category */}
            <div className="nav-basket-drawer__body" data-lenis-prevent>
              <div className="nav-basket-drawer__body-head">
                <span className="text-label--sm color--tertiary">
                  Selected roles
                </span>
                <span className="nav-basket-drawer__count text-body--xs color--tertiary">
                  {selectedRoles.length}
                </span>
              </div>

              {groupedByCategory.map((cat) => (
                <div key={cat.slug} className="nav-basket-drawer__group">
                  <span className="nav-basket-drawer__group-label text-body--xs color--tertiary">
                    {cat.name}
                  </span>
                  <ul className="nav-basket-drawer__roles">
                    {cat.roles.map((role) => (
                      <li key={role.roleId} className="nav-basket-drawer__role">
                        <span className="nav-basket-drawer__role-dot" aria-hidden="true" />
                        <span className="nav-basket-drawer__role-name text-body--sm font--medium color--primary">
                          {role.roleName}
                        </span>
                        <button
                          type="button"
                          className="nav-basket-drawer__role-remove"
                          onClick={() =>
                            dispatch({
                              type: 'REMOVE_ROLE',
                              payload: { roleId: role.roleId },
                            })
                          }
                          aria-label={`Remove ${role.roleName}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Sticky bottom: clear basket + continue to checkout */}
            <footer className="nav-basket-drawer__footer">
              {confirmClear ? (
                <div className="nav-basket-drawer__confirm" role="alertdialog" aria-label="Confirm clear basket">
                  <span className="text-body--sm color--secondary">
                    Clear all roles from your basket?
                  </span>
                  <div className="nav-basket-drawer__confirm-actions">
                    <button
                      type="button"
                      className="nav-basket-drawer__confirm-btn nav-basket-drawer__confirm-btn--cancel"
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="nav-basket-drawer__confirm-btn nav-basket-drawer__confirm-btn--destructive"
                      onClick={handleClear}
                      autoFocus
                    >
                      Clear basket
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleContinue}
                  >
                    {recommendedTier === 'bespoke'
                      ? 'Discuss requirements →'
                      : `Continue to checkout (${selectedRoles.length})`}
                  </Button>
                  <button
                    type="button"
                    className="nav-basket-drawer__clear text-body--xs"
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear basket
                  </button>
                </>
              )}
            </footer>

          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
