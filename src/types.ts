export type ActivityCategory = 'cognitiva' | 'fisica' | 'musica' | 'outro' | 'sensorial' | 'expressao_artistica';

export interface Resident {
  id: string;
  name: string;
  birthDate: string;
  cognitiveLevel: 'Ligeiro' | 'Moderado' | 'Grave';
  physicalLevel: 'Independente' | 'Mobilidade Reduzida' | 'Cadeira de Rodas';
  interests: string[];
  observations: string;
  joinedDate: string;
  avatar: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  durationMinutes: number;
  materials: string[];
  objectives: string[];
}

export interface ScheduledActivity {
  id: string;
  activityId?: string; // Optional if it's a completely custom activity
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  slot: 'manha' | 'tarde';
  time: string; // e.g., "10:00" or "15:30"
  completed: boolean;
}

export interface ResidentProgressLog {
  id: string;
  residentId: string;
  scheduledActivityId: string;
  date: string;
  activityTitle: string;
  category: ActivityCategory;
  participation: 'alta' | 'media' | 'baixa' | 'recusou';
  cognitiveScore: number; // 1-5
  physicalScore: number; // 1-5
  socialScore: number; // 1-5
  notes: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  type: 'atividade' | 'saude' | 'geral';
  completed: boolean;
}

export interface SuggestionRules {
  activeDays: string[]; // e.g. ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  maxPhysicalDaysPerWeek: number;
  maxCognitiveDaysPerWeek: number;
  maxMusicDaysPerWeek: number;
  maxOtherDaysPerWeek: number;
  morningCategoryPreference: ActivityCategory | 'aleatorio';
  afternoonCategoryPreference: ActivityCategory | 'aleatorio';
  morningTime: string; // e.g. "10:30"
  afternoonTime: string; // e.g. "15:30"
}

