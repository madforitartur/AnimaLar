import React, { useState } from 'react';
import { Printer, Download, BookOpen, FileText, Music, Map, HelpCircle, Lightbulb, Grid, Eye, Palette } from 'lucide-react';
import Tooltip from './Tooltip';

type MaterialType = 'proverbios' | 'quiz' | 'sabedoria' | 'matematica' | 'rimas' | 'cancioneiro' | 'mapa' | 'sensorial' | 'artes';

export default function SupportMaterialsPanel() {
  const [activeMaterial, setActiveMaterial] = useState<MaterialType>('proverbios');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="support-materials-root">
      
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display font-black text-slate-800 text-xl sm:text-2xl tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Material de Apoio Pronto a Imprimir
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Documentos, fichas de exercícios, cartões de jogos e letras de música formatados especificamente para impressão em tamanho A4.
          </p>
        </div>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all self-start md:self-auto"
          id="btn-print-material"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Main Grid (Sidebar + Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar (Hidden on Print) */}
        <div className="lg:col-span-1 space-y-3 print:hidden">
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-2 tracking-wider block mb-2">Selecione o Documento</span>
            
            <button
              onClick={() => setActiveMaterial('proverbios')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'proverbios'
                  ? 'bg-amber-50 text-amber-800 border-l-4 border-amber-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4 text-amber-500" />
              <span>Cartões de Provérbios</span>
            </button>

            <button
              onClick={() => setActiveMaterial('quiz')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'quiz'
                  ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Fichas de Perguntas / Quiz</span>
            </button>

            <button
              onClick={() => setActiveMaterial('sabedoria')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'sabedoria'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span>Ideias de Sabedoria Popular</span>
            </button>

            <button
              onClick={() => setActiveMaterial('matematica')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'matematica'
                  ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Problemas Matemáticos</span>
            </button>

            <button
              onClick={() => setActiveMaterial('rimas')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'rimas'
                  ? 'bg-rose-50 text-rose-800 border-l-4 border-rose-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Dicionário de Rimas</span>
            </button>

            <button
              onClick={() => setActiveMaterial('cancioneiro')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'cancioneiro'
                  ? 'bg-sky-50 text-sky-800 border-l-4 border-sky-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Music className="w-4 h-4 text-sky-500" />
              <span>Letras Grandes / Canções</span>
            </button>

            <button
              onClick={() => setActiveMaterial('mapa')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'mapa'
                  ? 'bg-slate-100 text-slate-800 border-l-4 border-slate-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Map className="w-4 h-4 text-slate-600" />
              <span>Mapa de Portugal em Branco</span>
            </button>

            <button
              onClick={() => setActiveMaterial('sensorial')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'sensorial'
                  ? 'bg-rose-50 text-rose-800 border-l-4 border-rose-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4 text-rose-500" />
              <span>Roteiro de Estimulação Sensorial</span>
            </button>

            <button
              onClick={() => setActiveMaterial('artes')}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                activeMaterial === 'artes'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-500'
                  : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Palette className="w-4 h-4 text-purple-500" />
              <span>Moldes e Guia de Expressão Artística</span>
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-[11px] text-indigo-950 space-y-1.5 leading-relaxed">
            <span className="font-bold uppercase tracking-wider block text-[9px] text-indigo-700">Dica de Utilização</span>
            <p>
              Ao imprimir, escolha a opção <strong>"Guardar como PDF"</strong> para arquivar digitalmente, ou envie diretamente para a sua impressora local.
            </p>
            <p className="text-gray-400">
              Dica: use folhas de maior gramagem (120g+) para os cartões de jogo para prolongar a sua durabilidade.
            </p>
          </div>
        </div>

        {/* Preview and Printable Canvas */}
        <div className="lg:col-span-3">
          
          {/* Printable container. Custom class name avoids external layout components on print */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none min-h-[297mm] w-full font-sans text-slate-900" id="print-area-container">
            
            {/* Header present on every printed document */}
            <div className="border-b-2 border-slate-200 pb-4 mb-6 flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-indigo-700 uppercase">AnimaLar • Recursos de Estimulação Terapêutica</span>
                <h3 className="font-display font-black text-slate-800 text-lg">
                  {activeMaterial === 'proverbios' && 'Jogo de Memória: Provérbios Populares'}
                  {activeMaterial === 'quiz' && 'Ficha de Exercícios: Quiz de Cultura Geral'}
                  {activeMaterial === 'sabedoria' && 'Roteiro de Conversação: Sabedoria Popular'}
                  {activeMaterial === 'matematica' && 'Exercício de Cálculo: Mercado de Antigamente'}
                  {activeMaterial === 'rimas' && 'Oficina Literária: Guia e Dicionário de Rimas'}
                  {activeMaterial === 'cancioneiro' && 'Cancioneiro Tradicional (Letra Aumentada)'}
                  {activeMaterial === 'mapa' && 'Exercício de Geografia: Mapa de Portugal'}
                  {activeMaterial === 'sensorial' && 'Ficha Terapêutica: Protocolo de Estimulação Sensorial e Aromaterapia'}
                  {activeMaterial === 'artes' && 'Guia de Atividade: Moldes e Padrões para Expressão Artística e Mosaico'}
                </h3>
              </div>
              <div className="text-right text-[9px] text-slate-400 font-mono">
                PÁGINA DE IMPRESSÃO A4 • CONFIDENCIAL/TERAPÊUTICO
              </div>
            </div>

            {/* Document Body: Proverbios Match Cards */}
            {activeMaterial === 'proverbios' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4 italic">
                  <strong>Instruções de Corte:</strong> Recorte os cartões ao longo das linhas tracejadas. Baralhe as cartas e desafie os utentes a associar a primeira metade (azul) com a respetiva segunda metade (verde).
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pair 1 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"Mais vale um pássaro na mão..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... do que dois a voar."</span>
                  </div>

                  {/* Pair 2 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"Grão a grão..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... enche a galinha o papo."</span>
                  </div>

                  {/* Pair 3 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"Quem semeia ventos..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... colhe tempestades."</span>
                  </div>

                  {/* Pair 4 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"Não deixes para amanhã..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... o que podes fazer hoje."</span>
                  </div>

                  {/* Pair 5 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"A cavalo dado..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... não se olha o dente."</span>
                  </div>

                  {/* Pair 6 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"Quem canta..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... seus males espanta."</span>
                  </div>

                  {/* Pair 7 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"De pequenino..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... se torce o pepino."</span>
                  </div>

                  {/* Pair 8 */}
                  <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-indigo-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 tracking-wider">Parte A (Início)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"O seguro..."</span>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 p-4 rounded-xl flex flex-col justify-between min-h-[90px] bg-emerald-50/20">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-600 tracking-wider">Parte B (Fim)</span>
                    <span className="font-display font-bold text-sm text-slate-800">"... morreu de velho."</span>
                  </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400 italic">
                  Sugestão: Cole estes cartões em papel cartão rígido antes de os recortar para que durem mais tempo em sessões sucessivas.
                </div>
              </div>
            )}

            {/* Document Body: Quiz de Cultura Geral */}
            {activeMaterial === 'quiz' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  Esta ficha contém um conjunto de perguntas calibradas para estimulação cognitiva do grupo, divididas por blocos temáticos. Leia em voz alta de forma pausada.
                </p>

                <div className="space-y-5">
                  {/* Bloco 1: Geografia e Localidades */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-indigo-800 border-b pb-1.5 uppercase tracking-wide">Bloco 1 • Geografia e Tradições</h4>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        1. Qual é o rio mais longo que nasce em Espanha e desagua em Portugal, especificamente na cidade de Lisboa?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Rio Tejo.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        2. O que é o "Vira" e de que região de Portugal é típico?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Uma dança tradicional típica da região do Minho.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        3. Que cidade portuguesa é mundialmente conhecida pelos seus canais de água e pelos barcos "moliceiros"?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Aveiro.</p>
                    </div>
                  </div>

                  {/* Bloco 2: História e Efemérides */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-indigo-800 border-b pb-1.5 uppercase tracking-wide">Bloco 2 • História de Portugal</h4>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        1. Quem foi o primeiro Rei de Portugal, também conhecido como "O Conquistador"?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: D. Afonso Henriques.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        2. Em que dia e mês se comemora o Dia de Portugal, de Camões e das Comunidades Portuguesas?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: 10 de Junho.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        3. Que grande evento decorreu em Lisboa em 1998, focado nos oceanos, que transformou a zona oriental da cidade?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Expo 98.</p>
                    </div>
                  </div>

                  {/* Bloco 3: Gastronomia Tradicional */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-indigo-800 border-b pb-1.5 uppercase tracking-wide">Bloco 3 • Gastronomia e Culinária</h4>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        1. Que ingredientes principais compõem o tradicional prato transmontano "Alheira"?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Pão, carne de aves/porco/caça, alho e azeite.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        2. De que cidade portuguesa é originária a famosa receita das "Amêijoas à Bulhão Pato"?
                      </p>
                      <p className="text-xs text-emerald-700 font-mono ml-4">↳ Resposta: Lisboa (criada em homenagem ao poeta Raimundo António de Bulhão Pato).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Sabedoria Popular */}
            {activeMaterial === 'sabedoria' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  Cartões de conversa e orientação verbal para explorar a sabedoria popular, mezinhas caseiras antigas e tradições climáticas regionais.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-300 p-4 rounded-xl space-y-2 bg-slate-50/30">
                    <span className="text-[9px] font-extrabold uppercase text-indigo-700">Roteiro 1 • O Tempo e os Meses</span>
                    <h5 className="font-bold text-xs">Provérbios do Clima</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pergunte ao grupo: 
                      <br />- Quem se lembra do provérbio <em>"Em Abril..."</em> (águas mil)?
                      <br />- E o de Janeiro? (<em>"Janeiro geador, Fevereiro voltador."</em>)
                      <br />- Como sabiam antigamente se ia chover sem ver a meteorologia na televisão? (Dores nas articulações, nuvens, comportamento das andorinhas).
                    </p>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-2 bg-slate-50/30">
                    <span className="text-[9px] font-extrabold uppercase text-indigo-700">Roteiro 2 • Plantas e Mezinhas</span>
                    <h5 className="font-bold text-xs">Ervas e Remédios de Antigamente</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Desafie o grupo a recordar utilidades das seguintes ervas aromáticas:
                      <br />- <strong>Chá de Tília / Camomila</strong>: Para acalmar e ajudar a adormecer.
                      <br />- <strong>Alecrim</strong>: Para dores musculares (álcool de alecrim) e circulação.
                      <br />- <strong>Hortelã-pimenta</strong>: Para a digestão e dores de estômago.
                    </p>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-2 bg-slate-50/30 col-span-2">
                    <span className="text-[9px] font-extrabold uppercase text-indigo-700">Metodologia Terapêutica recomendada</span>
                    <h5 className="font-bold text-xs">Como guiar esta sessão</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fomente a reminiscência ativa sem pressionar por respostas corretas. O objetivo é a troca livre de estórias sobre o que faziam nas aldeias e vilas quando eram jovens. Valorize cada testemunho pessoal, pois isso reconstrói o autoconceito positivo do idoso.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Problemas de Calculo */}
            {activeMaterial === 'matematica' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  <strong>Ficha de Exercícios de Raciocínio Numérico:</strong> Resolva em conjunto ou distribua individualmente. Os problemas simulam compras antigas na feira ou mercearia com moeda antiga (Escudos) ou Euro para ativar o cálculo de forma nostálgica.
                </p>

                <div className="space-y-6">
                  {/* Problem 1 */}
                  <div className="border-b pb-4 space-y-2">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 block">Problema 1 • Na Mercearia de Antigamente</span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      "A D. Maria foi à feira comprar batatas e cebolas. Cada saca de batatas custava 15 escudos e o quilo de cebolas custava 5 escudos. Se ela comprou duas sacas de batatas e um quilo de cebolas, quanto gastou no total?"
                    </p>
                    <div className="h-12 border border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Espaço para cálculo do utente:</span>
                      <span className="text-xs font-bold text-emerald-800">Resposta Correta: 35 escudos (15 x 2 = 30 + 5 = 35)</span>
                    </div>
                  </div>

                  {/* Problem 2 */}
                  <div className="border-b pb-4 space-y-2">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 block">Problema 2 • O Troco da Nota de 50 Escudos</span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      "Para pagar a conta anterior (35 escudos), a D. Maria entregou ao feirante uma nota de 50 escudos. Quanto deve receber de troco?"
                    </p>
                    <div className="h-12 border border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Espaço para cálculo do utente:</span>
                      <span className="text-xs font-bold text-emerald-800">Resposta Correta: 15 escudos (50 - 35 = 15)</span>
                    </div>
                  </div>

                  {/* Problem 3 */}
                  <div className="border-b pb-4 space-y-2">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 block">Problema 3 • Azeite e Pão de Trigo</span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      "Um litro de azeite custava 10 escudos e um pão de trigo custava 2 escudos. Se o Sr. Manuel comprou 2 litros de azeite e 4 pães de trigo, quanto dinheiro gastou ao todo?"
                    </p>
                    <div className="h-12 border border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Espaço para cálculo do utente:</span>
                      <span className="text-xs font-bold text-emerald-800">Resposta Correta: 28 escudos (20 pelo azeite + 8 pelo pão)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Rimas */}
            {activeMaterial === 'rimas' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  <strong>Guia para a Oficina de Escrita Criativa e Poesia:</strong> Uma tabela de apoio com famílias de rimas comuns em português para estimular a criatividade lírica dos utentes na criação de quadras populares.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded-lg space-y-1.5">
                    <span className="text-xs font-black text-rose-800 block border-b pb-1">Família do "-ÃO" (Forte)</span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      Coração, Balão, Canção, João, Violão, Pão, Sertão, Verão, Mão, Emoção, Gratidão, União, Irmão, Recordação.
                    </p>
                  </div>

                  <div className="border p-3 rounded-lg space-y-1.5">
                    <span className="text-xs font-black text-rose-800 block border-b pb-1">Família do "-AR" (Ação)</span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      Cantar, Dançar, Voar, Sonhar, Lembrar, Amar, Olhar, Chorar, Caminhar, Encontrar, Partilhar, Brilhar, Rezar, Brincar.
                    </p>
                  </div>

                  <div className="border p-3 rounded-lg space-y-1.5">
                    <span className="text-xs font-black text-rose-800 block border-b pb-1">Família do "-ELA" (Suave)</span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      Janela, Estrela, Bela, Aguarela, Capela, Vela, Fivela, Panela, Ela, Donzela, Castela, Passarela.
                    </p>
                  </div>

                  <div className="border p-3 rounded-lg space-y-1.5">
                    <span className="text-xs font-black text-rose-800 block border-b pb-1">Família do "-URA" (Doce)</span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      Ternura, Brancura, Altura, Pintura, Frescura, Doçura, Criatura, Leitura, Cultura, Costura, Ventura, Doçura.
                    </p>
                  </div>
                </div>

                <div className="border border-rose-100 bg-rose-50/10 p-4 rounded-xl mt-4">
                  <span className="text-[10px] font-bold uppercase text-rose-700 block mb-1">Exercício Prático Coletivo</span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Escreva o seguinte início de quadra no quadro e desafie os utentes a completar os dois últimos versos usando a tabela acima:
                    <br />
                    <span className="font-serif italic font-semibold text-slate-800 block py-1.5 pl-4">
                      "Minha terra tem pinheiros,<br />
                      Onde canta o rouxinol..."
                    </span>
                    <em>(Ideia de continuação: "Lembro os tempos de outrora, / Sob este lindo pôr do sol.")</em>
                  </p>
                </div>
              </div>
            )}

            {/* Document Body: Letras de Canções / Cancioneiro */}
            {activeMaterial === 'cancioneiro' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4 italic">
                  Letras de canções populares portuguesas em tamanho de letra ampliado (Tamanho 20) para facilitar a leitura aos utentes com dificuldades visuais ligeiras.
                </p>

                <div className="space-y-8">
                  {/* Song 1 */}
                  <div className="border-b pb-6 space-y-3">
                    <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest block">Canção 1 • Alecrim Dourado</span>
                    <div className="font-serif text-lg text-slate-800 font-semibold space-y-2 pl-4 leading-normal print:text-2xl">
                      <p>Alecrim, alecrim dourado</p>
                      <p>Que nasceu no monte</p>
                      <p>Sem ser semeado.</p>
                      <br />
                      <p>Ó meu amor</p>
                      <p>Quem te disse a ti</p>
                      <p>Que o alecrim do monte</p>
                      <p>Era assim?</p>
                    </div>
                  </div>

                  {/* Song 2 */}
                  <div className="border-b pb-6 space-y-3">
                    <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest block">Canção 2 • Ó Laurinda</span>
                    <div className="font-serif text-lg text-slate-800 font-semibold space-y-2 pl-4 leading-normal print:text-2xl">
                      <p>Ó Laurinda, sê bem-vinda</p>
                      <p>Sê bem-vinda, ó Laurinda,</p>
                      <p>Ao serão da nossa aldeia!</p>
                      <br />
                      <p>Anda ver a mocidade</p>
                      <p>A dançar à claridade</p>
                      <p>Da lua quando está cheia!</p>
                    </div>
                  </div>

                  {/* Song 3 */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest block">Canção 3 • Cheira a Lisboa</span>
                    <div className="font-serif text-lg text-slate-800 font-semibold space-y-2 pl-4 leading-normal print:text-2xl">
                      <p>Cheira bem, cheira a Lisboa</p>
                      <p>Cheira a flor de laranjeira</p>
                      <p>A rosa, a manjerico</p>
                      <p>A cravo de papelão...</p>
                      <br />
                      <p>Cheira bem, cheira a Lisboa</p>
                      <p>Tem o cheiro de uma cantiga</p>
                      <p>Tem o cheiro de um pregão!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Mapa de Portugal */}
            {activeMaterial === 'mapa' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 print:text-black mb-2">
                  <strong>Ficha de Geografia e Localização:</strong> Peça aos utentes para identificar e escrever os nomes dos distritos de Portugal nos círculos correspondentes ou pintar as regiões que já visitaram ou onde nasceram.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10 border border-slate-200 p-6 rounded-2xl bg-slate-50/20">
                  {/* Beautiful high-contrast vector drawing of Portugal */}
                  <div className="w-full max-w-[280px]">
                    <svg viewBox="0 0 300 600" className="w-full h-auto text-slate-800 stroke-2" fill="none" stroke="currentColor">
                      {/* Stylized Portugal Contour Map */}
                      <path 
                        d="M100,50 L110,60 L130,55 L150,80 L160,110 L155,130 L165,150 L150,180 L160,200 L140,220 L150,250 L145,280 L155,310 L140,350 L160,380 L150,410 L165,440 L155,470 L140,500 L110,510 L80,510 L75,480 L60,470 L65,440 L50,420 L55,380 L40,350 L50,310 L45,280 L35,260 L45,230 L35,200 L45,170 L35,140 L55,110 L50,80 L70,70 Z" 
                        fill="#f8fafc" 
                        stroke="#1e293b" 
                        strokeWidth="3.5"
                      />
                      
                      {/* Dotted border rivers */}
                      <path d="M45,230 Q90,210 140,220" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="3 3" />
                      <path d="M35,140 Q80,130 155,130" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="3 3" />
                      
                      {/* District Markers (Círculos vazios para preenchimento) */}
                      {/* Porto / Norte */}
                      <circle cx="95" cy="115" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="95" y="119" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">1</text>
                      
                      {/* Coimbra / Centro */}
                      <circle cx="85" cy="205" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="85" y="209" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">2</text>

                      {/* Lisboa */}
                      <circle cx="55" cy="335" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="55" y="339" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">3</text>

                      {/* Alentejo / Évora */}
                      <circle cx="110" cy="385" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="110" y="389" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">4</text>

                      {/* Algarve / Faro */}
                      <circle cx="115" cy="485" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="115" y="489" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">5</text>
                    </svg>
                  </div>

                  {/* Lendas/Legenda de preenchimento */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Identifique na legenda:</span>
                      <h5 className="font-bold text-xs">Associe os números ao nome do Distrito correspondente:</h5>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                        <span className="border-b border-dashed border-gray-400 w-32 h-5 block"></span>
                        <span className="text-gray-400 text-[10px] italic">(Dica: Minho / Douro Litoral)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                        <span className="border-b border-dashed border-gray-400 w-32 h-5 block"></span>
                        <span className="text-gray-400 text-[10px] italic">(Dica: Beira Litoral)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                        <span className="border-b border-dashed border-gray-400 w-32 h-5 block"></span>
                        <span className="text-gray-400 text-[10px] italic">(Dica: Estremadura / Capital)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                        <span className="border-b border-dashed border-gray-400 w-32 h-5 block"></span>
                        <span className="text-gray-400 text-[10px] italic">(Dica: Planícies do Sul)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">5</span>
                        <span className="border-b border-dashed border-gray-400 w-32 h-5 block"></span>
                        <span className="text-gray-400 text-[10px] italic">(Dica: Extremo Sul / Sol)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Sensorial Protocol */}
            {activeMaterial === 'sensorial' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  Ficha de apoio para orientação de sessões de estimulação tátil, olfativa e auditiva com grupo sénior. Imprima e utilize como guia no espaço Snoezelen ou sala de atividades.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-rose-200 bg-rose-50/30 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-rose-700 tracking-wider">Estação 1 • Aromaterapia dos Citrinos</span>
                    <h5 className="font-bold text-xs text-slate-800">Citrinos e Ervas Medicinais</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Apresentar frascos perfurados com casca de laranja fresca, alecrim e canela.<br/>
                      2. Questionar: "Que recordação lhe traz este aroma?" / "Lembra-se das compotas de outono?"
                    </p>
                  </div>

                  <div className="border border-amber-200 bg-amber-50/30 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-amber-700 tracking-wider">Estação 2 • Caixa do Mar e Texturas</span>
                    <h5 className="font-bold text-xs text-slate-800">Conchas, Pedras do Rio e Areia</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Convidar o utente a tocar nas pedras polidas e conchas sem olhar.<br/>
                      2. Estimular a descrição tátil: "É liso, áspero, frio ou quente?"
                    </p>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/30 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-emerald-700 tracking-wider">Estação 3 • Sons do Meio Rural</span>
                    <h5 className="font-bold text-xs text-slate-800">Chocalhos, Água e Pássaros</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Reproduzir 30 segundos de som de chocalho de ovelhas ou moenda de água.<br/>
                      2. Pedir aos residentes para identificar o animal ou elemento da natureza.
                    </p>
                  </div>

                  <div className="border border-purple-200 bg-purple-50/30 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-purple-700 tracking-wider">Estação 4 • Caixa dos Sabores Antigos</span>
                    <h5 className="font-bold text-xs text-slate-800">Marmelada, Mel e Queijo</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      1. Pequena degustação guiada com colher descartável em ambiente calmo.<br/>
                      2. Promover o relaxamento e o resgate da memória gustativa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Body: Artes Protocol */}
            {activeMaterial === 'artes' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500 print:text-black mb-4">
                  Grelhas e moldes geométricos para atividades de pintura de mandalas, mosaicos portugueses e pintura em tecido.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-purple-300 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-purple-50/20">
                    <span className="text-[9px] font-bold uppercase text-purple-600 tracking-wider">Molde 1 • Azulejo Tradicional Português</span>
                    <div className="w-24 h-24 border-4 border-purple-400 rounded-lg flex items-center justify-center relative">
                      <div className="w-12 h-12 border-2 border-purple-300 rotate-45"></div>
                    </div>
                    <span className="text-[10px] text-slate-500">Pronto para recortar, pintar com tinta guache azul e colhar em cartolina.</span>
                  </div>

                  <div className="border-2 border-dashed border-teal-300 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-teal-50/20">
                    <span className="text-[9px] font-bold uppercase text-teal-600 tracking-wider">Molde 2 • Mandala de Primavera</span>
                    <div className="w-24 h-24 border-4 border-dashed border-teal-400 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-teal-300 rounded-full"></div>
                    </div>
                    <span className="text-[10px] text-slate-500">Exercício de preenchimento de cor para motricidade fina e paciência.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Signature area for print authenticity */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-400">
              <div>
                <span>Garantia de Qualidade de Estimulação Sénior • AnimaLar</span>
              </div>
              <div className="text-right">
                <span>Assinatura do Técnico de Animação: ___________________________</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
