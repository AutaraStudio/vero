'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import Button from '@/components/ui/Button';
import type { ThemeVariant } from '@/lib/theme';
import './role-grid.css';

interface Role {
  _id: string;
  name: string;
  slug: string;
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
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    lottieRef.current?.play();
  };

  const handleMouseLeave = () => {
    setHovered(false);
    lottieRef.current?.goToAndStop(0, true);
  };

  return (
    <button
      type="button"
      className={`role-grid__card rounded--lg border--default pad--card${selected ? ' is-selected' : ''}`}
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-pressed={selected}
      aria-label={
        selected
          ? `Remove ${role.name} from basket`
          : `Add ${role.name} to basket`
      }
    >
      {/* Top row: icon + title + check */}
      <div className="role-grid__card-top">
        <div className="role-grid__card-lottie rounded--md surface--sunken">
          {role.lottieData && (
            <Lottie
              lottieRef={lottieRef}
              animationData={role.lottieData}
              loop
              autoplay={false}
            />
          )}
        </div>
        <div className="role-grid__card-header">
          <h3 className="role-grid__card-title text-h6 color--primary leading--snug">
            {role.name}
          </h3>
        </div>
        <div className="role-grid__card-check rounded--full" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Description */}
      {role.tasks && (
        <p className="role-grid__card-desc text-body--xs color--secondary">
          {role.tasks}
        </p>
      )}

      {/* Strength tags */}
      {role.strengths && (
        <div className="role-grid__card-tags">
          {role.strengths.split(',').map((s) => (
            <span key={s} className="role-grid__card-tag text-label--xs rounded--full">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="role-grid__card-footer border--top-subtle">
        <span className="role-grid__card-action text-label--sm">
          {selected ? 'Added to basket' : 'Add to basket'}
        </span>
        <span className="role-grid__card-plus text-body--sm color--tertiary" aria-hidden="true">
          {selected ? '✓' : '+'}
        </span>
      </div>
    </button>
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
              {heading && <h2 className="text-h2 color--primary">{heading}</h2>}
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

      {/* Floating basket bar — visible when roles are selected */}
      {selectedCount > 0 && (
        <div className="role-bar rounded--lg border--default pad--inset-md surface--raised">
          <div className="role-bar__left">
            <span className="role-bar__pill text-label--sm rounded--full">
              {selectedCount} {selectedCount === 1 ? 'role' : 'roles'}
            </span>
            <div className="stack--xs">
              <span className="text-body--sm font--medium color--primary">
                {selectedRoles.map((r) => r.roleName).join(' · ')}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/get-started')}
          >
            Get started →
          </Button>
        </div>
      )}
    </>
  );
}
