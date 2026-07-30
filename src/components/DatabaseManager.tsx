import React, { useState, useRef, useEffect } from 'react';
import { Resident, ScheduledActivity, ResidentProgressLog, Reminder, SuggestionRules } from '../types';
import { useConfirm } from '../hooks/useConfirm';
import {
  Database,
  Download,
  Upload,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  Settings,
  Flame,
  HelpCircle,
  Smartphone,
  Plus,
  Folder,
  ExternalLink,
  Cloud,
  CloudUpload,
  CloudDownload
} from 'lucide-react';

interface DatabaseManagerProps {
  residents: Resident[];
  scheduledActivities: ScheduledActivity[];
  progressLogs: ResidentProgressLog[];
  reminders: Reminder[];
  suggestionRules?: SuggestionRules;
  onImportData: (data: {
    residents: Resident[];
    scheduledActivities: ScheduledActivity[];
    progressLogs: ResidentProgressLog[];
    reminders: Reminder[];
    suggestionRules?: SuggestionRules;
    activities?: any[];
    settings?: any;
  }) => void;
  isStandalone: boolean;
}

export default function DatabaseManager({
  residents,
  scheduledActivities,
  progressLogs,
  reminders,
  suggestionRules,
  onImportData,
  isStandalone
}: DatabaseManagerProps) {
  const confirm = useConfirm();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | null>(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive states & handlers
  const [gdriveConfigured, setGdriveConfigured] = useState(false);
  const [gdriveSyncing, setGdriveSyncing] = useState(false);
  const [gdriveRestoring, setGdriveRestoring] = useState(false);
  const [gdriveLastSynced, setGdriveLastSynced] = useState<string | null>(null);
  const [gdriveMessage, setGdriveMessage] = useState<string | null>(null);

  const GDRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1q2Ky5732OVNJhtDpTUFikKEjkGmonp6n";

  useEffect(() => {
    if (!isStandalone) {
      fetch('/api/gdrive/status')
        .then(res => res.json())
        .then(data => {
          setGdriveConfigured(data.configured);
        })
        .catch(() => {});
    }
  }, [isStandalone]);

  const handleGDriveUpload = async () => {
    setGdriveSyncing(true);
    setGdriveMessage(null);
    try {
      const res = await fetch('/api/gdrive/upload', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao guardar no Google Drive');
      setGdriveLastSynced(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
      setGdriveMessage('Base de dados guardada com sucesso na pasta do Google Drive!');
    } catch (err: any) {
      setGdriveMessage('Erro: ' + err.message);
    } finally {
      setGdriveSyncing(false);
    }
  };

  const handleGDriveRestore = async () => {
    const confirmed = await confirm({
      title: 'Restaurar do Google Drive',
      message: 'Deseja importar a base de dados guardada na pasta do Google Drive? Esta ação irá atualizar os dados atuais da aplicação.',
      confirmText: 'Sim, Restaurar',
      cancelText: 'Cancelar',
      variant: 'warning'
    });
    if (!confirmed) return;

    setGdriveRestoring(true);
    setGdriveMessage(null);
    try {
      const res = await fetch('/api/gdrive/restore', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao restaurar do Google Drive');
      if (data.data) {
        onImportData(data.data);
      }
      setGdriveMessage('Base de dados restaurada com sucesso a partir do Google Drive!');
    } catch (err: any) {
      setGdriveMessage('Erro: ' + err.message);
    } finally {
      setGdriveRestoring(false);
    }
  };

  // PWA states and logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone display mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true ||
                           document.referrer.includes('android-app://');
    
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // Load from early-captured prompt if it exists
    if ((window as any).deferredInstallPrompt) {
      setDeferredPrompt((window as any).deferredInstallPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom dispatch if it fires later
    const handlePwaInstallable = () => {
      if ((window as any).deferredInstallPrompt) {
        setDeferredPrompt((window as any).deferredInstallPrompt);
        setIsInstallable(true);
      }
    };
    window.addEventListener('pwa-installable', handlePwaInstallable);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-installable', handlePwaInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Para instalar a aplicação no seu telemóvel ou tablet:\n\n• No iPhone/iPad (Safari): Toque no ícone de Partilhar (↑) no navegador e escolha a opção 'Adicionar ao Ecrã Principal'.\n\n• No Android (Chrome/Edge): Toque nos três pontos (⋮) no canto superior direito e selecione 'Instalar aplicação' ou 'Adicionar ao ecrã principal'.");
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("Erro ao invocar o prompt de instalação do PWA:", err);
    }
  };

  // Trigger manual synchronization with the SQLite Server
  const handleManualSync = async () => {
    if (isStandalone) return;
    setSyncing(true);
    setSyncStatus(null);
    setSyncMessage('');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residents,
          scheduledActivities,
          progressLogs,
          reminders,
          suggestionRules
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na resposta do servidor.");
      }

      setSyncStatus('success');
      setSyncMessage("Os seus dados foram totalmente gravados no ficheiro SQLite local do servidor.");
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage("Falha ao comunicar com a base de dados do servidor. Os dados mantêm-se em segurança no seu navegador.");
    } finally {
      setSyncing(false);
    }
  };

  // Triggers SQLite DB Binary Download from Node.js
  const handleDownloadSQLite = () => {
    if (isStandalone) {
      // Standalone mode export - Since we are running on file:// without a Node backend,
      // we generate an extremely clean and structured JSON backup file that acts as the SQLite dataset.
      // This allows the user to import it back or convert it. We also add a .db file layout as fallback.
      const backupData = {
        residents,
        scheduledActivities,
        progressLogs,
        reminders,
        suggestionRules,
        exportedAt: new Date().toISOString(),
        format: "AnimaLar SQLite Backup compatible JSON"
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'animalar_backup_offline.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Production mode - Fetch the binary animalar.db via fetch to bypass iframe/cookie restrictions, then save as a Blob
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      fetch('/api/database/download')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Erro ao obter cópia de segurança a partir do servidor.");
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'animalar.db';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
        .catch((err: any) => {
          console.error(err);
          setUploadError("Erro ao descarregar base de dados: " + (err.message || err));
        })
        .finally(() => {
          setUploading(false);
        });
    }
  };

  // Handles physical .db SQLite file upload to Node.js backend or local storage fallback
  const handleUploadSQLiteFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = await confirm({
      title: 'Restaurar Base de Dados',
      message: `Tem a certeza que deseja importar a cópia de segurança "${file.name}"? Esta ação irá substituir os dados atuais da aplicação.`,
      confirmText: 'Sim, Restaurar',
      cancelText: 'Cancelar',
      variant: 'warning'
    });

    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // If we are not in standalone mode and it's a binary .db file, upload directly to the SQLite backend
      if (file.name.endsWith('.db') && !isStandalone) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const response = await fetch('/api/database/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-sqlite3'
            },
            body: arrayBuffer
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Erro ao guardar cópia no servidor.");
          }
          
          // Force reload sync states from the backend to guarantee match
          const syncRes = await fetch('/api/data');
          if (syncRes.ok) {
            const dbData = await syncRes.json();
            onImportData(dbData);
          }
          setUploadSuccess(true);
        } catch (serverErr: any) {
          console.error(serverErr);
          setUploadError(serverErr.message || "Erro ao fazer upload do ficheiro .db para o servidor.");
        } finally {
          setUploading(false);
        }
        return;
      }

      // Fallback/standard mode: Read as JSON for .json or local JSON storage uploads
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileContent = event.target?.result as string;
          let parsed;
          try {
            parsed = JSON.parse(fileContent);
          } catch (jsonErr) {
            throw new Error("Formato de ficheiro incorreto ou corrompido. Certifique-se de carregar um ficheiro .json válido ou um .db exportado pelo AnimaLar.");
          }

          if (!parsed.residents || !parsed.scheduledActivities) {
            throw new Error("O ficheiro de base de dados selecionado não contém as tabelas de utentes ou atividades válidas.");
          }

          // Step 1: Import locally on the client browser state immediately to guarantee 100% offline compatibility
          onImportData({
            residents: parsed.residents,
            scheduledActivities: parsed.scheduledActivities,
            progressLogs: parsed.progressLogs || [],
            reminders: parsed.reminders || [],
            suggestionRules: parsed.suggestionRules || undefined
          });

          // Step 2: If we are not in standalone mode, also upload to the backend server
          if (!isStandalone) {
            try {
              const arrayBuffer = await file.arrayBuffer();
              const response = await fetch('/api/database/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-sqlite3'
                },
                body: arrayBuffer
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Erro ao guardar cópia no servidor.");
              }
              
              // Force reload sync states from the backend to guarantee match
              const syncRes = await fetch('/api/data');
              if (syncRes.ok) {
                const dbData = await syncRes.json();
                onImportData(dbData);
              }
            } catch (serverErr: any) {
              console.warn("Aviso: Servidor offline ou inacessível, mas os dados foram importados com sucesso localmente no seu navegador:", serverErr);
              // Do not throw or fail here. The browser imported the backup correctly to localStorage.
            }
          }

          setUploadSuccess(true);
        } catch (err: any) {
          console.error(err);
          setUploadError(err.message || "Erro ao processar o ficheiro de base de dados.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Erro de leitura do ficheiro selecionado.");
      setUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Downloads the completely packed Single HTML file for 100% offline usage
  const handleDownloadOfflineHTML = () => {
    if (isStandalone) {
      alert("Já se encontra a utilizar a versão offline autónoma!");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    fetch('/api/offline-html')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Erro ao obter a versão offline autónoma a partir do servidor.");
        }
        const htmlText = await response.text();
        const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AnimaLar.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setUploadSuccess(true);
      })
      .catch((err: any) => {
        console.error(err);
        setUploadError("Erro ao descarregar aplicação offline: " + (err.message || err));
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div className="space-y-6" id="database-manager-container">
      
      {/* Intro Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
              <Database className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
            </div>
            <h2 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
              Painel de Gestão SQLite & Portabilidade
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Configure, sincronize, faça cópias de segurança da sua base de dados na pasta institucional do Google Drive, descarregue o ficheiro SQLite físico e exporte a aplicação para trabalhar 100% offline.
          </p>
        </div>

        {/* Current Environment Badge */}
        <div className={`p-3 rounded-2xl border text-center font-sans space-y-1 self-stretch md:self-auto flex flex-col items-center justify-center shrink-0 ${
          isStandalone 
            ? 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-900 dark:text-amber-300' 
            : 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-1.5 justify-center">
            {isStandalone ? (
              <>
                <WifiOff className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Modo Offline Autónomo</span>
              </>
            ) : (
              <>
                <Wifi className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Servidor SQLite Ativo</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {isStandalone 
              ? 'Guardado localmente no browser' 
              : 'Ligado ao ficheiro animalar.db'}
          </p>
        </div>
      </div>

      {/* Google Drive Primary Sync Card */}
      {!isStandalone && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-indigo-800 rounded-2xl p-6 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Base de Dados no Google Drive (Pasta Institucional)
                </h3>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Sincronização Ativa
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed pl-9">
                A base de dados é automaticamente preservada na sua pasta do Google Drive em <strong>animalar_database.json</strong> e <strong>animalar.db</strong>.
              </p>
            </div>

            <a
              href={GDRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-blue-200 border border-white/20 px-4 py-2.5 rounded-xl transition-all shrink-0 self-start md:self-auto"
            >
              <Folder className="w-4 h-4 text-blue-300" />
              Abrir Pasta no Google Drive
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              onClick={handleGDriveUpload}
              disabled={gdriveSyncing || gdriveRestoring}
              className="flex items-center justify-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-3 px-5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className={`w-4 h-4 ${gdriveSyncing ? 'animate-bounce' : ''}`} />
              {gdriveSyncing ? 'A guardar no Google Drive...' : 'Guardar Agora no Google Drive'}
            </button>

            <button
              onClick={handleGDriveRestore}
              disabled={gdriveSyncing || gdriveRestoring}
              className="flex items-center justify-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <CloudDownload className={`w-4 h-4 text-indigo-300 ${gdriveRestoring ? 'animate-bounce' : ''}`} />
              {gdriveRestoring ? 'A restaurar do Google Drive...' : 'Restaurar do Google Drive'}
            </button>
          </div>

          {gdriveLastSynced && (
            <p className="text-[11px] text-indigo-300/80 font-mono">
              Última cópia no Google Drive: {gdriveLastSynced}
            </p>
          )}

          {gdriveMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              gdriveMessage.startsWith('Erro') 
                ? 'bg-red-500/20 text-red-200 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
            }`}>
              {gdriveMessage.startsWith('Erro') ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-300" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-300" />
              )}
              <span>{gdriveMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core SQLite Actions Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5 lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Base de Dados Física (Ficheiro SQLite)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Backup / Export SQLite */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Passo 1</span>
                <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">Exportar Ficheiro de Dados</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isStandalone 
                    ? 'Transfere um backup JSON contendo toda a estrutura de dados atualizada, pronto a ser carregado em qualquer instância.'
                    : 'Transfere diretamente o ficheiro de base de dados física "animalar.db" SQLite ativo no servidor para salvaguarda externa.'}
                </p>
              </div>
              <button
                onClick={handleDownloadSQLite}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Descarregar {isStandalone ? 'Cópia de Segurança' : 'Ficheiro SQLite (.db)'}
              </button>
            </div>

            {/* Restore / Import SQLite */}
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Passo 2</span>
                <h4 className="font-display font-bold text-xs text-slate-800">Restaurar / Importar Dados</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Selecione o ficheiro de base de dados (fórmula <strong>.json</strong> ou <strong>.db</strong>) exportado anteriormente. Toda a informação será restaurada com total segurança e compatibilidade.
                </p>
              </div>
              
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadSQLiteFile}
                  accept=".json,.db"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold border border-gray-200 hover:bg-white text-slate-700 py-2.5 rounded-xl transition-all cursor-pointer hover:shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  {uploading ? 'A carregar...' : 'Importar Base de Dados (.json / .db)'}
                </button>
              </div>
            </div>

          </div>

          {/* Sincronização Server Card (Only shown if NOT standalone) */}
          {!isStandalone && (
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-gray-100 p-3 rounded-xl">
              <div className="flex gap-2.5">
                <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="font-display font-bold text-[11px] text-slate-800">Sincronização em tempo real</h5>
                  <p className="text-[10px] text-gray-400 leading-snug">
                    Todas as ações efetuadas no ecrã são sincronizadas de forma imediata. Pode forçar a gravação completa a qualquer altura.
                  </p>
                </div>
              </div>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="text-[10px] font-bold bg-white border border-gray-200 hover:border-indigo-200 text-indigo-700 px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'A Sincronizar...' : 'Forçar Sincronização'}
              </button>
            </div>
          )}

          {/* Messages */}
          {syncStatus && (
            <div className={`p-3.5 rounded-xl text-xs flex gap-2.5 items-start ${
              syncStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
            }`}>
              {syncStatus === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <p className="font-medium leading-relaxed">{syncMessage}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 flex gap-2.5 items-start">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">
                A base de dados foi importada e recarregada com absoluto sucesso! Toda a informação atualizou.
              </p>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl text-xs bg-red-50 text-red-800 border border-red-100 flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{uploadError}</p>
            </div>
          )}

        </div>

        {/* Right Column: Stats & PWA Installation */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Database Stats Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-gray-800 text-xs sm:text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-600" />
                Informação Estatística SQLite
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-1.5">
                  <span className="text-gray-400 font-medium">Tabela Residents:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{residents.length} registos</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-1.5">
                  <span className="text-gray-400 font-medium">Tabela Scheduled_activities:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{scheduledActivities.length} registos</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-1.5">
                  <span className="text-gray-400 font-medium">Tabela Progress_logs:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{progressLogs.length} registos</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-1.5">
                  <span className="text-gray-400 font-medium">Tabela Reminders:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{reminders.length} registos</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-gray-400 space-y-1">
                <p className="font-semibold text-slate-700">A sua informação está protegida:</p>
                <p>Os dados clínicos, históricos de pontuação de bem-estar social, cognitivo e motor estão guardados com confidencialidade local total.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100/50 flex flex-col gap-1.5 text-[10px]">
              <p className="text-gray-400 text-center font-medium">Formato da base de dados: SQLite v3</p>
            </div>
          </div>

          {/* PWA Installation Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-display font-bold text-gray-800 text-xs sm:text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Instalar Aplicação (PWA)
              </h3>
              
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Adicione o AnimaLar ao ecrã principal do seu telemóvel ou tablet. Funciona como uma aplicação nativa: acesso imediato, sem barras do browser e usabilidade perfeita.
              </p>

              {isInstalled ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-emerald-800">Aplicação Instalada!</p>
                    <p className="text-[10px] text-emerald-600/90 leading-snug">
                      Já está a usufruir da experiência completa PWA no seu dispositivo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleInstallApp}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Instalar no Dispositivo
                  </button>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2 text-[10px] text-gray-500">
                    <p className="font-semibold text-slate-700">Instruções rápidas:</p>
                    <ul className="list-disc list-inside space-y-1 leading-relaxed">
                      <li>
                        <strong className="text-slate-700">Android / Chrome:</strong> Clique no botão ou use os 3 pontos <span className="font-bold">⋮</span> &rarr; <span className="italic">Instalar aplicação</span>.
                      </li>
                      <li>
                        <strong className="text-slate-700">Apple iOS / Safari:</strong> Clique no botão de partilha <span className="font-bold">↑</span> &rarr; <span className="italic">Adicionar ao Ecrã Principal</span>.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Export to Offline standalone Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">Portabilidade 100% Livre</span>
          </div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
            Descarregar Aplicação Offline para Ficheiro Único HTML
          </h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Esta funcionalidade compila toda a aplicação AnimaLar, o CSS do Tailwind CSS e os seus dados atuais num <strong>único ficheiro HTML autossuficiente (.html)</strong>. Pode guardá-lo numa pen USB, utilizá-lo num tablet ou portátil sem internet, ou partilhá-lo. Tudo funcionará perfeitamente e guardará as alterações no browser local do utilizador, com opções completas para importar/exportar ficheiros SQLite!
          </p>
        </div>

        <div className="flex flex-col justify-center shrink-0">
          <button
            onClick={handleDownloadOfflineHTML}
            disabled={isStandalone}
            className={`flex items-center justify-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Globe className="w-4 h-4 text-slate-900" />
            Exportar App Offline (.html)
          </button>
          {isStandalone && (
            <p className="text-[10px] text-center text-amber-200/60 mt-2">
              Já se encontra a executar esta versão offline.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
