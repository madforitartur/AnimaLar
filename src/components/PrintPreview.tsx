import React, { useState } from 'react';
import { ScheduledActivity } from '../types';
import { Printer, Download, Info, Calendar } from 'lucide-react';

interface PrintPreviewProps {
  scheduledActivities: ScheduledActivity[];
}

export default function PrintPreview({ scheduledActivities }: PrintPreviewProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July (0-indexed)

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  // Get total days in month and start day
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun index
  };

  const totalDays = getDaysInMonth(year, month);
  const startDayIndex = getFirstDayOfMonth(year, month);

  // Group activities by date
  const getActivityMap = () => {
    const map: Record<string, { manha: ScheduledActivity[]; tarde: ScheduledActivity[] }> = {};
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayActs = scheduledActivities.filter(a => a.date === dateStr);
      
      map[day] = {
        manha: dayActs.filter(a => a.slot === 'manha'),
        tarde: dayActs.filter(a => a.slot === 'tarde')
      };
    }
    return map;
  };

  const activityMap = getActivityMap();

  const handlePrint = () => {
    window.print();
  };

  // Create weeks array for rendering
  const renderWeeks = () => {
    const weeks = [];
    let currentWeek: (number | null)[] = Array(7).fill(null);
    
    // Fill initial padding
    for (let i = 0; i < startDayIndex; i++) {
      currentWeek[i] = null;
    }

    let colIndex = startDayIndex;
    for (let day = 1; day <= totalDays; day++) {
      currentWeek[colIndex] = day;
      colIndex++;
      
      if (colIndex === 7) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
        colIndex = 0;
      }
    }
    
    if (currentWeek.some(val => val !== null)) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = renderWeeks();

  return (
    <div className="space-y-6" id="print-preview-container">
      {/* Control Panel (Hidden on Print) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Exportar Plano Mensal Completo
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
            Visualize o plano num formato de tabela limpa e de alto contraste ideal para afixar no mural ou imprimir. Escolha a opção <strong>"Guardar como PDF"</strong> na janela de impressão para exportar em formato digital.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="text-xs p-2.5 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="text-xs p-2.5 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            id="btn-print-action"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Info Tip (Hidden on Print) */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-xs text-blue-900 print:hidden">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Dica para Impressão Perfeita:</strong> Na caixa de diálogo de impressão do seu navegador, selecione a orientação <strong>Horizontal (Landscape)</strong>, ative a opção <strong>"Imprimir gráficos de fundo" (Background graphics)</strong> e defina as margens como <strong>Mínimas</strong> ou <strong>Nenhum</strong> para ajustar perfeitamente o plano mensal a uma página A4.
        </p>
      </div>

      {/* Printable Sheet (Always Visible, Styled beautifully for screen and printed cleanly for paper) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
        {/* Document Header */}
        <div className="border-b border-gray-300 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 print:text-black">Plano de Atividades de Animação Sociocultural</span>
            <h1 className="font-display font-black text-2xl text-slate-800 print:text-black">
              Rotina Mensal de Atividades — {monthNames[month]} de {year}
            </h1>
            <p className="text-xs text-gray-500 print:text-black">
              Foco terapêutico: Estimulação Cognitiva, Exercícios Físicos Adaptados, Musicoterapia e Integração Social.
            </p>
          </div>
          <div className="text-right text-[10px] text-gray-400 font-mono print:text-black">
            Lar de Idosos São Francisco • Emitido em 13/07/2026
          </div>
        </div>

        {/* Printable Month Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 min-w-[900px] text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-gray-300 font-bold">
                {daysOfWeek.map((day, i) => (
                  <th key={i} className="border border-gray-300 p-2 text-center w-[14.28%] py-3">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIndex) => (
                <tr key={weekIndex} className="min-h-40 border-b border-gray-300">
                  {week.map((dayNumber, colIndex) => {
                    if (dayNumber === null) {
                      return (
                        <td key={colIndex} className="border border-gray-300 bg-gray-50/50 p-2 min-h-40 text-gray-300 select-none">
                          {/* Empty day placeholder */}
                        </td>
                      );
                    }

                    const acts = activityMap[dayNumber];
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
