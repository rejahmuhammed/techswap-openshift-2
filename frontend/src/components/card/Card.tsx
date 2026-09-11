import React from 'react';

/**
 * Card component for wrapping content with consistent styling
 */
const Card = ({ title, children, className, ...props }) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm ${className}">
      {title && (
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          {children && <div></div>}
        </div>
      )}
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;
export { Card };