import React from 'react';

/**
 * Input component with label support
 * Types: text, email, password, number, textarea
 * Variants: default, outline, filled
 */
const Input = ({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  disabled,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className=`${error ? 'border-red-500' : 'border-input'} rounded-md px-3 py-2 ${error ? 'focus:border-red-500' : 'focus:border-primary'} focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 transition-colors ${className}`
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
export { Input };