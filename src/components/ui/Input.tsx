import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'search';
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors";
  const iconClasses = icon ? "pl-12" : "";
  const errorClasses = error ? "border-red-500 focus:border-red-500" : "";
  
  const classes = `${baseClasses} ${iconClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </span>
        )}
        <input 
          className={classes}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};
