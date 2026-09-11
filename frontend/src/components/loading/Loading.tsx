import React from 'react';

/**
 * Loading skeleton component
 */
const Loading = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div
      className={`animate-bounce ${sizes[size]} inline-block ${className}`}
      {...props}
    />
  );
};

Loading.displayName = 'Loading';

export default Loading;
export { Loading };