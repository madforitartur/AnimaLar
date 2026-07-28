import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share2, Plus, ArrowUp, Laptop, Sparkles, Smartphone, CheckCircle } from 'lucide-react';
// @ts-ignore
import logoUrl from '../assets/images/lar_santo_antonio_logo_official_1784530465177.jpg';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://');
    
    setIsStandalone(checkStandalone);

    if (checkStandalone) {
      return; // Already installed, do not show prompt
    }

    // 2. Identify if user is on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(detectIOS);

    // 3. Check if user dismissed prompt recently (within last 24 hours)
    const lastDismissed = localStorage.getItem('pwa-install-prompt-dismissed');
    const now = Date.now();
    const isDismissedRecently = lastDismissed && (now - parseInt(lastDismissed, 10)) < 24 * 60 * 60 * 1000;

    let installTimer: any = null;

    const triggerPromptWithDelay = (promptEvent: any) => {
      setDeferredPrompt(promptEvent);
      if (!isDismissedRecently && isMobileOrTablet()) {
        if (installTimer) clearTimeout(installTimer);
        installTimer = setTimeout(() => {
          setShowPrompt(true);
        }, 1500); // reduced delay for quicker engagement
      }
    };

    // Check if early capture grabbed the prompt event
    if ((window as any).deferredInstallPrompt) {
      triggerPromptWithDelay((window as any).deferredInstallPrompt);
    }

    // Listen for custom dispatch if it fires later
    const handlePwaInstallable = () => {
      if ((window as any).deferredInstallPrompt) {
        triggerPromptWithDelay((window as any).deferredInstallPrompt);
      }
    };
    window.addEventListener('pwa-installable', handlePwaInstallable);

    // 4. Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      triggerPromptWithDelay(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Fallback for iOS/Safari where beforeinstallprompt doesn't fire
    if (detectIOS && !isDismissedRecently && isMobileOrTablet() && !((window as any).deferredInstallPrompt)) {
      installTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-installable', handlePwaInstallable);
      if (installTimer) clearTimeout(installTimer);
    };
  }, []);

  // Helper to detect mobile or tablet screen size/user agent
  const isMobileOrTablet = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 1024; // trigger for tablet or mobile
    return isMobileUA || isSmallScreen;
  };

  const handleDismiss = () => {
    // Store timestamp of dismissal
    localStorage.setItem('pwa-install-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser prompt
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsStandalone(true);
          setShowPrompt(false);
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error triggering PWA prompt:', err);
      }
    } else {
      // Show custom step-by-step installation instructions (mainly for iOS Safari or other browsers)
      setShowTutorial(true);
    }
  };

  // If already in standalone mode, don't show anything
  if (isStandalone) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showPrompt && !showTutorial && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white border border-indigo-100 rounded-2xl shadow-xl z-50 p-4 shrink-0 print:hidden"
            id="pwa-install-banner"
          >
            <div className="flex items-start gap-3.5">
              {/* App Icon */}
              <div className="relative shrink-0">
                <img
                  src={logoUrl}
                  alt="AnimaLar Logo"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full shadow-xs">
                  <Download className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center gap-1">
                    Instalar AnimaLar PWA
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-indigo-50 text-indigo-600">
                      <Sparkles className="w-2 h-2" /> App
                    </span>
                  </h4>
                  <button
                    onClick={handleDismiss}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                    title="Fechar"
                    id="pwa-close-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                  Adicione o AnimaLar ao seu ecrã principal para ter acesso offline, inicialização rápida e visualização em ecrã inteiro como uma aplicação nativa!
                </p>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                    id="pwa-install-now-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Instalar no Ecrã Principal
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
                    id="pwa-later-btn"
                  >
                    Mais tarde
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial modal for custom install guidance */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4 print:hidden" id="pwa-tutorial-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white relative">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  id="pwa-tutorial-close"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-sm"
                  />
                  <div>
                    <h3 className="text-xs font-extrabold tracking-tight">Instalar AnimaLar</h3>
                    <p className="text-[9px] text-indigo-100">Guia de instalação rápida no dispositivo</p>
                  </div>
                </div>
              </div>

              {/* Instructions body */}
              <div className="p-5 space-y-4">
                {isIOS ? (
                  /* iOS Specific Steps */
                  <div className="space-y-3.5">
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Como o sistema Apple iOS não permite instalação automática pelo navegador, siga estes passos fáceis no <strong className="text-slate-800">Safari</strong>:
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Toque no botão de <strong>Partilhar</strong> na barra de ferramentas do Safari (representado por um quadrado com uma seta para cima <Share2 className="w-3.5 h-3.5 inline-block text-indigo-500 mx-0.5" />).
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Deslize o menu de partilha para baixo e selecione a opção <strong>Adicionar ao Ecrã Principal</strong> (representada por um ícone de mais <Plus className="w-3.5 h-3.5 inline-block text-indigo-500 mx-0.5" />).
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Toque em <strong>Adicionar</strong> no canto superior direito para confirmar. O ícone oficial do Lar aparecerá no seu ecrã!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Android/Other general browser steps if trigger was blocked */
                  <div className="space-y-3.5">
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Para adicionar a aplicação ao seu dispositivo a partir deste navegador:
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Toque nos <strong>três pontos (⋮)</strong> no canto superior direito do seu navegador.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Selecione a opção <strong>Instalar aplicação</strong> ou <strong>Adicionar ao ecrã principal</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Confirme a instalação. O ícone oficial do Lar será instalado com sucesso no seu dispositivo!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer confirmation */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowTutorial(false);
                      setShowPrompt(false);
                      localStorage.setItem('pwa-install-prompt-dismissed', Date.now().toString());
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all cursor-pointer text-center"
                    id="pwa-tutorial-understood"
                  >
                    Entendi, obrigado!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
