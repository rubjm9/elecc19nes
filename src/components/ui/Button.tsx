import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseClasses = "font-bold rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-orange-500 hover:bg-orange-600 text-white"
  };
  
  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4",
    lg: "py-3 px-6 text-lg"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Cargando...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
