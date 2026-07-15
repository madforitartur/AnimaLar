import React, { useState } from 'react';
import { Activity, ScheduledActivity, ActivityCategory, Resident } from '../types';
import { PREDEFINED_ACTIVITIES } from '../data';
import { Calendar as CalendarIcon, Clock, Plus, Check, ChevronLeft, ChevronRight, Filter, AlertCircle, Edit, Trash2, CalendarCheck, BookOpen, Sparkles } from 'lucide-react';
import GeminiPlanner from './GeminiPlanner';
import Tooltip from './Tooltip';

interface CalendarViewProps {
  scheduledActivities: ScheduledActivity[];
  residents: Resident[];
  activities: Activity[];
  onAddScheduledActivity: (activity: Omit<ScheduledActivity, 'id'>) => void;
  onToggleCompleteActivity: (id: string) => void;
  onDeleteScheduledActivity: (id: string) => void;
  onUpdateScheduledActivity?: (activity: ScheduledActivity) => void;
  onOpenParticipationLog: (activity: ScheduledActivity) => void;
}

export default function CalendarView({
  scheduledActivities,
  residents,
  activities,
  onAddScheduledActivity,
  onToggleCompleteActivity,
  onDeleteScheduledActivity,
  onUpdateScheduledActivity,
  onOpenParticipationLog,
}: CalendarViewProps) {
  // Current month being viewed - default to July 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-13'); // default selected date
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | 'todos'>('todos');
  const [showGeminiPlanner, setShowGeminiPlanner] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<'mensal' | 'semanal'>('mensal');

  // Scheduling Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalSlot, setModalSlot] = useState<'manha' | 'tarde'>('manha');
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(activities[0]?.id || '');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState<ActivityCategory>('cognitiva');
  const [modalTime, setModalTime] = useState('10:00');

  // Editing Scheduled Activity State
  const [editingScheduled, setEditingScheduled] = useState<ScheduledActivity | null>(null);
  const [editModalTime, setEditModalTime] = useState('10:00');
  const [editModalSlot, setEditModalSlot] = useState<'manha' | 'tarde'>('manha');
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalDesc, setEditModalDesc] = useState('');
  const [editModalCategory, setEditModalCategory] = useState<ActivityCategory>('cognitiva');

  const handleOpenEditScheduledModal = (act: ScheduledActivity) => {
    setEditingScheduled(act);
    setEditModalTime(act.time || '10:00');
    setEditModalSlot(act.slot);
    setEditModalTitle(act.title);
    setEditModalDesc(act.description);
    setEditModalCategory(act.category);
  };

  const handleUpdateScheduledActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduled) return;

    if (onUpdateScheduledActivity) {
      onUpdateScheduledActivity({
        ...editingScheduled,
        title: editModalTitle.trim(),
        description: editModalDesc.trim(),
        category: editModalCategory,
        slot: editModalSlot,
        time: editModalTime,
      });
    }

    setEditingScheduled(null);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // Shift so Monday is 0, Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Month and Week navigation
  const handlePrevWeek = () => {
    const date = new Date(selectedDateStr);
    date.setDate(date.getDate() - 7);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${d}`;
    setSelectedDateStr(newDateStr);
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  };

  const handleNextWeek = () => {
    const date = new Date(selectedDateStr);
    date.setDate(date.getDate() + 7);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${d}`;
    setSelectedDateStr(newDateStr);
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  };

  const handlePrevMonth = () => {
    if (calendarViewMode === 'semanal') {
      handlePrevWeek();
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarViewMode === 'semanal') {
      handleNextWeek();
      return;
    }
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date string as YYYY-MM-DD
  const formatDateString = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  // Filter and sort activities
  const getActivitiesForDate = (dateStr: string) => {
    return scheduledActivities.filter((act) => {
      const matchDate = act.date === dateStr;
      const matchFilter = filterCategory === 'todos' || act.category === filterCategory;
      return matchDate && matchFilter;
    });
  };

  // Open modal to schedule activity
  const openScheduleModal = (dateStr: string, slot: 'manha' | 'tarde') => {
    setModalDate(dateStr);
    setModalSlot(slot);
    setModalTime(slot === 'manha' ? '10:00' : '15:30');
    setUseTemplate(true);
    setShowModal(true);
  };

  // Save Scheduled Activity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    let title = '';
    let description = '';
    let category: ActivityCategory = 'outro';

    if (useTemplate) {
      const template = activities.find((t) => t.id === selectedTemplateId);
      if (template) {
        title = template.title;
        description = template.description;
        category = template.category;
      }
    } else {
      title = customTitle.trim() || 'Atividade Personalizada';
      description = customDesc.trim();
      category = customCategory;
    }

    onAddScheduledActivity({
      title,
      description,
      category,
      date: modalDate,
      slot: modalSlot,
      time: modalTime,
      completed: false,
      activityId: useTemplate ? selectedTemplateId : undefined,
    });

    // Reset fields & close
    setCustomTitle('');
    setCustomDesc('');
    setShowModal(false);
  };

  // Render calendar cells
  const renderCalendarCells = () => {
    const cells = [];
    const totalSlots = daysInMonth + firstDayIndex;
    const gridRows = Math.ceil(totalSlots / 7);

    for (let i = 0; i < gridRows * 7; i++) {
      const dayNumber = i - firstDayIndex + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

      if (!isValidDay) {
        // Empty cells for padding
        cells.push(
          <div key={`empty-${i}`} className="bg-gray-50/50 border border-gray-100 min-h-24 p-1 opacity-40 select-none"></div>
        );
      } else {
        const dateStr = formatDateString(dayNumber);
        const dailyActs = getActivitiesForDate(dateStr);
        const morningActs = dailyActs.filter((a) => a.slot === 'manha');
        const afternoonActs = dailyActs.filter((a) => a.slot === 'tarde');
        const isSelected = selectedDateStr === dateStr;
        const isToday = dateStr === '2026-07-13'; // Simulating 13th July 2026

        cells.push(
          <div
            key={`day-${dayNumber}`}
            onClick={() => setSelectedDateStr(dateStr)}
            className={`min-h-28 border border-gray-100 p-1.5 transition-all flex flex-col relative cursor-pointer ${
              isSelected ? 'bg-indigo-50/45 ring-2 ring-indigo-400 ring-inset z-10' : 'bg-white hover:bg-slate-50/60'
            } ${isToday ? 'border-indigo-200' : ''}`}
            id={`cal-cell-${dateStr}`}
          >
            {/* Header of cell */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-xs font-mono font-bold w-5.5 h-5.5 flex items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-indigo-600 text-white'
                    : isSelected
                    ? 'text-indigo-900 bg-indigo-100'
                    : 'text-gray-500'
                }`}
              >
                {dayNumber}
              </span>
              {isToday && (
                <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded font-sans scale-90">
                  Hoje
                </span>
              )}
            </div>

            {/* Morning Slot Box */}
            <div className="flex-1 space-y-1 mb-1 bg-gray-50/50 rounded p-1 border border-gray-100/50 group/slot">
              <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                <span>Manhã 🌅</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openScheduleModal(dateStr, 'manha');
                  }}
                  className="opacity-0 group-hover/slot:opacity-100 text-indigo-600 hover:text-indigo-800 transition-opacity"
                  id={`add-manha-${dateStr}`}
                  title="Planear Manhã"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {morningActs.length === 0 ? (
                <div className="text-[10px] text-gray-300 italic text-center py-1">Vazio</div>
              ) : (
                <div className="space-y-1">
                  {morningActs.map((act) => (
                    <div
                      key={act.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateStr(dateStr);
                      }}
                      className={`text-[10px] font-medium p-1 rounded border flex items-center justify-between gap-1 transition-all ${
                        act.completed
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 opacity-75 line-through'
                          : act.category === 'cognitiva'
                          ? 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100'
                          : act.category === 'fisica'
                          ? 'bg-amber-50 border-amber-100 text-amber-900 hover:bg-amber-100'
                          : act.category === 'musica'
                          ? 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                      }`}
                      id={`cal-act-${act.id}`}
                    >
                      <span className="truncate flex-1">
                        <span className="font-mono text-[9px] opacity-75 mr-1 font-semibold">{act.time}</span>
                        {act.title}
                      </span>
                      {act.completed && <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Afternoon Slot Box */}
            <div className="flex-1 space-y-1 bg-gray-50/50 rounded p-1 border border-gray-100/50 group/aslot">
              <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                <span>Tarde 🌇</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openScheduleModal(dateStr, 'tarde');
                  }}
                  className="opacity-0 group-hover/aslot:opacity-100 text-indigo-600 hover:text-indigo-800 transition-opacity"
                  id={`add-tarde-${dateStr}`}
                  title="Planear Tarde"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {afternoonActs.length === 0 ? (
                <div className="text-[10px] text-gray-300 italic text-center py-1">Vazio</div>
              ) : (
                <div className="space-y-1">
                  {afternoonActs.map((act) => (
                    <div
                      key={act.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateStr(dateStr);
                      }}
                      className={`text-[10px] font-medium p-1 rounded border flex items-center justify-between gap-1 transition-all ${
                        act.completed
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 opacity-75 line-through'
                          : act.category === 'cognitiva'
                          ? 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100'
                          : act.category === 'fisica'
                          ? 'bg-amber-50 border-amber-100 text-amber-900 hover:bg-amber-100'
                          : act.category === 'musica'
                          ? 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                      }`}
                      id={`cal-act-${act.id}`}
                    >
                      <span className="truncate flex-1">
                        <span className="font-mono text-[9px] opacity-75 mr-1 font-semibold">{act.time}</span>
                        {act.title}
                      </span>
                      {act.completed && <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    return cells;
  };

  // Helper: Get days of the week for the selected date
  const getWeekDays = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Shift so Monday is 0 and Sunday is 6
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      weekDays.push({
        dateStr: `${y}-${m}-${dateNum}`,
        dayName: daysOfWeek[i],
        dayNumber: d.getDate(),
        monthShort: d.toLocaleDateString('pt-PT', { month: 'short' }),
        fullDayName: d.toLocaleDateString('pt-PT', { weekday: 'long' }),
      });
    }
    return weekDays;
  };

  const renderWeeklyView = () => {
    const weekDays = getWeekDays(selectedDateStr);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 mb-4" id="weekly-view-grid">
        {weekDays.map((day) => {
          const dailyActs = getActivitiesForDate(day.dateStr);
          const morningActs = dailyActs.filter((a) => a.slot === 'manha');
          const afternoonActs = dailyActs.filter((a) => a.slot === 'tarde');
          const isSelected = selectedDateStr === day.dateStr;
          const isToday = day.dateStr === '2026-07-13'; // Simulating today

          return (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`flex flex-col border rounded-xl p-3 min-h-[380px] transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-indigo-50/45 ring-2 ring-indigo-400 ring-inset z-10'
                  : 'bg-white hover:bg-slate-50/60 border-gray-150'
              } ${isToday ? 'border-indigo-300 shadow-xs' : ''}`}
              id={`week-col-${day.dateStr}`}
            >
              {/* Day Header */}
              <div className="border-b border-gray-100 pb-2 mb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">
                    {day.dayName}
                  </span>
                  <span className="font-display font-bold text-sm text-gray-800">
                    {day.dayNumber} {day.monthShort}
                  </span>
                </div>
                {isToday && (
                  <span className="text-[8px] uppercase font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded font-sans shrink-0">
                    Hoje
                  </span>
                )}
              </div>

              {/* Slots Section */}
              <div className="flex-1 flex flex-col gap-2.5">
                {/* Morning Slot */}
                <div className="flex-1 bg-gray-50/50 rounded-lg p-2 border border-gray-100/50 flex flex-col group/mslot">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold mb-1 border-b border-gray-100/30 pb-0.5">
                    <span>Manhã 🌅</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openScheduleModal(day.dateStr, 'manha');
                      }}
                      className="opacity-0 group-hover/mslot:opacity-100 text-indigo-600 hover:text-indigo-800 transition-opacity"
                      id={`add-week-manha-${day.dateStr}`}
                      title="Planear Manhã"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {morningActs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-gray-300 italic py-2">
                      Vazio
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {morningActs.map((act) => (
                        <div
                          key={act.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(day.dateStr);
                          }}
                          className={`text-[10px] font-medium p-1.5 rounded-lg border flex flex-col gap-1 transition-all relative group/act ${
                            act.completed
                              ? 'bg-emerald-50/45 border-emerald-100 text-emerald-800 opacity-80 line-through'
                              : act.category === 'cognitiva'
                              ? 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100'
                              : act.category === 'fisica'
                              ? 'bg-amber-50 border-amber-100 text-amber-900 hover:bg-amber-100'
                              : act.category === 'musica'
                              ? 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100'
                              : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                          }`}
                          id={`week-act-${act.id}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] opacity-75 font-bold shrink-0">{act.time}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/act:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleCompleteActivity(act.id);
                                }}
                                className="p-0.5 rounded hover:bg-black/5 text-gray-500 hover:text-emerald-600"
                                title="Concluir"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className="font-semibold truncate leading-tight">{act.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Afternoon Slot */}
                <div className="flex-1 bg-gray-50/50 rounded-lg p-2 border border-gray-100/50 flex flex-col group/aslot">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold mb-1 border-b border-gray-100/30 pb-0.5">
                    <span>Tarde 🌇</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openScheduleModal(day.dateStr, 'tarde');
                      }}
                      className="opacity-0 group-hover/aslot:opacity-100 text-indigo-600 hover:text-indigo-800 transition-opacity"
                      id={`add-week-tarde-${day.dateStr}`}
                      title="Planear Tarde"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {afternoonActs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-gray-300 italic py-2">
                      Vazio
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {afternoonActs.map((act) => (
                        <div
                          key={act.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(day.dateStr);
                          }}
                          className={`text-[10px] font-medium p-1.5 rounded-lg border flex flex-col gap-1 transition-all relative group/act ${
                            act.completed
                              ? 'bg-emerald-50/45 border-emerald-100 text-emerald-800 opacity-80 line-through'
                              : act.category === 'cognitiva'
                              ? 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100'
                              : act.category === 'fisica'
                              ? 'bg-amber-50 border-amber-100 text-amber-900 hover:bg-amber-100'
                              : act.category === 'musica'
                              ? 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100'
                              : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                          }`}
                          id={`week-act-${act.id}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] opacity-75 font-bold shrink-0">{act.time}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/act:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleCompleteActivity(act.id);
                                }}
                                className="p-0.5 rounded hover:bg-black/5 text-gray-500 hover:text-emerald-600"
                                title="Concluir"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className="font-semibold truncate leading-tight">{act.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Get details of selected day for the side view
  const selectedDayActs = scheduledActivities.filter((a) => a.date === selectedDateStr);
  const formattedSelectedDate = new Date(selectedDateStr).toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (showGeminiPlanner) {
    return (
      <GeminiPlanner
        residents={residents}
        onAddScheduledActivity={onAddScheduledActivity}
        onClose={() => setShowGeminiPlanner(false)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="calendar-view-container">
      {/* Calendar Grid (Main 3 Columns) */}
      <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-indigo-600 animate-pulse" id="cal-icon-header" />
            <h2 className="font-display font-bold text-gray-800 text-sm sm:text-base lg:text-lg shrink-0">
              {calendarViewMode === 'mensal' ? (
                `${monthNames[currentMonth]} ${currentYear}`
              ) : (
                `Semana de ${getWeekDays(selectedDateStr)[0].dayNumber} a ${getWeekDays(selectedDateStr)[6].dayNumber} de ${monthNames[currentMonth]}`
              )}
            </h2>
            <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-1 bg-slate-50 shrink-0">
              <Tooltip position="bottom" content={calendarViewMode === 'semanal' ? 'Semana Anterior: Retroceder para a semana anterior' : 'Mês Anterior: Retroceder para o mês anterior'}>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white hover:text-indigo-600 rounded transition-all cursor-pointer"
                  id="btn-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip position="bottom" content={calendarViewMode === 'semanal' ? 'Próxima Semana: Avançar para a próxima semana' : 'Próximo Mês: Avançar para o próximo mês'}>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white hover:text-indigo-600 rounded transition-all cursor-pointer"
                  id="btn-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            {/* View switcher */}
            <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-1 bg-slate-50 shrink-0">
              <button
                onClick={() => setCalendarViewMode('mensal')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  calendarViewMode === 'mensal'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-view-mensal"
              >
                Mensal
              </button>
              <button
                onClick={() => setCalendarViewMode('semanal')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  calendarViewMode === 'semanal'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-view-semanal"
              >
                Semanal
              </button>
            </div>
            
            <Tooltip position="left" content="Sugerir Plano IA: Gerar sugestões de rotinas de estimulação cognitiva e física personalizadas usando Inteligência Artificial">
              <button
                onClick={() => setShowGeminiPlanner(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-md ml-2"
                id="btn-open-gemini-planner"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Sugerir Plano IA
              </button>
            </Tooltip>
          </div>

          {/* Categorical Filtering */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-1.5 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              onClick={() => setFilterCategory('todos')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'todos' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterCategory('cognitiva')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'cognitiva' ? 'bg-purple-100 text-purple-900 shadow-xs font-bold' : 'text-purple-600/80 hover:text-purple-950'
              }`}
            >
              Cognitiva 🧠
            </button>
            <button
              onClick={() => setFilterCategory('fisica')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'fisica' ? 'bg-amber-100 text-amber-900 shadow-xs font-bold' : 'text-amber-600/80 hover:text-amber-950'
              }`}
            >
              Física 🏃‍♂️
            </button>
            <button
              onClick={() => setFilterCategory('musica')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'musica' ? 'bg-blue-100 text-blue-900 shadow-xs font-bold' : 'text-blue-600/80 hover:text-blue-950'
              }`}
            >
              Música 🎶
            </button>
            <button
              onClick={() => setFilterCategory('outro')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'outro' ? 'bg-slate-200 text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Outro 🎨
            </button>
          </div>
        </div>

        {/* Conditional Month view vs Weekly view rendering */}
        {calendarViewMode === 'mensal' ? (
          <>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-gray-400 bg-slate-50 py-2 rounded-xl border border-gray-100/50">
              {daysOfWeek.map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarCells()}
            </div>
          </>
        ) : (
          renderWeeklyView()
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-500">Categorias:</span>
            <span className="flex items-center gap-1 font-medium text-purple-800 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
              🧠 Estimulação Cognitiva
            </span>
            <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
              🏃‍♂️ Exercício Físico Leve
            </span>
            <span className="flex items-center gap-1 font-medium text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
              🎶 Musicoterapia
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              🎨 Outros Ateliers
            </span>
          </div>
          <div className="text-gray-400 text-[10px] font-mono">
            Clique em 🌅 / 🌇 para agendar rapidamente
          </div>
        </div>
      </div>

      {/* Daily Routine Sidebar (1 Column) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Rotina Diária</span>
          <h3 className="font-display font-semibold text-gray-800 text-sm leading-tight capitalize mt-0.5">
            {formattedSelectedDate}
          </h3>
        </div>

        {selectedDayActs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">Nenhuma Atividade Planeada</p>
            <p className="text-[10px] text-gray-400 mt-1 max-w-44">Agende sessões de ginástica, estimulação cognitiva ou música para hoje.</p>
            <div className="mt-4 flex gap-1.5">
              <button
                onClick={() => openScheduleModal(selectedDateStr, 'manha')}
                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                id="btn-quick-manha"
              >
                + Manhã
              </button>
              <button
                onClick={() => openScheduleModal(selectedDateStr, 'tarde')}
                className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                id="btn-quick-tarde"
              >
                + Tarde
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {selectedDayActs.map((act) => {
              const categoryColor = {
                cognitiva: 'border-l-purple-500 bg-purple-50/50',
                fisica: 'border-l-amber-500 bg-amber-50/50',
                musica: 'border-l-blue-500 bg-blue-50/50',
                outro: 'border-l-slate-400 bg-slate-50/50',
              };

              return (
                <div
                  key={act.id}
                  className={`border-l-4 rounded-r-xl border border-gray-100 p-4 space-y-3 transition-all hover:shadow-xs relative ${categoryColor[act.category]} ${
                    act.completed ? 'opacity-80' : ''
                  }`}
                  id={`side-act-${act.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono text-gray-400 flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {act.slot === 'manha' ? 'Manhã' : 'Tarde'} • {act.time}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Tooltip position="top" content={act.completed ? "Marcar Pendente: Alterar o estado desta atividade de volta para pendente" : "Concluir Atividade: Registar a atividade de hoje como concluída e realizada com sucesso"}>
                          <button
                            onClick={() => onToggleCompleteActivity(act.id)}
                            className={`p-1 rounded-md border transition-all cursor-pointer ${
                              act.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white hover:bg-slate-100 text-gray-400'
                            }`}
                            id={`complete-btn-${act.id}`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </Tooltip>
                        <Tooltip position="top" content="Editar Atividade: Alterar horário, período ou informações desta sessão agendada">
                          <button
                            onClick={() => handleOpenEditScheduledModal(act)}
                            className="p-1 rounded-md border bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            id={`edit-sched-btn-${act.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </Tooltip>
                        <Tooltip position="top" content="Desmarcar Atividade: Remover esta atividade do plano diário atual">
                          <button
                            onClick={() => onDeleteScheduledActivity(act.id)}
                            className="p-1 rounded-md border bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            id={`delete-btn-${act.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <h4 className={`font-display font-bold text-xs text-slate-800 ${act.completed ? 'line-through text-slate-400' : ''}`}>
                      {act.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                      {act.description}
                    </p>
                  </div>

                  {/* Log Participation Button */}
                  <div className="pt-2 border-t border-gray-100/55 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {act.completed ? 'Concluída ✓' : 'Pendente'}
                    </span>
                    <Tooltip position="left" content="Registar Progresso: Registar e avaliar a participação, nível de atenção e cooperação do grupo de utentes nesta atividade">
                      <button
                        onClick={() => onOpenParticipationLog(act)}
                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs hover:shadow-md transition-all cursor-pointer"
                        id={`log-part-btn-${act.id}`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        Registar Progresso
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedulling Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="schedule-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Agendar Atividade • {modalDate.split('-').reverse().join('/')} ({modalSlot === 'manha' ? 'Manhã' : 'Tarde'})
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
                id="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              {/* Slot / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Período</label>
                  <select
                    value={modalSlot}
                    onChange={(e) => {
                      const val = e.target.value as 'manha' | 'tarde';
                      setModalSlot(val);
                      setModalTime(val === 'manha' ? '10:00' : '15:30');
                    }}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="manha">Manhã 🌅</option>
                    <option value="tarde">Tarde 🌇</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hora de Início</label>
                  <input
                    type="time"
                    required
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Source Option */}
              <div className="flex gap-4 items-center bg-slate-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-500">Tipo de Atividade:</span>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={useTemplate}
                    onChange={() => setUseTemplate(true)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Usar Modelo Terapêutico
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={!useTemplate}
                    onChange={() => setUseTemplate(false)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Criar Personalizada
                </label>
              </div>

              {/* Template Selection */}
              {useTemplate ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selecionar Modelo de Atividade</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {activities.map((act) => {
                      const icon = act.category === 'cognitiva' ? '🧠' : act.category === 'fisica' ? '🏃‍♂️' : act.category === 'musica' ? '🎶' : '🎨';
                      return (
                        <option key={act.id} value={act.id}>
                          {icon} {act.title} ({act.durationMinutes} min)
                        </option>
                      );
                    })}
                  </select>
                  {/* Quick Preview of Template */}
                  {(() => {
                    const selectedTemp = activities.find((t) => t.id === selectedTemplateId);
                    if (!selectedTemp) return null;
                    return (
                      <div className="mt-2.5 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 text-[11px] text-indigo-950 space-y-1.5">
                        <p className="font-semibold">{selectedTemp.title}</p>
                        <p className="text-gray-600 leading-relaxed">{selectedTemp.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {selectedTemp.materials.map((m, i) => (
                            <span key={i} className="bg-indigo-100/70 border border-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded text-[9px] font-sans">
                              📌 {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Custom Creator Form */
                <div className="space-y-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Título da Atividade</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tarde de Danças de Roda Portuguesas"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['cognitiva', 'fisica', 'musica', 'outro'] as ActivityCategory[]).map((cat) => {
                        const labels = {
                          cognitiva: '🧠 Cognitiva',
                          fisica: '🏃‍♂️ Física',
                          musica: '🎶 Música',
                          outro: '🎨 Outro',
                        };
                        const colors = {
                          cognitiva: 'peer-checked:bg-purple-600 peer-checked:text-white text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200',
                          fisica: 'peer-checked:bg-amber-600 peer-checked:text-white text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',
                          musica: 'peer-checked:bg-blue-600 peer-checked:text-white text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',
                          outro: 'peer-checked:bg-slate-700 peer-checked:text-white text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200',
                        };

                        return (
                          <label key={cat} className="cursor-pointer">
                            <input
                              type="radio"
                              name="custom-cat"
                              value={cat}
                              checked={customCategory === cat}
                              onChange={() => setCustomCategory(cat)}
                              className="sr-only peer"
                            />
                            <div className={`text-[10px] font-bold py-2 px-1 text-center border rounded-lg transition-all peer-checked:border-transparent ${colors[cat]}`}>
                              {labels[cat]}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                    <textarea
                      rows={3}
                      placeholder="Fale brevemente do desenvolvimento, dinâmicas e materiais..."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Agendar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHEDULED ACTIVITY MODAL */}
      {editingScheduled && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-schedule-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Editar Sessão Agendada • {editingScheduled.date.split('-').reverse().join('/')}
              </h3>
              <button
                onClick={() => setEditingScheduled(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
                id="close-edit-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateScheduledActivity} className="space-y-4">
              {/* Slot / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Período</label>
                  <select
                    value={editModalSlot}
                    onChange={(e) => {
                      const val = e.target.value as 'manha' | 'tarde';
                      setEditModalSlot(val);
                      setEditModalTime(val === 'manha' ? '10:00' : '15:30');
                    }}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="manha">Manhã 🌅</option>
                    <option value="tarde">Tarde 🌇</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hora de Início</label>
                  <input
                    type="time"
                    required
                    value={editModalTime}
                    onChange={(e) => setEditModalTime(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Title, Category and Description */}
              <div className="space-y-3 bg-gray-50/50 border border-gray-100 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Título da Atividade</label>
                  <input
                    type="text"
                    required
                    value={editModalTitle}
                    onChange={(e) => setEditModalTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['cognitiva', 'fisica', 'musica', 'outro'] as ActivityCategory[]).map((cat) => {
                      const labels = {
                        cognitiva: '🧠 Cognitiva',
                        fisica: '🏃‍♂️ Física',
                        musica: '🎶 Música',
                        outro: '🎨 Outro',
                      };
                      const colors = {
                        cognitiva: 'peer-checked:bg-purple-600 peer-checked:text-white text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200',
                        fisica: 'peer-checked:bg-amber-600 peer-checked:text-white text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',
                        musica: 'peer-checked:bg-blue-600 peer-checked:text-white text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',
                        outro: 'peer-checked:bg-slate-700 peer-checked:text-white text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200',
                      };

                      return (
                        <label key={cat} className="cursor-pointer">
                          <input
                            type="radio"
                            name="edit-cat"
                            value={cat}
                            checked={editModalCategory === cat}
                            onChange={() => setEditModalCategory(cat)}
                            className="sr-only peer"
                          />
                          <div className={`text-[10px] font-bold py-2 px-1 text-center border rounded-lg transition-all peer-checked:border-transparent ${colors[cat]}`}>
                            {labels[cat]}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={4}
                    value={editModalDesc}
                    onChange={(e) => setEditModalDesc(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingScheduled(null)}
                  className="text-xs px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
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
