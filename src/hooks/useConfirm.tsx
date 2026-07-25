import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(false);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!options) return;
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    if (options) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options, handleCancel, handleConfirm]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-500 p-4 animate-fade-in"
          id="confirm-modal-backdrop"
          onClick={handleCancel}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-scale-up"
            id="confirm-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  options.variant === 'warning'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : options.variant === 'info'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                }`}
              >
                {options.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : options.variant === 'info' ? (
                  <Info className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="confirm-modal-title"
                  className="font-display font-bold text-slate-900 dark:text-slate-100 text-base leading-snug"
                >
                  {options.title || 'Confirmar Operação'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {options.message}
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                id="btn-close-confirm-modal"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer font-semibold text-xs sm:text-sm"
                id="btn-cancel-confirm"
              >
                {options.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ${
                  options.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : options.variant === 'info'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
                id="btn-action-confirm"
              >
                {options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFunction {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm deve ser usado dentro de um ConfirmProvider');
  }
  return context;
}
