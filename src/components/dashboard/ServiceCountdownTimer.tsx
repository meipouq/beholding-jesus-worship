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
      <div className={`p-3.5 rounded-2xl bg-[#222225] border border-stone-800 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Service Concluded</span>
        </div>
        <span className="text-[11px] font-bold text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-xl">
          Archived in History
        </span>
      </div>
    );
  }

  // If service is currently ongoing (within start and end time)
  if (lifecycleStatus === 'ongoing' || countdown.isOngoing) {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-[#2A1808] to-[#1F160C] border border-[#D4A359]/40 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E5A93C]" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#E5A93C]" />
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200">
                Service Ongoing Now
              </span>
            </div>
            <p className="text-[11px] text-amber-100/70 mt-0.5 font-medium">
              Worship service in session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-3.5 py-2 rounded-xl border border-amber-500/20">
          <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span className="text-xs font-bold text-stone-300">Remaining:</span>
          <span className="font-mono text-sm font-extrabold text-[#E5A93C]">
            {String(countdown.hours).padStart(2, '0')}:
            {String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    );
  }

  // Normal upcoming countdown
  return (
    <div className={`p-4 rounded-2xl bg-[#1C1C1F] border border-stone-800/90 shadow-soft ${className}`}>
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Clock className="w-3.5 h-3.5 text-[#D4A359]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
            Live Service Countdown
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Upcoming
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        {/* Days */}
        <div className="bg-[#242428] rounded-xl p-2 sm:p-2.5 border border-stone-800/80">
          <span className="font-mono text-xl sm:text-2xl font-black text-white leading-none block">
            {countdown.days}
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1 block">
            {countdown.days === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {/* Hours */}
        <div className="bg-[#242428] rounded-xl p-2 sm:p-2.5 border border-stone-800/80">
          <span className="font-mono text-xl sm:text-2xl font-black text-white leading-none block">
            {String(countdown.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1 block">
            Hours
          </span>
        </div>

        {/* Minutes */}
        <div className="bg-[#242428] rounded-xl p-2 sm:p-2.5 border border-stone-800/80">
          <span className="font-mono text-xl sm:text-2xl font-black text-white leading-none block">
            {String(countdown.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1 block">
            Mins
          </span>
        </div>

        {/* Seconds */}
        <div className="bg-[#242428] rounded-xl p-2 sm:p-2.5 border border-stone-800/80">
          <span className="font-mono text-xl sm:text-2xl font-black text-[#E5A93C] leading-none block">
            {String(countdown.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1 block">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
};
