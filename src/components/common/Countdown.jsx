import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate, label = "Starts in" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        <span>Event Concluded</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {label && <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">{label}:</span>}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
          {String(timeLeft.days).padStart(2, '0')}<span className="text-[10px] font-normal text-slate-500 ml-0.5">d</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
          {String(timeLeft.hours).padStart(2, '0')}<span className="text-[10px] font-normal text-slate-500 ml-0.5">h</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}<span className="text-[10px] font-normal text-slate-500 ml-0.5">m</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
          {String(timeLeft.seconds).padStart(2, '0')}<span className="text-[10px] font-normal text-slate-500 ml-0.5">s</span>
        </div>
      </div>
    </div>
  );
}
