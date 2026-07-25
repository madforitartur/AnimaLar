import React, { useState } from 'react';
import { Reminder, Resident, ResidentProgressLog, ScheduledActivity } from '../types';
import { Bell, CheckSquare, Square, Trash2, AlertTriangle, Plus, ShieldAlert, CheckCircle, Clock, Cake } from 'lucide-react';
import { useConfirm } from '../hooks/useConfirm';

interface RemindersPanelProps {
  reminders: Reminder[];
  residents: Resident[];
  progressLogs: ResidentProgressLog[];
  scheduledActivities: ScheduledActivity[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (text: string, type: 'atividade' | 'saude' | 'geral', date: string) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersPanel({
  reminders,
  residents,
  progressLogs,
  scheduledActivities,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}: RemindersPanelProps) {
  const confirm = useConfirm();
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<'atividade' | 'saude' | 'geral'>('geral');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Compute automatic alerts
  const generateAutoAlerts = () => {
    const alerts: { id: string; text: string; type: 'warning' | 'info' | 'birthday'; residentId: string }[] = [];
    const today = new Date(); // Actual current time
    today.setHours(0, 0, 0, 0);

    residents.forEach((resident) => {
      // 1. Birthday Alert (7 days in advance)
      if (resident.birthDate) {
        const parts = resident.birthDate.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const birthYear = parts[0];
          const birthMonth = parts[1] - 1; // 0-indexed
          const birthDay = parts[2];

          let nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
          nextBirthday.setHours(0, 0, 0, 0);

          if (nextBirthday.getTime() < today.getTime()) {
            nextBirthday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
            nextBirthday.setHours(0, 0, 0, 0);
          }

          const diffTime = nextBirthday.getTime() - today.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 7) {
            const turningAge = nextBirthday.getFullYear() - birthYear;
            const bdayFormatted = `${String(birthDay).padStart(2, '0')}/${String(birthMonth + 1).padStart(2, '0')}`;

            let text = '';
            if (diffDays === 0) {
              text = `🎂 HOJE É O ANIVERSÁRIO de ${resident.name}! Completa ${turningAge} anos hoje (${bdayFormatted}). Não se esqueça de lhe dar os parabéns e celebrar no Lar!`;
            } else if (diffDays === 1) {
              text = `🎂 Aniversário Amanhã: ${resident.name} completa ${turningAge} anos amanhã (${bdayFormatted}). Prepare a comemoração e mensagem da equipa!`;
            } else {
              text = `🎂 Próximo Aniversário (daqui a ${diffDays} dias): ${resident.name} completa ${turningAge} anos no dia ${bdayFormatted}. Organize a celebração com antecedência!`;
            }

            alerts.push({
              id: `auto-bday-${resident.id}`,
              text,
              type: 'birthday',
              residentId: resident.id,
            });
          }
        }
      }

      // Find logs for this resident
      const resLogs = progressLogs.filter((l) => l.residentId === resident.id);

      // Check physical activity
      const physicalLogs = resLogs.filter((l) => l.category === 'fisica' && l.participation !== 'recusou');
      if (physicalLogs.length === 0) {
        alerts.push({
          id: `auto-phys-${resident.id}`,
          text: `Atenção: ${resident.name} não participa em exercícios físicos desde que foi registado(a). Recomenda-se mobilidade suave na cadeira.`,
          type: 'warning',
          residentId: resident.id,
        });
      } else {
        // Find most recent physical log
        const sortedPhys = [...physicalLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastPhysDate = new Date(sortedPhys[0].date);
        const diffDays = Math.floor((today.getTime() - lastPhysDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
          alerts.push({
            id: `auto-phys-${resident.id}`,
            text: `Alerta Físico: ${resident.name} não realiza atividades físicas há ${diffDays} dias. Agendar exercícios leves.`,
            type: 'warning',
            residentId: resident.id,
          });
        }
      }

      // Check cognitive activity
      const cognitiveLogs = resLogs.filter((l) => l.category === 'cognitiva' && l.participation !== 'recusou');
      if (cognitiveLogs.length === 0) {
        alerts.push({
          id: `auto-cog-${resident.id}`,
          text: `Atenção: ${resident.name} não realizou estimulação cognitiva. Recomenda-se agendar Jogo de Memória.`,
          type: 'info',
          residentId: resident.id,
        });
      } else {
        // Find most recent cognitive log
        const sortedCog = [...cognitiveLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastCogDate = new Date(sortedCog[0].date);
        const diffDays = Math.floor((today.getTime() - lastCogDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
          alerts.push({
            id: `auto-cog-${resident.id}`,
            text: `Alerta Cognitivo: ${resident.name} não participa em estimulação cognitiva há ${diffDays} dias. Recomenda-se treino de reminiscências.`,
            type: 'warning',
            residentId: resident.id,
          });
        }
      }
    });

    return alerts;
  };

  const autoAlerts = generateAutoAlerts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddReminder(newText.trim(), newType, newDate);
    setNewText('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="reminders-panel">
      {/* Automatic Alerts (Intelligent Reminders) */}
      <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" id="shield-alert-icon" />
            <h3 className="font-display font-semibold text-amber-900 dark:text-amber-200 text-base">Alertas de Rotina Automáticos</h3>
          </div>
          <span className="text-xs font-mono font-medium bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            {autoAlerts.length} Alertas Ativos
          </span>
        </div>

        {autoAlerts.length === 0 ? (
          <div className="text-center py-4 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Todos os residentes estão com a rotina de estimulação física e cognitiva em dia!
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {autoAlerts.map((alert) => {
              const isBday = alert.type === 'birthday';
              const isWarning = alert.type === 'warning';

              let cardBg = 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200';
              let icon = <AlertTriangle className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />;

              if (isBday) {
                cardBg = 'bg-purple-100/80 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 font-medium shadow-2xs';
                icon = <Cake className="w-4.5 h-4.5 shrink-0 text-purple-600 dark:text-purple-400" />;
              } else if (isWarning) {
                cardBg = 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200';
                icon = <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />;
              }

              return (
                <div
                  key={alert.id}
                  className={`flex gap-3 p-3 rounded-lg text-xs border ${cardBg}`}
                  id={alert.id}
                >
                  {icon}
                  <div className="flex-1">
                    <p className="font-medium leading-relaxed">{alert.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customizable Reminders */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" id="bell-reminders-icon" />
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-base">Os meus Lembretes</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-800"
            id="btn-add-reminder"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Lembrete
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 space-y-3" id="form-new-reminder">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mensagem do Lembrete</label>
              <input
                type="text"
                required
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Ex: Preparar instrumentos para musicoterapia..."
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                id="input-reminder-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  id="select-reminder-type"
                >
                  <option value="geral">Geral 📌</option>
                  <option value="atividade">Atividade 📅</option>
                  <option value="saude">Saúde/Atenção 🩺</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Alerta</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  id="input-reminder-date"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                id="btn-cancel-reminder"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
                id="btn-save-reminder"
              >
                Guardar Lembrete
              </button>
            </div>
          </form>
        )}

        {reminders.length === 0 ? (
          <p className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">Sem lembretes definidos para os próximos dias.</p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {reminders.map((reminder, idx) => {
              const badgeColors = {
                saude: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900',
                atividade: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900',
                geral: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
              };

              return (
                <div
                  key={`${reminder.id}-${idx}`}
                  className={`flex items-start justify-between p-3 border rounded-xl transition-all ${
                    reminder.completed
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-65'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                  id={`reminder-card-${reminder.id}-${idx}`}
                >
                  <div className="flex items-start gap-2.5 flex-1 mr-2">
                    <button
                      onClick={() => onToggleReminder(reminder.id)}
                      className="mt-0.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                      id={`btn-toggle-rem-${reminder.id}-${idx}`}
                    >
                      {reminder.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <p className={`text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed ${reminder.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {reminder.text}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold px-1.5 py-0.5 rounded border ${badgeColors[reminder.type]}`}>
                          {reminder.type === 'saude' ? 'Saúde' : reminder.type === 'atividade' ? 'Atividade' : 'Geral'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {reminder.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Eliminar Lembrete',
                        message: `Tem a certeza que deseja eliminar o lembrete "${reminder.text}"?`,
                        confirmText: 'Sim, Eliminar',
                        cancelText: 'Cancelar',
                        variant: 'danger'
                      });
                      if (confirmed) {
                        onDeleteReminder(reminder.id);
                      }
                    }}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 cursor-pointer"
                    id={`btn-del-rem-${reminder.id}-${idx}`}
                    title="Eliminar lembrete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
