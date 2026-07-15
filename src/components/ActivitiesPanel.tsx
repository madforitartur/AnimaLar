import React, { useState } from 'react';
import { Activity, ScheduledActivity, ActivityCategory } from '../types';
import {
  Plus, Search, Filter, Clock, BookOpen, BrainCircuit, Activity as PhysIcon,
  Music, Sparkles, Trash2, Calendar, CheckCircle, ListTodo, HelpCircle, Edit,
  Printer
} from 'lucide-react';
import Tooltip from './Tooltip';

interface ActivitiesPanelProps {
  activities: Activity[];
  scheduledActivities: ScheduledActivity[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity?: (activity: Activity) => void;
  onSelectTab?: (tab: any) => void;
}

export default function ActivitiesPanel({
  activities,
  scheduledActivities,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
  onSelectTab
}: ActivitiesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | 'todos'>('todos');
  
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
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
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
      default:
        return 'bg-purple-50 text-purple-700 border-purple-100';
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

      {/* Grid containing filters, statistics, and main list */}
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
              {(['todos', 'cognitiva', 'fisica', 'musica', 'outro'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    filterCategory === cat
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">{cat === 'todos' ? 'Todas as Categorias' : cat === 'fisica' ? 'Física' : cat === 'cognitiva' ? 'Cognitiva' : cat === 'musica' ? 'Música' : 'Outra'}</span>
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

          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.length === 0 ? (
              <div className="col-span-2 bg-slate-50 border border-dashed border-gray-200 p-8 text-center rounded-2xl flex flex-col items-center justify-center space-y-3">
                <HelpCircle className="w-10 h-10 text-gray-300" />
                <div>
                  <p className="font-display font-bold text-slate-700 text-sm">Nenhuma atividade encontrada</p>
                  <p className="text-gray-400 text-xs mt-0.5">Tente ajustar os filtros ou pesquisar por outro termo.</p>
                </div>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div 
                  key={act.id} 
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category and Duration */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${getCategoryColor(act.category)}`}>
                        {getCategoryIcon(act.category)}
                        <span>{act.category === 'fisica' ? 'Física' : act.category === 'cognitiva' ? 'Cognitiva' : act.category === 'musica' ? 'Música' : 'Outra'}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {act.durationMinutes} minutos
                      </span>
                    </div>

                    {/* Title and description */}
                    <div>
                      <h3 className="font-display font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {act.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    {/* Objectives list */}
                    <div className="pt-2.5 border-t border-gray-50 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Objetivos Terapêuticos</span>
                      <div className="flex flex-wrap gap-1">
                        {act.objectives.map((obj, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-gray-100">
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
                                onClick={() => onSelectTab('materials')}
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
                  </div>

                  {/* Actions footer on Card */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end gap-1.5">
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
              ))
            )}
          </div>

        </div>

      </div>

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
