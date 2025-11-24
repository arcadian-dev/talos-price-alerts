import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'bronze' | 'malachite' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'bronze', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    bronze: 'btn-bronze focus:ring-[var(--accent-bronze)]',
    malachite: 'btn-malachite focus:ring-[var(--accent-malachite)]',
    outline: 'border-2 border-[var(--accent-bronze)] text-[var(--accent-bronze)] bg-transparent hover:bg-[var(--accent-bronze)] hover:text-white',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
