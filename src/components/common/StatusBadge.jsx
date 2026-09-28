import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Trophy, Eye, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || '').toLowerCase().trim();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    icon: Clock,
    label: status || 'Pending'
  };

  switch (norm) {
    case 'upcoming':
      config = {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: Clock,
        label: 'UPCOMING'
      };
      break;
    case 'running':
    case 'active':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500 animate-pulse',
        icon: Clock,
        label: 'LIVE NOW'
      };
      break;
    case 'submitted':
      config = {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        icon: CheckCircle2,
        label: 'SUBMITTED'
      };
      break;
    case 'under review':
    case 'reviewing':
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        icon: Eye,
        label: 'UNDER REVIEW'
      };
      break;
    case 'shortlisted':
      config = {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
        icon: CheckCircle2,
        label: 'SHORTLISTED'
      };
      break;
    case 'winner':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-600',
        icon: Trophy,
        label: 'WINNER'
      };
      break;
    case 'rejected':
      config = {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        icon: XCircle,
        label: 'NOT SELECTED'
      };
      break;
    case 'submission closed':
    case 'closed':
      config = {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        icon: AlertCircle,
        label: 'CLOSED'
      };
      break;
    case 'draft':
      config = {
        bg: 'bg-zinc-100',
        text: 'text-zinc-600',
        border: 'border-zinc-300',
        dot: 'bg-zinc-400',
        icon: Clock,
        label: 'DRAFT'
      };
      break;
    default:
      config.label = status ? status.toUpperCase() : 'UNKNOWN';
  }

  const IconComponent = config.icon;
  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-xs px-3 py-1.5 font-semibold' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
