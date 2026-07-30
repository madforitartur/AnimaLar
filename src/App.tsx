import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import logoUrl from './assets/images/lar_santo_antonio_logo_official_1784530465177.jpg';
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
import { InstallPrompt } from './components/InstallPrompt';

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
  BookOpen,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  ExternalLink,
  RefreshCw
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

export const getTodayStr = (): string => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayFormatted = (): string => {
  const today = new Date();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
};

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

const ensureDailyLeituraJornal = (
  list: ScheduledActivity[],
  rules?: SuggestionRules,
  deletedDates?: string[]
): ScheduledActivity[] => {
  const existingMap = new Map<string, ScheduledActivity>();
  list.forEach(act => {
    if (act.activityId === 'act_leitura_jornal' || act.id.startsWith('sch_leitura_jornal_')) {
      existingMap.set(act.date, act);
    }
  });

  const updatedList = list.filter(act => act.activityId !== 'act_leitura_jornal' && !act.id.startsWith('sch_leitura_jornal_'));

  const years = [2025, 2026, 2027];
  const deletedSet = new Set(deletedDates || []);
  const activeDaysSet = new Set(rules?.activeDays || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

  const getPortugueseWeekday = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const mapping = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return mapping[dayOfWeek];
  };

  const finalActs: ScheduledActivity[] = [...updatedList];

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const weekday = getPortugueseWeekday(dateStr);

        const shouldSchedule = activeDaysSet.has(weekday) && !deletedSet.has(dateStr);
        const existing = existingMap.get(dateStr);

        if (shouldSchedule) {
          if (existing) {
            finalActs.push({ ...existing, time: '08:00' });
          } else {
            let isCompleted = false;
            if (year === 2026 && month === 7) {
              isCompleted = day < 13;
            }
            finalActs.push({
              id: `sch_leitura_jornal_${dateStr}`,
              activityId: 'act_leitura_jornal',
              title: 'Atividade de Estimulação Cognitiva - Intelectuais / Formativas - Leitura do Jornal',
              description: 'Leitura diária comentada de notícias, efemérides e debates sobre temas atuais nacionais e internacionais para exercitar a atenção, raciocínio de atualidades e interação social.',
              category: 'cognitiva',
              date: dateStr,
              slot: 'manha',
              time: '08:00',
              completed: isCompleted
            });
          }
        }
      }
    }
  }

  if (list.length === finalActs.length) {
    const listMap = new Map<string, ScheduledActivity>();
    list.forEach(a => listMap.set(a.id, a));
    
    const isIdentical = finalActs.every(a => {
      const orig = listMap.get(a.id);
      if (!orig) return false;
      return (
        orig.time === a.time &&
        orig.completed === a.completed &&
        orig.title === a.title &&
        orig.date === a.date &&
        orig.category === a.category
      );
    });

    if (isIdentical) {
      return list;
    }
  }

  return finalActs;
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

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem('animar_theme_mode') === 'dark';
  });

  useEffect(() => {
    safeLocalStorage.setItem('animar_theme_mode', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Core Database States (Persisted in LocalStorage)
  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_residents');
      if (saved) {
        const parsed: Resident[] = JSON.parse(saved);
        return parsed.filter(r => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(r.id));
      }
    } catch (e) {
      console.error("Erro ao analisar residentes guardados em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.residents) {
      return (offlineData.residents as Resident[]).filter(r => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(r.id));
    }
    return INITIAL_RESIDENTS;
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
      maxPhysicalDaysPerWeek: 3,
      physicalDaysConfig: {
        'Seg': 'manha',
        'Qua': 'manha',
        'Sex': 'manha'
      },
      maxCognitiveDaysPerWeek: 5,
      cognitiveDaysConfig: {
        'Seg': 'tarde',
        'Ter': 'manha',
        'Qua': 'tarde',
        'Qui': 'manha',
        'Sex': 'tarde'
      },
      maxMusicDaysPerWeek: 2,
      musicDaysConfig: {
        'Ter': 'tarde',
        'Qui': 'tarde'
      },
      maxSensoryDaysPerWeek: 2,
      sensoryDaysConfig: {},
      maxArtisticDaysPerWeek: 2,
      artisticDaysConfig: {},
      maxOtherDaysPerWeek: 2,
      otherDaysConfig: {},
      morningCategoryPreference: 'aleatorio',
      afternoonCategoryPreference: 'aleatorio',
      morningTime: '10:30',
      afternoonTime: '15:30'
    };
  });

  useEffect(() => {
    safeLocalStorage.setItem('animar_suggestion_rules', JSON.stringify(suggestionRules));
  }, [suggestionRules]);

  const [deletedLeituraJornalDates, setDeletedLeituraJornalDates] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_deleted_leitura_jornal_dates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing deleted leitura jornal dates:', e);
      return [];
    }
  });

  useEffect(() => {
    safeLocalStorage.setItem('animar_deleted_leitura_jornal_dates', JSON.stringify(deletedLeituraJornalDates));
  }, [deletedLeituraJornalDates]);

  const [scheduledActivities, _setScheduledActivities] = useState<ScheduledActivity[]>(() => {
    let baseList: ScheduledActivity[] = [];
    try {
      const saved = safeLocalStorage.getItem('animar_scheduled');
      if (saved) {
        baseList = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao analisar atividades agendadas guardadas em localStorage:", e);
    }

    if (baseList.length === 0) {
      const offlineData = (window as any).INITIAL_OFFLINE_DATA;
      if (offlineData && offlineData.scheduledActivities) {
        baseList = offlineData.scheduledActivities;
      } else {
        baseList = getInitialScheduledActivities();
      }
    }

    // Load initial values from localStorage directly since state variables might be uninitialized during lazy initializers, or we can use the default rules/deleted dates as fallback.
    const savedRulesStr = safeLocalStorage.getItem('animar_suggestion_rules');
    let rulesVal = { activeDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] };
    if (savedRulesStr) {
      try { rulesVal = JSON.parse(savedRulesStr); } catch(e){}
    }
    const savedDeletedStr = safeLocalStorage.getItem('animar_deleted_leitura_jornal_dates');
    let deletedVal: string[] = [];
    if (savedDeletedStr) {
      try { deletedVal = JSON.parse(savedDeletedStr); } catch(e){}
    }

    return ensureDailyLeituraJornal(baseList, rulesVal as SuggestionRules, deletedVal);
  });

  const setScheduledActivities = (
    value: ScheduledActivity[] | ((prev: ScheduledActivity[]) => ScheduledActivity[])
  ) => {
    _setScheduledActivities(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      return ensureDailyLeituraJornal(next, suggestionRules, deletedLeituraJornalDates);
    });
  };

  useEffect(() => {
    _setScheduledActivities(prev => {
      return ensureDailyLeituraJornal(prev, suggestionRules, deletedLeituraJornalDates);
    });
  }, [suggestionRules, deletedLeituraJornalDates]);

  const [progressLogs, setProgressLogs] = useState<ResidentProgressLog[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('animar_logs');
      if (saved) {
        const parsed: ResidentProgressLog[] = JSON.parse(saved);
        return parsed.filter(l => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(l.residentId));
      }
    } catch (e) {
      console.error("Erro ao analisar registos de progresso guardados em localStorage:", e);
    }
    const offlineData = (window as any).INITIAL_OFFLINE_DATA;
    if (offlineData && offlineData.progressLogs) {
      return (offlineData.progressLogs as ResidentProgressLog[]).filter(l => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(l.residentId));
    }
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

  // Google Drive Status State
  const [gdriveStatus, setGdriveStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [gdriveLastSyncedAt, setGdriveLastSyncedAt] = useState<string | null>(null);

  // Load initial data from SQLite server if available
  useEffect(() => {
    if (isStandalone) return;

    const loadServerData = async () => {
      try {
        setGdriveStatus('syncing');
        const response = await fetch('/api/data');
        if (response.ok) {
          const dbData = await response.json();
          if (dbData.residents) {
            const cleanResidents = (dbData.residents as Resident[]).filter(r => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(r.id));
            const cleanLogs = ((dbData.progressLogs || []) as ResidentProgressLog[]).filter(l => !['res_1', 'res_2', 'res_3', 'res_4', 'res_5'].includes(l.residentId));
            setResidents(cleanResidents);
            setScheduledActivities(dbData.scheduledActivities || []);
            setProgressLogs(cleanLogs);
            setReminders(ensureUniqueReminders(dbData.reminders || []));
            if (dbData.suggestionRules) {
              setSuggestionRules(dbData.suggestionRules);
            }
            if (dbData.activities && Array.isArray(dbData.activities) && dbData.activities.length > 0) {
              setActivities(dbData.activities);
            }
            if (dbData.settings) {
              if (typeof dbData.settings.isDarkMode === 'boolean') {
                setIsDarkMode(dbData.settings.isDarkMode);
              }
              if (Array.isArray(dbData.settings.deletedLeituraJornalDates)) {
                setDeletedLeituraJornalDates(dbData.settings.deletedLeituraJornalDates);
              }
            }
            console.log("Dados sincronizados da base de dados SQLite do servidor.");
            setGdriveStatus('synced');
            setGdriveLastSyncedAt(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
          } else {
            console.log("A base de dados SQLite está vazia. Enviando dados locais para povoar...");
            const syncRes = await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                residents,
                scheduledActivities,
                progressLogs,
                reminders,
                suggestionRules,
                activities,
                settings: {
                  isDarkMode,
                  deletedLeituraJornalDates
                }
              })
            });
            if (syncRes.ok) {
              setGdriveStatus('synced');
              setGdriveLastSyncedAt(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
            } else {
              setGdriveStatus('error');
            }
          }
        } else {
          setGdriveStatus('error');
        }
      } catch (err) {
        console.warn("Servidor SQLite não acessível. Usando armazenamento local offline.", err);
        setGdriveStatus('error');
      }
    };

    loadServerData();
  }, []);

  // Synchronize with SQLite server and Google Drive on background state change
  useEffect(() => {
    if (isStandalone) return;

    const syncWithServer = async () => {
      try {
        setGdriveStatus('syncing');
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residents,
            scheduledActivities,
            progressLogs,
            reminders,
            suggestionRules,
            activities,
            settings: {
              isDarkMode,
              deletedLeituraJornalDates
            }
          })
        });
        if (response.ok) {
          setGdriveStatus('synced');
          setGdriveLastSyncedAt(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setGdriveStatus('error');
        }
      } catch (err) {
        console.warn("Erro ao sincronizar dados com SQLite do servidor:", err);
        setGdriveStatus('error');
      }
    };

    const timer = setTimeout(syncWithServer, 500);
    return () => clearTimeout(timer);
  }, [residents, scheduledActivities, progressLogs, reminders, suggestionRules, activities, isDarkMode, deletedLeituraJornalDates]);

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
    suggestionRules?: SuggestionRules;
    activities?: Activity[];
    settings?: any;
  }) => {
    if (data.residents) setResidents(data.residents);
    if (data.scheduledActivities) setScheduledActivities(data.scheduledActivities);
    if (data.progressLogs) setProgressLogs(data.progressLogs);
    if (data.reminders) setReminders(ensureUniqueReminders(data.reminders));
    if (data.suggestionRules) setSuggestionRules(data.suggestionRules);
    if (data.activities && Array.isArray(data.activities)) setActivities(data.activities);
    if (data.settings) {
      if (typeof data.settings.isDarkMode === 'boolean') setIsDarkMode(data.settings.isDarkMode);
      if (Array.isArray(data.settings.deletedLeituraJornalDates)) setDeletedLeituraJornalDates(data.settings.deletedLeituraJornalDates);
    }
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
    if (newAct.activityId === 'act_leitura_jornal') {
      setDeletedLeituraJornalDates(prev => prev.filter(d => d !== newAct.date));
    }

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
  const handleAddScheduledActivities = (newActs: Omit<ScheduledActivity, 'id'>[], clearDates?: string[]) => {
    const datesToRemove = newActs
      .filter(act => act.activityId === 'act_leitura_jornal')
      .map(act => act.date);
    if (datesToRemove.length > 0) {
      setDeletedLeituraJornalDates(prev => prev.filter(d => !datesToRemove.includes(d)));
    }

    const now = Date.now();
    const newScheduled = newActs.map((act, index) => ({
      ...act,
      id: `sch_${now}_${index}_${Math.random().toString(36).substr(2, 5)}`
    }));

    const targetDates = new Set(clearDates && clearDates.length > 0 ? clearDates : newActs.map(act => act.date));

    setScheduledActivities(prev => {
      // Filter out pre-existing activities for target dates, but PRESERVE Leitura do Jornal
      const preserved = prev.filter(
        act => !targetDates.has(act.date) || act.activityId === 'act_leitura_jornal' || act.id.startsWith('sch_leitura_jornal_')
      );
      return [...preserved, ...newScheduled];
    });

    const newReminders = newScheduled.map(act => ({
      id: `rem_auto_${act.id}`,
      text: `Executar a atividade planeada: "${act.title}" agendada para as ${act.time}.`,
      date: act.date,
      type: 'atividade' as const,
      completed: false
    }));

    setReminders(prev => {
      const preservedReminders = prev.filter(r => !targetDates.has(r.date) || !r.id.startsWith('rem_auto_'));
      return ensureUniqueReminders([...newReminders, ...preservedReminders]);
    });
  };

  // Handler: Toggle complete scheduled activity
  const handleToggleCompleteActivity = (id: string) => {
    setScheduledActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, completed: !act.completed } : act))
    );
  };

  // Handler: Delete scheduled activity
  const handleDeleteScheduledActivity = (id: string) => {
    const act = scheduledActivities.find(a => a.id === id);
    if (act && (act.activityId === 'act_leitura_jornal' || act.id.startsWith('sch_leitura_jornal_'))) {
      if (!deletedLeituraJornalDates.includes(act.date)) {
        setDeletedLeituraJornalDates(prev => [...prev, act.date]);
      }
    }

    setScheduledActivities(prev => prev.filter(act => act.id !== id));
    // Also clear associated automatic reminder if exists
    setReminders(prev => prev.filter(r => r.id !== `rem_auto_${id}`));
  };

  const handleDeleteScheduledActivities = (ids: string[]) => {
    const idSet = new Set(ids);
    const deletedDates = scheduledActivities
      .filter(act => idSet.has(act.id) && (act.activityId === 'act_leitura_jornal' || act.id.startsWith('sch_leitura_jornal_')))
      .map(act => act.date);
    if (deletedDates.length > 0) {
      setDeletedLeituraJornalDates(prev => {
        const next = [...prev];
        deletedDates.forEach(d => {
          if (!next.includes(d)) next.push(d);
        });
        return next;
      });
    }

    setScheduledActivities(prev => prev.filter(act => !idSet.has(act.id)));
    setReminders(prev => prev.filter(r => {
      if (r.id.startsWith('rem_auto_')) {
        const actId = r.id.replace('rem_auto_', '');
        return !idSet.has(actId);
      }
      return true;
    }));
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

  const activeRemindersCount = reminders.filter(r => !r.completed).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-700'} font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200`}>
      
      {/* Decorative Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-500 w-full shrink-0 print:hidden"></div>

      {/* Primary Application Header (Hidden on Print) */}
      <header className={`border-b py-3 px-3 sm:px-4 md:px-10 sticky top-0 z-40 shadow-xs print:hidden transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-100'}`}>
        <div className="w-full max-w-full flex flex-col gap-3">
          
          {/* Top Row: Logo & App Branding + Date + Theme Toggle */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
            {/* Logo & App Branding (Lar de Santo António) */}
            <div className="flex items-center gap-2.5 sm:gap-4 select-none min-w-0 flex-1">
              <img 
                src={logoUrl} 
                alt="Logo Lar de Santo António" 
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-100 dark:border-slate-700 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className={`font-display font-extrabold text-xs sm:text-lg leading-tight tracking-tight truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Lar de Santo António
                  </h1>
                </div>
                <p className={`text-[8px] sm:text-xs font-medium leading-none mt-0.5 sm:mt-1 truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Rua Pedro Alvares Cabral, 165 Creixomil
                </p>
                <p className={`hidden sm:block text-[8px] sm:text-[10px] font-semibold font-mono mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  Tel: 253 521 801
                </p>
              </div>
            </div>

            {/* Time & Quick Indicator + Google Drive Status + Theme Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Google Drive Status Indicator */}
              {!isStandalone && (
                <Tooltip 
                  position="bottom" 
                  content={
                    gdriveStatus === 'synced'
                      ? `Google Drive: Sincronizado com Sucesso (${gdriveLastSyncedAt ? 'às ' + gdriveLastSyncedAt : 'Pasta Institucional'})`
                      : gdriveStatus === 'syncing'
                      ? 'Google Drive: A guardar dados na pasta...'
                      : 'Google Drive: Erro na ligação ao servidor'
                  }
                >
                  <a
                    href="https://drive.google.com/drive/folders/1q2Ky5732OVNJhtDpTUFikKEjkGmonp6n"
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold border px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg sm:rounded-xl shrink-0 transition-all cursor-pointer ${
                      gdriveStatus === 'synced'
                        ? isDarkMode
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        : gdriveStatus === 'syncing'
                        ? isDarkMode
                          ? 'bg-blue-950/60 border-blue-800/80 text-blue-300 hover:bg-blue-900/60'
                          : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                        : isDarkMode
                          ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                          : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                    id="header-gdrive-status-badge"
                  >
                    <div className="relative flex items-center justify-center">
                      <Cloud className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                        gdriveStatus === 'synced' ? 'text-emerald-500' : gdriveStatus === 'syncing' ? 'text-blue-500 animate-pulse' : 'text-amber-500'
                      }`} />
                      {gdriveStatus === 'synced' && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      )}
                    </div>
                    <span className="hidden min-[520px]:inline font-mono text-[10px] sm:text-xs font-bold">
                      {gdriveStatus === 'synced' ? 'GDrive Ativo' : gdriveStatus === 'syncing' ? 'GDrive a Guardar...' : 'GDrive Erro'}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
                  </a>
                </Tooltip>
              )}

              <div className={`hidden min-[480px]:flex items-center gap-1 text-[10px] sm:text-xs font-medium border px-2 py-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-gray-100 text-gray-500'}`}>
                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-mono shrink-0">{getTodayFormatted()}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 shadow-xs ring-1 ring-amber-400/20'
                    : 'bg-white border-gray-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
                title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro (Noturno - Reduz a fadiga ocular)'}
                id="theme-toggle-btn"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="hidden sm:inline">Modo Noturno</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Menu (Top Header - Desktop & Mobile) */}
          <nav className="w-full border-t border-gray-100 pt-3 print:hidden">
            <div className="flex flex-row items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth w-full">
              <Tooltip position="bottom" content="Plano Diário: Agenda de estimulação, listagem e controle de atividades agendadas">
                <button
                  onClick={() => setCurrentTab('planner')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'planner'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-planner"
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Plano Mensal / Diário</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Utentes & Progresso: Fichas clínicas individuais, notas de evolução e relatórios">
                <button
                  onClick={() => setCurrentTab('residents')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'residents'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-residents"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Utentes & Progresso</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Catálogo de Atividades: Biblioteca de rotinas de animação sociocultural catalogadas">
                <button
                  onClick={() => setCurrentTab('activities')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'activities'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-activities"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="whitespace-nowrap">Atividades</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Material de Apoio: Fichas, cartões, rimas, letras e mapas prontos para imprimir">
                <button
                  onClick={() => setCurrentTab('materials')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'materials'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-materials"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="whitespace-nowrap">Material de Apoio</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Lembretes & Alertas: Gestor de avisos médicos, tarefas diárias e rotinas importantes">
                <button
                  onClick={() => setCurrentTab('reminders')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'reminders'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-reminders"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Lembretes & Alertas ({activeRemindersCount})</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Imprimir Mural: Visualização otimizada para impressão física e exposição no mural do lar">
                <button
                  onClick={() => setCurrentTab('print')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'print'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-print"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Imprimir Mural</span>
                </button>
              </Tooltip>

              <Tooltip position="bottom" content="Base de Dados: Salvaguarda, importação e exportação de dados em servidores SQLite/locais">
                <button
                  onClick={() => setCurrentTab('database')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    currentTab === 'database'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id="tab-database"
                >
                  <Database className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="whitespace-nowrap">Base de Dados</span>
                </button>
              </Tooltip>
            </div>
          </nav>

        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 p-4 md:p-8 flex flex-col space-y-6 print:p-0 print:gap-0">
        
        {/* Content Area (Full Width) */}
        <div className="flex-1 w-full flex flex-col space-y-6">
          
          {/* Tab Panel Renderings */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full"
              >
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
                    onDeleteScheduledActivities={handleDeleteScheduledActivities}
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
                    suggestionRules={suggestionRules}
                    onImportData={handleImportData}
                    isStandalone={isStandalone}
                  />
                )}
              </motion.div>
            </AnimatePresence>
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

      {/* PWA Install Prompt for Mobile Devices */}
      <InstallPrompt />

    </div>
  );
}
