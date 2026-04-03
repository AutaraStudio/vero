'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useBasket } from '@/store/basketStore';
import Button from '@/components/ui/Button';
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
      className={`role-grid__card${selected ? ' is-selected' : ''}`}
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
        {role.lottieData && (
          <div className="role-grid__card-lottie">
            <Lottie
              lottieRef={lottieRef}
              animationData={role.lottieData}
              loop
              autoplay={false}
            />
          </div>
        )}
        <h3 className="role-grid__card-title">{role.name}</h3>
        <div className="role-grid__card-check" aria-hidden="true">
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

      {/* Divider */}
      <div className="role-grid__card-divider" />

      {/* Description */}
      {role.tasks && (
        <p className="role-grid__card-desc">{role.tasks}</p>
      )}

      {/* Footer action hint */}
      <span className="role-grid__card-action">
        {selected ? 'Remove from basket' : 'Add to basket'}
      </span>
    </button>
  );
}

export default function RoleGrid({
  roles,
  categoryName,
  categorySlug,
  heading,
  subheading,
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
      <section className="role-grid-section" data-theme="dark">
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

      {/* Sticky bottom bar — visible when roles are selected */}
      {selectedCount > 0 && (
        <div className="role-bar">
          <div className="role-bar__inner container">
            <span className="text-body--sm font--medium color--primary">
              {selectedCount} role{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/get-started')}
            >
              Get started →
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
