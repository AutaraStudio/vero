import './ActionButton.css';

export interface ActionButtonProps {
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}

export default function ActionButton({ selected, onClick, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`action-btn rounded--md${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
    >
      <span aria-hidden="true">{selected ? '−' : '+'}</span>
    </button>
  );
}
