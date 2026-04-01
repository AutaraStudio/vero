import React from 'react';

interface RevealGroupProps {
  children: React.ReactNode;
  stagger?: number;
  distance?: string;
  start?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealGroup({
  children,
  stagger = 100,
  distance = '1.25rem',
  start = 'top 80%',
  as: Tag = 'div',
  className,
  style,
}: RevealGroupProps) {
  return (
    <Tag
      data-reveal-group=""
      data-stagger={stagger}
      data-distance={distance}
      data-start={start}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

interface RevealNestedProps {
  children: React.ReactNode;
  includeParent?: boolean;
  stagger?: number;
  distance?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealNested({
  children,
  includeParent = false,
  stagger,
  distance,
  as: Tag = 'div',
  className,
  style,
}: RevealNestedProps) {
  return (
    <Tag
      data-reveal-group-nested=""
      data-ignore={includeParent ? 'false' : undefined}
      data-stagger={stagger}
      data-distance={distance}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  ignore?: boolean;
  distance?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealItem({
  children,
  ignore = false,
  distance,
  as: Tag = 'div',
  className,
  style,
}: RevealItemProps) {
  return (
    <Tag
      data-ignore={ignore ? 'true' : undefined}
      data-distance={distance}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
