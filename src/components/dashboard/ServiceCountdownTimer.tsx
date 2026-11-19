import React, { useState, useEffect } from 'react';
import { Clock, Radio, CheckCircle2 } from 'lucide-react';
import { ServiceLineup } from '../../types';
import { calculateServiceCountdown, getLineupLifecycleStatus, CountdownResult } from '../../utils/serviceSchedule';

interface ServiceCountdownTimerProps {
  lineup: ServiceLineup;
  className?: string;
  onStatusChange?: (status: string) => void;
}

export const ServiceCountdownTimer: React.FC<ServiceCountdownTimerProps> = ({
  lineup,
  className = '',
  onStatusChange
}) => {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateServiceCountdown(lineup)
  );
  const [lifecycleStatus, setLifecycleStatus] = useState(() =>
    getLineupLifecycleStatus(lineup)
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const currentCountdown = calculateServiceCountdown(lineup, now);
      const currentStatus = getLineupLifecycleStatus(lineup, now);

      setCountdown(currentCountdown);
      if (currentStatus !== lifecycleStatus) {
        setLifecycleStatus(currentStatus);
        onStatusChange?.(currentStatus);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [lineup, lifecycleStatus, onStatusChange]);

  // If service is already completed
  if (lifecycleStatus === 'completed' || countdown.isExpired) {
    return (
      <div className={`px-3.5 py-2 rounded-2xl bg-[#181510] border border-[#393027] flex items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 text-[#B8ADA0] text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#79BB8B] shrink-0" />
          <span>Service Concluded</span>
        </div>
        <span className="text-[10px] font-bold text-[#B8ADA0] bg-[#29231C] border border-[#393027] px-2 py-0.5 rounded-lg">
          Archived
        </span>
      </div>
    );
  }

  // If service is currently ongoing (within start and end time)
  if (lifecycleStatus === 'ongoing' || countdown.isOngoing) {
    return (
      <div className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#211C17] via-[#181510] to-[#211C17] border border-[#E5AF45]/40 shadow-xs flex items-center justify-between gap-2.5 ${className}`}>
        {/* Left: Live pulsing dot + Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5AF45] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFC85C]" />
          </span>
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="w-3.5 h-3.5 text-[#E5AF45] shrink-0" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FFC85C] truncate">
              Service Ongoing Now
            </span>
          </div>
        </div>

        {/* Right: Sleek compact countdown pill */}
        <div className="flex items-center gap-1.5 bg-[#100E0B] px-2.5 py-1 rounded-xl border border-[#E5AF45]/35 shrink-0">
          <Clock className="w-3 h-3 text-[#E5AF45]" />
          <span className="text-[10px] font-semibold text-[#B8ADA0] hidden xs:inline">Ends in</span>
          <span className="font-mono text-xs sm:text-sm font-black text-[#FFC85C] tracking-wider">
            {String(countdown.hours).padStart(2, '0')}:
            {String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    );
  }

  // Normal upcoming countdown - compact, engaging & space-saving
  return (
    <div className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#181510] border border-[#393027] shadow-xs flex items-center justify-between gap-2.5 ${className}`}>
      {/* Left: Compact Label */}
      <div className="flex items-center gap-1.5 text-[#FFF5E6] shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#E5AF45]" />
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FFF5E6]">
          Countdown
        </span>
      </div>

      {/* Right: 4 Sleek Compact Capsule Units */}
      <div className="flex items-center gap-1 sm:gap-1.5 text-center">
        {/* Days */}
        <div className="bg-[#29231C] px-2 py-1 rounded-xl border border-[#393027] flex items-baseline gap-0.5 min-w-[34px] sm:min-w-[42px] justify-center">
          <span className="font-mono text-xs sm:text-sm font-black text-[#FFF5E6] leading-none">
            {countdown.days}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-[#B8ADA0] uppercase tracking-tight">
            d
          </span>
        </div>
        <span className="text-[#393027] font-bold text-xs select-none">:</span>

        {/* Hours */}
        <div className="bg-[#29231C] px-2 py-1 rounded-xl border border-[#393027] flex items-baseline gap-0.5 min-w-[34px] sm:min-w-[42px] justify-center">
          <span className="font-mono text-xs sm:text-sm font-black text-[#FFF5E6] leading-none">
            {String(countdown.hours).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-[#B8ADA0] uppercase tracking-tight">
            h
          </span>
        </div>
        <span className="text-[#393027] font-bold text-xs select-none">:</span>

        {/* Minutes */}
        <div className="bg-[#29231C] px-2 py-1 rounded-xl border border-[#393027] flex items-baseline gap-0.5 min-w-[34px] sm:min-w-[42px] justify-center">
          <span className="font-mono text-xs sm:text-sm font-black text-[#FFF5E6] leading-none">
            {String(countdown.minutes).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-[#B8ADA0] uppercase tracking-tight">
            m
          </span>
        </div>
        <span className="text-[#393027] font-bold text-xs select-none">:</span>

        {/* Seconds */}
        <div className="bg-[#29231C] px-2 py-1 rounded-xl border border-[#E5AF45]/50 flex items-baseline gap-0.5 min-w-[34px] sm:min-w-[42px] justify-center">
          <span className="font-mono text-xs sm:text-sm font-black text-[#FFC85C] leading-none">
            {String(countdown.seconds).padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-[#E5AF45] uppercase tracking-tight">
            s
          </span>
        </div>
      </div>
    </div>
  );
};
