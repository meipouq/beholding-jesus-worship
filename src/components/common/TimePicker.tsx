import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import {
  parseValidTime,
  formatDisplayTime,
  DEFAULT_TIME_SUGGESTIONS
} from '../../utils/timeFormat';

export interface TimePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (time12h: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
  helperText?: string;
  disabled?: boolean;
  suggestions?: string[];
  className?: string;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Select time (e.g. 9:00 AM)',
  error,
  helperText,
  disabled = false,
  suggestions = DEFAULT_TIME_SUGGESTIONS,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value into 12h state
  const parsed = parseValidTime(value);
  
  // Internal picker state
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (parsed) {
      const h12 = parsed.hours % 12 === 0 ? 12 : parsed.hours % 12;
      return h12;
    }
    return 9;
  });

  const [selectedMinute, setSelectedMinute] = useState<string>(() => {
    if (parsed) {
      return parsed.minutes.toString().padStart(2, '0');
    }
    return '00';
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(() => {
    if (parsed) {
      return parsed.hours >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
  });

  // Sync internal state when external value changes
  useEffect(() => {
    const currentParsed = parseValidTime(value);
    if (currentParsed) {
      const h12 = currentParsed.hours % 12 === 0 ? 12 : currentParsed.hours % 12;
      setSelectedHour(h12);
      setSelectedMinute(currentParsed.minutes.toString().padStart(2, '0'));
      setSelectedPeriod(currentParsed.hours >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const commitTime = (hour: number, minute: string, period: 'AM' | 'PM') => {
    const formatted = `${hour}:${minute} ${period}`;
    onChange(formatted);
  };

  const handleSelectSuggestion = (sug: string) => {
    const p = parseValidTime(sug);
    if (p) {
      const h12 = p.hours % 12 === 0 ? 12 : p.hours % 12;
      const min = p.minutes.toString().padStart(2, '0');
      const per = p.hours >= 12 ? 'PM' : 'AM';
      setSelectedHour(h12);
      setSelectedMinute(min);
      setSelectedPeriod(per);
      onChange(p.formatted12);
      setIsOpen(false);
    }
  };

  const handleHourClick = (h: number) => {
    setSelectedHour(h);
    commitTime(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteClick = (m: string) => {
    setSelectedMinute(m);
    commitTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodToggle = (p: 'AM' | 'PM') => {
    setSelectedPeriod(p);
    commitTime(selectedHour, selectedMinute, p);
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    // Round to nearest 5 minutes
    const rawMin = now.getMinutes();
    const roundedMin = Math.round(rawMin / 5) * 5;
    const finalMin = (roundedMin % 60).toString().padStart(2, '0');
    
    setSelectedHour(hour12);
    setSelectedMinute(finalMin);
    setSelectedPeriod(period);
    commitTime(hour12, finalMin, period);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const displayTime = formatDisplayTime(value);
  const isInvalid = value.trim().length > 0 && !displayTime;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-[#E57373]">*</span>}
          </span>
          {displayTime && (
            <span className="text-[10px] text-[#E5AF45] font-semibold lowercase tracking-normal">
              12-hour format
            </span>
          )}
        </label>
      )}

      {/* Main Trigger Input */}
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full text-xs px-3.5 py-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-[#181510]/50 border-[#393027]'
            : isOpen
            ? 'bg-[#181510] border-[#E5AF45] shadow-[0_0_12px_rgba(229,175,69,0.25)] ring-1 ring-[#E5AF45]'
            : error || isInvalid
            ? 'bg-[#181510] border-[#E57373] hover:border-[#E57373]/80'
            : 'bg-[#181510] border-[#393027] hover:border-[#E5AF45]/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#211C17] border border-[#393027] flex items-center justify-center text-[#E5AF45] shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          {displayTime ? (
            <span className="font-bold text-[#FFF5E6] tracking-wide text-xs">
              {displayTime}
            </span>
          ) : (
            <span className="text-[#B8ADA0]/60 italic">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {!required && displayTime && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear time"
              className="p-1 rounded-lg text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#B8ADA0] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#E5AF45]' : ''
            }`}
          />
        </div>
      </div>

      {/* Error / Validation Feedback */}
      {(error || isInvalid) && (
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#E57373] animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || 'Invalid time format. Please select a valid 12-hour time.'}</span>
        </div>
      )}

      {helperText && !error && !isInvalid && (
        <p className="text-[10px] text-[#B8ADA0] mt-1">{helperText}</p>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 p-3.5 bg-[#211C17] rounded-3xl border border-[#393027] shadow-2xl animate-scale-in text-[#FFF5E6] backdrop-blur-md min-w-[280px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#393027] mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5AF45]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Time</span>
            </div>
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#29231C] hover:bg-[#352c23] text-[#B8ADA0] hover:text-[#FFF5E6] border border-[#393027] transition-colors cursor-pointer"
            >
              Set to Now
            </button>
          </div>

          {/* Quick Select Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="mb-3.5">
              <span className="text-[10px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1.5">
                Quick Suggestions
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                {suggestions.map((sug) => {
                  const isMatch = displayTime === sug;
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-[#E5AF45] text-[#100E0B] shadow-sm font-black scale-105'
                          : 'bg-[#181510] text-[#B8ADA0] border border-[#393027] hover:border-[#E5AF45]/50 hover:text-[#FFF5E6]'
                      }`}
                    >
                      {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Time Selector (Hours, Minutes, AM/PM) */}
          <div className="pt-2 border-t border-[#393027]">
            <span className="text-[10px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-2">
              Custom Time
            </span>

            {/* Current Selection Preview */}
            <div className="bg-[#181510] rounded-2xl p-2.5 border border-[#393027] flex items-center justify-center gap-3 mb-3">
              <span className="text-xl font-black text-[#FFF5E6] tracking-wider">
                {selectedHour}:{selectedMinute}
              </span>
              <div className="flex bg-[#211C17] p-0.5 rounded-xl border border-[#393027]">
                <button
                  type="button"
                  onClick={() => handlePeriodToggle('AM')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedPeriod === 'AM'
                      ? 'bg-[#E5AF45] text-[#100E0B] shadow-xs'
                      : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodToggle('PM')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedPeriod === 'PM'
                      ? 'bg-[#E5AF45] text-[#100E0B] shadow-xs'
                      : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Hours Selector Grid (1 to 12) */}
            <div className="mb-2.5">
              <span className="text-[9px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Hour
              </span>
              <div className="grid grid-cols-6 gap-1">
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourClick(h)}
                      className={`py-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5AF45] text-[#100E0B] font-black'
                          : 'bg-[#181510] text-[#B8ADA0] hover:bg-[#29231C] hover:text-[#FFF5E6] border border-[#393027]'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Selector Grid (Common increments) */}
            <div className="mb-3">
              <span className="text-[9px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Minute
              </span>
              <div className="grid grid-cols-6 gap-1">
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteClick(m)}
                      className={`py-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5AF45] text-[#100E0B] font-black'
                          : 'bg-[#181510] text-[#B8ADA0] hover:bg-[#29231C] hover:text-[#FFF5E6] border border-[#393027]'
                      }`}
                    >
                      :{m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Done / Confirm Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply {selectedHour}:{selectedMinute} {selectedPeriod}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
