import React from 'react';
import { X, Bell, Check, ExternalLink, Calendar, Code } from 'lucide-react';
import { db } from '../../services/db';
import { useNavigate } from 'react-router-dom';

export default function NotificationDrawer({ isOpen, onClose, userId, notifications, onUpdate }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleItemClick = (notif) => {
    db.markNotificationAsRead(notif.id);
    if (onUpdate) onUpdate();
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 font-mono">Platform Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-700 rounded-full">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">Updates regarding your registrations and submissions will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    n.read 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'bg-blue-50/40 border-blue-200 text-slate-900 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-medium text-xs text-slate-900">
                      {n.type === 'registration' && <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      {n.type === 'submission' && <Code className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      {n.type === 'status_update' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <span className="text-[11px] text-slate-500 font-mono">Siteon Event Notification Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
