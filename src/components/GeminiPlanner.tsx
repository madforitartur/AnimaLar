import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Resident, ScheduledActivity, ActivityCategory, Activity, SuggestionRules } from '../types';
import {
  Sparkles,
  BrainCircuit,
  Activity as PhysIcon,
  Disc,
  Palette,
  Calendar,
  Check,
  Plus,
  Info,
  CalendarDays,
  Loader2,
  ListTodo,
  Smile,
  Clock,
  CheckCircle,
  Settings,
  ChevronRight,
  Sparkle,
  X
} from 'lucide-react';
import Tooltip from './Tooltip';

interface GeminiPlannerProps {
  residents: Resident[];
  activities: Activity[];
  suggestionRules: SuggestionRules;
  currentYear: number;
  currentMonth: number;
  selectedDateStr: string;
  calendarViewMode: 'mensal' | 'semanal';
  onAddScheduledActivity: (activity: Omit<ScheduledActivity, 'id'>) => void;
  onAddScheduledActivities?: (activities: Omit<ScheduledActivity, 'id'>[], clearDates?: string[]) => void;
  onClose: () => void;
}

export default function GeminiPlanner({
  residents,
  activities,
  suggestionRules,
  currentYear,
  currentMonth,
  selectedDateStr,
  calendarViewMode,
  onAddScheduledActivity,
  onAddScheduledActivities,
  onClose
}: GeminiPlannerProps) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'semana' | 'mes'>(calendarViewMode === 'semanal' ? 'semana' : 'mes');
  const [suggestions, setSuggestions] = useState<Omit<ScheduledActivity, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track scheduled states for individual indices
  const [scheduledIndices, setScheduledIndices] = useState<Record<number, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper: Get Monday date for any YYYY-MM-DD date
  const getMondayOfDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper: Get all dates for the current week starting on Monday
  const getWeekDates = (baseDateStr: string) => {
    const dates: string[] = [];
    const baseDate = new Date(baseDateStr);
    const dayOfW = baseDate.getDay();
    const shift = dayOfW === 0 ? -6 : 1 - dayOfW; // Shift to Monday
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + shift);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  // Helper: Get all dates for the current month
  const getMonthDates = (year: number, month: number) => {
    const dates: string[] = [];
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      dates.push(`${year}-${mm}-${dd}`);
    }
    return dates;
  };

  // Client-side rule-based scheduling algorithm
  const handleGenerateSuggestions = () => {
    if (activities.length === 0) {
      setError("Por favor, garanta que o catálogo de atividades não está vazio.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setScheduledIndices({});

    // Small delay to make it feel deliberate and premium
    setTimeout(() => {
      let targetDates: string[] = [];
      if (period === 'semana') {
        targetDates = getWeekDates(selectedDateStr);
      } else {
        targetDates = getMonthDates(currentYear, currentMonth);
      }

      const generated: Omit<ScheduledActivity, 'id'>[] = [];
      const weekdayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      // Weekly limit trackers: mondayDateStr -> category -> set of active dates scheduled
      const weeklyStats: Record<string, Record<ActivityCategory, Set<string>>> = {};
      
      // Rotation tracker for templates in this suggestion run to prevent immediate duplicates
      const usedActivityIds: Record<ActivityCategory, string[]> = {
        cognitiva: [],
        fisica: [],
        musica: [],
        outro: [],
      };

      targetDates.forEach(dateStr => {
        const dObj = new Date(dateStr);
        const dayName = weekdayMap[dObj.getDay()];
        
        // Only schedule on active days
        if (!suggestionRules.activeDays.includes(dayName)) {
          return;
        }

        // Always insert "Leitura do Jornal" as a daily cognitive routine at 08:00 AM
        generated.push({
          activityId: 'act_leitura_jornal',
          title: 'Atividade de Estimulação Cognitiva - Intelectuais / Formativas - Leitura do Jornal',
          description: 'Leitura diária comentada de notícias, efemérides e debates sobre temas atuais nacionais e internacionais para exercitar a atenção, raciocínio de atualidades e interação social.\n\n[Materiais de Apoio]: Jornais diários portugueses, Óculos de leitura adicionais, Lupa se necessário\n[Objetivos Terapêuticos]: Estimular a atenção focada, Promover o raciocínio crítico e verbalização, Manter contacto com a realidade quotidiana',
          category: 'cognitiva',
          date: dateStr,
          slot: 'manha',
          time: '08:00',
          completed: false,
        });

        const mondayStr = getMondayOfDate(dateStr);
        if (!weeklyStats[mondayStr]) {
          weeklyStats[mondayStr] = {
            cognitiva: new Set<string>(),
            fisica: new Set<string>(),
            musica: new Set<string>(),
            outro: new Set<string>(),
          };
        }

        // Two slots: morning and afternoon
        const slots: ('manha' | 'tarde')[] = ['manha', 'tarde'];

        slots.forEach(slot => {
          const pref = slot === 'manha' 
            ? suggestionRules.morningCategoryPreference 
            : suggestionRules.afternoonCategoryPreference;

          // Determine which categories are allowed under constraints
          const allowedCategories: ActivityCategory[] = [];
          
          const checkAllowed = (cat: ActivityCategory, limit: number) => {
            const currentSet = weeklyStats[mondayStr][cat];
            if (currentSet.has(dateStr)) {
              return true; // Already scheduled on this day, no additional cost
            }
            return currentSet.size < limit;
          };

          if (checkAllowed('cognitiva', suggestionRules.maxCognitiveDaysPerWeek)) {
            allowedCategories.push('cognitiva');
          }
          if (checkAllowed('fisica', suggestionRules.maxPhysicalDaysPerWeek)) {
            allowedCategories.push('fisica');
          }
          if (checkAllowed('musica', suggestionRules.maxMusicDaysPerWeek)) {
            allowedCategories.push('musica');
          }
          if (checkAllowed('outro', suggestionRules.maxOtherDaysPerWeek)) {
            allowedCategories.push('outro');
          }

          if (allowedCategories.length === 0) {
            // Absolute fallback: if constraints are too tight, use anything with a non-zero limit
            if (suggestionRules.maxCognitiveDaysPerWeek > 0) allowedCategories.push('cognitiva');
            else if (suggestionRules.maxPhysicalDaysPerWeek > 0) allowedCategories.push('fisica');
            else if (suggestionRules.maxMusicDaysPerWeek > 0) allowedCategories.push('musica');
            else allowedCategories.push('outro');
          }

          // Choose category based on preference or lowest relative usage
          let chosenCat: ActivityCategory = 'cognitiva';
          if (pref !== 'aleatorio' && allowedCategories.includes(pref as ActivityCategory)) {
            chosenCat = pref as ActivityCategory;
          } else {
            const sortedByUsage = [...allowedCategories].sort((a, b) => {
              return weeklyStats[mondayStr][a].size - weeklyStats[mondayStr][b].size;
            });
            chosenCat = sortedByUsage[0] || 'outro';
          }

          // Register stats
          weeklyStats[mondayStr][chosenCat].add(dateStr);

          // Get template
          const templates = activities.filter(act => act.category === chosenCat && act.id !== 'act_leitura_jornal');
          if (templates.length > 0) {
            let unused = templates.filter(t => !usedActivityIds[chosenCat].includes(t.id));
            if (unused.length === 0) {
              usedActivityIds[chosenCat] = []; // reset rotation
              unused = templates;
            }

            const pickedTemplate = unused[Math.floor(Math.random() * unused.length)] || templates[0];
            usedActivityIds[chosenCat].push(pickedTemplate.id);

            const time = slot === 'manha' ? suggestionRules.morningTime : suggestionRules.afternoonTime;

            generated.push({
              title: pickedTemplate.title,
              description: `${pickedTemplate.description}\n\n[Materiais de Apoio]: ${pickedTemplate.materials.join(', ')}\n[Objetivos Terapêuticos]: ${pickedTemplate.objectives.join(', ')}`,
              category: chosenCat,
              date: dateStr,
              slot,
              time,
              completed: false,
            });
          }
        });
      });

      if (generated.length === 0) {
        setError("Não foi possível gerar sugestões com as regras atuais. Certifique-se de que ativou dias da semana na sua configuração.");
      } else {
        setSuggestions(generated);
      }
      setLoading(false);
    }, 700);
  };

  // Generate automatically on open
  useEffect(() => {
    handleGenerateSuggestions();
  }, [period]);

  const handleScheduleSingle = (idx: number, act: Omit<ScheduledActivity, 'id'>) => {
    onAddScheduledActivity(act);
    setScheduledIndices(prev => ({ ...prev, [idx]: true }));
  };

  const handleScheduleAll = () => {
    const toSchedule = suggestions.filter((_, idx) => !scheduledIndices[idx]);
    if (toSchedule.length === 0) return;

    let targetDates: string[] = [];
    if (period === 'semana') {
      targetDates = getWeekDates(selectedDateStr);
    } else {
      targetDates = getMonthDates(currentYear, currentMonth);
    }

    if (onAddScheduledActivities) {
      onAddScheduledActivities(toSchedule, targetDates);
    } else {
      toSchedule.forEach(act => {
        onAddScheduledActivity(act);
      });
    }

    const allMarked: Record<number, boolean> = {};
    suggestions.forEach((_, idx) => {
      allMarked[idx] = true;
    });
    setScheduledIndices(allMarked);
    setShowToast(true);
  };

  const categoryLabels = {
    cognitiva: { label: 'Estimulação Cognitiva', icon: <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-50 text-purple-800 border-purple-100', accent: 'border-l-purple-500' },
    fisica: { label: 'Exercício Físico', icon: <PhysIcon className="w-3.5 h-3.5 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-100', accent: 'border-l-amber-500' },
    musica: { label: 'Musicoterapia', icon: <Disc className="w-3.5 h-3.5 text-blue-600" />, color: 'bg-blue-50 text-blue-800 border-blue-100', accent: 'border-l-blue-500' },
    outro: { label: 'Outras Atividades', icon: <Palette className="w-3.5 h-3.5 text-slate-600" />, color: 'bg-slate-50 text-slate-800 border-slate-100', accent: 'border-l-slate-500' },
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6" id="suggestion-planner-root">
      
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </span>
            <h2 className="font-display font-bold text-gray-800 text-sm sm:text-base lg:text-lg">
              Sugestão de Atividades por Diretrizes
            </h2>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Mapeamento automatizado e inteligente que respeita integralmente as regras e limites que definiu para o lar.
          </p>
        </div>

        <div className="flex flex-col gap-2 self-stretch sm:self-auto items-stretch sm:items-end">
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="text-xs font-bold text-gray-500 hover:text-slate-800 hover:bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 transition-all cursor-pointer"
            >
              Voltar ao Calendário
            </button>
            
            <button
              onClick={handleGenerateSuggestions}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A processar...</span>
                </>
              ) : (
                <>
                  <Sparkle className="w-4 h-4 text-white" />
                  <span>Recalcular Sugestões</span>
                </>
              )}
            </button>
          </div>

          {suggestions.length > 0 && !loading && !error && (
            <button
              onClick={handleScheduleAll}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer w-full sm:max-w-xs"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              <span>Agendar Todas no Calendário</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Active Rules and Configuration Preview */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Generation Period Card */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider text-gray-400">
              Período de Planeamento
            </h3>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-gray-100/50">
              <button
                onClick={() => setPeriod('semana')}
                className={`text-[10px] font-bold py-2 rounded-lg transition-all cursor-pointer text-center ${
                  period === 'semana'
                    ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setPeriod('mes')}
                className={`text-[10px] font-bold py-2 rounded-lg transition-all cursor-pointer text-center ${
                  period === 'mes'
                    ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Mensal
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-gray-500 space-y-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wide text-[9px] block">Período Alvo:</span>
              <p className="font-bold text-indigo-700 leading-snug">
                {period === 'semana' ? (
                  `Esta semana (${getWeekDates(selectedDateStr)[0].split('-')[2]} a ${getWeekDates(selectedDateStr)[6].split('-')[2]} de ${monthNames[currentMonth]})`
                ) : (
                  `Todo o mês de ${monthNames[currentMonth]} de ${currentYear}`
                )}
              </p>
            </div>
          </div>

          {/* Active Rules Card */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
              <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider text-gray-400">
                Diretrizes Ativas
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold">
                ✓ Ativo
              </span>
            </div>

            {/* Days active */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Dias Ativos:</span>
              <div className="flex flex-wrap gap-1">
                {suggestionRules.activeDays.map(d => (
                  <span key={d} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Frequencies */}
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Frequências Máximas:</span>
              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>🧠 Cognitiva:</span>
                  <span className="font-bold text-slate-800">{suggestionRules.maxCognitiveDaysPerWeek} dias/sem</span>
                </div>
                <div className="flex justify-between">
                  <span>🏃‍♂️ Física:</span>
                  <span className="font-bold text-slate-800">{suggestionRules.maxPhysicalDaysPerWeek} dias/sem</span>
                </div>
                <div className="flex justify-between">
                  <span>🎶 Música:</span>
                  <span className="font-bold text-slate-800">{suggestionRules.maxMusicDaysPerWeek} dias/sem</span>
                </div>
                <div className="flex justify-between">
                  <span>🎨 Outros:</span>
                  <span className="font-bold text-slate-800">{suggestionRules.maxOtherDaysPerWeek} dias/sem</span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2 pt-2 border-t border-gray-50 text-xs text-gray-600">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Preferências de Turno:</span>
              <p className="mt-1 leading-snug">
                🌅 <strong className="font-semibold text-slate-700">Manhã ({suggestionRules.morningTime}):</strong> <span className="capitalize">{suggestionRules.morningCategoryPreference === 'fisica' ? 'Física' : suggestionRules.morningCategoryPreference === 'cognitiva' ? 'Cognitiva' : suggestionRules.morningCategoryPreference === 'musica' ? 'Música' : suggestionRules.morningCategoryPreference === 'outro' ? 'Outra' : 'Aleatório'}</span>
              </p>
              <p className="leading-snug">
                🌇 <strong className="font-semibold text-slate-700">Tarde ({suggestionRules.afternoonTime}):</strong> <span className="capitalize">{suggestionRules.afternoonCategoryPreference === 'fisica' ? 'Física' : suggestionRules.afternoonCategoryPreference === 'cognitiva' ? 'Cognitiva' : suggestionRules.afternoonCategoryPreference === 'musica' ? 'Música' : suggestionRules.afternoonCategoryPreference === 'outro' ? 'Outra' : 'Aleatório'}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Suggestions list */}
        <div className="lg:col-span-3 space-y-4">
          
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 shadow-2xs flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">A Aplicar Diretrizes de Estimulação...</h3>
                <p className="text-gray-400 text-xs mt-1">O algoritmo está a selecionar as melhores atividades e a distribuir pelos turnos autorizados.</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-3 shadow-2xs">
              <ListTodo className="w-10 h-10 text-gray-300 mx-auto" />
              <div>
                <p className="font-display font-bold text-slate-700 text-sm">Nenhuma atividade gerada</p>
                <p className="text-gray-400 text-xs mt-0.5">Tente alterar o período ou verificar os dias ativos nas suas regras.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              
              {/* List Header */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-4 rounded-2xl shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  {suggestions.length} Sugestões de Estimulação Geradas com Sucesso
                </span>
              </div>

              {/* Grid of suggested cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((act, idx) => {
                  const catInfo = categoryLabels[act.category];
                  const isScheduled = scheduledIndices[idx];
                  const dateObj = new Date(act.date);
                  const formattedDate = dateObj.toLocaleDateString('pt-PT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  });

                  return (
                    <div
                      key={idx}
                      className={`border border-gray-100 border-l-4 bg-white rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group ${
                        isScheduled ? 'opacity-65 bg-slate-50/50' : ''
                      } ${catInfo.accent}`}
                    >
                      <div className="space-y-3">
                        {/* Time stamp / Date & Turn */}
                        <div className="flex items-center justify-between text-gray-400 text-[10px] font-bold">
                          <span className="capitalize text-indigo-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                          </span>
                          <span className="bg-slate-100 border border-gray-100 text-slate-600 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
                            {act.slot === 'manha' ? 'Manhã' : 'Tarde'} — {act.time}
                          </span>
                        </div>

                        {/* Title & Badge */}
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                            {catInfo.icon}
                            <span>{catInfo.label}</span>
                          </span>
                          <h4 className="font-display font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                            {act.title}
                          </h4>
                        </div>

                        {/* Description with nested goals */}
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-4">
                          {act.description.split('\n\n')[0]}
                        </p>

                        {/* Support Materials extracted */}
                        {act.description.includes('[Materiais de Apoio]:') && (
                          <div className="pt-2 border-t border-gray-50 text-[10px]">
                            <span className="font-bold text-gray-400 block uppercase tracking-wider mb-1">Materiais Recomendados:</span>
                            <div className="flex flex-wrap gap-1">
                              {act.description
                                .split('[Materiais de Apoio]:')[1]
                                .split('\n')[0]
                                .split(',')
                                .map((m, i) => (
                                  <span key={i} className="bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-md">
                                    {m.trim()}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduling Action Row */}
                      <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-end">
                        {isScheduled ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 w-full justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Agendada com sucesso!
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleScheduleSingle(idx, act)}
                            className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800 text-indigo-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agendar no Calendário</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer navigation */}
              <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-2xs flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
                >
                  <span>Concluído e Voltar ao Calendário</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Floating Success Toast / Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white rounded-2xl shadow-xl border border-emerald-500/30 px-5 py-4 flex items-center gap-3.5 max-w-sm"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-xs leading-none tracking-wide text-white">
                Agendadas com sucesso
              </p>
              <p className="text-[10px] text-emerald-100 mt-1 leading-normal font-medium">
                Todas as sugestões de estimulação foram marcadas no calendário do lar!
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-emerald-100 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
