'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    border: '#10b981',
    icon: '#059669',
    title: '#065f46',
    bar: '#10b981',
  },
  error: {
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '#ef4444',
    icon: '#dc2626',
    title: '#7f1d1d',
    bar: '#ef4444',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '#f59e0b',
    icon: '#d97706',
    title: '#78350f',
    bar: '#f59e0b',
  },
  info: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '#3b82f6',
    icon: '#2563eb',
    title: '#1e3a8a',
    bar: '#3b82f6',
  },
};

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const Icon = icons[type];
  const s = styles[type];

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Start exit
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 400);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(onClose, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
        maxWidth: '420px',
        width: '100%',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: '100%',
          background: `${s.bar}22`,
        }}
      >
        <div
          style={{
            height: '100%',
            background: s.bar,
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 20px 22px 20px' }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `${s.icon}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} style={{ color: s.icon }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: s.title,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice'}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '14.5px',
              color: '#374151',
              lineHeight: '1.5',
              fontWeight: 450,
            }}
          >
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: '#9ca3af',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
        >
          <X size={16} />
        </button>
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Hook to manage toast state easily
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  const ToastElement = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastElement };
}
