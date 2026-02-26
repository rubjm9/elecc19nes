import React from 'react';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export interface NavigationButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'back' | 'exit';
  className?: string;
  disabled?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  onClick,
  children,
  variant = 'back',
  className = '',
  disabled = false
}) => {
  const baseClasses = 'flex items-center gap-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 rounded';
  const variantClasses = variant === 'back'
    ? 'text-cyan-600 hover:text-cyan-700'
    : 'text-slate-500 hover:text-cyan-600';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {variant === 'back' ? <ArrowLeftIcon /> : null}
      {children}
    </button>
  );
};
