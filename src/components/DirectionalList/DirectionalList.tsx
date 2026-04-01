'use client';

import { useRef, useCallback } from 'react';
import './DirectionalList.css';

type DirectionType = 'y' | 'x' | 'all';

export interface DirectionalListColumn<T> {
  label: string;
  render: keyof T | ((item: T) => React.ReactNode);
  width?: 'auto' | 'primary' | 'flex' | 'narrow';
}

export interface DirectionalListProps<T extends { href?: string; id?: string | number }> {
  columns: DirectionalListColumn<T>[];
  items: T[];
  directionType?: DirectionType;
  accentSwatch?: string;
  onItemClick?: (item: T) => void;
  className?: string;
}

function getDirection(event: React.MouseEvent<HTMLElement>, el: HTMLElement, type: DirectionType): 'top' | 'bottom' | 'left' | 'right' {
  const { left, top, width: w, height: h } = el.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;
  if (type === 'y') return y < h / 2 ? 'top' : 'bottom';
  if (type === 'x') return x < w / 2 ? 'left' : 'right';
  const distances = { top: y, right: w - x, bottom: h - y, left: x };
  return Object.entries(distances).reduce((a, b) => a[1] < b[1] ? a : b)[0] as 'top' | 'bottom' | 'left' | 'right';
}

const directionTransform: Record<string, string> = {
  top: 'translateY(-100%)', bottom: 'translateY(100%)',
  left: 'translateX(-100%)', right: 'translateX(100%)',
};

function DirectionalRow<T extends { href?: string; id?: string | number }>({
  item, columns, directionType, onItemClick,
}: { item: T; columns: DirectionalListColumn<T>[]; directionType: DirectionType; onItemClick?: (item: T) => void; }) {
  const tileRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const tile = tileRef.current;
    if (!tile) return;
    const dir = getDirection(e, e.currentTarget as HTMLElement, directionType);
    tile.style.transition = 'none';
    tile.style.transform = directionTransform[dir];
    void tile.offsetHeight;
    tile.style.transition = '';
    tile.style.transform = 'translate(0%, 0%)';
  }, [directionType]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const tile = tileRef.current;
    if (!tile) return;
    const dir = getDirection(e, e.currentTarget as HTMLElement, directionType);
    tile.style.transform = directionTransform[dir];
  }, [directionType]);

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="directional-list__item"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={tileRef} className="directional-list__tile" />
        <div className="directional-list__rule directional-list__rule--top" />
        {columns.map((col, i) => (
          <div key={i} className={`directional-list__col directional-list__col--${col.width ?? 'flex'}`}>
            <span className="directional-list__cell">
              {typeof col.render === 'function' ? col.render(item) : String(item[col.render] ?? '')}
            </span>
          </div>
        ))}
      </a>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onItemClick?.(item)}
      className="directional-list__item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={tileRef} className="directional-list__tile" />
      <div className="directional-list__rule directional-list__rule--top" />
      {columns.map((col, i) => (
        <div key={i} className={`directional-list__col directional-list__col--${col.width ?? 'flex'}`}>
          <span className="directional-list__cell">
            {typeof col.render === 'function' ? col.render(item) : String(item[col.render] ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DirectionalList<T extends { href?: string; id?: string | number }>({
  columns, items, directionType = 'y', accentSwatch = 'var(--swatch--purple-500)', onItemClick, className = '',
}: DirectionalListProps<T>) {
  return (
    <div className={`directional-list ${className}`.trim()} style={{ '--directional-accent': accentSwatch } as React.CSSProperties}>
      <div className="directional-list__header">
        {columns.map((col, i) => (
          <div key={i} className={`directional-list__col directional-list__col--${col.width ?? 'flex'}`}>
            <span className="directional-list__eyebrow">{col.label}</span>
          </div>
        ))}
      </div>
      <div className="directional-list__body">
        {items.map((item, i) => (
          <DirectionalRow key={item.id ?? i} item={item} columns={columns} directionType={directionType} onItemClick={onItemClick} />
        ))}
      </div>
      <div className="directional-list__rule directional-list__rule--bottom" />
    </div>
  );
}
