import React, { useState } from 'react';
import { Resident, ScheduledActivity, ActivityCategory } from '../types';
import {
  Sparkles,
  BrainCircuit,
  Activity as PhysIcon,
  Disc,
  Calendar,
  Check,
  Plus,
  Info,
  CalendarDays,
  Loader2,
  ListTodo,
  Smile
} from 'lucide-react';
import Tooltip from './Tooltip';

interface SuggestedActivity {
  title: string;
  description: string;
  category: 'cognitiva' | 'fisica' | 'musica';
  durationMinutes: number;
  materials: string[];
  objectives: string[];
  adaptedFor: string;
}

interface GeminiPlanResponse {
  sugestaoPlano: string;
  atividadesPropostas: SuggestedActivity[];
}

interface GeminiPlannerProps {
  residents: Resident[];
  onAddScheduledActivity: (activity: Omit<ScheduledActivity, 'id'>) => void;
  onClose: () => void;
}

export default function GeminiPlanner({ residents, onAddScheduledActivity, onClose }: GeminiPlannerProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<GeminiPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Scheduling states for each generated activity index
  const [scheduledIndices, setScheduledIndices] = useState<Record<number, boolean>>({});
  const [scheduleDates, setScheduleDates] = useState<Record<number, string>>({});
  const [scheduleSlots, setScheduleSlots] = useState<Record<number, 'manha' | 'tarde'>>({});
  const [scheduleTimes, setScheduleTimes] = useState<Record<number, string>>({});

  const loadingMessages = [
    "Analisando perfis clínicos dos utentes...",
    "Ajustando graus de estimulação cognitiva (Ligeiro/Moderado/Grave)...",
    "Adaptando rotinas de exercício físico para diferentes mobilidades...",
    "Mapeando canções tradicionais e ritmos para musicoterapia...",
    "Estruturando materiais e objetivos terapêuticos personalizados...",
    "Finalizando o plano mensal de atividades sociocultural..."
  ];

  const handleGeneratePlan = async () => {
    if (residents.length === 0) {
      setError("Por favor, adicione utentes primeiro para podermos analisar as suas preferências.");
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);
    setScheduledIndices({});

    // Start timer to rotate loading messages
    let step = 0;
    setLoadingStep(0);
    const interval = setInterval(() => {
      step = (step + 1) % loadingMessages.length;
      setLoadingStep(step);
    }, 2500);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residents }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Falha na comunicação com o servidor.");
      }

      const data: GeminiPlanResponse = await response.json();
      setPlan(data);

      // Pre-populate scheduling states with default values (staggered from July 14, 2026 onwards)
      const dates: Record<number, string> = {};
      const slots: Record<number, 'manha' | 'tarde'> = {};
      const times: Record<number, string> = {};

      data.atividadesPropostas.forEach((_, idx) => {
        // Calculate consecutive days starting from July 14, 2026
        const dateObj = new Date('2026-07-14');
        dateObj.setDate(dateObj.getDate() + idx);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        
        dates[idx] = `${yyyy}-${mm}-${dd}`;
        slots[idx] = idx % 2 === 0 ? 'manha' : 'tarde';
        times[idx] = idx % 2 === 0 ? '10:30' : '15:30';
      });

      setScheduleDates(dates);
      setScheduleSlots(slots);
      setScheduleTimes(times);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível gerar as recomendações no momento. Tente novamente.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleScheduleSingle = (idx: number, act: SuggestedActivity) => {
    const date = scheduleDates[idx] || '2026-07-14';
    const slot = scheduleSlots[idx] || 'manha';
    const time = scheduleTimes[idx] || '10:30';

    onAddScheduledActivity({
      title: act.title,
      description: `${act.description}\n\n[Adaptado para]: ${act.adaptedFor}\n[Objetivos]: ${act.objectives.join('; ')}`,
      category: act.category as ActivityCategory,
      date,
      slot,
      time,
      completed: false,
    });

    setScheduledIndices(prev => ({ ...prev, [idx]: true }));
  };

  const handleScheduleAll = () => {
    if (!plan) return;

    plan.atividadesPropostas.forEach((act, idx) => {
      if (scheduledIndices[idx]) return; // Skip already scheduled ones
      const date = scheduleDates[idx] || '2026-07-14';
      const slot = scheduleSlots[idx] || 'manha';
      const time = scheduleTimes[idx] || '10:30';

      onAddScheduledActivity({
        title: act.title,
        description: `${act.description}\n\n[Adaptado para]: ${act.adaptedFor}\n[Objetivos]: ${act.objectives.join('; ')}`,
        category: act.category as ActivityCategory,
        date,
        slot,
        time,
        completed: false,
      });
    });

    // Mark all as scheduled
    const allScheduled: Record<number, boolean> = {};
    plan.atividadesPropostas.forEach((_, idx) => {
      allScheduled[idx] = true;
    });
    setScheduledIndices(allScheduled);
  };

  const categoryLabels = {
    cognitiva: { label: 'Estimulação Cognitiva', icon: <BrainCircuit className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50 text-purple-800 border-purple-100', accent: 'border-l-purple-500' },
    fisica: { label: 'Exercício Físico', icon: <PhysIcon className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-100', accent: 'border-l-amber-500' },
    musica: { label: 'Musicoterapia', icon: <Disc className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50 text-blue-800 border-blue-100', accent: 'border-l-blue-500' },
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-gray-800 text-base sm:text-lg">
              Planeamento Inteligente AnimaLar
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Utiliza inteligência artificial avançada para alinhar a rotina do lar com os planos individuais de estimulação.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-500 hover:text-slate-800 hover:bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 transition-all cursor-pointer"
          >
            Voltar ao Calendário
          </button>
          
          <Tooltip position="left" content="Gerar Plano: Solicitar ao assistente de inteligência artificial que elabore propostas adaptadas de animação">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A Gerar...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Plano Mensal IA
                </>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Helper Context Info */}
      {!plan && !loading && (
        <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-5 space-y-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-xs text-slate-800">Como funciona o planeador inteligente?</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                A API Gemini analisará de forma segura o perfil dos <strong>{residents.length} utentes atualmente registados</strong>. O algoritmo detetará as suas limitações motoras (ex: se usam cadeira de rodas), os seus graus de atenção cognitiva (como graus graves de Alzheimer) e os seus interesses musicais (Fado, folclore, etc.), propondo um plano sociocultural com 10 atividades idealmente equilibradas e adaptadas.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-indigo-100/30">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Utentes que serão integrados na análise:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {residents.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 bg-white border border-gray-100 p-2 rounded-xl">
                  <img src={r.avatar} alt={r.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
                  <div className="min-w-0 text-[10px]">
                    <p className="font-semibold text-slate-800 truncate">{r.name}</p>
                    <p className="text-gray-400 truncate">🧠 {r.cognitiveLevel} | {r.physicalLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white text-[9px] font-bold">
              ✓
            </div>
          </div>
          <div className="space-y-1.5 px-4">
            <h3 className="font-display font-bold text-xs text-slate-800 animate-pulse">A Desenhar Plano Sociocultural Personalizado</h3>
            <p className="text-[11px] text-gray-500 max-w-sm transition-all duration-300">
              {loadingMessages[loadingStep]}
            </p>
          </div>
          <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs flex items-center gap-3">
          <span className="text-base">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Display Plan Recommendations */}
      {plan && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary / Introduction */}
          <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-100/50 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-display font-bold text-xs text-slate-800">Resumo da Recomendação Clínica</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{plan.sugestaoPlano}"
            </p>
          </div>

          {/* Activities List Header & Bulk action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ListTodo className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">
                Atividades Recomendadas ({plan.atividadesPropostas.length})
              </h3>
            </div>
            <Tooltip position="left" content="Agendar Todas: Agendar simultaneamente todas as propostas de atividade recomendadas no seu calendário para este mês">
              <button
                onClick={handleScheduleAll}
                className="flex items-center gap-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Agendar Todas no Calendário
              </button>
            </Tooltip>
          </div>

          {/* Grid list of proposed activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plan.atividadesPropostas.map((act, idx) => {
              const catInfo = categoryLabels[act.category] || { label: 'Outro', icon: <Smile className="w-4 h-4 text-slate-500" />, color: 'bg-slate-50 border-slate-100 text-slate-800', accent: 'border-l-slate-400' };
              const isScheduled = scheduledIndices[idx];

              return (
                <div
                  key={idx}
                  className={`border border-gray-100 border-l-4 rounded-xl rounded-l-md p-4 space-y-4 bg-white hover:shadow-md transition-all flex flex-col justify-between ${catInfo.accent} ${
                    isScheduled ? 'opacity-70 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top line with badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${catInfo.color} flex items-center gap-1`}>
                        {catInfo.icon}
                        {catInfo.label}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-gray-400">
                        ⏱️ {act.durationMinutes} minutos
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-xs text-slate-800 leading-snug">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    {/* Objectives & Materials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-400 block uppercase tracking-wider">Materiais:</span>
                        <div className="flex flex-wrap gap-1">
                          {act.materials.map((m, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[9px]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-400 block uppercase tracking-wider">Objetivos:</span>
                        <p className="text-gray-600 line-clamp-2 leading-tight">
                          {act.objectives.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Adapted For explanation badge */}
                    <div className="bg-indigo-50/30 border border-indigo-100/30 p-2.5 rounded-lg text-[10px] text-indigo-950 flex gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <strong className="font-semibold text-indigo-900">Adaptação Individual: </strong>
                        {act.adaptedFor}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time Selector + Schedule button */}
                  <div className="pt-3 border-t border-slate-100/80 mt-4 flex items-center justify-between gap-3 flex-wrap">
                    {isScheduled ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-full justify-center">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Atividade Agendada no Calendário!
                      </span>
                    ) : (
                      <>
                        {/* Selector input parameters */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            type="date"
                            value={scheduleDates[idx] || ''}
                            onChange={(e) => setScheduleDates({ ...scheduleDates, [idx]: e.target.value })}
                            className="text-[10px] p-1 border border-gray-200 rounded bg-white text-gray-700 font-medium font-mono cursor-pointer"
                          />
                          <select
                            value={scheduleSlots[idx] || 'manha'}
                            onChange={(e) => {
                              const val = e.target.value as 'manha' | 'tarde';
                              setScheduleSlots({ ...scheduleSlots, [idx]: val });
                              setScheduleTimes({ ...scheduleTimes, [idx]: val === 'manha' ? '10:30' : '15:30' });
                            }}
                            className="text-[10px] p-1 border border-gray-200 rounded bg-white text-gray-700 cursor-pointer"
                          >
                            <option value="manha">Manhã 🌅</option>
                            <option value="tarde">Tarde 🌇</option>
                          </select>
                          <input
                            type="text"
                            value={scheduleTimes[idx] || '10:30'}
                            onChange={(e) => setScheduleTimes({ ...scheduleTimes, [idx]: e.target.value })}
                            className="text-[10px] p-1 border border-gray-200 rounded bg-white text-gray-700 font-medium font-mono w-10 text-center"
                          />
                        </div>

                        {/* Schedule single item */}
                        <Tooltip position="left" content="Agendar Atividade: Adicionar esta atividade específica ao plano diário na data selecionada">
                          <button
                            onClick={() => handleScheduleSingle(idx, act)}
                            className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Agendar
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Concluído — Ver no Calendário
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
