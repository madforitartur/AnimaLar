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
        outro: suggestionRules.maxOtherDaysPerWeek ?? 2,
      };

      const allCategories: ActivityCategory[] = ['cognitiva', 'fisica', 'musica', 'sensorial', 'expressao_artistica', 'outro'];

      // Categories under weekly limit that have templates in catalog
      const categoriesUnderLimit = allCategories.filter(cat => {
        const currentSet = weeklyStats[mondayStr][cat];
        const isUnderLimit = currentSet.has(dateStr) || currentSet.size < limits[cat];
        const hasTemplates = activities.some(act => act.category === cat && act.id !== 'act_leitura_jornal');
        return isUnderLimit && hasTemplates;
      });

      // Categories specifically configured for THIS day and THIS slot (or 'ambos')
      const explicitlyConfiguredCats = categoriesUnderLimit.filter(cat => {
        const cfg = catConfigs[cat];
        const dayVal = cfg?.[dayName];
        return dayVal === slot || dayVal === 'ambos';
      });

      // Categories that have NO specific day restrictions configured at all
      const openCategories = categoriesUnderLimit.filter(cat => {
        const cfg = catConfigs[cat];
        return !cfg || Object.keys(cfg).length === 0;
      });

      let candidateCategories: ActivityCategory[] = [];

      if (pref && pref !== 'aleatorio' && categoriesUnderLimit.includes(pref as ActivityCategory)) {
        candidateCategories = [pref as ActivityCategory];
      } else if (explicitlyConfiguredCats.length > 0) {
        // All categories configured for this day & slot are candidates
        candidateCategories = [...explicitlyConfiguredCats];
        // Also include open categories if any
        openCategories.forEach(c => {
          if (!candidateCategories.includes(c)) candidateCategories.push(c);
        });
      } else if (openCategories.length > 0) {
        candidateCategories = openCategories;
      } else if (categoriesUnderLimit.length > 0) {
        candidateCategories = categoriesUnderLimit;
      } else {
        candidateCategories = allCategories.filter(cat => activities.some(act => act.category === cat && act.id !== 'act_leitura_jornal'));
      }

      if (candidateCategories.length === 0) return;

      // Gather ALL activity templates from ALL candidate categories
      const candidateTemplates = activities.filter(
        act => candidateCategories.includes(act.category) && act.id !== 'act_leitura_jornal'
      );

      if (candidateTemplates.length > 0) {
        let unusedTemplates = candidateTemplates.filter(t => !usedActivityIds[t.category]?.includes(t.id));
        if (unusedTemplates.length === 0) {
          candidateCategories.forEach(cat => {
            usedActivityIds[cat] = [];
          });
          unusedTemplates = candidateTemplates;
        }

        // Random pick from all available candidate templates
        const pickedTemplate = unusedTemplates[Math.floor(Math.random() * unusedTemplates.length)];

        weeklyStats[mondayStr][pickedTemplate.category].add(dateStr);
        usedActivityIds[pickedTemplate.category].push(pickedTemplate.id);

        const time = slot === 'manha' ? suggestionRules.morningTime : suggestionRules.afternoonTime;

        generated.push({
          title: pickedTemplate.title,
          description: `${pickedTemplate.description}\n\n[Materiais de Apoio]: ${pickedTemplate.materials.join(', ')}\n[Objetivos Terapêuticos]: ${pickedTemplate.objectives.join(', ')}`,
          category: pickedTemplate.category,
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
