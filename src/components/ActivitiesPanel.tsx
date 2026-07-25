import React, { useState } from 'react';
import { Activity, ScheduledActivity, ActivityCategory, SuggestionRules } from '../types';
import {
  Plus, Search, Filter, Clock, BookOpen, BrainCircuit, Activity as PhysIcon,
  Music, Sparkles, Trash2, Calendar, CheckCircle, ListTodo, HelpCircle, Edit,
  Printer, Palette, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import Tooltip from './Tooltip';

interface ActivitiesPanelProps {
  activities: Activity[];
  scheduledActivities: ScheduledActivity[];
  suggestionRules?: SuggestionRules;
  onSetSuggestionRules?: (rules: SuggestionRules) => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity?: (activity: Activity) => void;
  onSelectTab?: (tab: any) => void;
}

export default function ActivitiesPanel({
  activities,
  scheduledActivities,
  suggestionRules,
  onSetSuggestionRules,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
  onSelectTab
}: ActivitiesPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'rules'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | 'todos'>('todos');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [expandedActivityIds, setExpandedActivityIds] = useState<string[]>([]);

  const toggleActivityExpand = (id: string) => {
    setExpandedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleActivityClick = (id: string) => {
    if (selectedActivityId === id) {
      toggleActivityExpand(id);
    } else {
      setSelectedActivityId(id);
    }
  };

  const handleActivityDoubleClick = (id: string) => {
    setSelectedActivityId(id);
    if (!expandedActivityIds.includes(id)) {
      setExpandedActivityIds((prev) => [...prev, id]);
    }
  };
  
  // Create New Activity State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('cognitiva');
  const [duration, setDuration] = useState(45);
  const [materialsInput, setMaterialsInput] = useState('');
  const [objectivesInput, setObjectivesInput] = useState('');

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<ActivityCategory>('cognitiva');
  const [editDuration, setEditDuration] = useState(45);
  const [editMaterialsInput, setEditMaterialsInput] = useState('');
  const [editObjectivesInput, setEditObjectivesInput] = useState('');

  const handleOpenEditModal = (act: Activity) => {
    setEditingActivity(act);
    setEditTitle(act.title);
    setEditDescription(act.description);
    setEditCategory(act.category);
    setEditDuration(act.durationMinutes);
    setEditMaterialsInput(act.materials.join(', '));
    setEditObjectivesInput(act.objectives.join(', '));
  };

  const handleUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !editTitle.trim() || !editDescription.trim()) return;

    const materials = editMaterialsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const objectives = editObjectivesInput
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (onUpdateActivity) {
      onUpdateActivity({
        id: editingActivity.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        durationMinutes: Number(editDuration),
        materials: materials.length > 0 ? materials : ['Nenhum material específico'],
        objectives: objectives.length > 0 ? objectives : ['Estimulação geral e bem-estar']
      });
    }

    setEditingActivity(null);
  };

  // Filtering activities templates
  const filteredActivities = activities.filter((act) => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'todos' || act.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'cognitiva':
        return <BrainCircuit className="w-4 h-4 text-amber-600" />;
      case 'fisica':
        return <PhysIcon className="w-4 h-4 text-emerald-600" />;
      case 'musica':
        return <Music className="w-4 h-4 text-sky-600" />;
      case 'sensorial':
        return <Eye className="w-4 h-4 text-rose-600" />;
      case 'expressao_artistica':
        return <Palette className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryColor = (cat: ActivityCategory) => {
    switch (cat) {
      case 'cognitiva':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fisica':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'musica':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'sensorial':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'expressao_artistica':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const materials = materialsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const objectives = objectivesInput
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    onAddActivity({
      title: title.trim(),
      description: description.trim(),
      category,
      durationMinutes: Number(duration),
      materials: materials.length > 0 ? materials : ['Nenhum material específico'],
      objectives: objectives.length > 0 ? objectives : ['Estimulação geral e bem-estar']
    });

    // Reset forms
    setTitle('');
    setDescription('');
    setCategory('cognitiva');
    setDuration(45);
    setMaterialsInput('');
    setObjectivesInput('');
    setShowAddModal(false);
  };

  const handleToggleDay = (day: string) => {
    if (!suggestionRules || !onSetSuggestionRules) return;
    const activeDays = suggestionRules.activeDays.includes(day)
      ? suggestionRules.activeDays.filter(d => d !== day)
      : [...suggestionRules.activeDays, day];
    onSetSuggestionRules({ ...suggestionRules, activeDays });
  };

  const handleRuleChange = (key: keyof SuggestionRules, value: any) => {
    if (!suggestionRules || !onSetSuggestionRules) return;
    onSetSuggestionRules({ ...suggestionRules, [key]: value });
  };

  const renderCategoryCard = (
    title: string,
    icon: string,
    limitKey: keyof SuggestionRules,
    configKey: keyof SuggestionRules,
    defaultLimit: number,
    theme: {
      cardBg: string;
      border: string;
      titleColor: string;
      subtextColor: string;
      sliderBg: string;
      sliderAccent: string;
      badgeBg: string;
      badgeText: string;
      badgeBorder: string;
      daySelectedBg: string;
      daySelectedBorder: string;
      btnActiveBg: string;
      btnActiveText: string;
    }
  ) => {
    const limitValue = (suggestionRules?.[limitKey] as number) ?? defaultLimit;
    const config = (suggestionRules?.[configKey] as Record<string, 'manha' | 'tarde' | 'ambos'>) || {};
    const assignedCount = Object.keys(config).length;

    return (
      <div key={limitKey as string} className={`${theme.cardBg} ${theme.border} border p-4 sm:p-5 rounded-2xl space-y-4 transition-all shadow-xs`}>
        {/* Header: Title + Slider + Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className={`${theme.titleColor} font-bold text-xs sm:text-sm flex items-center gap-2`}>
            <span className="text-base">{icon}</span> {title}
          </span>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Máx/sem:
            </span>
            <input
              type="range"
              min="0"
              max="7"
              value={limitValue}
              onChange={(e) => handleRuleChange(limitKey, Number(e.target.value))}
              className={`w-24 sm:w-28 h-1.5 ${theme.sliderBg} rounded-lg appearance-none cursor-pointer ${theme.sliderAccent}`}
            />
            <span className={`font-mono font-bold ${theme.badgeText} ${theme.badgeBg} ${theme.badgeBorder} border px-2 py-0.5 rounded-lg text-xs shadow-2xs min-w-[36px] text-center`}>
              {limitValue}d
            </span>
          </div>
        </div>

        {/* Days of week & period selector */}
        <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold ${theme.subtextColor} uppercase tracking-wider`}>
              Dias e Período das Sessões:
            </span>
            <span className={`text-[10px] font-semibold ${theme.subtextColor}`}>
              {assignedCount} dia(s) atribuído(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
              const val = config[day];
              const isSelected = !!val;
              const hasMorning = val === 'manha' || val === 'ambos';
              const hasAfternoon = val === 'tarde' || val === 'ambos';

              const toggleSlot = (targetSlot: 'manha' | 'tarde', e: React.MouseEvent) => {
                e.stopPropagation();
                let newVal: 'manha' | 'tarde' | 'ambos' | undefined;
                if (val === 'ambos') {
                  newVal = targetSlot === 'manha' ? 'tarde' : 'manha';
                } else if (val === targetSlot) {
                  newVal = undefined;
                } else if (val) {
                  newVal = 'ambos';
                } else {
                  newVal = targetSlot;
                }

                const newConfig = { ...config };
                if (newVal) {
                  newConfig[day] = newVal;
                } else {
                  delete newConfig[day];
                }
                const newDaysCount = Object.keys(newConfig).length;
                if (!suggestionRules || !onSetSuggestionRules) return;
                onSetSuggestionRules({
                  ...suggestionRules,
                  [configKey]: newConfig,
                  [limitKey]: newDaysCount > 0 ? newDaysCount : suggestionRules[limitKey]
                });
              };

              return (
                <div
                  key={day}
                  className={`rounded-xl border p-2 flex flex-col items-center justify-between gap-1.5 transition-all text-xs ${
                    isSelected
                      ? `${theme.daySelectedBg} ${theme.daySelectedBorder} text-white shadow-2xs`
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const newConfig = { ...config };
                      if (isSelected) {
                        delete newConfig[day];
                      } else {
                        newConfig[day] = 'manha';
                      }
                      const newDaysCount = Object.keys(newConfig).length;
                      if (!suggestionRules || !onSetSuggestionRules) return;
                      onSetSuggestionRules({
                        ...suggestionRules,
                        [configKey]: newConfig,
                        [limitKey]: newDaysCount > 0 ? newDaysCount : suggestionRules[limitKey]
                      });
                    }}
                    className="w-full text-center font-bold py-0.5 cursor-pointer flex items-center justify-center gap-1 select-none"
                    title={isSelected ? `Remover ${day} de ${title}` : `Ativar ${day} para ${title}`}
                  >
                    <span>{day}</span>
                    {val === 'ambos' ? (
                      <span className="text-[9px] bg-white/25 dark:bg-black/25 px-1 py-0.2 rounded font-extrabold text-white">🌅+🌇</span>
                    ) : isSelected ? (
                      <span className="text-[10px]">✓</span>
                    ) : null}
                  </button>

                  <div className={`flex items-center rounded-lg p-0.5 w-full justify-center gap-0.5 ${
                    isSelected ? 'bg-black/20 dark:bg-black/40' : 'bg-gray-100 dark:bg-slate-800'
                  }`}>
                    <button
                      type="button"
                      onClick={(e) => toggleSlot('manha', e)}
                      className={`text-[9px] font-bold px-1 py-0.5 rounded-md transition-all cursor-pointer flex-1 text-center ${
                        hasMorning
                          ? `${theme.btnActiveBg} ${theme.btnActiveText} shadow-2xs font-extrabold`
                          : isSelected
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={hasMorning ? 'Desativar Manhã (🌅)' : 'Ativar Manhã (🌅)'}
                    >
                      🌅 Manhã
                    </button>
                    <button
                      type="button"
                      onClick={(e) => toggleSlot('tarde', e)}
                      className={`text-[9px] font-bold px-1 py-0.5 rounded-md transition-all cursor-pointer flex-1 text-center ${
                        hasAfternoon
                          ? `${theme.btnActiveBg} ${theme.btnActiveText} shadow-2xs font-extrabold`
                          : isSelected
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={hasAfternoon ? 'Desativar Tarde (🌇)' : 'Ativar Tarde (🌇)'}
                    >
                      🌇 Tarde
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`text-[10px] ${theme.subtextColor} font-medium opacity-90`}>
            💡 Selecione 🌅 Manhã e/ou 🌇 Tarde em cada dia da semana. Pode escolher ambos os turnos no mesmo dia!
          </p>
        </div>
      </div>
    );
  };

  // Compute some quick statistics
  const scheduledCount = scheduledActivities.length;
  const completedCount = scheduledActivities.filter(a => a.completed).length;

  return (
    <div className="space-y-6" id="activities-panel-root">
      
      {/* Header and Quick Stats Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-slate-800 text-xl sm:text-2xl tracking-tight">
            Catálogo de Atividades Socioculturais
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Gerencie, crie e consulte modelos de atividades terapêuticas recomendadas para os residentes.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Atividade</span>
        </button>
      </div>

      {/* Submenu de Navegação */}
      <div className="flex border-b border-gray-100 pb-px print:hidden">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800 font-medium'
          }`}
        >
          📖 Catálogo de Modelos
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeSubTab === 'rules'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800 font-medium'
          }`}
          id="btn-rules-submenu"
        >
          ⚙️ Regras para Sugestão
        </button>
      </div>

      {activeSubTab === 'catalog' ? (
        /* Grid containing filters, statistics, and main list */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Controls and Statistics */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Quick Statistics Card */}
          <div className="bg-white border border-gray-100 p-4.5 rounded-2xl shadow-xs space-y-3.5">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider text-gray-400">
              Desempenho Geral
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Agendadas:
                </span>
                <span className="font-bold text-slate-800 font-mono">{scheduledCount}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Concluídas:
                </span>
                <span className="font-bold text-slate-800 font-mono">{completedCount}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-sky-500" />
                  Disponíveis:
                </span>
                <span className="font-bold text-slate-800 font-mono">{activities.length}</span>
              </div>

              {/* Progress Bar */}
              {scheduledCount > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-1">
                    <span>Taxa de Execução</span>
                    <span>{Math.round((completedCount / scheduledCount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${(completedCount / scheduledCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categories Quick Filter Card */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs space-y-2.5">
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider text-gray-400 px-1">
              Filtrar Categoria
            </h4>
            
            <div className="flex flex-col gap-1">
              {(['todos', 'cognitiva', 'fisica', 'musica', 'sensorial', 'expressao_artistica', 'outro'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    filterCategory === cat
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">
                    {cat === 'todos' ? 'Todas as Categorias' :
                     cat === 'fisica' ? 'Física' :
                     cat === 'cognitiva' ? 'Cognitiva' :
                     cat === 'musica' ? 'Música' :
                     cat === 'sensorial' ? 'Sensorial' :
                     cat === 'expressao_artistica' ? 'Exp. Artística' : 'Outra'}
                  </span>
                  {cat !== 'todos' && (
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500">
                      {activities.filter(a => a.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Search & List of Activities */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search Bar */}
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xs flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Pesquisar por título, objetivo, material ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-slate-800 placeholder-gray-400 bg-transparent text-sm focus:outline-hidden"
            />
          </div>

          {/* Hint Notice */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3.5 py-2 select-none">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-900">💡 Dica:</span> O 1º clique seleciona a atividade na lista. O 2º clique (ou duplo-clique) expande ou recolhe os detalhes.
            </span>
          </div>

          {/* Main Cards List */}
          <div className="space-y-2.5">
            {filteredActivities.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl flex flex-col items-center justify-center space-y-3">
                <HelpCircle className="w-10 h-10 text-gray-300" />
                <div>
                  <p className="font-display font-bold text-slate-700 text-sm">Nenhuma atividade encontrada</p>
                  <p className="text-gray-400 text-xs mt-0.5">Tente ajustar os filtros ou pesquisar por outro termo.</p>
                </div>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isExpanded = expandedActivityIds.includes(act.id);
                const isSelected = selectedActivityId === act.id;

                if (!isExpanded) {
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleActivityClick(act.id)}
                      onDoubleClick={() => handleActivityDoubleClick(act.id)}
                      className={`rounded-xl px-4 py-3 transition-all cursor-pointer select-none flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-indigo-50/80 border-2 border-indigo-500 ring-2 ring-indigo-200/90 shadow-xs scale-[1.002]'
                          : 'bg-white border border-gray-200/80 hover:border-indigo-300 shadow-2xs'
                      }`}
                      id={`act-collapsed-${act.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`p-1.5 rounded-lg border shrink-0 ${getCategoryColor(act.category)}`}>
                          {getCategoryIcon(act.category)}
                        </span>
                        <h3 className={`font-display font-bold text-sm truncate ${
                          isSelected ? 'text-indigo-950 font-black' : 'text-slate-800 group-hover:text-indigo-600'
                        }`}>
                          {act.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${getCategoryColor(act.category)}`}>
                          {act.category === 'fisica' ? 'Física' :
                           act.category === 'cognitiva' ? 'Cognitiva' :
                           act.category === 'musica' ? 'Música' :
                           act.category === 'sensorial' ? 'Sensorial' :
                           act.category === 'expressao_artistica' ? 'Exp. Artística' : 'Outra'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium hidden md:inline-block">
                          {isSelected ? '(clique de novo p/ expandir)' : '(clique p/ selecionar)'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-colors ${
                          isSelected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                        }`} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={act.id} 
                    onClick={() => handleActivityClick(act.id)}
                    onDoubleClick={() => handleActivityDoubleClick(act.id)}
                    className="bg-white border-2 border-indigo-600 rounded-2xl p-5 shadow-sm transition-all select-none space-y-4 cursor-pointer"
                    id={`act-expanded-${act.id}`}
                  >
                    {/* Header: Title and Collapse Notice */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2 rounded-xl border shrink-0 ${getCategoryColor(act.category)}`}>
                          {getCategoryIcon(act.category)}
                        </span>
                        <div>
                          <h3 className="font-display font-black text-slate-900 text-base">
                            {act.title}
                          </h3>
                          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                            Atividade Expandida (clique de novo ou clique 2x para recolher)
                          </span>
                        </div>
                      </div>
                      <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                    </div>

                    {/* Category tag & duration */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${getCategoryColor(act.category)}`}>
                        {getCategoryIcon(act.category)}
                        <span>
                          {act.category === 'fisica' ? 'Física' :
                           act.category === 'cognitiva' ? 'Cognitiva' :
                           act.category === 'musica' ? 'Música' :
                           act.category === 'sensorial' ? 'Sensorial' :
                           act.category === 'expressao_artistica' ? 'Exp. Artística' : 'Outra'}
                        </span>
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {act.durationMinutes} minutos
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Descrição</span>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    {/* Objectives list */}
                    <div className="pt-2 border-t border-gray-50 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Objetivos Terapêuticos</span>
                      <div className="flex flex-wrap gap-1">
                        {act.objectives.map((obj, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] px-2.5 py-1 rounded-full border border-gray-100 font-medium">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Materials list */}
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materiais de Apoio</span>
                      <div className="flex flex-wrap gap-1">
                        {act.materials.map((mat, idx) => {
                          const m = mat.toLowerCase();
                          const isPrintable = 
                            m.includes('cartões') || 
                            m.includes('provérbios') || 
                            m.includes('ficha') || 
                            m.includes('pergunta') || 
                            m.includes('sabedoria') || 
                            m.includes('problema') || 
                            m.includes('raciocínio') || 
                            m.includes('rima') || 
                            m.includes('cancioneiro') || 
                            m.includes('letras') || 
                            m.includes('canção') || 
                            m.includes('canções') || 
                            m.includes('mapa');
                          
                          if (isPrintable && onSelectTab) {
                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTab('materials');
                                }}
                                className="inline-flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer shadow-2xs hover:scale-102 transition-all"
                                title="Clique para ir ao Material de Apoio Pronto a Imprimir"
                              >
                                <span>{mat}</span>
                                <Printer className="w-2.5 h-2.5 text-indigo-600" />
                              </button>
                            );
                          }
                          return (
                            <span key={idx} className="bg-indigo-50/40 text-indigo-700/90 text-[10px] px-2 py-0.5 rounded-full border border-indigo-50">
                              {mat}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions footer on Card */}
                    <div className="pt-3 border-t border-gray-100 flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Tooltip position="top" content="Editar Atividade: Atualizar informações deste modelo de atividade">
                        <button
                          onClick={() => handleOpenEditModal(act)}
                          className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                          id={`edit-act-btn-${act.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      {act.id.startsWith('custom_') && (
                        <Tooltip position="top" content="Eliminar Atividade: Apagar de forma irreversível este modelo personalizado">
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            id={`delete-act-btn-${act.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    ) : (
      /* Rules for suggestion editor screen */
      <div className="bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in" id="rules-view-container">
        <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">⚙️</span>
            Regras para Sugestão de Planos
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed pt-1">
            As regras aqui estipuladas orientam a criação automática de planos semanais e mensais de estimulação. O algoritmo garantirá que as restrições e preferências definidas sejam cumpridas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Card 1: Days of the week */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm">📅</span>
              <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                Dias da Semana Ativos
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              Selecione em que dias da semana podem decorrer as atividades e rotinas de estimulação:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                const isActive = suggestionRules?.activeDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`w-11 h-11 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
           {/* Card 2: Limits and Day/Period Selector per Category */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400 text-sm">⚖️</span>
              <div>
                <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
                  Configuração por Categoria de Atividade (Dias, Período e Frequência)
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium pt-0.5">
                  Configure em que dias da semana e em que turno (Manhã / Tarde) deseja agendar cada tipo de atividade, bem como a frequência máxima semanal:
                </p>
              </div>
            </div>
            
            <div className="space-y-4 pt-1">
              {/* Exercício Físico */}
              {renderCategoryCard(
                'Exercício Físico',
                '🏃‍♂️',
                'maxPhysicalDaysPerWeek',
                'physicalDaysConfig',
                3,
                {
                  cardBg: 'bg-amber-50/70 dark:bg-amber-950/25',
                  border: 'border-amber-200/80 dark:border-amber-800/40',
                  titleColor: 'text-amber-950 dark:text-amber-200',
                  subtextColor: 'text-amber-900/80 dark:text-amber-300/90',
                  sliderBg: 'bg-amber-200 dark:bg-amber-900',
                  sliderAccent: 'accent-amber-600',
                  badgeBg: 'bg-white dark:bg-amber-900/70',
                  badgeText: 'text-amber-950 dark:text-amber-100',
                  badgeBorder: 'border-amber-200 dark:border-amber-700',
                  daySelectedBg: 'bg-amber-500',
                  daySelectedBorder: 'border-amber-600',
                  btnActiveBg: 'bg-white dark:bg-amber-900',
                  btnActiveText: 'text-amber-950 dark:text-amber-100',
                }
              )}

              {/* Estimulação Cognitiva */}
              {renderCategoryCard(
                'Estimulação Cognitiva',
                '🧠',
                'maxCognitiveDaysPerWeek',
                'cognitiveDaysConfig',
                5,
                {
                  cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/25',
                  border: 'border-indigo-200/80 dark:border-indigo-800/40',
                  titleColor: 'text-indigo-950 dark:text-indigo-200',
                  subtextColor: 'text-indigo-900/80 dark:text-indigo-300/90',
                  sliderBg: 'bg-indigo-200 dark:bg-indigo-900',
                  sliderAccent: 'accent-indigo-600',
                  badgeBg: 'bg-white dark:bg-indigo-900/70',
                  badgeText: 'text-indigo-950 dark:text-indigo-100',
                  badgeBorder: 'border-indigo-200 dark:border-indigo-700',
                  daySelectedBg: 'bg-indigo-600',
                  daySelectedBorder: 'border-indigo-700',
                  btnActiveBg: 'bg-white dark:bg-indigo-900',
                  btnActiveText: 'text-indigo-950 dark:text-indigo-100',
                }
              )}

              {/* Musicoterapia */}
              {renderCategoryCard(
                'Musicoterapia',
                '🎶',
                'maxMusicDaysPerWeek',
                'musicDaysConfig',
                3,
                {
                  cardBg: 'bg-purple-50/70 dark:bg-purple-950/25',
                  border: 'border-purple-200/80 dark:border-purple-800/40',
                  titleColor: 'text-purple-950 dark:text-purple-200',
                  subtextColor: 'text-purple-900/80 dark:text-purple-300/90',
                  sliderBg: 'bg-purple-200 dark:bg-purple-900',
                  sliderAccent: 'accent-purple-600',
                  badgeBg: 'bg-white dark:bg-purple-900/70',
                  badgeText: 'text-purple-950 dark:text-purple-100',
                  badgeBorder: 'border-purple-200 dark:border-purple-700',
                  daySelectedBg: 'bg-purple-600',
                  daySelectedBorder: 'border-purple-700',
                  btnActiveBg: 'bg-white dark:bg-purple-900',
                  btnActiveText: 'text-purple-950 dark:text-purple-100',
                }
              )}

              {/* Estimulação Sensorial */}
              {renderCategoryCard(
                'Estimulação Sensorial',
                '🌿',
                'maxSensoryDaysPerWeek',
                'sensoryDaysConfig',
                2,
                {
                  cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/25',
                  border: 'border-emerald-200/80 dark:border-emerald-800/40',
                  titleColor: 'text-emerald-950 dark:text-emerald-200',
                  subtextColor: 'text-emerald-900/80 dark:text-emerald-300/90',
                  sliderBg: 'bg-emerald-200 dark:bg-emerald-900',
                  sliderAccent: 'accent-emerald-600',
                  badgeBg: 'bg-white dark:bg-emerald-900/70',
                  badgeText: 'text-emerald-950 dark:text-emerald-100',
                  badgeBorder: 'border-emerald-200 dark:border-emerald-700',
                  daySelectedBg: 'bg-emerald-600',
                  daySelectedBorder: 'border-emerald-700',
                  btnActiveBg: 'bg-white dark:bg-emerald-900',
                  btnActiveText: 'text-emerald-950 dark:text-emerald-100',
                }
              )}

              {/* Expressão Artística */}
              {renderCategoryCard(
                'Expressão Artística',
                '🎨',
                'maxArtisticDaysPerWeek',
                'artisticDaysConfig',
                2,
                {
                  cardBg: 'bg-rose-50/70 dark:bg-rose-950/25',
                  border: 'border-rose-200/80 dark:border-rose-800/40',
                  titleColor: 'text-rose-950 dark:text-rose-200',
                  subtextColor: 'text-rose-900/80 dark:text-rose-300/90',
                  sliderBg: 'bg-rose-200 dark:bg-rose-900',
                  sliderAccent: 'accent-rose-600',
                  badgeBg: 'bg-white dark:bg-rose-900/70',
                  badgeText: 'text-rose-950 dark:text-rose-100',
                  badgeBorder: 'border-rose-200 dark:border-rose-700',
                  daySelectedBg: 'bg-rose-600',
                  daySelectedBorder: 'border-rose-700',
                  btnActiveBg: 'bg-white dark:bg-rose-900',
                  btnActiveText: 'text-rose-950 dark:text-rose-100',
                }
              )}

              {/* Outras Atividades / Lazer */}
              {renderCategoryCard(
                'Outras Atividades / Lazer',
                '🌟',
                'maxOtherDaysPerWeek',
                'otherDaysConfig',
                2,
                {
                  cardBg: 'bg-teal-50/70 dark:bg-teal-950/25',
                  border: 'border-teal-200/80 dark:border-teal-800/40',
                  titleColor: 'text-teal-950 dark:text-teal-200',
                  subtextColor: 'text-teal-900/80 dark:text-teal-300/90',
                  sliderBg: 'bg-teal-200 dark:bg-teal-900',
                  sliderAccent: 'accent-teal-600',
                  badgeBg: 'bg-white dark:bg-teal-900/70',
                  badgeText: 'text-teal-950 dark:text-teal-100',
                  badgeBorder: 'border-teal-200 dark:border-teal-700',
                  daySelectedBg: 'bg-teal-600',
                  daySelectedBorder: 'border-teal-700',
                  btnActiveBg: 'bg-white dark:bg-teal-900',
                  btnActiveText: 'text-teal-950 dark:text-teal-100',
                }
              )}
            </div>
          </div>

          {/* Card 3: Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400 text-sm">💡</span>
              <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                Preferências por Período do Dia
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              Selecione as categorias que prefere realizar preferencialmente em cada período do dia:
            </p>
            
            <div className="space-y-3 pt-1">
              {/* Morning Preference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 dark:text-slate-300 font-medium">🌅 Período da Manhã:</span>
                <select
                  value={suggestionRules?.morningCategoryPreference ?? 'cognitiva'}
                  onChange={(e) => handleRuleChange('morningCategoryPreference', e.target.value)}
                  className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="cognitiva">🧠 Estimulação Cognitiva</option>
                  <option value="fisica">🏃‍♂️ Exercício Físico</option>
                  <option value="musica">🎶 Musicoterapia</option>
                  <option value="sensorial">🌿 Estimulação Sensorial</option>
                  <option value="expressao_artistica">🎨 Expressão Artística</option>
                  <option value="outro">🌟 Outras (Artes / Lazer)</option>
                  <option value="aleatorio">🎲 Aleatório / Variado</option>
                </select>
              </div>

              {/* Afternoon Preference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 dark:text-slate-300 font-medium">🌇 Período da Tarde:</span>
                <select
                  value={suggestionRules?.afternoonCategoryPreference ?? 'musica'}
                  onChange={(e) => handleRuleChange('afternoonCategoryPreference', e.target.value)}
                  className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="cognitiva">🧠 Estimulação Cognitiva</option>
                  <option value="fisica">🏃‍♂️ Exercício Físico</option>
                  <option value="musica">🎶 Musicoterapia</option>
                  <option value="sensorial">🌿 Estimulação Sensorial</option>
                  <option value="expressao_artistica">🎨 Expressão Artística</option>
                  <option value="outro">🌟 Outras (Artes / Lazer)</option>
                  <option value="aleatorio">🎲 Aleatório / Variado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 4: Hours */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 text-sm">🕒</span>
              <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                Horários de Realização Padrão
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              Configure o horário padrão em que as sessões de animação devem idealmente começar em cada turno:
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Manhã</label>
                <input
                  type="text"
                  value={suggestionRules?.morningTime ?? '10:30'}
                  onChange={(e) => handleRuleChange('morningTime', e.target.value)}
                  placeholder="Ex: 10:30"
                  className="w-full text-xs border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-center"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Tarde</label>
                <input
                  type="text"
                  value={suggestionRules?.afternoonTime ?? '15:30'}
                  onChange={(e) => handleRuleChange('afternoonTime', e.target.value)}
                  placeholder="Ex: 15:30"
                  className="w-full text-xs border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-hidden focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('catalog');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
          >
            <span>Guardar e Ver Catálogo</span>
          </button>
        </div>
      </div>
    )}

      {/* CREATE NEW ACTIVITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-sans">
                  Novo Modelo de Atividade
                </span>
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base mt-1">
                  Registar Atividade no Catálogo
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-slate-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Título da Atividade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pintura de Azulejos com Guache"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                  >
                    <option value="cognitiva">Cognitiva</option>
                    <option value="fisica">Física</option>
                    <option value="musica">Música</option>
                    <option value="outro">Outra / Lúdica</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duração (Minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Descrição Detalhada</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explique detalhadamente como a atividade é realizada de forma terapêutica..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Materiais (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tintas guache, Pincéis macios, Moldes de cartão, Água"
                  value={materialsInput}
                  onChange={(e) => setMaterialsInput(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Objetivos Terapêuticos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Treinar motricidade fina, Promover foco, Estimular relaxamento"
                  value={objectivesInput}
                  onChange={(e) => setObjectivesInput(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold text-gray-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100"
                >
                  Guardar Atividade
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT EXISTING ACTIVITY MODAL */}
      {editingActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-sans">
                  Editar Modelo de Atividade
                </span>
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base mt-1">
                  Atualizar Atividade no Catálogo
                </h3>
              </div>
              <button 
                onClick={() => setEditingActivity(null)}
                className="text-gray-400 hover:text-slate-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateActivity} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Título da Atividade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pintura de Azulejos com Guache"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ActivityCategory)}
                    className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                  >
                    <option value="cognitiva">Cognitiva</option>
                    <option value="fisica">Física</option>
                    <option value="musica">Música</option>
                    <option value="sensorial">Sensorial</option>
                    <option value="expressao_artistica">Expressão Artística / Artes Manuais</option>
                    <option value="outro">Outra / Lúdica</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duração (Minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    required
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Descrição Detalhada</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explique detalhadamente como a atividade é realizada de forma terapêutica..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Materiais (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tintas guache, Pincéis macios, Moldes de cartão, Água"
                  value={editMaterialsInput}
                  onChange={(e) => setEditMaterialsInput(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Objetivos Terapêuticos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Treinar motricidade fina, Promover foco, Estimular relaxamento"
                  value={editObjectivesInput}
                  onChange={(e) => setEditObjectivesInput(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="text-xs font-bold text-gray-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100"
                >
                  Guardar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
