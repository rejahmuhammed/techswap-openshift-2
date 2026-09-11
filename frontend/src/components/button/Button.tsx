import React from 'react';

/**
 * Primary button component
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  onClick,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'hover:bg-accent hover:text-accent',
    danger: 'bg-destructive text-destructive-hover hover:bg-destructive/90',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md 
        ${variants[variant]} 
        ${sizes[size]} 
        font-medium 
        transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    />
  );
};

Button.displayName = 'Button';

export default Button;
export { Button };