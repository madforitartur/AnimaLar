import React, { useState, useEffect } from 'react';
import { Resident, ScheduledActivity, ResidentProgressLog, Reminder, ActivityCategory, SuggestionRules } from './types';
import {
  PREDEFINED_ACTIVITIES,
  INITIAL_RESIDENTS,
  getInitialScheduledActivities,
  getInitialProgressLogs,
  getInitialReminders
} from './data';
import CalendarView from './components/CalendarView';
import ResidentsList from './components/ResidentsList';
import RemindersPanel from './components/RemindersPanel';
import PrintPreview from './components/PrintPreview';
import DatabaseManager from './components/DatabaseManager';
import ActivitiesPanel from './components/ActivitiesPanel';
import SupportMaterialsPanel from './components/SupportMaterialsPanel';
import { Activity } from './types';
import Tooltip from './components/Tooltip';

import {
  Calendar as CalendarIcon,
  Users,
  Bell,
  Printer,
  Heart,
  Clock,
  Plus,
  TrendingUp,
  Award,
  FileCheck2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  UserCheck,
  Database,
  BookOpen
} from 'lucide-react';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Erro ao aceder ao localStorage para ler a chave "${key}":`, e);
      return (window as any).__fallback_storage?.[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Erro ao aceder ao localStorage para guardar a chave "${key}":`, e);
      if (!(window as any).__fallback_storage) {
        (window as any).__fallback_storage = {};
      }
      (window as any).__fallback_storage[key] = value;
    }
  }
};

const isStandalone = (window as any).IS_OFFLINE_STANDALONE || window.location.protocol === 'file:';

const ensureUniqueReminders = (list: Reminder[]): Reminder[] => {
  const seen = new Set<string>();
  return list.map((rem, idx) => {
    let newId = rem.id;
    if (!newId || seen.has(newId)) {
      const originalId = newId || 'rem_auto';
      newId = `${originalId}_fixed_${idx}_${Math.random().toString(36).substr(2, 4)}`;
    }
    seen.add(newId);
    return { ...rem, id: newId };
  });
};

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'planner' | 'residents' | 'reminders' | 'print' | 'database' | 'activities' | 'materials'>('planner');

  // Activities Catalog State (Persisted in LocalStorage)
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = safeLocalStorage.getItem('animar_activities');
    let baseActivities = PREDEFINED_ACTIVITIES;
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.activities) {
      baseActivities = offlineData.activities;
    }

    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved) as Activity[];
        const baseIds = new Set(baseActivities.map(a => a.id));
        
        // Filter out any custom user-added activities
        const customActivities = parsedSaved.filter(a => !baseIds.has(a.id));
        
        // Map over predefined activities, merging any changes from local storage if they were modified,
        // otherwise keeping the latest predefined versions.
        const merged = baseActivities.map(baseAct => {
          const savedAct = parsedSaved.find(s => s.id === baseAct.id);
          return savedAct || baseAct;
        });
        
        return [...merged, ...customActivities];
      } catch (e) {
        console.error("Erro ao analisar as atividades guardadas, a redefinir para as predefinidas:", e);
        return baseActivities;
      }
    }
    return baseActivities;
  });

  // Core Database States (Persisted in LocalStorage)
  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_residents');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao analisar residentes guardados em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.residents) return offlineData.residents;
    return INITIAL_RESIDENTS;
  });

  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_scheduled');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao analisar atividades agendadas guardadas em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.scheduledActivities) return offlineData.scheduledActivities;
    return getInitialScheduledActivities();
  });

  const [progressLogs, setProgressLogs] = useState<ResidentProgressLog[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao analisar registos de progresso guardados em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.progressLogs) return offlineData.progressLogs;
    return getInitialProgressLogs();
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_reminders');
      if (saved) return ensureUniqueReminders(JSON.parse(saved));
    } catch (e) {
      console.error("Erro ao analisar lembretes guardados em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.reminders) return ensureUniqueReminders(offlineData.reminders);
    return ensureUniqueReminders(getInitialReminders());
  });

  // Browser Notification States
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [notifiedIds, setNotifiedIds] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem('animar_notified_activities');
    return saved ? JSON.parse(saved) : [];
  });

  // Suggestion Rules State
  const [suggestionRules, setSuggestionRules] = useState<SuggestionRules>(() => {
    const saved = safeLocalStorage.getItem('animar_suggestion_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing suggestion rules:', e);
      }
    }
    return {
      activeDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      maxPhysicalDaysPerWeek: 2,
      maxCognitiveDaysPerWeek: 5,
      maxMusicDaysPerWeek: 3,
      maxOtherDaysPerWeek: 2,
      morningCategoryPreference: 'cognitiva',
      afternoonCategoryPreference: 'musica',
      morningTime: '10:30',
      afternoonTime: '15:30'
    };
  });

  useEffect(() => {
    safeLocalStorage.setItem('animar_suggestion_rules', JSON.stringify(suggestionRules));
  }, [suggestionRules]);

  // Helper to request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('As notificações não são suportadas pelo seu navegador.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('AnimaLar', {
          body: 'Notificações de atividades ativadas com sucesso!',
          tag: 'animalar_welcome'
        });
      }
    } catch (err) {
      console.error('Erro ao pedir permissão de notificações:', err);
    }
  };

  // Check for upcoming scheduled activities every 30 seconds
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkUpcomingActivities = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDateString = `${year}-${month}-${day}`;

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const nowTotalMinutes = currentHours * 60 + currentMinutes;

      // Find uncompleted activities scheduled for today
      const upcoming = scheduledActivities.filter(act => {
        if (act.completed) return false;
        if (act.date !== currentDateString) return false;
        if (!act.time) return false;

        const [actHours, actMinutes] = act.time.split(':').map(Number);
        if (isNaN(actHours) || isNaN(actMinutes)) return false;

        const actTotalMinutes = actHours * 60 + actMinutes;
        const diff = actTotalMinutes - nowTotalMinutes;

        // Notify if it starts within 15 minutes and hasn't started more than 2 minutes ago
        return diff >= -2 && diff <= 15;
      });

      upcoming.forEach(act => {
        if (!notifiedIds.includes(act.id)) {
          const [actHours, actMinutes] = act.time.split(':').map(Number);
          const actTotalMinutes = actHours * 60 + actMinutes;
          const diff = actTotalMinutes - nowTotalMinutes;

          let bodyMessage = '';
          if (diff === 0) {
            bodyMessage = `A atividade "${act.title}" começa agora mesmo às ${act.time}!`;
          } else if (diff < 0) {
            bodyMessage = `A atividade "${act.title}" já começou às ${act.time}!`;
          } else {
            bodyMessage = `A atividade "${act.title}" está prestes a começar às ${act.time} (daqui a ${diff} minutos).`;
          }

          try {
            const notif = new Notification('AnimaLar - Alerta de Atividade', {
              body: bodyMessage,
              requireInteraction: true,
              tag: act.id
            });

            notif.onclick = () => {
              window.focus();
            };

            setNotifiedIds(prev => {
              const updated = [...prev, act.id];
              safeLocalStorage.setItem('animar_notified_activities', JSON.stringify(updated));
              return updated;
            });
          } catch (e) {
            console.error('Error triggering Notification:', e);
          }
        }
      });
    };

    // Run once on load/state change
    checkUpcomingActivities();

    const intervalId = setInterval(checkUpcomingActivities, 30000);
    return () => clearInterval(intervalId);
  }, [scheduledActivities, notificationPermission, notifiedIds]);

  // Load initial data from SQLite server if available
  useEffect(() => {
    if (isStandalone) return;

    const loadServerData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const dbData = await response.json();
          if (dbData.residents && dbData.residents.length > 0) {
            setResidents(dbData.residents);
            setScheduledActivities(dbData.scheduledActivities || []);
            setProgressLogs(dbData.progressLogs || []);
            setReminders(ensureUniqueReminders(dbData.reminders || []));
            console.log("Dados sincronizados da base de dados SQLite do servidor.");
          } else {
            console.log("A base de dados SQLite está vazia. Enviando dados locais para povoar...");
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                residents,
                scheduledActivities,
                progressLogs,
                reminders
              })
            });
          }
        }
      } catch (err) {
        console.warn("Servidor SQLite não acessível. Usando armazenamento local offline.", err);
      }
    };

    loadServerData();
  }, []);

  // Synchronize with SQLite server on background state change
  useEffect(() => {
    if (isStandalone) return;

    const syncWithServer = async () => {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residents,
            scheduledActivities,
            progressLogs,
            reminders
          })
        });
      } catch (err) {
        console.warn("Erro ao sincronizar dados com SQLite do servidor:", err);
      }
    };

    const timer = setTimeout(syncWithServer, 500);
    return () => clearTimeout(timer);
  }, [residents, scheduledActivities, progressLogs, reminders]);

  // Batch Logging Modal State
  const [activeLogActivity, setActiveLogActivity] = useState<ScheduledActivity | null>(null);
  const [batchLogData, setBatchLogData] = useState<Record<string, {
    participated: boolean;
    participation: 'alta' | 'media' | 'baixa' | 'recusou';
    cognitiveScore: number;
    physicalScore: number;
    socialScore: number;
    notes: string;
  }>>({});

  // Sync to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('animar_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    safeLocalStorage.setItem('animar_scheduled', JSON.stringify(scheduledActivities));
  }, [scheduledActivities]);

  useEffect(() => {
    safeLocalStorage.setItem('animar_logs', JSON.stringify(progressLogs));
  }, [progressLogs]);

  useEffect(() => {
    safeLocalStorage.setItem('animar_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    safeLocalStorage.setItem('animar_activities', JSON.stringify(activities));
  }, [activities]);

  const handleAddActivity = (newAct: Omit<Activity, 'id'>) => {
    const id = `custom_${Date.now()}`;
    setActivities([...activities, { ...newAct, id }]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handleUpdateActivity = (updatedAct: Activity) => {
    setActivities(activities.map(a => a.id === updatedAct.id ? updatedAct : a));
  };

  // Handler: Import full backup data
  const handleImportData = (data: {
    residents: Resident[];
    scheduledActivities: ScheduledActivity[];
    progressLogs: ResidentProgressLog[];
    reminders: Reminder[];
  }) => {
    if (data.residents) setResidents(data.residents);
    if (data.scheduledActivities) setScheduledActivities(data.scheduledActivities);
    if (data.progressLogs) setProgressLogs(data.progressLogs);
    if (data.reminders) setReminders(ensureUniqueReminders(data.reminders));
  };

  // Handler: Add New Resident
  const handleAddResident = (newRes: Omit<Resident, 'id'>) => {
    const id = `res_${Date.now()}`;
    setResidents([...residents, { ...newRes, id }]);
  };

  // Handler: Delete Resident
  const handleDeleteResident = (id: string) => {
    setResidents(residents.filter(r => r.id !== id));
    setProgressLogs(progressLogs.filter(log => log.residentId !== id));
  };

  // Handler: Update Resident
  const handleUpdateResident = (updatedRes: Resident) => {
    setResidents(residents.map(r => r.id === updatedRes.id ? updatedRes : r));
  };

  // Handler: Add Scheduled Activity
  const handleAddScheduledActivity = (newAct: Omit<ScheduledActivity, 'id'>) => {
    const id = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setScheduledActivities(prev => [...prev, { ...newAct, id }]);

    // Add automatic reminder for this scheduled activity
    const activityReminder: Reminder = {
      id: `rem_auto_${id}`,
      text: `Executar a atividade planeada: "${newAct.title}" agendada para as ${newAct.time}.`,
      date: newAct.date,
      type: 'atividade',
      completed: false
    };
    setReminders(prev => ensureUniqueReminders([activityReminder, ...prev]));
  };

  // Handler: Add Multiple Scheduled Activities
  const handleAddScheduledActivities = (newActs: Omit<ScheduledActivity, 'id'>[]) => {
    const now = Date.now();
    const newScheduled = newActs.map((act, index) => ({
      ...act,
      id: `sch_${now}_${index}_${Math.random().toString(36).substr(2, 5)}`
    }));

    setScheduledActivities(prev => [...prev, ...newScheduled]);

    const newReminders = newScheduled.map(act => ({
      id: `rem_auto_${act.id}`,
      text: `Executar a atividade planeada: "${act.title}" agendada para as ${act.time}.`,
      date: act.date,
      type: 'atividade' as const,
      completed: false
    }));

    setReminders(prev => ensureUniqueReminders([...newReminders, ...prev]));
  };

  // Handler: Toggle complete scheduled activity
  const handleToggleCompleteActivity = (id: string) => {
    setScheduledActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, completed: !act.completed } : act))
    );
  };

  // Handler: Delete scheduled activity
  const handleDeleteScheduledActivity = (id: string) => {
    setScheduledActivities(prev => prev.filter(act => act.id !== id));
    // Also clear associated automatic reminder if exists
    setReminders(prev => prev.filter(r => r.id !== `rem_auto_${id}`));
  };

  const handleUpdateScheduledActivity = (updatedAct: ScheduledActivity) => {
    setScheduledActivities(prev => prev.map(act => act.id === updatedAct.id ? updatedAct : act));
    // Also update associated automatic reminder if exists
    setReminders(prev => prev.map(r => {
      if (r.id === `rem_auto_${updatedAct.id}`) {
        return {
          ...r,
          text: `Executar a atividade planeada: "${updatedAct.title}" agendada para as ${updatedAct.time}.`,
          date: updatedAct.date
        };
      }
      return r;
    }));
  };

  const handleReorderScheduledActivities = (reorderedForDay: ScheduledActivity[], dateStr: string) => {
    setScheduledActivities(prev => {
      const otherDays = prev.filter(a => a.date !== dateStr);
      return [...otherDays, ...reorderedForDay];
    });
  };

  // Handler: Manual add individual progress log
  const handleAddProgressLog = (newLog: Omit<ResidentProgressLog, 'id'>) => {
    const id = `log_${Date.now()}`;
    setProgressLogs([ { ...newLog, id }, ...progressLogs]);
  };

  // Reminders Management
  const handleToggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(rem => (rem.id === id ? { ...rem, completed: !rem.completed } : rem))
    );
  };

  const handleAddReminder = (text: string, type: 'atividade' | 'saude' | 'geral', date: string) => {
    const id = `rem_${Date.now()}`;
    const newRem: Reminder = { id, text, type, date, completed: false };
    setReminders(ensureUniqueReminders([newRem, ...reminders]));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Open Batch Logging Modal
  const handleOpenParticipationLog = (activity: ScheduledActivity) => {
    // Pre-populate batch data with defaults for all current residents
    const initialBatch: Record<string, any> = {};
    residents.forEach(res => {
      // Find matching categories to adapt scores
      initialBatch[res.id] = {
        participated: true,
        participation: 'alta',
        cognitiveScore: res.cognitiveLevel === 'Grave' ? 2 : 4,
        physicalScore: res.physicalLevel === 'Cadeira de Rodas' ? 2 : 3,
        socialScore: 4,
        notes: ''
      };
    });
    setBatchLogData(initialBatch);
    setActiveLogActivity(activity);
  };

  // Save Batch Logging Attendance
  const handleSaveBatchLogs = () => {
    if (!activeLogActivity) return;

    const newLogs: ResidentProgressLog[] = [];
    residents.forEach(res => {
      const data = batchLogData[res.id];
      if (data && data.participated) {
        newLogs.push({
          id: `log_batch_${res.id}_${activeLogActivity.id}_${Date.now()}`,
          residentId: res.id,
          scheduledActivityId: activeLogActivity.id,
          date: activeLogActivity.date,
          activityTitle: activeLogActivity.title,
          category: activeLogActivity.category,
          participation: data.participation,
          cognitiveScore: data.cognitiveScore,
          physicalScore: data.physicalScore,
          socialScore: data.socialScore,
          notes: data.notes.trim() || `Participação normal na atividade de ${activeLogActivity.title}.`
        });
      }
    });

    setProgressLogs(prev => [...newLogs, ...prev]);

    // Mark the scheduled activity as completed
    setScheduledActivities(prev =>
      prev.map(act => (act.id === activeLogActivity.id ? { ...act, completed: true } : act))
    );

    // Also toggle the associated reminder to completed if it exists
    setReminders(prev =>
      prev.map(r => r.id === `rem_auto_${activeLogActivity.id}` ? { ...r, completed: true } : r)
    );

    setActiveLogActivity(null);
  };

  // Compute stats for top cards
  const completedTodayCount = scheduledActivities.filter(
    a => a.date === '2026-07-13' && a.completed
  ).length;

  const totalTodayCount = scheduledActivities.filter(
    a => a.date === '2026-07-13'
  ).length;

  const activeRemindersCount = reminders.filter(r => !r.completed).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-700 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-500 w-full shrink-0 print:hidden"></div>

      {/* Primary Application Header (Hidden on Print) */}
      <header className="bg-white border-b border-gray-100 py-4 px-4 md:px-10 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="w-full flex flex-col gap-4">
          
          {/* Top Row: Logo & App Branding + Reduced Date */}
          <div className="flex flex-row items-center justify-between gap-2 w-full">
            {/* Logo & App Branding */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                <Heart className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-extrabold text-slate-800 text-sm sm:text-lg leading-none tracking-tight">
                    AnimaLar
                  </h1>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.2 rounded shrink-0">
                    Sociocultural
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium font-mono mt-0.5 max-w-[140px] xs:max-w-[200px] sm:max-w-none truncate sm:whitespace-normal">
                  Gestor de Estimulação & Rotinas de Animação
                </p>
              </div>
            </div>

            {/* Time & Quick Indicator - Reduced for mobile & placed in top right */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium bg-slate-50 border border-gray-100 px-2 py-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-mono shrink-0">13 Julho 2026</span>
              </div>
            </div>
          </div>

          {/* Bottom Row (Mobile/Tablet Only): Menus (tabs switcher) placed on the line where the date currently is */}
          <div className="lg:hidden w-full border-t border-gray-50 pt-3 print:hidden">
            <div className="flex flex-row gap-1.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
              <button
                onClick={() => setCurrentTab('planner')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'planner'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Plano Mensal / Diário</span>
              </button>

              <button
                onClick={() => setCurrentTab('residents')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'residents'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Utentes & Progresso</span>
              </button>

              <button
                onClick={() => setCurrentTab('activities')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'activities'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Atividades</span>
              </button>

              <button
                onClick={() => setCurrentTab('materials')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'materials'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Material de Apoio</span>
              </button>

              <button
                onClick={() => setCurrentTab('reminders')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'reminders'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>Lembretes ({activeRemindersCount})</span>
              </button>

              <button
                onClick={() => setCurrentTab('print')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'print'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Imprimir Mural</span>
              </button>

              <button
                onClick={() => setCurrentTab('database')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  currentTab === 'database'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Base de Dados</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-6 items-start print:flex-col print:p-0 print:gap-0">
        
        {/* Left Sidebar Menu (Hidden on Print) */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4 print:hidden" id="left-sidebar">
          
          {/* Tabs Switcher Card */}
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xs lg:flex flex-col gap-3 hidden">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-2 tracking-wider hidden lg:block">Navegação</span>
            
            <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
              <Tooltip position="right" content="Plano Diário: Agenda de estimulação, listagem e controle de atividades agendadas">
                <button
                  onClick={() => setCurrentTab('planner')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'planner'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-planner"
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">Plano Mensal / Diário</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Utentes & Progresso: Fichas clínicas individuais, notas de evolução e relatórios">
                <button
                  onClick={() => setCurrentTab('residents')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'residents'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-residents"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Utentes & Progresso</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Catálogo de Atividades: Biblioteca de rotinas de animação sociocultural catalogadas">
                <button
                  onClick={() => setCurrentTab('activities')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'activities'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-activities"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Atividades</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Material de Apoio: Fichas, cartões, rimas, letras e mapas prontos para imprimir">
                <button
                  onClick={() => setCurrentTab('materials')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'materials'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-materials"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">Material de Apoio</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Lembretes & Alertas: Gestor de avisos médicos, tarefas diárias e rotinas importantes">
                <button
                  onClick={() => setCurrentTab('reminders')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'reminders'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-reminders"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span className="truncate">Lembretes & Alertas ({activeRemindersCount})</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Imprimir Mural: Visualização otimizada para impressão física e exposição no mural do lar">
                <button
                  onClick={() => setCurrentTab('print')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'print'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-print"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span className="truncate">Imprimir Mural</span>
                </button>
              </Tooltip>
              <Tooltip position="right" content="Base de Dados: Salvaguarda, importação e exportação de dados em servidores SQLite/locais">
                <button
                  onClick={() => setCurrentTab('database')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink-1 lg:w-full ${
                    currentTab === 'database'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-database"
                >
                  <Database className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">Base de Dados</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Atividades de Hoje</span>
                <p className="font-display font-black text-lg text-slate-800 leading-none">
                  {completedTodayCount} <span className="text-[10px] font-medium text-gray-400 block sm:inline lg:block">de {totalTodayCount} concluintes</span>
                </p>
              </div>
              <Tooltip position="left" content="Progresso do Dia: Relação entre as atividades concluídas e o total agendado para hoje">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </Tooltip>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Utentes Ativos</span>
                <p className="font-display font-black text-lg text-slate-800 leading-none">
                  {residents.length} <span className="text-[10px] font-medium text-gray-400 block sm:inline lg:block">inscritos</span>
                </p>
              </div>
              <Tooltip position="left" content="Utentes Ativos: Total de utentes atualmente acompanhados nos planos de estimulação">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
              </Tooltip>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Métrica de Engajamento</span>
                <p className="font-display font-black text-lg text-slate-800 leading-none">
                  {residents.length > 0 ? '82%' : '0%'} <span className="text-[10px] font-medium text-gray-400 block sm:inline lg:block">envolvimento</span>
                </p>
              </div>
              <Tooltip position="left" content="Índice de Envolvimento: Nível médio de adesão e participação dos utentes nas sessões">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </Tooltip>
            </div>

          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 w-full flex flex-col space-y-6">
          
          {/* Tab Panel Renderings */}
          <div className="w-full">
          {currentTab === 'planner' && (
            <CalendarView
              scheduledActivities={scheduledActivities}
              residents={residents}
              activities={activities}
              suggestionRules={suggestionRules}
              onAddScheduledActivity={handleAddScheduledActivity}
              onAddScheduledActivities={handleAddScheduledActivities}
              onToggleCompleteActivity={handleToggleCompleteActivity}
              onDeleteScheduledActivity={handleDeleteScheduledActivity}
              onUpdateScheduledActivity={handleUpdateScheduledActivity}
              onOpenParticipationLog={handleOpenParticipationLog}
              onReorderScheduledActivities={handleReorderScheduledActivities}
            />
          )}

          {currentTab === 'residents' && (
            <ResidentsList
              residents={residents}
              progressLogs={progressLogs}
              onAddResident={handleAddResident}
              onAddProgressLog={handleAddProgressLog}
              onDeleteResident={handleDeleteResident}
              onUpdateResident={handleUpdateResident}
            />
          )}

          {currentTab === 'activities' && (
            <ActivitiesPanel
              activities={activities}
              scheduledActivities={scheduledActivities}
              suggestionRules={suggestionRules}
              onSetSuggestionRules={setSuggestionRules}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivity={handleUpdateActivity}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'materials' && (
            <SupportMaterialsPanel />
          )}

          {currentTab === 'reminders' && (
            <RemindersPanel
              reminders={reminders}
              residents={residents}
              progressLogs={progressLogs}
              scheduledActivities={scheduledActivities}
              onToggleReminder={handleToggleReminder}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          )}

           {currentTab === 'print' && (
            <PrintPreview scheduledActivities={scheduledActivities} />
          )}

          {currentTab === 'database' && (
            <DatabaseManager
              residents={residents}
              scheduledActivities={scheduledActivities}
              progressLogs={progressLogs}
              reminders={reminders}
              onImportData={handleImportData}
              isStandalone={isStandalone}
            />
          )}
        </div>
      </div>

      </main>

      {/* Application Footer (Hidden on Print) */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium shrink-0 print:hidden">
        <p>© 2026 AnimaLar Sociocultural — Gestor de Estimulação & Rotinas de Animação, desenvolvido para Carina Fontes</p>
      </footer>

      {/* BATCH ATTENDANCE & LOG PROGRESS MODAL */}
      {activeLogActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="batch-logging-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-sans">
                  Registo Coletivo de Progresso
                </span>
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base mt-1">
                  Avaliar Utentes — {activeLogActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLogActivity(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List residents for attendance check */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {residents.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-xs italic">Não existem utentes inscritos para avaliar.</p>
              ) : (
                residents.map(res => {
                  const state = batchLogData[res.id] || {
                    participated: false,
                    participation: 'alta',
                    cognitiveScore: 3,
                    physicalScore: 3,
                    socialScore: 3,
                    notes: ''
                  };

                  return (
                    <div
                      key={res.id}
                      className={`p-3 rounded-xl border transition-all ${
                        state.participated ? 'bg-indigo-50/20 border-indigo-100' : 'bg-slate-50/50 border-gray-100 opacity-60'
                      }`}
                      id={`batch-row-${res.id}`}
                    >
                      {/* Top row: Checkbox + info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={state.participated}
                            onChange={(e) => setBatchLogData({
                              ...batchLogData,
                              [res.id]: { ...state, participated: e.target.checked }
                            })}
                            className="w-4.5 h-4.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div>
                            <span className="font-display font-semibold text-xs text-slate-800 block">
                              {res.name}
                            </span>
                            <span className="text-[9px] font-medium text-gray-400">
                              Cognição: {res.cognitiveLevel} | Mobilidade: {res.physicalLevel}
                            </span>
                          </div>
                        </label>

                        {/* Status Select */}
                        {state.participated && (
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Participação:</span>
                            <select
                              value={state.participation}
                              onChange={(e) => setBatchLogData({
                                ...batchLogData,
                                [res.id]: { ...state, participation: e.target.value as any }
                              })}
                              className="text-[10px] font-bold p-1 border border-gray-200 rounded-md bg-white"
                            >
                              <option value="alta">Alta (Ativo) ✓✓</option>
                              <option value="media">Média (Participativo) ✓</option>
                              <option value="baixa">Baixa (Apático)</option>
                              <option value="recusou">Recusou / Não quis ✕</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Advanced ratings (only if participated is checked) */}
                      {state.participated && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {/* Cognitive */}
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <div className="flex justify-between text-[9px] font-semibold text-purple-700 mb-1">
                              <span>Cognição/Atenção</span>
                              <span>{state.cognitiveScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={state.cognitiveScore}
                              onChange={(e) => setBatchLogData({
                                ...batchLogData,
                                [res.id]: { ...state, cognitiveScore: parseInt(e.target.value) }
                              })}
                              className="w-full accent-purple-600 cursor-pointer scale-90"
                            />
                          </div>

                          {/* Physical */}
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <div className="flex justify-between text-[9px] font-semibold text-amber-700 mb-1">
                              <span>Mobilidade/Físico</span>
                              <span>{state.physicalScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={state.physicalScore}
                              onChange={(e) => setBatchLogData({
                                ...batchLogData,
                                [res.id]: { ...state, physicalScore: parseInt(e.target.value) }
                              })}
                              className="w-full accent-amber-600 cursor-pointer scale-90"
                            />
                          </div>

                          {/* Social */}
                          <div className="bg-white p-2 rounded-lg border border-gray-100">
                            <div className="flex justify-between text-[9px] font-semibold text-blue-700 mb-1">
                              <span>Socialização/Humor</span>
                              <span>{state.socialScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={state.socialScore}
                              onChange={(e) => setBatchLogData({
                                ...batchLogData,
                                [res.id]: { ...state, socialScore: parseInt(e.target.value) }
                              })}
                              className="w-full accent-blue-600 cursor-pointer scale-90"
                            />
                          </div>

                          {/* Custom Observation Note */}
                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              placeholder="Observação rápida (ex: demonstrou boa recordação lírica)"
                              value={state.notes}
                              onChange={(e) => setBatchLogData({
                                ...batchLogData,
                                [res.id]: { ...state, notes: e.target.value }
                              })}
                              className="w-full text-[11px] p-2 border border-gray-200 rounded-lg bg-white mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveLogActivity(null)}
                className="text-xs px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveBatchLogs}
                className="text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                id="btn-save-batch-logs"
              >
                <UserCheck className="w-4 h-4" />
                Gravar Avaliações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
