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
        <img
          src="/images/worship_team_profile.png"
          alt="Beholding Jesus Worship Team"
          className="w-full h-full rounded-full object-cover shadow-[0_0_10px_rgba(229,175,69,0.25)] border border-[#E5AF45]/60 ring-1 ring-[#FFC85C]/30"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className="font-sans tracking-wider uppercase font-extrabold text-sm md:text-[15px] leading-tight text-[#FFF5E6]"
            style={{ letterSpacing: '0.08em' }}
          >
            Beholding Jesus
          </span>
          <span
            className="font-sans tracking-widest uppercase text-[10px] md:text-[11px] font-bold leading-none mt-1 text-[#E5AF45]"
            style={{ letterSpacing: '0.14em' }}
          >
            Worship Team
          </span>
        </div>
      )}
    </div>
  );
};
