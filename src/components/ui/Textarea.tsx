import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors";
  const errorClasses = error ? "border-red-500 focus:border-red-500" : "";
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <textarea 
        className={classes}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};
