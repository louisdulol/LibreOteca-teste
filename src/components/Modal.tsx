import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Pilha global de fechamento de modais para que o ESC feche apenas o modal do topo
const activeModalStack: (() => void)[] = [];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  zIndex?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  zIndex = 'z-50',
}) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const currentClose = () => {
      onCloseRef.current();
    };

    activeModalStack.push(currentClose);
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const topClose = activeModalStack[activeModalStack.length - 1];
        if (topClose === currentClose) {
          e.stopPropagation();
          topClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      const idx = activeModalStack.lastIndexOf(currentClose);
      if (idx !== -1) {
        activeModalStack.splice(idx, 1);
      }
      if (activeModalStack.length === 0) {
        document.body.style.overflow = 'unset';
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div
      id="modal-backdrop"
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-[#131926] text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between px-6 py-4.5 border-b border-slate-800 bg-[#0f1420]/90">
          <div>
            <h3 className="text-xl font-serif font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            id="modal-close-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-hidden"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

