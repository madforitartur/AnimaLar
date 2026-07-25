import { Activity, ActivityCategory, ScheduledActivity, SuggestionRules } from '../types';

export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getMondayOfDate = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getWeekDates = (baseDateStr: string): string[] => {
  const dates: string[] = [];
  const baseDate = parseLocalDate(baseDateStr);
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

export const getMonthDates = (year: number, month: number): string[] => {
  const dates: string[] = [];
  const numDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= numDays; i++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    dates.push(`${year}-${mm}-${dd}`);
  }
  return dates;
};

export function generateSuggestedPlan({
  activities,
  suggestionRules,
  period,
  selectedDateStr,
  currentYear,
  currentMonth,
  status = 'pending_approval'
}: {
  activities: Activity[];
  suggestionRules: SuggestionRules;
  period: 'semana' | 'mes';
  selectedDateStr: string;
  currentYear: number;
  currentMonth: number;
  status?: 'pending_approval' | 'approved';
}): { suggestions: Omit<ScheduledActivity, 'id'>[]; targetDates: string[] } {
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
    sensorial: [],
    expressao_artistica: [],
    outro: [],
  };

  targetDates.forEach(dateStr => {
    const dObj = parseLocalDate(dateStr);
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
      status,
    });

    const mondayStr = getMondayOfDate(dateStr);
    if (!weeklyStats[mondayStr]) {
      weeklyStats[mondayStr] = {
        cognitiva: new Set<string>(),
        fisica: new Set<string>(),
        musica: new Set<string>(),
        sensorial: new Set<string>(),
        expressao_artistica: new Set<string>(),
        outro: new Set<string>(),
      };
    }

    // Two slots: morning and afternoon
    const slots: ('manha' | 'tarde')[] = ['manha', 'tarde'];

    slots.forEach(slot => {
      const pref = slot === 'manha' 
        ? suggestionRules.morningCategoryPreference 
        : suggestionRules.afternoonCategoryPreference;

      const catConfigs: Record<ActivityCategory, Record<string, 'manha' | 'tarde' | 'ambos'> | undefined> = {
        fisica: suggestionRules.physicalDaysConfig,
        cognitiva: suggestionRules.cognitiveDaysConfig,
        musica: suggestionRules.musicDaysConfig,
        sensorial: suggestionRules.sensoryDaysConfig,
        expressao_artistica: suggestionRules.artisticDaysConfig,
        outro: suggestionRules.otherDaysConfig,
      };

      const limits: Record<ActivityCategory, number> = {
        cognitiva: suggestionRules.maxCognitiveDaysPerWeek ?? 5,
        fisica: suggestionRules.maxPhysicalDaysPerWeek ?? 2,
        musica: suggestionRules.maxMusicDaysPerWeek ?? 3,
        sensorial: suggestionRules.maxSensoryDaysPerWeek ?? 2,
        expressao_artistica: suggestionRules.maxArtisticDaysPerWeek ?? 2,
        outro: suggestionRules.otherDaysConfig ? (suggestionRules.maxOtherDaysPerWeek ?? 2) : (suggestionRules.maxOtherDaysPerWeek ?? 2),
      };

      // Determine which categories are allowed under constraints
      const allowedCategories: ActivityCategory[] = [];
      
      const checkAllowed = (cat: ActivityCategory, limit: number) => {
        const currentSet = weeklyStats[mondayStr][cat];
        if (currentSet.has(dateStr)) {
          return true; // Already scheduled on this day, no additional cost
        }
        return currentSet.size < limit;
      };

      (Object.keys(limits) as ActivityCategory[]).forEach(cat => {
        const cfg = catConfigs[cat];
        const dayVal = cfg?.[dayName];
        const otherSlot = slot === 'manha' ? 'tarde' : 'manha';
        // Only exclude if explicitly set ONLY for the opposite slot
        const isConfiguredOnlyForOtherSlot = dayVal === otherSlot;
        if (!isConfiguredOnlyForOtherSlot && checkAllowed(cat, limits[cat])) {
          allowedCategories.push(cat);
        }
      });

      if (allowedCategories.length === 0) {
        // Absolute fallback: if constraints are too tight, use anything with a non-zero limit
        (Object.keys(limits) as ActivityCategory[]).forEach(cat => {
          if (limits[cat] > 0) allowedCategories.push(cat);
        });
        if (allowedCategories.length === 0) allowedCategories.push('cognitiva');
      }

      // Check if any category is specifically configured for THIS day and THIS slot (or 'ambos')
      const explicitlyConfiguredCat = (Object.keys(catConfigs) as ActivityCategory[]).find(cat => {
        const cfg = catConfigs[cat];
        const dayVal = cfg?.[dayName];
        const matchesSlot = dayVal === slot || dayVal === 'ambos';
        return matchesSlot && allowedCategories.includes(cat);
      });

      let chosenCat: ActivityCategory = 'cognitiva';
      if (explicitlyConfiguredCat) {
        chosenCat = explicitlyConfiguredCat;
      } else if (pref !== 'aleatorio' && allowedCategories.includes(pref as ActivityCategory)) {
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
          status,
        });
      }
    });
  });

  return { suggestions: generated, targetDates };
}
