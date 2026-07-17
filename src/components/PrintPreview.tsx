import React, { useState } from 'react';
// @ts-ignore
import logoUrl from '../assets/images/lar_santo_antonio_logo_perfect_1784226948200.jpg';
import { ScheduledActivity } from '../types';
import { Printer, Download, Info, Calendar, LayoutGrid, ListTodo } from 'lucide-react';

interface PrintPreviewProps {
  scheduledActivities: ScheduledActivity[];
}

export default function PrintPreview({ scheduledActivities }: PrintPreviewProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July (0-indexed)
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal'>('mensal');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const activityMap = getActivityMap();

  const handlePrint = () => {
    window.print();
  };

  // Create weeks array for rendering
  const renderWeeks = () => {
    const weeksList = [];
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

  const weeks = renderWeeks();

  // Helper to dynamically label weeks for selection
  const getWeekLabel = (week: (number | null)[], idx: number) => {
    const validDays = week.filter((d): d is number => d !== null);
    if (validDays.length === 0) return `Semana ${idx + 1}`;
    const firstDay = validDays[0];
    const lastDay = validDays[validDays.length - 1];
    return `Semana ${idx + 1} (${firstDay} a ${lastDay} de ${monthNames[month]})`;
  };

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

        // OKLCH to sRGB conversion math
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

  // Convert OKLAB colors to rgb/rgba format so html2canvas doesn't crash on Tailwind v4 styles
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

        // OKLAB to sRGB conversion math
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

  // Generate downloadable PDF using jsPDF and html2canvas
  const handleExportPDF = async () => {
    setIsGenerating(true);
    
    // Store variables to restore original styles and window methods in finally block
    const originalStyleContents: { tag: HTMLStyleElement; content: string }[] = [];
    const disabledLinks: { link: HTMLLinkElement; tempStyle: HTMLStyleElement }[] = [];
    const originalGetComputedStyle = window.getComputedStyle;
    
    // Track original element styles so they can be reverted perfectly
    let originalElementStyle: string | null = null;
    const originalWrapperStyles: { el: HTMLDivElement; style: string | null }[] = [];

    try {
      const element = document.getElementById('printable-sheet');
      if (!element) {
        throw new Error("Elemento de exportação não encontrado");
      }

      // Save original styles of the printable sheet
      originalElementStyle = element.getAttribute('style');

      // Expand all horizontal scrollable wrapper containers so tables are fully rendered
      const scrollWrappers = Array.from(element.querySelectorAll('.overflow-x-auto')) as HTMLDivElement[];
      scrollWrappers.forEach(el => {
        originalWrapperStyles.push({ el, style: el.getAttribute('style') });
        el.style.overflow = 'visible';
        el.style.overflowX = 'visible';
      });

      // Set a robust fixed width on the sheet during capture so that all calendars
      // render in their full glorious landscape sizes, unaffected by current screen size.
      element.style.width = '1280px';
      element.style.maxWidth = 'none';
      element.style.overflow = 'visible';

      // Dynamically import libraries for speed & seamless execution
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // 1. Override window.getComputedStyle to automatically intercept oklch/oklab colors read by html2canvas
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

      // 2. Process link stylesheets to extract and replace oklch/oklab colors locally (same-origin only)
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const link of links) {
        try {
          if (!link.href) continue;

          // Only fetch if it's from the same origin to avoid CORS errors or fetching cross-origin assets
          const isSameOrigin = link.href.startsWith(window.location.origin) || !link.href.includes('://');
          if (!isSameOrigin) continue;

          // Avoid fetching main document HTML if href is empty or equal to current page
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

      // 3. Process internal style tags to replace oklch/oklab colors with rgb equivalents
      const styleTags = Array.from(document.querySelectorAll('style:not([data-temp-oklch-fix="true"])')) as HTMLStyleElement[];
      styleTags.forEach(tag => {
        const text = tag.textContent || '';
        if (text.includes('oklch') || text.includes('oklab')) {
          originalStyleContents.push({ tag, content: text });
          tag.textContent = parseAndConvertTailwindColors(text);
        }
      });

      // Small delay to ensure browser repaints and layout transition finishes
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution crisp PDF output
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // We export to landscape format for perfect fit of calendar table structures
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 297; // A4 landscape width in mm
      const pdfHeight = 210; // A4 landscape height in mm
      
      // Configure to fill the entire A4 Landscape sheet perfectly from edge to edge (0 margins)
      const xOffset = 0;
      const yOffset = 0;
      const finalWidth = pdfWidth;
      const finalHeight = pdfHeight;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      // Generate pristine filename depending on current active view mode
      const sanitizedMonth = monthNames[month].toLowerCase().replace(/\s+/g, '_');
      const filename = viewMode === 'mensal'
        ? `animalar_plano_mensal_${sanitizedMonth}_${year}.pdf`
        : `animalar_plano_semanal_sem_${selectedWeekIndex + 1}_${sanitizedMonth}_${year}.pdf`;

      pdf.save(filename);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível exportar o PDF diretamente. Por favor, utilize o botão de "Imprimir" ou tente novamente.');
    } finally {
      // Restore window.getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore all original styles and links immediately
      originalStyleContents.forEach(({ tag, content }) => {
        tag.textContent = content;
      });
      disabledLinks.forEach(({ link, tempStyle }) => {
        link.disabled = false;
        if (tempStyle.parentNode) {
          tempStyle.parentNode.removeChild(tempStyle);
        }
      });

      // Restore the printable-sheet element original style
      const element = document.getElementById('printable-sheet');
      if (element) {
        if (originalElementStyle !== null) {
          element.setAttribute('style', originalElementStyle);
        } else {
          element.removeAttribute('style');
        }
      }

      // Restore scrollable wrapper styles
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

  const activeWeek = weeks[selectedWeekIndex] || weeks[0] || Array(7).fill(null);

  const getPeriodoReferencia = () => {
    if (viewMode === 'mensal') {
      return `De 01 a ${totalDays} de ${monthNames[month]} de ${year}`;
    } else {
      const validDays = activeWeek.filter((d): d is number => d !== null);
      if (validDays.length === 0) return `Semana ${selectedWeekIndex + 1} de ${monthNames[month]} de ${year}`;
      const firstDay = validDays[0];
      const lastDay = validDays[validDays.length - 1];
      return `Semana ${selectedWeekIndex + 1} (${firstDay} a ${lastDay} de ${monthNames[month]} de ${year})`;
    }
  };

  return (
    <div className="space-y-6" id="print-preview-container">
      {/* Estilos dinâmicos para otimização de impressão física em A4 Landscape */}
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

          /* Ocultar barra lateral, cabeçalho principal e quaisquer controles não relevantes para o papel */
          header, nav, footer, aside, #left-sidebar, .print\\:hidden, #btn-pdf-action, #btn-print-action, .print-hidden-element {
            display: none !important;
          }

          /* Forçar o contentor principal a usar a largura total */
          main {
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            width: 100% !important;
            max-width: none !important;
            display: block !important;
          }

          .flex-1, .w-full, .flex {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Ajustar a folha de planeamento para ocupar a folha inteira */
          #printable-sheet {
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

          /* Expandir totalmente tabelas com scroll horizontal */
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
            border: 1px solid #cbd5e1 !important; /* bordo cinza claro legível */
          }

          /* Garantir que as cores de fundo (manhã, tarde, categorias) são preservadas no papel */
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

      {/* Control Panel (Hidden on Print) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Exportar Plano de Atividades
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
            Escolha o formato pretendido (Mensal ou Semanal). O botão <strong>"Guardar PDF"</strong> gera e transfere um ficheiro digital de alta definição perfeito para partilhar ou arquivar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => {
                setViewMode('mensal');
                setSelectedWeekIndex(0);
              }}
              className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'mensal'
                  ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              id="print-mode-mensal"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Plano Mensal
            </button>
            <button
              onClick={() => {
                setViewMode('semanal');
                setSelectedWeekIndex(0);
              }}
              className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'semanal'
                  ? 'bg-white text-indigo-700 shadow-xs border border-gray-100'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              id="print-mode-semanal"
            >
              <ListTodo className="w-3.5 h-3.5" />
              Plano Semanal
            </button>
          </div>

          <select
            value={month}
            onChange={(e) => {
              setMonth(parseInt(e.target.value));
              setSelectedWeekIndex(0);
            }}
            className="text-xs p-2.5 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => {
              setYear(parseInt(e.target.value));
              setSelectedWeekIndex(0);
            }}
            className="text-xs p-2.5 border border-gray-200 rounded-lg bg-slate-50 font-medium focus:outline-hidden"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          {/* Conditional week dropdown when Weekly layout is active */}
          {viewMode === 'semanal' && weeks.length > 0 && (
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
              className="text-xs p-2.5 border border-indigo-200 rounded-lg bg-indigo-50/50 font-medium text-indigo-900 focus:outline-hidden"
            >
              {weeks.map((week, idx) => (
                <option key={idx} value={idx}>
                  {getWeekLabel(week, idx)}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              id="btn-pdf-action"
            >
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'animate-bounce'}`} />
              {isGenerating ? 'A gerar PDF...' : 'Guardar PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              id="btn-print-action"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Info Tip (Hidden on Print) */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-xs text-blue-900 print:hidden">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Sugestão para guardar/imprimir:</strong> A exportação do plano de atividades está perfeitamente calibrada para o formato <strong>Horizontal (Landscape)</strong> em tamanho <strong>A4</strong>. Ative a impressão de gráficos de fundo para reter o estilo colorido das categorias das atividades.
        </p>
      </div>

      {/* Printable Sheet (Always Visible, Styled beautifully for screen and printed cleanly for paper) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm print:shadow-none print:border-none print:p-0 font-sans" id="printable-sheet">
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
                {getPeriodoReferencia()}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono block">
              Emitido em 13/07/2026
            </p>
          </div>
        </div>

        {/* Printable Month Grid / Weekly Grid */}
        {viewMode === 'mensal' ? (
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
        ) : (
          /* Weekly view optimized sheet */
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
                <tr className="min-h-60 border-b border-gray-300">
                  {activeWeek.map((dayNumber, colIndex) => {
                    if (dayNumber === null) {
                      return (
                        <td key={colIndex} className="border border-gray-300 bg-gray-50/50 p-2.5 text-gray-300 select-none align-top">
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
