import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, footer, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">{title}</h3>
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t">{footer}</div>
      )}
    </div>
  );
};

export default Card;