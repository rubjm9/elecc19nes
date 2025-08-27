import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  options, 
  placeholder,
  onChange,
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors";
  const errorClasses = error ? "border-red-500 focus:border-red-500" : "";
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <select 
        className={classes}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};
