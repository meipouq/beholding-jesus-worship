import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showText = true,
  className = ''
}) => {
  const isLight = variant === 'light'; // Light text on dark bg (sidebar)
  const isDark = variant === 'dark';   // Dark text on light bg (mobile header)

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={isLight ? '#FFFFFF' : '#1F1E1D'}
            strokeWidth="2.8"
          />

          {/* Left crescent / orbit arc */}
          <path
            d="M 50 9 C 27 9 12 27 12 50 C 12 73 27 91 50 91 C 33 87 21 70 21 50 C 21 30 33 13 50 9 Z"
            stroke={isLight ? '#FFFFFF' : '#1F1E1D'}
            strokeWidth="2.2"
            fill="none"
          />

          {/* Cross stem */}
          <line
            x1="58"
            y1="18"
            x2="58"
            y2="78"
            stroke={isLight ? '#FFFFFF' : '#1F1E1D'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Crossbar */}
          <line
            x1="45"
            y1="36"
            x2="71"
            y2="36"
            stroke={isLight ? '#FFFFFF' : '#1F1E1D'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Delicate lower sweep under cross */}
          <path
            d="M 28 66 C 42 85 68 82 82 58"
            stroke={isLight ? '#FFFFFF' : '#1F1E1D'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-sans tracking-wider uppercase font-bold text-sm md:text-[15px] leading-tight ${
              isLight ? 'text-white' : 'text-[#1F1E1D]'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            Beholding Jesus
          </span>
          <span
            className={`font-sans tracking-widest uppercase text-[10px] md:text-[11px] font-medium leading-none mt-0.5 ${
              isLight ? 'text-stone-400' : 'text-stone-500'
            }`}
            style={{ letterSpacing: '0.14em' }}
          >
            Worship Team
          </span>
        </div>
      )}
    </div>
  );
};
