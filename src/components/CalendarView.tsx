import React, { useState, useRef } from 'react';
import { Activity, ScheduledActivity, ActivityCategory, Resident, SuggestionRules } from '../types';
import { PREDEFINED_ACTIVITIES } from '../data';
import { Calendar as CalendarIcon, Clock, Plus, Check, ChevronLeft, ChevronRight, Filter, AlertCircle, Edit, Trash2, CalendarCheck, BookOpen, Sparkles, GripVertical, RefreshCw, ListTodo, X, Printer, Download, LayoutGrid } from 'lucide-react';
// @ts-ignore
import logoUrl from '../assets/images/lar_santo_antonio_logo_official_1784530465177.jpg';
import GeminiPlanner from './GeminiPlanner';
import Tooltip from './Tooltip';
import { generateSuggestedPlan } from '../utils/suggestionGenerator';

// Convert OKLCH colors to rgb/rgba format so html2canvas doesn't crash on Tailwind v4 styles
const parseAndConvertOklch = (cssText: string): string => {
  return cssText.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.trim().split(/\s*[\s/]\s*/);
      if (parts.length < 3) return match;

      const LStr = parts[0];
      const CStr = parts[1];
      const HStr = parts[2];
      const AStr = parts[3];

      const L = LStr.endsWith('%') ? parseFloat(LStr) / 100 : parseFloat(LStr);
      const C = CStr.endsWith('%') ? parseFloat(CStr) / 100 : parseFloat(CStr);
      const H = HStr.endsWith('deg') ? parseFloat(HStr) : parseFloat(HStr);
      
      let alpha = 1;
      if (AStr) {
        alpha = AStr.endsWith('%') ? parseFloat(AStr) / 100 : parseFloat(AStr);
      }

      if (isNaN(L) || isNaN(C) || isNaN(H)) return match;

      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const convert = (cVal: number) => {
        return cVal <= 0.0031308 ? 12.92 * cVal : 1.055 * Math.pow(cVal, 1 / 2.4) - 0.055;
      };

      const r255 = Math.round(Math.max(0, Math.min(1, convert(r))) * 255);
      const g255 = Math.round(Math.max(0, Math.min(1, convert(g))) * 255);
      const b255 = Math.round(Math.max(0, Math.min(1, convert(bVal))) * 255);

      if (AStr) {
        return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
      } else {
        return `rgb(${r255}, ${g255}, ${b255})`;
      }
    } catch (e) {
      return match;
    }
  });
};

const parseAndConvertOklab = (cssText: string): string => {
  return cssText.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.trim().split(/\s*[\s/]\s*/);
      if (parts.length < 3) return match;

      const LStr = parts[0];
      const aStr = parts[1];
      const bStr = parts[2];
      const AStr = parts[3];

      const L = LStr.endsWith('%') ? parseFloat(LStr) / 100 : parseFloat(LStr);
      
      const parseAb = (str: string) => {
        if (str.endsWith('%')) {
          return (parseFloat(str) / 100) * 0.4;
        }
        return parseFloat(str);
      };

      const a = parseAb(aStr);
      const b = parseAb(bStr);
      
      let alpha = 1;
      if (AStr) {
        alpha = AStr.endsWith('%') ? parseFloat(AStr) / 100 : parseFloat(AStr);
      }

      if (isNaN(L) || isNaN(a) || isNaN(b)) return match;

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const convert = (cVal: number) => {
        return cVal <= 0.0031308 ? 12.92 * cVal : 1.055 * Math.pow(cVal, 1 / 2.4) - 0.055;
      };

      const r255 = Math.round(Math.max(0, Math.min(1, convert(r))) * 255);
      const g255 = Math.round(Math.max(0, Math.min(1, convert(g))) * 255);
      const b255 = Math.round(Math.max(0, Math.min(1, convert(bVal))) * 255);

      if (AStr) {
        return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
      } else {
        return `rgb(${r255}, ${g255}, ${b255})`;
      }
    } catch (e) {
      return match;
    }
  });
};

const parseAndConvertTailwindColors = (cssText: string): string => {
  let result = cssText;
  if (result.includes('oklch')) {
    result = parseAndConvertOklch(result);
  }
  if (result.includes('oklab')) {
    result = parseAndConvertOklab(result);
  }
  return result;
};

interface CalendarViewProps {
  scheduledActivities: ScheduledActivity[];
  residents: Resident[];
  activities: Activity[];
  suggestionRules: SuggestionRules;
  onAddScheduledActivity: (activity: Omit<ScheduledActivity, 'id'>) => void;
  onAddScheduledActivities?: (activities: Omit<ScheduledActivity, 'id'>[], clearDates?: string[]) => void;
  onToggleCompleteActivity: (id: string) => void;
  onDeleteScheduledActivity: (id: string) => void;
  onDeleteScheduledActivities?: (ids: string[]) => void;
  onUpdateScheduledActivity?: (activity: ScheduledActivity) => void;
  onOpenParticipationLog: (activity: ScheduledActivity) => void;
  onReorderScheduledActivities?: (activities: ScheduledActivity[], date: string) => void;
}

const getTodayStr = (): string => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function CalendarView({
  scheduledActivities,
  residents,
  activities,
  suggestionRules,
  onAddScheduledActivity,
  onAddScheduledActivities,
  onToggleCompleteActivity,
  onDeleteScheduledActivity,
  onDeleteScheduledActivities,
  onUpdateScheduledActivity,
  onOpenParticipationLog,
  onReorderScheduledActivities,
}: CalendarViewProps) {
  // Current month being viewed - default to the current month/year
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState(() => getTodayStr()); // default selected date is today
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | 'todos'>('todos');
  const [showGeminiPlanner, setShowGeminiPlanner] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<'mensal' | 'semanal'>('mensal');
  const [confirmClear, setConfirmClear] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const daysOfWeekFull = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  const calcDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const calcFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun index
  };

  const totalDays = calcDaysInMonth(currentYear, currentMonth);
  const startDayIndex = calcFirstDayOfMonth(currentYear, currentMonth);

  const getActivityMapForPrint = () => {
    const map: Record<string, { manha: ScheduledActivity[]; tarde: ScheduledActivity[] }> = {};
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayActs = scheduledActivities
        .filter(a => a.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));
      
      map[day] = {
        manha: dayActs.filter(a => a.slot === 'manha'),
        tarde: dayActs.filter(a => a.slot === 'tarde')
      };
    }
    return map;
  };

  const activityMapForPrint = getActivityMapForPrint();

  const renderWeeksForPrint = () => {
    const weeksList = [];
    let currentWeek: (number | null)[] = Array(7).fill(null);
    for (let i = 0; i < startDayIndex; i++) {
      currentWeek[i] = null;
    }
    let colIndex = startDayIndex;
    for (let day = 1; day <= totalDays; day++) {
      currentWeek[colIndex] = day;
      colIndex++;
      if (colIndex === 7) {
        weeksList.push(currentWeek);
        currentWeek = Array(7).fill(null);
        colIndex = 0;
      }
    }
    if (currentWeek.some(val => val !== null)) {
      weeksList.push(currentWeek);
    }
    return weeksList;
  };

  const printWeeks = renderWeeksForPrint();
  const activePrintWeek = printWeeks[selectedWeekIndex] || printWeeks[0] || Array(7).fill(null);

  const getWeekLabelForPrint = (week: (number | null)[], idx: number) => {
    const validDays = week.filter((d): d is number => d !== null);
    if (validDays.length === 0) return `Semana ${idx + 1}`;
    const firstDay = validDays[0];
    const lastDay = validDays[validDays.length - 1];
    return `Semana ${idx + 1} (${firstDay} a ${lastDay} de ${monthNames[currentMonth]})`;
  };

  const getPeriodoReferenciaForPrint = () => {
    if (calendarViewMode === 'mensal') {
      return `De 01 a ${totalDays} de ${monthNames[currentMonth]} de ${currentYear}`;
    } else {
      const validDays = activePrintWeek.filter((d): d is number => d !== null);
      if (validDays.length === 0) return `Semana ${selectedWeekIndex + 1} de ${monthNames[currentMonth]} de ${currentYear}`;
      const firstDay = validDays[0];
      const lastDay = validDays[validDays.length - 1];
      return `Semana ${selectedWeekIndex + 1} (${firstDay} a ${lastDay} de ${monthNames[currentMonth]} de ${currentYear})`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    
    const originalStyleContents: { tag: HTMLStyleElement; content: string }[] = [];
    const disabledLinks: { link: HTMLLinkElement; tempStyle: HTMLStyleElement }[] = [];
    const originalGetComputedStyle = window.getComputedStyle;
    
    let originalElementStyle: string | null = null;
    const originalWrapperStyles: { el: HTMLDivElement; style: string | null }[] = [];

    try {
      const element = document.getElementById('printable-sheet');
      if (!element) {
        throw new Error("Elemento de exportação não encontrado");
      }

      originalElementStyle = element.getAttribute('style');

      element.classList.remove('hidden');
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '1280px';
      element.style.maxWidth = 'none';
      element.style.overflow = 'visible';

      const scrollWrappers = Array.from(element.querySelectorAll('.overflow-x-auto')) as HTMLDivElement[];
      scrollWrappers.forEach(el => {
        originalWrapperStyles.push({ el, style: el.getAttribute('style') });
        el.style.overflow = 'visible';
        el.style.overflowX = 'visible';
      });

      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return (propertyName: string) => {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string') {
                  return parseAndConvertTailwindColors(val);
                }
                return val;
              };
            }
            
            const val = target[prop as any];
            if (typeof val === 'function') {
              return (val as any).bind(target);
            }
            if (typeof val === 'string') {
              return parseAndConvertTailwindColors(val);
            }
            return val;
          }
        });
      };

      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const link of links) {
        try {
          if (!link.href) continue;
          const isSameOrigin = link.href.startsWith(window.location.origin) || !link.href.includes('://');
          if (!isSameOrigin) continue;
          if (link.href === window.location.href || link.href === window.location.origin || link.href === window.location.origin + '/') {
            continue;
          }

          const res = await fetch(link.href);
          if (res.ok) {
            const text = await res.text();
            if (text.includes('oklch') || text.includes('oklab')) {
              const convertedText = parseAndConvertTailwindColors(text);
              const tempStyle = document.createElement('style');
              tempStyle.setAttribute('data-temp-oklch-fix', 'true');
              tempStyle.textContent = convertedText;
              document.head.appendChild(tempStyle);
              link.disabled = true;
              disabledLinks.push({ link, tempStyle });
            }
          }
        } catch (linkErr) {
          console.warn('Could not parse external stylesheet:', link.href, linkErr);
        }
      }

      const styleTags = Array.from(document.querySelectorAll('style:not([data-temp-oklch-fix="true"])')) as HTMLStyleElement[];
      styleTags.forEach(tag => {
        const text = tag.textContent || '';
        if (text.includes('oklch') || text.includes('oklab')) {
          originalStyleContents.push({ tag, content: text });
          tag.textContent = parseAndConvertTailwindColors(text);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => el.classList.contains('print-hidden-element') || el.classList.contains('print:hidden')
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 297;
      const pdfHeight = 210;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const sanitizedMonth = monthNames[currentMonth].toLowerCase().replace(/\s+/g, '_');
      const filename = calendarViewMode === 'mensal'
        ? `animalar_plano_mensal_${sanitizedMonth}_${currentYear}.pdf`
        : `animalar_plano_semanal_${sanitizedMonth}_${currentYear}.pdf`;

      pdf.save(filename);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível exportar o PDF diretamente. Por favor, utilize o botão de "Imprimir" ou tente novamente.');
    } finally {
      window.getComputedStyle = originalGetComputedStyle;

      originalStyleContents.forEach(({ tag, content }) => {
        tag.textContent = content;
      });
      disabledLinks.forEach(({ link, tempStyle }) => {
        link.disabled = false;
        if (tempStyle.parentNode) {
          tempStyle.parentNode.removeChild(tempStyle);
        }
      });

      const element = document.getElementById('printable-sheet');
      if (element) {
        element.classList.add('hidden');
        if (originalElementStyle !== null) {
          element.setAttribute('style', originalElementStyle);
        } else {
          element.removeAttribute('style');
        }
      }

      originalWrapperStyles.forEach(({ el, style }) => {
        if (style !== null) {
          el.setAttribute('style', style);
        } else {
          el.removeAttribute('style');
        }
      });

      setIsGenerating(false);
    }
  };

  const pendingActivities = scheduledActivities.filter(a => a.status === 'pending_approval');

  const handleDirectSuggestPlan = () => {
    if (!onAddScheduledActivities) return;
    const period = calendarViewMode === 'mensal' ? 'mes' : 'semana';
    const { suggestions, targetDates } = generateSuggestedPlan({
      activities,
      suggestionRules,
      period,
      selectedDateStr,
      currentYear,
      currentMonth,
      status: 'pending_approval'
    });

    if (suggestions.length === 0) {
      alert("Não foi possível gerar sugestões com as regras atuais. Por favor, verifique as suas Regras para sugestão de Planos.");
      return;
    }

    onAddScheduledActivities(suggestions, targetDates);
  };

  const handleApprovePlan = () => {
    if (pendingActivities.length === 0) return;
    pendingActivities.forEach(act => {
      if (onUpdateScheduledActivity) {
        onUpdateScheduledActivity({ ...act, status: 'approved' });
      }
    });
  };

  const handleDiscardPlan = () => {
    if (pendingActivities.length === 0) return;
    const ids = pendingActivities.map(a => a.id);
    if (onDeleteScheduledActivities) {
      onDeleteScheduledActivities(ids);
    } else {
      ids.forEach(id => onDeleteScheduledActivity(id));
    }
  };

  const handleSelectDay = (dateStr: string) => {
    if (selectedDateStr === dateStr) {
      setShowDailyModal(true);
    } else {
      setSelectedDateStr(dateStr);
    }
  };

  const getScheduledActivitiesForPeriod = () => {
    if (calendarViewMode === 'mensal') {
      const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      return scheduledActivities.filter(act => act.date.startsWith(monthPrefix));
    } else {
      const weekDays = getWeekDays(selectedDateStr);
      const weekDates = new Set(weekDays.map(d => d.dateStr));
      return scheduledActivities.filter(act => weekDates.has(act.date));
    }
  };

  const handleClearPeriodActivities = () => {
    const periodActs = getScheduledActivitiesForPeriod();
    const idsToDelete = periodActs
      .filter(act => act.activityId !== 'act_leitura_jornal' && !act.id.startsWith('sch_leitura_jornal_'))
      .map(act => act.id);
    if (idsToDelete.length > 0) {
      if (onDeleteScheduledActivities) {
        onDeleteScheduledActivities(idsToDelete);
      } else {
        idsToDelete.forEach(id => onDeleteScheduledActivity(id));
      }
    }
    setConfirmClear(false);
  };

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

  // Drag and drop / Touch reordering state & handlers
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentIndex = useRef<number>(-1);

  const getSelectedDayActs = () => {
    return scheduledActivities
      .filter((a) => a.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleDragStart = (id: string, index: number) => {
    setDraggedId(id);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const dayActs = getSelectedDayActs();
    const reordered = [...dayActs];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    if (onReorderScheduledActivities) {
      onReorderScheduledActivities(reordered, selectedDateStr);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDraggedIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const dayActs = getSelectedDayActs();
    if (!dayActs[index]) return;
    setDraggedId(dayActs[index].id);
    setDraggedIndex(index);
    touchCurrentIndex.current = index;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchCurrentIndex.current === -1) return;
    const clientY = e.touches[0].clientY;
    
    const listContainer = document.getElementById('selected-acts-list');
    if (!listContainer) return;
    
    const children = Array.from(listContainer.children);
    let targetIndex = -1;
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        targetIndex = i;
        break;
      }
    }
    
    if (targetIndex !== -1 && targetIndex !== touchCurrentIndex.current) {
      const dayActs = getSelectedDayActs();
      const reordered = [...dayActs];
      const draggedItem = reordered[touchCurrentIndex.current];
      if (!draggedItem) return;
      reordered.splice(touchCurrentIndex.current, 1);
      reordered.splice(targetIndex, 0, draggedItem);
      
      touchCurrentIndex.current = targetIndex;
      setDraggedIndex(targetIndex);
      if (onReorderScheduledActivities) {
        onReorderScheduledActivities(reordered, selectedDateStr);
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedId(null);
    setDraggedIndex(null);
    touchCurrentIndex.current = -1;
  };

  // Editing Scheduled Activity State
  const [editingScheduled, setEditingScheduled] = useState<ScheduledActivity | null>(null);
  const [editModalTime, setEditModalTime] = useState('10:00');
  const [editModalSlot, setEditModalSlot] = useState<'manha' | 'tarde'>('manha');
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalDesc, setEditModalDesc] = useState('');
  const [editModalCategory, setEditModalCategory] = useState<ActivityCategory>('cognitiva');

  // Swap Activity State
  const [swappingActivity, setSwappingActivity] = useState<ScheduledActivity | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapCategoryFilter, setSwapCategoryFilter] = useState<ActivityCategory | 'todos'>('todos');

  const handleSwapActivity = (selectedActivity: Activity) => {
    if (!swappingActivity) return;

    if (onUpdateScheduledActivity) {
      onUpdateScheduledActivity({
        ...swappingActivity,
        activityId: selectedActivity.id,
        title: selectedActivity.title,
        description: selectedActivity.description,
        category: selectedActivity.category
      });
    }

    setSwappingActivity(null);
    setSwapSearch('');
    setSwapCategoryFilter('todos');
  };

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

  // Helper: Parse YYYY-MM-DD into a Date object in the local timezone (avoiding UTC timezone shift)
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

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
    const date = parseLocalDate(selectedDateStr);
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
    const date = parseLocalDate(selectedDateStr);
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
    return scheduledActivities
      .filter((act) => {
        const matchDate = act.date === dateStr;
        const matchFilter = filterCategory === 'todos' || act.category === filterCategory;
        return matchDate && matchFilter;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
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
          <div key={`empty-${i}`} className="bg-emerald-100/20 border border-emerald-200/30 rounded-xl min-h-28 p-1 opacity-40 select-none"></div>
        );
      } else {
        const dateStr = formatDateString(dayNumber);
        const dailyActs = getActivitiesForDate(dateStr);
        const morningActs = dailyActs.filter((a) => a.slot === 'manha');
        const afternoonActs = dailyActs.filter((a) => a.slot === 'tarde');
        const isSelected = selectedDateStr === dateStr;
        const isToday = dateStr === getTodayStr();

        cells.push(
          <div
            key={`day-${dayNumber}`}
            onClick={() => handleSelectDay(dateStr)}
            className={`min-h-28 border rounded-xl p-1.5 transition-all flex flex-col relative cursor-pointer shadow-2xs ${
              isSelected
                ? 'bg-indigo-50 border-2 border-indigo-500 ring-2 ring-indigo-300 shadow-md scale-[1.01] z-10'
                : 'bg-white border-emerald-100 hover:border-emerald-200'
            } ${isToday ? 'border-indigo-400 ring-1 ring-indigo-200 font-bold' : ''}`}
            id={`cal-cell-${dateStr}`}
          >
            {/* Header of cell */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
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
                {/* Dots signaling scheduled activities */}
                {dailyActs.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {dailyActs.map(act => (
                      <span
                        key={act.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          act.category === 'cognitiva'
                            ? 'bg-purple-500'
                            : act.category === 'fisica'
                            ? 'bg-amber-500'
                            : act.category === 'musica'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                        title={act.title}
                      />
                    ))}
                  </div>
                )}
              </div>
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
                        handleSelectDay(dateStr);
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
                          : act.category === 'sensorial'
                          ? 'bg-rose-50 border-rose-100 text-rose-900 hover:bg-rose-100'
                          : act.category === 'expressao_artistica'
                          ? 'bg-teal-50 border-teal-100 text-teal-900 hover:bg-teal-100'
                          : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                      } ${act.status === 'pending_approval' ? 'border-dashed border-amber-400/90 ring-1 ring-amber-300/60 shadow-2xs' : ''}`}
                      id={`cal-act-${act.id}`}
                    >
                      <span className="truncate flex-1 flex items-center gap-1">
                        <span className="font-mono text-[9px] opacity-75 mr-1 font-semibold shrink-0">{act.time}</span>
                        <span className="truncate">{act.title}</span>
                      </span>
                      {act.completed && (
                        <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      )}
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
                        handleSelectDay(dateStr);
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
                          : act.category === 'sensorial'
                          ? 'bg-rose-50 border-rose-100 text-rose-900 hover:bg-rose-100'
                          : act.category === 'expressao_artistica'
                          ? 'bg-teal-50 border-teal-100 text-teal-900 hover:bg-teal-100'
                          : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                      } ${act.status === 'pending_approval' ? 'border-dashed border-amber-400/90 ring-1 ring-amber-300/60 shadow-2xs' : ''}`}
                      id={`cal-act-${act.id}`}
                    >
                      <span className="truncate flex-1 flex items-center gap-1">
                        <span className="font-mono text-[9px] opacity-75 mr-1 font-semibold shrink-0">{act.time}</span>
                        <span className="truncate">{act.title}</span>
                      </span>
                      {act.completed && (
                        <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      )}
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


  const renderMobileCalendarCells = () => {
    const cells = [];
    const totalSlots = daysInMonth + firstDayIndex;
    const gridRows = Math.ceil(totalSlots / 7);

    for (let i = 0; i < gridRows * 7; i++) {
      const dayNumber = i - firstDayIndex + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

      if (!isValidDay) {
        cells.push(
          <div key={`empty-mob-${i}`} className="bg-emerald-100/20 border border-emerald-200/30 rounded-xl aspect-square p-1 opacity-40 select-none"></div>
        );
      } else {
        const dateStr = formatDateString(dayNumber);
        const dailyActs = getActivitiesForDate(dateStr);
        const isSelected = selectedDateStr === dateStr;
        const isToday = dateStr === getTodayStr();

        // Unique categories for dot indicators
        const categories = Array.from(new Set(dailyActs.map(a => a.category)));

        const dotColors = {
          cognitiva: 'bg-purple-500',
          fisica: 'bg-amber-500',
          musica: 'bg-blue-500',
          outro: 'bg-slate-400',
        };

        cells.push(
          <div
            key={`day-mob-${dayNumber}`}
            onClick={() => handleSelectDay(dateStr)}
            className={`aspect-square border rounded-xl p-1 flex flex-col justify-between items-center transition-all cursor-pointer relative shadow-2xs ${
              isSelected
                ? 'bg-indigo-50 border-2 border-indigo-500 ring-2 ring-indigo-300 z-10 shadow-md'
                : 'bg-white border-emerald-100'
            } ${isToday ? 'border-indigo-400 font-black' : ''}`}
            id={`cal-cell-mob-${dateStr}`}
          >
            <span
              className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full mt-0.5 ${
                isToday
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isSelected
                  ? 'text-indigo-900 bg-indigo-100/80 font-bold'
                  : 'text-gray-600'
              }`}
            >
              {dayNumber}
            </span>
            
            {/* Tiny Indicator dots container */}
            <div className="flex gap-0.5 pb-1 justify-center max-w-full overflow-hidden flex-wrap">
              {dailyActs.map((act) => (
                <span
                  key={act.id}
                  className={`w-1.5 h-1.5 rounded-full ${dotColors[act.category] || 'bg-slate-300'}`}
                  title={act.title}
                />
              ))}
            </div>
          </div>
        );
      }
    }
    return cells;
  };

  // Helper: Get days of the week for the selected date
  const getWeekDays = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
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
          const isToday = day.dateStr === getTodayStr();

          return (
            <div
              key={day.dateStr}
              onClick={() => handleSelectDay(day.dateStr)}
              className={`flex flex-col border rounded-xl p-3 min-h-[380px] transition-all cursor-pointer relative shadow-2xs ${
                isSelected
                  ? 'bg-indigo-50 border-2 border-indigo-500 ring-2 ring-indigo-300 z-10 shadow-md'
                  : 'bg-white border-emerald-100 hover:border-emerald-200'
              } ${isToday ? 'border-indigo-400 shadow-xs' : ''}`}
              id={`week-col-${day.dateStr}`}
            >
              {/* Day Header */}
              <div className="border-b border-gray-100 pb-2 mb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">
                    {day.dayName}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-display font-bold text-sm text-gray-800">
                      {day.dayNumber} {day.monthShort}
                    </span>
                    {/* Dots signaling scheduled activities */}
                    {dailyActs.length > 0 && (
                      <div className="flex gap-0.5">
                        {dailyActs.map(act => (
                          <span
                            key={act.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              act.category === 'cognitiva'
                                ? 'bg-purple-500'
                                : act.category === 'fisica'
                                ? 'bg-amber-500'
                                : act.category === 'musica'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                            title={act.title}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
                            handleSelectDay(day.dateStr);
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
                          } ${act.status === 'pending_approval' ? 'border-dashed border-amber-400/90 ring-1 ring-amber-300/60 shadow-2xs' : ''}`}
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
                            handleSelectDay(day.dateStr);
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
                          } ${act.status === 'pending_approval' ? 'border-dashed border-amber-400/90 ring-1 ring-amber-300/60 shadow-2xs' : ''}`}
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
  const selectedDayActs = scheduledActivities
    .filter((a) => a.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
  const formattedSelectedDate = parseLocalDate(selectedDateStr).toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (showGeminiPlanner) {
    return (
      <GeminiPlanner
        residents={residents}
        activities={activities}
        suggestionRules={suggestionRules}
        currentYear={currentYear}
        currentMonth={currentMonth}
        selectedDateStr={selectedDateStr}
        calendarViewMode={calendarViewMode}
        onAddScheduledActivity={onAddScheduledActivity}
        onAddScheduledActivities={onAddScheduledActivities}
        onClose={() => setShowGeminiPlanner(false)}
      />
    );
  }

  return (
    <div className="w-full space-y-6" id="calendar-view-container">
      {/* Dynamic print styles for A4 landscape print execution */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 10mm !important;
          }
          
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          header, nav, footer, aside, #left-sidebar, .print\\:hidden, #btn-pdf-action-calendar, #btn-print-action-calendar, .print-hidden-element {
            display: none !important;
          }

          main {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
            overflow-x: visible !important;
            width: 100% !important;
            max-width: none !important;
          }

          table {
            width: 100% !important;
            max-width: none !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }

          th, td {
            word-break: break-word !important;
            white-space: normal !important;
            border: 1px solid #cbd5e1 !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          tr, td, th {
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* Calendar Grid (Full Width) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 flex-wrap">
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
          </div>

          {/* Action Toolbar buttons copied from Imprimir Mural */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format selector */}
            <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-1 bg-slate-50 shrink-0">
              <button
                onClick={() => setCalendarViewMode('mensal')}
                className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  calendarViewMode === 'mensal'
                    ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-view-mensal"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Plano Mensal
              </button>
              <button
                onClick={() => setCalendarViewMode('semanal')}
                className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  calendarViewMode === 'semanal'
                    ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-view-semanal"
              >
                <ListTodo className="w-3.5 h-3.5" />
                Plano Semanal
              </button>
            </div>

            {/* Month select */}
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="text-xs p-2 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden cursor-pointer"
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>

            {/* Year select */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="text-xs p-2 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>

            {/* Conditional week dropdown when Weekly layout is active */}
            {calendarViewMode === 'semanal' && printWeeks.length > 0 && (
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
                className="text-xs p-2 border border-indigo-200 rounded-lg bg-indigo-50/50 font-medium text-indigo-900 focus:outline-hidden cursor-pointer"
              >
                {printWeeks.map((week, idx) => (
                  <option key={idx} value={idx}>
                    {getWeekLabelForPrint(week, idx)}
                  </option>
                ))}
              </select>
            )}

            {/* Guardar PDF button */}
            <button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-3.5 py-2 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              id="btn-pdf-action-calendar"
            >
              <Download className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'animate-bounce'}`} />
              {isGenerating ? 'A gerar PDF...' : 'Guardar PDF'}
            </button>

            {/* Imprimir button */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer"
              id="btn-print-action-calendar"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
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
              onClick={() => setFilterCategory('sensorial')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'sensorial' ? 'bg-rose-100 text-rose-900 shadow-xs font-bold' : 'text-rose-600/80 hover:text-rose-950'
              }`}
            >
              Sensorial 🌿
            </button>
            <button
              onClick={() => setFilterCategory('expressao_artistica')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'expressao_artistica' ? 'bg-teal-100 text-teal-900 shadow-xs font-bold' : 'text-teal-600/80 hover:text-teal-950'
              }`}
            >
              Artes 🎨
            </button>
            <button
              onClick={() => setFilterCategory('outro')}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'outro' ? 'bg-slate-200 text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Outro 🌟
            </button>
          </div>
        </div>

        {/* Pending Approval Banner when generated suggestions exist */}
        {pendingActivities.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-fade-in" id="pending-approval-banner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-amber-950">
                    Plano Sugerido Gerado ({pendingActivities.length} {pendingActivities.length === 1 ? 'atividade' : 'atividades'})
                  </h4>
                  <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ⏳ A aguardar aprovação
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  As atividades foram colocadas diretamente no calendário. Clique em <span className="font-semibold text-amber-950">"Aprovar Plano"</span> para as guardar definitivamente ou <span className="font-semibold text-amber-950">"Descartar"</span> para as remover.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleApprovePlan}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer w-full sm:w-auto"
                id="btn-approve-suggested-plan"
              >
                <Check className="w-4 h-4" />
                <span>Aprovar Plano</span>
              </button>

              <button
                onClick={handleDiscardPlan}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
                id="btn-discard-suggested-plan"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Descartar</span>
              </button>

              <button
                onClick={handleDirectSuggestPlan}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full sm:w-auto"
                id="btn-recalculate-suggested-plan"
                title="Gerar outra combinação de atividades"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Gerar Novamente</span>
              </button>

              <button
                onClick={() => setShowGeminiPlanner(true)}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline px-2 py-1 transition-all cursor-pointer"
                title="Ajustar regras e opções avançadas"
              >
                Ajustar Regras
              </button>
            </div>
          </div>
        )}

        {/* Banner para Sugerir plano de Estimulação com IA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-3 sm:p-4 animate-fade-in gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              Sugerir Plano com IA
            </h4>
            <p className="text-[10px] text-indigo-800 leading-normal">
              Gere automaticamente sugestões de estimulação diretamente no calendário que respeitam as regras personalizadas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {getScheduledActivitiesForPeriod().length > 0 && (
              <div className="relative shrink-0">
                {confirmClear ? (
                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                    <span className="text-[9px] font-semibold text-rose-700 px-1">Apagar {getScheduledActivitiesForPeriod().length}?</span>
                    <button
                      onClick={handleClearPeriodActivities}
                      className="text-[9px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="text-[9px] font-semibold bg-white hover:bg-slate-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer w-full sm:w-auto"
                    title="Apagar todas as atividades do período selecionado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar {calendarViewMode === 'mensal' ? 'Mês' : 'Semana'}</span>
                  </button>
                )}
              </div>
            )}
            <Tooltip position="left" content="Sugerir plano: Gerar automaticamente sugestões de atividades no calendário a aguardar aprovação">
              <button
                onClick={handleDirectSuggestPlan}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-md shrink-0 w-full sm:w-auto justify-center"
                id="btn-open-gemini-planner"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                Sugerir plano
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Interaction hint notice */}
        <div className="flex items-center justify-between text-[11px] font-medium text-emerald-900 bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-3.5 py-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-950">💡 Dica:</span> Clique num dia para o selecionar visualmente. Clique <span className="font-bold text-indigo-700 underline decoration-indigo-300">segunda vez</span> para abrir a janela com a rotina diária.
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
            Dia Selecionado: {formattedSelectedDate}
          </span>
        </div>

        {/* Conditional Month view vs Weekly view rendering */}
        {calendarViewMode === 'mensal' ? (
          <div className="bg-emerald-50/70 p-3 sm:p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2.5">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-[11px] sm:text-xs text-emerald-950 bg-emerald-100/80 py-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="py-0.5 tracking-wide">{day}</div>
              ))}
            </div>

            {/* Calendar Day Grid - Desktop */}
            <div className="hidden md:grid grid-cols-7 gap-1.5">
              {renderCalendarCells()}
            </div>

            {/* Calendar Day Grid - Mobile Compact */}
            <div className="grid md:hidden grid-cols-7 gap-1.5">
              {renderMobileCalendarCells()}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 p-3 sm:p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
            {renderWeeklyView()}
          </div>
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
            <span className="flex items-center gap-1 font-medium text-rose-800 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
              🌿 Sensorial
            </span>
            <span className="flex items-center gap-1 font-medium text-teal-800 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
              🎨 Artes Manuais
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              🌟 Outros
            </span>
          </div>
          <button
            onClick={() => setShowDailyModal(true)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            id="btn-open-daily-modal-bar"
          >
            <ListTodo className="w-4 h-4 text-indigo-600" />
            <span>Ver Rotina Diária ({formattedSelectedDate})</span>
          </button>
        </div>
      </div>

      {/* Daily Routine Pop-up Modal */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="daily-routine-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Rotina Diária • Plano do Dia</span>
                <h3 className="font-display font-semibold text-gray-800 text-sm sm:text-base leading-tight capitalize mt-0.5">
                  {formattedSelectedDate}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openScheduleModal(selectedDateStr, 'manha')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
                  id="btn-daily-modal-add-new"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agendar</span>
                </button>
                <button
                  onClick={() => setShowDailyModal(false)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-slate-100 text-lg font-bold cursor-pointer transition-colors"
                  id="close-daily-modal-btn"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content - Selected Day Activities */}
            {selectedDayActs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
                <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-600">Nenhuma Atividade Planeada para este dia</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-52">Agende sessões de ginástica, estimulação cognitiva, sensorial ou música para este dia.</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openScheduleModal(selectedDateStr, 'manha')}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    id="btn-quick-manha"
                  >
                    + Manhã
                  </button>
                  <button
                    onClick={() => openScheduleModal(selectedDateStr, 'tarde')}
                    className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    id="btn-quick-tarde"
                  >
                    + Tarde
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                <div className="text-[10px] text-gray-400 font-medium bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between select-none shrink-0">
                  <span>💡 Toque e arraste pela pega (⠿) para reordenar as atividades de hoje</span>
                  <span className="font-mono text-indigo-600 font-bold">{selectedDayActs.length} {selectedDayActs.length === 1 ? 'atividade' : 'atividades'}</span>
                </div>
                <div 
                  id="selected-acts-list"
                  className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1"
                >
                  {selectedDayActs.map((act, idx) => {
                    const categoryColor = {
                      cognitiva: 'border-l-purple-500 bg-purple-50/50',
                      fisica: 'border-l-amber-500 bg-amber-50/50',
                      musica: 'border-l-blue-500 bg-blue-50/50',
                      sensorial: 'border-l-rose-500 bg-rose-50/50',
                      expressao_artistica: 'border-l-teal-500 bg-teal-50/50',
                      outro: 'border-l-slate-400 bg-slate-50/50',
                    };

                    const isCurrentlyDragged = draggedId === act.id;

                    return (
                      <div
                        key={act.id}
                        draggable
                        onDragStart={() => handleDragStart(act.id, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`border-l-4 rounded-r-xl border border-gray-100 p-3.5 space-y-2.5 transition-all hover:shadow-xs relative ${categoryColor[act.category] || 'border-l-slate-400 bg-slate-50/50'} ${
                          act.completed ? 'opacity-80' : ''
                        } ${isCurrentlyDragged ? 'scale-[1.02] bg-indigo-50/90 ring-2 ring-indigo-300 opacity-95 shadow-md z-30 cursor-grabbing' : ''}`}
                        id={`side-act-${act.id}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-1 cursor-grab active:cursor-grabbing select-none"
                              onTouchStart={(e) => handleTouchStart(e, idx)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              title="Arraste para reordenar"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-[9px] uppercase font-mono text-gray-500 flex items-center gap-1 font-bold">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {act.slot === 'manha' ? 'Manhã' : 'Tarde'} • {act.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Tooltip position="top" content={act.completed ? "Marcar Pendente: Alterar o estado desta atividade de volta para pendente" : "Concluir Atividade: Registar a atividade de hoje como concluída e realizada com sucesso"}>
                                <button
                                  onClick={() => onToggleCompleteActivity(act.id)}
                                  className={`w-7 h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                    act.completed
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'bg-white hover:bg-slate-100 border-gray-200 text-gray-400'
                                  }`}
                                  id={`complete-btn-${act.id}`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                              <Tooltip position="top" content="Trocar Atividade: Substituir esta atividade por outra atividade registada">
                                <button
                                  onClick={() => setSwappingActivity(act)}
                                  className="w-7 h-7 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-center"
                                  id={`swap-btn-${act.id}`}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                              </Tooltip>
                              <Tooltip position="top" content="Editar Atividade: Alterar horário, período ou informações desta sessão agendada">
                                <button
                                  onClick={() => handleOpenEditScheduledModal(act)}
                                  className="w-7 h-7 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center"
                                  id={`edit-sched-btn-${act.id}`}
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </Tooltip>
                              <Tooltip position="top" content="Desmarcar Atividade: Remover esta atividade do plano diário atual">
                                <button
                                  onClick={() => onDeleteScheduledActivity(act.id)}
                                  className="w-7 h-7 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                                  id={`delete-btn-${act.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                          <h4 className={`font-display font-bold text-xs sm:text-sm text-slate-800 ${act.completed ? 'line-through text-slate-400' : ''}`}>
                            {act.title}
                          </h4>
                          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                            {act.description}
                          </p>
                        </div>

                        {/* Log Participation Button */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
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
              </div>
            )}
            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowDailyModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
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
                      className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(['cognitiva', 'fisica', 'musica', 'sensorial', 'expressao_artistica', 'outro'] as ActivityCategory[]).map((cat) => {
                        const labels = {
                          cognitiva: '🧠 Cognitiva',
                          fisica: '🏃‍♂️ Física',
                          musica: '🎶 Música',
                          sensorial: '🌿 Sensorial',
                          expressao_artistica: '🎨 Arte',
                          outro: '🌟 Outro',
                        };
                        const colors = {
                          cognitiva: 'peer-checked:bg-purple-600 peer-checked:text-white text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200',
                          fisica: 'peer-checked:bg-amber-600 peer-checked:text-white text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',
                          musica: 'peer-checked:bg-blue-600 peer-checked:text-white text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',
                          sensorial: 'peer-checked:bg-rose-600 peer-checked:text-white text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200',
                          expressao_artistica: 'peer-checked:bg-teal-600 peer-checked:text-white text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200',
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
                            <div className={`text-[10px] font-bold py-3.5 sm:py-2 px-1.5 text-center border rounded-lg transition-all peer-checked:border-transparent ${colors[cat]}`}>
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
                      className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs px-5 py-3 sm:py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs px-5 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
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
                    className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
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
                    className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
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
                          <div className={`text-[10px] font-bold py-3.5 sm:py-2 px-1.5 text-center border rounded-lg transition-all peer-checked:border-transparent ${colors[cat]}`}>
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
                    className="w-full text-xs p-3.5 md:p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingScheduled(null)}
                  className="text-xs px-5 py-3 sm:py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs px-5 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap Activity Modal */}
      {swappingActivity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="swap-activity-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                Trocar Atividade
              </h3>
              <button
                onClick={() => {
                  setSwappingActivity(null);
                  setSwapSearch('');
                  setSwapCategoryFilter('todos');
                }}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
                id="close-swap-modal-btn"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-500 leading-normal bg-slate-50 border border-slate-100 rounded-xl p-3 shrink-0">
              Substituir a atividade <span className="font-bold text-slate-700">"{swappingActivity.title}"</span> ({swappingActivity.slot === 'manha' ? 'Manhã' : 'Tarde'} • {swappingActivity.time}) por uma das atividades registadas abaixo:
            </div>

            {/* Filters & Search */}
            <div className="space-y-3 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar por título ou descrição..."
                  value={swapSearch}
                  onChange={(e) => setSwapSearch(e.target.value)}
                  className="w-full text-xs p-3.5 pl-10 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5">
                {(['todos', 'cognitiva', 'fisica', 'musica', 'outro'] as const).map((cat) => {
                  const labels = {
                    todos: 'Todos',
                    cognitiva: '🧠 Cognitiva',
                    fisica: '🏃 Física',
                    musica: '🎵 Música',
                    outro: '🎨 Outro',
                  };
                  const activeStyle = swapCategoryFilter === cat
                    ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200';

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSwapCategoryFilter(cat)}
                      className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${activeStyle}`}
                    >
                      {labels[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of activities */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {(() => {
                const filtered = activities.filter((act) => {
                  const matchesSearch = act.title.toLowerCase().includes(swapSearch.toLowerCase()) || 
                                       act.description.toLowerCase().includes(swapSearch.toLowerCase());
                  const matchesCategory = swapCategoryFilter === 'todos' || act.category === swapCategoryFilter;
                  return matchesSearch && matchesCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      Nenhuma atividade encontrada com estes filtros.
                    </div>
                  );
                }

                return filtered.map((act) => {
                  const badgeColors = {
                    cognitiva: 'bg-purple-100 text-purple-800 border-purple-200',
                    fisica: 'bg-amber-100 text-amber-800 border-amber-200',
                    musica: 'bg-blue-100 text-blue-800 border-blue-200',
                    sensorial: 'bg-rose-100 text-rose-800 border-rose-200',
                    expressao_artistica: 'bg-teal-100 text-teal-800 border-teal-200',
                    outro: 'bg-slate-100 text-slate-800 border-slate-200',
                  };

                  const labels = {
                    cognitiva: 'Estimulação Cognitiva',
                    fisica: 'Atividade Física',
                    musica: 'Estimulação Musical',
                    sensorial: 'Estimulação Sensorial',
                    expressao_artistica: 'Expressão Artística',
                    outro: 'Atividade Social/Outra',
                  };

                  return (
                    <div
                      key={act.id}
                      onClick={() => handleSwapActivity(act)}
                      className="group border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20 p-3.5 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-950">
                            {act.title}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badgeColors[act.category]}`}>
                            {labels[act.category]}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal line-clamp-2">
                          {act.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-[10px] font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-xs shrink-0 cursor-pointer self-end md:self-auto"
                      >
                        Selecionar
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSwappingActivity(null);
                  setSwapSearch('');
                  setSwapCategoryFilter('todos');
                }}
                className="text-xs px-5 py-2.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Sheet (Hidden on screen, styled cleanly for PDF generation & print execution) */}
      <div className="hidden print:block bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs font-sans text-slate-800" id="printable-sheet">
        {/* Document Header */}
        <div className="border-b border-gray-300 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Logo & App Branding (Lar de Santo António) */}
          <div className="flex items-center gap-3.5 select-none">
            <img 
              src={logoUrl} 
              alt="Logo Lar de Santo António" 
              className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <h1 className="font-display font-extrabold text-slate-800 text-lg leading-tight tracking-tight">
                Lar de Santo António
              </h1>
              <p className="text-xs text-gray-500 font-medium leading-none mt-1">
                Rua Pedro Alvares Cabral, 165 Creixomil — 4835-091
              </p>
              <p className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                Tel: 253 521 801
              </p>
            </div>
          </div>

          {/* Document & Period Info */}
          <div className="text-left md:text-right space-y-1.5 md:max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 print:text-black block">
              Plano de Atividades de Animação Sociocultural
            </span>
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 md:inline-block text-left">
              <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                Período de Referência
              </span>
              <span className="text-xs font-bold text-slate-800 print:text-black">
                {getPeriodoReferenciaForPrint()}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono block">
              Emitido em {getTodayStr()}
            </p>
          </div>
        </div>

        {/* Printable Month Grid / Weekly Grid */}
        {calendarViewMode === 'mensal' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 min-w-[900px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-gray-300 font-bold">
                  {daysOfWeekFull.map((day, i) => (
                    <th key={i} className="border border-gray-300 p-2 text-center w-[14.28%] py-3">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {printWeeks.map((week, weekIndex) => (
                  <tr key={weekIndex} className="min-h-40 border-b border-gray-300">
                    {week.map((dayNumber, colIndex) => {
                      if (dayNumber === null) {
                        return (
                          <td key={colIndex} className="border border-gray-300 bg-gray-50/50 p-2 min-h-40 text-gray-300 select-none">
                            {/* Empty day placeholder */}
                          </td>
                        );
                      }

                      const acts = activityMapForPrint[dayNumber];
                      const morningActs = acts?.manha || [];
                      const afternoonActs = acts?.tarde || [];

                      return (
                        <td
                          key={colIndex}
                          className="border border-gray-300 p-2.5 min-h-44 vertical-align-top align-top space-y-2 hover:bg-slate-50/50 transition-colors"
                          id={`print-cell-${dayNumber}`}
                        >
                          {/* Day Number badge */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-xs bg-slate-100 print:bg-gray-200 text-slate-700 print:text-black w-6 h-6 rounded-full flex items-center justify-center border border-gray-200">
                              {dayNumber}
                            </span>
                          </div>

                          {/* Morning Activities Box */}
                          <div className="bg-purple-50/45 print:bg-white border border-purple-100 print:border-gray-200 rounded-lg p-1.5 space-y-1">
                            <span className="text-[8px] font-bold text-purple-700 print:text-black uppercase tracking-wider block">
                              🌅 Manhã
                            </span>
                            {morningActs.length === 0 ? (
                              <span className="text-[9px] text-gray-300 italic block">Sem atividade</span>
                            ) : (
                              morningActs.map((a) => (
                                <div key={a.id} className="text-[9px] font-semibold text-purple-950 print:text-black leading-tight border-b border-purple-100/50 pb-0.5 last:border-none">
                                  <span className="font-mono font-bold text-[8px] text-purple-700 print:text-black">{a.time}</span> • {a.title}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Afternoon Activities Box */}
                          <div className="bg-amber-50/45 print:bg-white border border-amber-100 print:border-gray-200 rounded-lg p-1.5 space-y-1">
                            <span className="text-[8px] font-bold text-amber-700 print:text-black uppercase tracking-wider block">
                              🌇 Tarde
                            </span>
                            {afternoonActs.length === 0 ? (
                              <span className="text-[9px] text-gray-300 italic block">Sem atividade</span>
                            ) : (
                              afternoonActs.map((a) => (
                                <div key={a.id} className="text-[9px] font-semibold text-amber-950 print:text-black leading-tight border-b border-amber-100/50 pb-0.5 last:border-none">
                                  <span className="font-mono font-bold text-[8px] text-amber-700 print:text-black">{a.time}</span> • {a.title}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Weekly view optimized sheet */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 min-w-[900px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-gray-300 font-bold">
                  {daysOfWeekFull.map((day, i) => (
                    <th key={i} className="border border-gray-300 p-2 text-center w-[14.28%] py-3">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="min-h-60 border-b border-gray-300">
                  {activePrintWeek.map((dayNumber, colIndex) => {
                    if (dayNumber === null) {
                      return (
                        <td key={colIndex} className="border border-gray-300 bg-gray-50/50 p-2.5 text-gray-300 select-none align-top">
                          {/* Empty day placeholder */}
                        </td>
                      );
                    }

                    const acts = activityMapForPrint[dayNumber];
                    const morningActs = acts?.manha || [];
                    const afternoonActs = acts?.tarde || [];

                    return (
                      <td
                        key={colIndex}
                        className="border border-gray-300 p-3 align-top space-y-4 hover:bg-slate-50/50 transition-colors"
                        id={`print-week-cell-${dayNumber}`}
                      >
                        {/* Day Number badge */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs bg-indigo-50 print:bg-gray-200 text-indigo-700 print:text-black w-7 h-7 rounded-full flex items-center justify-center border border-indigo-100">
                            {dayNumber}
                          </span>
                        </div>

                        {/* Morning Activities Box */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-purple-700 print:text-black uppercase tracking-wider flex items-center gap-1 border-b border-purple-100 pb-1">
                            🌅 Manhã
                          </span>
                          {morningActs.length === 0 ? (
                            <span className="text-[10px] text-gray-300 italic block">Sem atividades agendadas</span>
                          ) : (
                            morningActs.map((a) => (
                              <div key={a.id} className="bg-purple-50/35 print:bg-white border border-purple-100/50 print:border-gray-200 rounded-lg p-2 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono font-bold text-[9px] text-purple-700 print:text-black">{a.time}</span>
                                  <span className="text-[9px] text-gray-400 print:text-black font-semibold">☐</span>
                                </div>
                                <p className="text-[10px] font-bold text-purple-950 print:text-black leading-tight">{a.title}</p>
                                {a.description && (
                                  <p className="text-[9px] text-gray-500 print:text-black leading-relaxed line-clamp-2">{a.description}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Afternoon Activities Box */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-amber-700 print:text-black uppercase tracking-wider flex items-center gap-1 border-b border-amber-100 pb-1">
                            🌇 Tarde
                          </span>
                          {afternoonActs.length === 0 ? (
                            <span className="text-[10px] text-gray-300 italic block">Sem atividades agendadas</span>
                          ) : (
                            afternoonActs.map((a) => (
                              <div key={a.id} className="bg-amber-50/35 print:bg-white border border-amber-100/50 print:border-gray-200 rounded-lg p-2 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono font-bold text-[9px] text-amber-700 print:text-black">{a.time}</span>
                                  <span className="text-[9px] text-gray-400 print:text-black font-semibold">☐</span>
                                </div>
                                <p className="text-[10px] font-bold text-amber-950 print:text-black leading-tight">{a.title}</p>
                                {a.description && (
                                  <p className="text-[9px] text-gray-500 print:text-black leading-relaxed line-clamp-2">{a.description}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Notes & Signs (A4 Poster footer) */}
        <div className="mt-8 pt-6 border-t border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs print:text-black">
          <div className="space-y-1 md:col-span-2">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">Observações e Recomendações Gerais</span>
            <p className="text-gray-500 print:text-black leading-relaxed text-[11px]">
              - Todas as atividades físicas adaptadas respeitam o ritmo cardíaco e muscular individual.
              - As sessões de estimulação cognitiva são calibradas por graus de deterioração ligeira a grave.
              - Sugere-se a participação de familiares e voluntários nas sessões de Musicoterapia de quarta-feira.
            </p>
          </div>
          <div className="flex flex-col justify-end text-right space-y-4">
            <div className="h-10 border-b border-gray-300 w-48 ml-auto"></div>
            <span className="text-[10px] font-semibold text-gray-400 print:text-black uppercase tracking-wider block">
              Assinatura do Responsável Sociocultural
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
