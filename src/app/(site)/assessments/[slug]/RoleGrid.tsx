'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import Button from '@/components/ui/Button';
import FixedBar from '@/components/ui/FixedBar';
import ActionButton from '@/components/ui/ActionButton';
import type { ThemeVariant } from '@/lib/theme';
import './role-grid.css';

interface Role {
  _id: string;
  name: string;
  slug: string;
  hubspotValue?: string;
  tasks?: string;
  strengths?: string;
  lottieUrl?: string;
  lottieData?: object;
}

interface RoleGridProps {
  roles: Role[];
  categoryName: string;
  categorySlug: string;
  heading?: string;
  subheading?: string;
  theme?: ThemeVariant;
}

interface RoleCardProps {
  role: Role;
  selected: boolean;
  onToggle: () => void;
}

function RoleCard({ role, selected, onToggle }: RoleCardProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleMouseEnter = () => lottieRef.current?.play();
  const handleMouseLeave = () => lottieRef.current?.goToAndStop(0, true);

  /* Format strengths as title-case comma-separated text (no pills) */
  const strengths = role.strengths
    ?.split(',')
    .map((s) => {
      const t = s.trim();
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`role-grid__card${selected ? ' is-selected' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top — branded icon panel with corner select action */}
      <div className="role-grid__card-visual">
        <div className="role-grid__card-icon">
          {role.lottieData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={role.lottieData}
              loop
              autoplay={false}
            />
          ) : (
            <div className="role-grid__card-icon-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="role-grid__card-action">
          <ActionButton
            selected={selected}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            label={selected ? `Remove ${role.name} from basket` : `Add ${role.name} to basket`}
          />
        </div>
      </div>

      {/* Body — name + tasks + strengths */}
      <div className="role-grid__card-body">
        <h3 className="role-grid__card-name text-h5 color--primary">
          {role.name}
        </h3>

        {role.tasks && (
          <p className="role-grid__card-tasks text-body--sm leading--snug color--secondary">
            {role.tasks}
          </p>
        )}

        {strengths && (
          <div className="role-grid__card-strengths">
            <span className="role-grid__card-strengths-label text-label--sm color--tertiary">
              Strengths
            </span>
            <p className="role-grid__card-strengths-value text-body--sm font--medium color--primary">
              {strengths}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export default function RoleGrid({
  roles,
  categoryName,
  categorySlug,
  heading,
  subheading,
  theme = 'brand-purple',
}: RoleGridProps) {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles } = state;

  const gridRef = useFadeUp({
    selector: '.role-grid__card',
    stagger: 0.06,
    delay: 0.1,
    y: 24,
  });

  const isSelected = (roleId: string) =>
    selectedRoles.some((r) => r.roleId === roleId);

  const toggleRole = (role: Role) => {
    if (isSelected(role._id)) {
      dispatch({ type: 'REMOVE_ROLE', payload: { roleId: role._id } });
    } else {
      dispatch({
        type: 'ADD_ROLE',
        payload: {
          roleId: role._id,
          roleName: role.name,
          roleSlug: role.slug,
          roleHubspotValue: role.hubspotValue,
          categoryName,
          categorySlug,
        },
      });
    }
  };

  const selectedCount = selectedRoles.length;

  return (
    <>
      <section className="role-grid-section" data-theme={theme}>
        <div className="container">
          {(heading || subheading) && (
            <div className="role-grid__header">
              {heading && <h2 className="text-h2 text-balance max-ch-30 color--primary">{heading}</h2>}
              {subheading && (
                <p className="text-body--lg color--secondary leading--snug">
                  {subheading}
                </p>
              )}
            </div>
          )}

          <div
            ref={gridRef as React.RefObject<HTMLDivElement>}
            className="role-grid"
          >
            {roles.map((role) => (
              <RoleCard
                key={role._id}
                role={role}
                selected={isSelected(role._id)}
                onToggle={() => toggleRole(role)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Fixed bottom bar — visible when roles are selected */}
      {selectedCount > 0 && (
        <FixedBar theme={theme}>

          {/* Left — count */}
          <span className="text-label--sm font--medium color--primary role-bar__count">
            {selectedCount} {selectedCount === 1 ? 'role' : 'roles'} selected
          </span>

          {/* Divider */}
          <span className="divider--vertical role-bar__hide-tablet" aria-hidden="true" />

          {/* Centre — scrollable role badges */}
          <div className="role-bar__centre">
            <div className="role-bar__scroll">
              {selectedRoles.map((r) => (
                <span key={r.roleId} className="pill role-bar__badge">
                  {r.roleName}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <span className="divider--vertical role-bar__hide-tablet" aria-hidden="true" />

          {/* Right — CTA */}
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/get-started')}
          >
            Get started →
          </Button>

        </FixedBar>
      )}
    </>
  );
}
