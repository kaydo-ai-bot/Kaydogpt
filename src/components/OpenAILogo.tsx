import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const KaydoLogo: React.FC<LogoProps> = ({ className = '', size = 24 }) => {
  const [hasError, setHasError] = React.useState(false);

  if (!hasError) {
    return (
      <img
        src="/icon.png"
        alt="Kaydo GPT"
        width={size}
        height={size}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover shrink-0 shadow-sm ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="kaydo-sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
        fill="url(#kaydo-sparkle-grad)"
      />
      <path
        d="M19 3C19 4.65685 20.3431 6 22 6C20.3431 6 19 7.34315 19 9C19 7.34315 17.6569 6 16 6C17.6569 6 19 4.65685 19 3Z"
        fill="url(#kaydo-sparkle-grad)"
        opacity="0.85"
      />
    </svg>
  );
};

export const OpenAILogo = KaydoLogo;


