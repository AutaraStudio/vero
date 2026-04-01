'use client';

import './Tooltip.css';

type TooltipIcon = 'info' | 'question' | 'alert';
type TooltipYPos = 'top' | 'bottom';
type TooltipXPos = 'center' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  icon?: TooltipIcon;
  y?: TooltipYPos;
  x?: TooltipXPos;
  className?: string;
}

export function TooltipContent({ title, body }: { title?: string; body: string }) {
  return (
    <>
      {title && <div className="tooltip__card-title"><h3 className="tooltip__card-heading">{title}</h3></div>}
      <div className="tooltip__card-body"><p className="tooltip__card-text">{body}</p></div>
    </>
  );
}

export function Tooltip({ children, content, icon = 'info', y = 'top', x = 'center', className = '' }: TooltipProps) {
  return (
    <span data-css-tooltip-hover="" className={`tooltip ${className}`.trim()}>
      {children}
      <span data-css-tooltip-icon={icon} className="tooltip__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none">
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 13.25V13C12 12.183 12.505 11.74 13.011 11.4C13.505 11.067 14 10.633 14 9.83301C14 8.72801 13.105 7.83301 12 7.83301C10.895 7.83301 10 8.72801 10 9.83301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.999 16C11.861 16 11.749 16.112 11.75 16.25C11.75 16.388 11.862 16.5 12 16.5C12.138 16.5 12.25 16.388 12.25 16.25C12.25 16.112 12.138 16 11.999 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 13V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.999 16C11.861 16 11.749 16.112 11.75 16.25C11.75 16.388 11.862 16.5 12 16.5C12.138 16.5 12.25 16.388 12.25 16.25C12.25 16.112 12.138 16 11.999 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 15.5H13.3093" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.1588 15.5V11.25H11.0088" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.1001 8.24725C12.1001 8.2967 12.0854 8.34503 12.058 8.38615C12.0305 8.42726 11.9915 8.4593 11.9458 8.47822C11.9001 8.49714 11.8498 8.5021 11.8013 8.49245C11.7528 8.4828 11.7083 8.45899 11.6733 8.42403C11.6384 8.38907 11.6145 8.34452 11.6049 8.29603C11.5953 8.24753 11.6002 8.19726 11.6191 8.15158C11.638 8.1059 11.6701 8.06686 11.7112 8.03939C11.7523 8.01192 11.8007 7.99725 11.8501 7.99725" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.8501 7.99725C11.9164 7.99725 11.98 8.02359 12.0269 8.07048C12.0738 8.11736 12.1001 8.18095 12.1001 8.24725" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div data-css-tooltip-x={x} data-css-tooltip-y={y} className="tooltip__box">
          <div className="tooltip__box-inner">
            <div className="tooltip__card">{content}</div>
            <div className="tooltip__tip">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 124 30" fill="none">
                <path d="M103.284 3L121 3C122.657 3 124 1.65685 124 0L0 0C0 1.65685 1.34315 3 3 3L20.7157 3C26.0201 3 31.1071 5.10713 34.8579 8.85786L51.3934 25.3934C57.2513 31.2513 66.7487 31.2513 72.6066 25.3934L89.1421 8.85786C92.8929 5.10714 97.9799 3 103.284 3Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
      </span>
    </span>
  );
}
