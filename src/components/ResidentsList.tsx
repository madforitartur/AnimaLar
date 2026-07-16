import React, { useState } from 'react';
import { Resident, ResidentProgressLog, ActivityCategory } from '../types';
import { UserPlus, Search, Filter, ShieldAlert, Award, FileText, CheckCircle, TrendingUp, Calendar, Trash2, Edit2, Smile, ArrowUpRight, Plus, BrainCircuit, Activity as PhysIcon, Disc } from 'lucide-react';
import Tooltip from './Tooltip';

interface ResidentsListProps {
  residents: Resident[];
  progressLogs: ResidentProgressLog[];
  onAddResident: (resident: Omit<Resident, 'id'>) => void;
  onAddProgressLog: (log: Omit<ResidentProgressLog, 'id'>) => void;
  onDeleteResident: (id: string) => void;
  onUpdateResident: (resident: Resident) => void;
}

export default function ResidentsList({
  residents,
  progressLogs,
  onAddResident,
  onAddProgressLog,
  onDeleteResident,
  onUpdateResident,
}: ResidentsListProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCog, setFilterCog] = useState<string>('todos');
  const [filterPhys, setFilterPhys] = useState<string>('todos');

  // Preset Avatars Array
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=120&h=120',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120',
  ];

  // New Resident Form Modal State
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [resName, setResName] = useState('');
  const [resBirthDate, setResBirthDate] = useState('1940-01-01');
  const [resCog, setResCog] = useState<'Ligeiro' | 'Moderado' | 'Grave'>('Ligeiro');
  const [resPhys, setResPhys] = useState<'Independente' | 'Mobilidade Reduzida' | 'Cadeira de Rodas'>('Independente');
  const [resInterests, setResInterests] = useState('');
  const [resObs, setResObs] = useState('');
  const [resPhoto, setResPhoto] = useState<string>(''); // Holds base64 or URL

  // Edit Resident Form Modal State
  const [showEditResidentModal, setShowEditResidentModal] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [editResId, setEditResId] = useState('');
  const [editResName, setEditResName] = useState('');
  const [editResBirthDate, setEditResBirthDate] = useState('');
  const [editResCog, setEditResCog] = useState<'Ligeiro' | 'Moderado' | 'Grave'>('Ligeiro');
  const [editResPhys, setEditResPhys] = useState<'Independente' | 'Mobilidade Reduzida' | 'Cadeira de Rodas'>('Independente');
  const [editResInterests, setEditResInterests] = useState('');
  const [editResObs, setEditResObs] = useState('');
  const [editResPhoto, setEditResPhoto] = useState<string>(''); // Holds base64 or URL

  // File Upload to Base64 Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditResPhoto(reader.result);
          } else {
            setResPhoto(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to open edit modal
  const openEditResidentModal = (res: Resident) => {
    setEditResId(res.id);
    setEditResName(res.name);
    setEditResBirthDate(res.birthDate);
    setEditResCog(res.cognitiveLevel);
    setEditResPhys(res.physicalLevel);
    setEditResInterests(res.interests.join(', '));
    setEditResObs(res.observations || '');
    setEditResPhoto(res.avatar || '');
    setShowEditResidentModal(true);
  };

  // Helper to save edited resident
  const handleUpdateResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResName.trim()) return;

    const parsedInterests = editResInterests
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const residentToUpdate = residents.find(r => r.id === editResId);
    if (!residentToUpdate) return;

    onUpdateResident({
      ...residentToUpdate,
      name: editResName.trim(),
      birthDate: editResBirthDate,
      cognitiveLevel: editResCog,
      physicalLevel: editResPhys,
      interests: parsedInterests.length > 0 ? parsedInterests : ['Música', 'Ar livre'],
      observations: editResObs.trim(),
      avatar: editResPhoto || residentToUpdate.avatar,
    });

    setShowEditResidentModal(false);
  };

  // New Progress Log Form State (inside detail panel)
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [logActTitle, setLogActTitle] = useState('Sessão Individual de Acompanhamento');
  const [logCategory, setLogCategory] = useState<ActivityCategory>('cognitiva');
  const [logPart, setLogPart] = useState<'alta' | 'media' | 'baixa' | 'recusou'>('alta');
  const [logCogScore, setLogCogScore] = useState(4);
  const [logPhysScore, setLogPhysScore] = useState(3);
  const [logSocialScore, setLogSocialScore] = useState(4);
  const [logNotes, setLogNotes] = useState('');

  // Generated Report State
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Active Selected Resident
  const selectedResident = residents.find((r) => r.id === selectedResidentId);

  // Helper: Compute Age
  const calculateAge = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const today = new Date('2026-07-13'); // Matches simulated current time
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Filter residents list
  const filteredResidents = residents.filter((r) => {
    const matchName = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCog = filterCog === 'todos' || r.cognitiveLevel === filterCog;
    const matchPhys = filterPhys === 'todos' || r.physicalLevel === filterPhys;
    return matchName && matchCog && matchPhys;
  });

  // Handle Register New Resident
  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim()) return;

    const parsedInterests = resInterests
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const randomAvatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120&h=120',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120&h=120',
    ];
    const chosenAvatar = resPhoto || randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    onAddResident({
      name: resName.trim(),
      birthDate: resBirthDate,
      cognitiveLevel: resCog,
      physicalLevel: resPhys,
      interests: parsedInterests.length > 0 ? parsedInterests : ['Música', 'Ar livre'],
      observations: resObs.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: chosenAvatar,
    });

    // Reset fields & close
    setResName('');
    setResBirthDate('1940-01-01');
    setResCog('Ligeiro');
    setResPhys('Independente');
    setResInterests('');
    setResObs('');
    setResPhoto('');
    setShowAddResidentModal(false);
  };

  // Handle Save Progress Log
  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    onAddProgressLog({
      residentId: selectedResidentId,
      scheduledActivityId: `manual_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      activityTitle: logActTitle,
      category: logCategory,
      participation: logPart,
      cognitiveScore: logCogScore,
      physicalScore: logPhysScore,
      socialScore: logSocialScore,
      notes: logNotes.trim() || 'Participação normal na atividade.',
    });

    // Reset & close
    setLogActTitle('Sessão de Acompanhamento');
    setLogNotes('');
    setShowAddLogForm(false);
    setGeneratedReport(null); // invalidate cached report
  };

  // Generate Automated Progress Report Summary
  const handleGenerateReportText = () => {
    if (!selectedResident) return;
    const resLogs = progressLogs.filter((l) => l.residentId === selectedResident.id);

    if (resLogs.length === 0) {
      setGeneratedReport(
        `RELATÓRIO DE PROGRESSO INDIVIDUAL\nLar de Santo António\nData: 13/07/2026\n\nResidente: ${
          selectedResident.name
        } (${calculateAge(selectedResident.birthDate)} anos)\nNível Cognitivo: ${
          selectedResident.cognitiveLevel
        } | Nível Físico: ${selectedResident.physicalLevel}\n\nNota: Não existem participações registadas para este residente no sistema. Recomenda-se iniciar o registo diário para obter análises automatizadas.`
      );
      return;
    }

    const countHighPart = resLogs.filter((l) => l.participation === 'alta').length;
    const countTotal = resLogs.length;
    const rateParticipation = Math.round((countHighPart / countTotal) * 100);

    const avgCog = (resLogs.reduce((acc, l) => acc + l.cognitiveScore, 0) / countTotal).toFixed(1);
    const avgPhys = (resLogs.reduce((acc, l) => acc + l.physicalScore, 0) / countTotal).toFixed(1);
    const avgSoc = (resLogs.reduce((acc, l) => acc + l.socialScore, 0) / countTotal).toFixed(1);

    // Categories Breakdown
    const listCats = resLogs.map((l) => l.category);
    const countCog = listCats.filter((c) => c === 'cognitiva').length;
    const countPhys = listCats.filter((c) => c === 'fisica').length;
    const countMus = listCats.filter((c) => c === 'musica').length;

    // Build the clinical-like text
    let text = `====================================================\n`;
    text += `   RELATÓRIO DE PROGRESSO TERAPÊUTICO E SOCIOCULTURAL\n`;
    text += `====================================================\n\n`;
    text += `DADOS DO UTENTE:\n`;
    text += `• Nome Completo: ${selectedResident.name}\n`;
    text += `• Idade: ${calculateAge(selectedResident.birthDate)} anos (Nascimento: ${selectedResident.birthDate.split('-').reverse().join('/')})\n`;
    text += `• Perfil Clínico: Cognição [${selectedResident.cognitiveLevel}] | Mobilidade [${selectedResident.physicalLevel}]\n`;
    text += `• Data de Admissão: ${selectedResident.joinedDate.split('-').reverse().join('/')}\n`;
    text += `• Interesses Partilhados: ${selectedResident.interests.join(', ')}\n\n`;

    text += `MÉTRICAS DE ACOMPANHAMENTO (Baseado em ${countTotal} registos recentes):\n`;
    text += `• Taxa de Elevado Envolvimento: ${rateParticipation}% das sessões.\n`;
    text += `• Média de Desempenho Cognitivo: ${avgCog} / 5.0\n`;
    text += `• Média de Desempenho Físico: ${avgPhys} / 5.0\n`;
    text += `• Média de Socialização e Humor: ${avgSoc} / 5.0\n\n`;

    text += `SÍNTESE DE PARTICIPAÇÕES POR ÁREA:\n`;
    text += `- Estimulação Cognitiva: ${countCog} sessões\n`;
    text += `- Atividade Física Leve: ${countPhys} sessões\n`;
    text += `- Musicoterapia: ${countMus} sessões\n\n`;

    text += `SÍNTESE TERAPÊUTICA NARRATIVA:\n`;
    if (parseFloat(avgSoc) >= 4.0) {
      text += `Utente exibe um excelente estado de espírito, mantendo-se altamente recetivo(a) e acolhedor(a) para com a equipa de animação e os restantes residentes. `;
    } else if (parseFloat(avgSoc) >= 2.5) {
      text += `O utente demonstra socialização estável. O humor é oscilante mas alinha-se positivamente com atividades estruturadas. `;
    } else {
      text += `Deteta-se um padrão de isolamento social e apatia frequente. Necessita de convites individuais constantes e acompanhamento um-para-um. `;
    }

    if (parseFloat(avgCog) >= 4.0) {
      text += `A nível cognitivo, apresenta raciocínio rápido, facilidade de expressão oral e excelente evocação de memória a longo prazo (especialmente durante oficinas de reminiscências). `;
    } else if (parseFloat(avgCog) >= 2.5) {
      text += `Apresenta algumas falhas de atenção e desorientação espaçotemporal ligeira, mas beneficia muito do suporte visual dos cartões de provérbios e pistas contextuais. `;
    } else {
      text += `Evidencia declínio cognitivo acentuado (grau severo). Responde sobretudo a estímulos sensoriais primários, como toque, luzes e sons. `;
    }

    if (parseFloat(avgPhys) >= 4.0) {
      text += `Mostra grande vitalidade motora. Executa alongamentos completos sem queixas de dores, com excelente equilíbrio.\n\n`;
    } else if (parseFloat(avgPhys) >= 2.5) {
      text += `Realiza os exercícios na cadeira com algumas pausas por fadiga. Beneficia de treinos curtos com bolas e fitas.\n\n`;
    } else {
      text += `Apresenta restrições de mobilidade severas. O foco físico deve focar-se em manter a flexibilidade passiva das mãos e relaxamento articular.\n\n`;
    }

    text += `NOTAS DE DIÁRIO DE OBSERVAÇÃO RECENTE:\n`;
    const recentLogsWithNotes = resLogs.filter((l) => l.notes.length > 0).slice(-3);
    if (recentLogsWithNotes.length > 0) {
      recentLogsWithNotes.forEach((l) => {
        text += `- [${l.date.split('-').reverse().join('/')}] (${l.activityTitle}): "${l.notes}"\n`;
      });
    } else {
      text += `Sem observações adicionais registadas.\n`;
    }

    text += `\nPARECER DO ANIMADOR SOCIOCULTURAL:\n`;
    text += `Recomenda-se continuar com o plano semanal integrado de musicoterapia coletiva e sessões cognitivas de reminiscências. Manter vigilância na hidratação e incentivar pequenas caminhadas com apoio.\n\n`;
    text += `Assinatura: _______________________________\n`;
    text += `(Animador(a) Sociocultural Responsável)\n`;

    setGeneratedReport(text);
  };

  // Prepare Chart Data
  const getChartDataForSelected = () => {
    if (!selectedResident) return [];
    // Filter and sort oldest to newest
    const resLogs = progressLogs
      .filter((l) => l.residentId === selectedResident.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6); // Last 6 points

    return resLogs;
  };

  const chartData = getChartDataForSelected();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="residents-list-container">
      {/* Sidebar: Residents search & filter (1 Column) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col space-y-4 h-fit">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-gray-800 text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Lista de Utentes
          </h2>
          <Tooltip position="left" content="Registar Utente: Adicionar a ficha clínica e de estimulação de um novo utente no sistema">
            <button
              onClick={() => setShowAddResidentModal(true)}
              className="flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              id="btn-register-resident"
            >
              <UserPlus className="w-3.5 h-3.5" /> Registar Utente
            </button>
          </Tooltip>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Procurar utente pelo nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="block font-semibold text-gray-500 mb-1">Filtro Cognitivo</label>
            <select
              value={filterCog}
              onChange={(e) => setFilterCog(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white font-medium"
            >
              <option value="todos">Todos os Graus</option>
              <option value="Ligeiro">Ligeiro 🟢</option>
              <option value="Moderado">Moderado 🟡</option>
              <option value="Grave">Grave 🔴</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-500 mb-1">Filtro Físico</label>
            <select
              value={filterPhys}
              onChange={(e) => setFilterPhys(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white font-medium"
            >
              <option value="todos">Todos os Perfis</option>
              <option value="Independente">Independente 🏃‍♂️</option>
              <option value="Mobilidade Reduzida">Andarilho/Apoio 🚶‍♂️</option>
              <option value="Cadeira de Rodas">Cadeira de Rodas ♿</option>
            </select>
          </div>
        </div>

        {/* Residents Scrollable List */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filteredResidents.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-xs italic">Nenhum utente encontrado com estes filtros.</p>
          ) : (
            filteredResidents.map((resident) => {
              const isSelected = resident.id === selectedResidentId;
              const age = calculateAge(resident.birthDate);

              return (
                <div
                  key={resident.id}
                  onClick={() => {
                    setSelectedResidentId(resident.id);
                    setGeneratedReport(null); // Clear cache
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-300'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-slate-50/50'
                  }`}
                  id={`res-item-${resident.id}`}
                >
                  <img
                    src={resident.avatar}
                    alt={resident.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-display font-semibold text-xs text-slate-800 truncate">
                      {resident.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-mono font-medium text-gray-500">
                        {age} anos
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        resident.cognitiveLevel === 'Ligeiro' ? 'bg-emerald-50 text-emerald-800' :
                        resident.cognitiveLevel === 'Moderado' ? 'bg-amber-50 text-amber-800' :
                        'bg-red-50 text-red-800'
                      }`}>
                        🧠 {resident.cognitiveLevel}
                      </span>
                      <span className="text-[8px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                        {resident.physicalLevel === 'Independente' ? '🏃‍♂️' : resident.physicalLevel === 'Mobilidade Reduzida' ? '🚶‍♂️' : '♿'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {/* Edit resident button */}
                    <Tooltip position="top" content="Editar Ficha: Atualizar dados de identificação e saúde deste utente">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditResidentModal(resident);
                        }}
                        className="text-gray-300 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                        title="Editar utente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                    {/* Delete resident button */}
                    <Tooltip position="top" content="Remover Utente: Apagar de forma irreversível o registo e avaliações deste utente">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResidentToDelete(resident);
                        }}
                        className="text-gray-300 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Eliminar utente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Selected Resident Progress & Notes (2 Columns) */}
      <div className="lg:col-span-2 space-y-5" id="resident-detail-panel">
        {selectedResident ? (
          <>
            {/* Utente Header/Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-5">
              <img
                src={selectedResident.avatar}
                alt={selectedResident.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-inner shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-gray-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-gray-100">
                      Ficha Terapêutica
                    </span>
                    <h2 className="font-display font-bold text-gray-800 text-lg mt-1">
                      {selectedResident.name}
                    </h2>
                  </div>
                  <Tooltip position="left" content="Editar Ficha: Editar informações de saúde, interesses e observações do utente selecionado">
                    <button
                      onClick={() => openEditResidentModal(selectedResident)}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-100/50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-all font-bold cursor-pointer shrink-0"
                      title="Editar Ficha Clínica"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Ficha</span>
                    </button>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-50 border border-gray-100 rounded-lg p-2">
                    <span className="block text-[10px] font-semibold text-gray-400">Idade</span>
                    <span className="font-semibold text-slate-700">{calculateAge(selectedResident.birthDate)} Anos</span>
                  </div>
                  <div className="bg-slate-50 border border-gray-100 rounded-lg p-2">
                    <span className="block text-[10px] font-semibold text-gray-400">Estado de Cognição</span>
                    <span className={`font-semibold ${
                      selectedResident.cognitiveLevel === 'Ligeiro' ? 'text-emerald-700' :
                      selectedResident.cognitiveLevel === 'Moderado' ? 'text-amber-700' :
                      'text-red-700 font-bold'
                    }`}>{selectedResident.cognitiveLevel}</span>
                  </div>
                  <div className="bg-slate-50 border border-gray-100 rounded-lg p-2 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-semibold text-gray-400">Autonomia Física</span>
                    <span className="font-semibold text-slate-700 text-[11px] truncate block">{selectedResident.physicalLevel}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Interesses & Hobbies:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedResident.interests.map((interest, i) => (
                      <span key={i} className="text-[10px] font-medium bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                        ✨ {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedResident.observations && (
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700 block mb-0.5">Observações Diárias:</span>
                    <p className="italic leading-relaxed">"{selectedResident.observations}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Progress Graph Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-display font-semibold text-gray-800 text-sm">Evolução do Progresso Clínico</h3>
                  <p className="text-[10px] text-gray-400">Pontuações cognitivas, físicas e sociais registadas recentemente (últimas 6 sessões)</p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-purple-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Cognitivo
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Físico
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Social
                  </span>
                </div>
              </div>

              {chartData.length < 2 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 italic">Dados insuficientes para desenhar o gráfico.</p>
                  <p className="text-[10px] text-gray-400 mt-1">É necessário registar pelo menos 2 participações para traçar a linha temporal.</p>
                </div>
              ) : (
                /* Pure SVG Responsive Line Chart */
                <div className="bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                  <svg viewBox="0 0 500 200" className="w-full h-44 overflow-visible" id="progress-svg-chart">
                    {/* Grid lines */}
                    {[1, 2, 3, 4, 5].map((val) => {
                      const y = 200 - (val * 35);
                      return (
                        <g key={val}>
                          <line x1="40" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                          <text x="15" y={y + 4} className="text-[9px] font-mono fill-gray-400 font-semibold">{val}.0</text>
                        </g>
                      );
                    })}

                    {/* Chart Paths */}
                    {(() => {
                      const count = chartData.length;
                      const getPoints = (scoreKey: 'cognitiveScore' | 'physicalScore' | 'socialScore') => {
                        return chartData.map((d, index) => {
                          const x = 40 + (index * (440 / (count - 1)));
                          const y = 200 - (d[scoreKey] * 35);
                          return { x, y };
                        });
                      };

                      const cogPoints = getPoints('cognitiveScore');
                      const physPoints = getPoints('physicalScore');
                      const socPoints = getPoints('socialScore');

                      const createDPath = (points: { x: number; y: number }[]) => {
                        return points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
                      };

                      return (
                        <>
                          {/* Cognitive Line */}
                          <path d={createDPath(cogPoints)} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Physical Line */}
                          <path d={createDPath(physPoints)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Social Line */}
                          <path d={createDPath(socPoints)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Data points */}
                          {chartData.map((d, i) => {
                            const x = 40 + (i * (440 / (count - 1)));
                            return (
                              <g key={i}>
                                {/* Cognitive Dot */}
                                <circle cx={x} cy={200 - (d.cognitiveScore * 35)} r="4" fill="#a855f7" stroke="#fff" strokeWidth="1" />
                                {/* Physical Dot */}
                                <circle cx={x} cy={200 - (d.physicalScore * 35)} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                                {/* Social Dot */}
                                <circle cx={x} cy={200 - (d.socialScore * 35)} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1" />

                                {/* Date Labels */}
                                <text x={x} y="195" textAnchor="middle" className="text-[8px] font-mono fill-gray-500 font-semibold uppercase">
                                  {d.date.split('-').slice(1).reverse().join('/')}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              )}
            </div>

            {/* Individual Progress Journal Logs */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Histórico de Sessões & Registos
                </h3>
                <Tooltip position="left" content="Registar Avaliação: Adicionar um novo registo de participação e observação comportamental">
                  <button
                    onClick={() => setShowAddLogForm(!showAddLogForm)}
                    className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    id="btn-trigger-log-form"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registar Avaliação
                  </button>
                </Tooltip>
              </div>

              {showAddLogForm && (
                <form onSubmit={handleCreateLog} className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-3" id="add-progress-log-form">
                  <h4 className="text-xs font-bold text-slate-800">Nova Observação de Desempenho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Título da Atividade</label>
                      <input
                        type="text"
                        required
                        value={logActTitle}
                        onChange={(e) => setLogActTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Categoria</label>
                      <select
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="cognitiva">🧠 Estimulação Cognitiva</option>
                        <option value="fisica">🏃‍♂️ Exercício Físico Leve</option>
                        <option value="musica">🎶 Musicoterapia Coletiva</option>
                        <option value="outro">🎨 Outros Ateliers</option>
                      </select>
                    </div>
                  </div>

                  {/* Rating Scores slider/selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Engajamento / Participação</label>
                      <select
                        value={logPart}
                        onChange={(e) => setLogPart(e.target.value as any)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="alta">Alta (Envolvido) ✓✓</option>
                        <option value="media">Média (Participativo) ✓</option>
                        <option value="baixa">Baixa (Apático)</option>
                        <option value="recusou">Recusou / Não quis ✕</option>
                      </select>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-purple-700 mb-1">
                        <span>Atenção Cognitiva</span>
                        <span className="font-mono">{logCogScore}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={logCogScore}
                        onChange={(e) => setLogCogScore(parseInt(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-amber-700 mb-1">
                        <span>Esforço Físico</span>
                        <span className="font-mono">{logPhysScore}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={logPhysScore}
                        onChange={(e) => setLogPhysScore(parseInt(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-100 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-blue-700 mb-1">
                        <span>Socialização / Humor</span>
                        <span className="font-mono">{logSocialScore}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={logSocialScore}
                        onChange={(e) => setLogSocialScore(parseInt(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Observações Clínicas/Terapêuticas</label>
                      <input
                        type="text"
                        placeholder="Ex: Sorriu muito ao cantar, lembrou letras facilmente..."
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLogForm(false)}
                      className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="text-xs px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs"
                    >
                      Guardar Registo
                    </button>
                  </div>
                </form>
              )}

              {/* Logs chronological list */}
              {(() => {
                const logs = progressLogs
                  .filter((l) => l.residentId === selectedResident.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (logs.length === 0) {
                  return <p className="text-center py-6 text-gray-400 text-xs italic">Sem registos de participação recentes.</p>;
                }

                return (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {logs.map((log) => {
                      const icons = {
                        cognitiva: <BrainCircuit className="w-4 h-4 text-purple-600" />,
                        fisica: <PhysIcon className="w-4 h-4 text-amber-600" />,
                        musica: <Disc className="w-4 h-4 text-blue-600" />,
                        outro: <Smile className="w-4 h-4 text-slate-500" />,
                      };

                      return (
                        <div key={log.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {icons[log.category]} {log.activityTitle}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 font-medium">
                              {log.date.split('-').reverse().join('/')}
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-[11px] text-gray-600 leading-relaxed italic bg-white p-2 rounded-lg border border-gray-100">
                              "{log.notes}"
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-medium pt-0.5">
                            <span className="text-gray-500">
                              Participação: <strong className="text-indigo-800 uppercase text-[9px] bg-indigo-50 border border-indigo-100 px-1 rounded">{log.participation}</strong>
                            </span>
                            <span className="text-purple-700">
                              Cognitivo: <strong>{log.cognitiveScore}/5</strong>
                            </span>
                            <span className="text-amber-700">
                              Físico: <strong>{log.physicalScore}/5</strong>
                            </span>
                            <span className="text-blue-700">
                              Social: <strong>{log.socialScore}/5</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Smart Clinical Report Generator Section */}
            <div className="bg-indigo-900 border border-indigo-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-300 animate-bounce" />
                    Gerador de Relatório Mensal Individual
                  </h3>
                  <p className="text-[10px] text-indigo-200">Sintetize automaticamente todo o histórico recente num parecer terapêutico em formato de texto para imprimir ou anexar à ficha clínica.</p>
                </div>
                <button
                  onClick={handleGenerateReportText}
                  className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer shrink-0"
                  id="btn-gen-report"
                >
                  Gerar Parecer
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {generatedReport && (
                <div className="space-y-3 animate-fade-in" id="report-view-area">
                  <textarea
                    rows={12}
                    value={generatedReport}
                    onChange={(e) => setGeneratedReport(e.target.value)}
                    className="w-full text-xs font-mono p-4 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-hidden leading-relaxed"
                  />
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] text-indigo-200">
                      📝 Pode editar o relatório gerado acima antes de copiar ou imprimir.
                    </span>
                    <button
                      onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>Relatório de Progresso - ${selectedResident.name}</title>
                                <style>
                                  body { font-family: 'Courier New', Courier, monospace; padding: 40px; white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #333; }
                                  @media print { body { padding: 0; } }
                                </style>
                              </head>
                              <body>${generatedReport.replace(/\n/g, '<br>')}</body>
                            </html>
                          `);
                          win.document.close();
                          win.print();
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-500 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Imprimir Relatório
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 italic">Por favor, registe utentes na barra lateral para começar.</p>
          </div>
        )}
      </div>

      {/* Register Resident Modal */}
      {showAddResidentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="resident-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0 mb-2">
              <h3 className="font-display font-bold text-slate-800 text-base">
                Registar Utente no Lar
              </h3>
              <button
                onClick={() => setShowAddResidentModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
                id="btn-close-resident-modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="flex-1 flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
              {/* Foto de Perfil Selection/Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Foto do Utente</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  {/* Current Photo Preview */}
                  <div className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-200 bg-white shrink-0 flex items-center justify-center">
                    {resPhoto ? (
                      <img
                        src={resPhoto}
                        alt="Foto do Utente"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300 text-[10px] text-center font-semibold p-1">Sem foto</div>
                    )}
                    {resPhoto && (
                      <button
                        type="button"
                        onClick={() => setResPhoto('')}
                        className="absolute inset-0 bg-black/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        title="Remover Foto"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-medium">Carregue um ficheiro do computador ou escolha uma das fotos sugeridas abaixo.</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('add-res-photo-input')?.click()}
                        className="text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        📁 Carregar Ficheiro
                      </button>
                      <input
                        type="file"
                        id="add-res-photo-input"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, false)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold text-gray-500">Fotos sugeridas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResPhoto(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                          resPhoto === url ? 'border-indigo-600 scale-105 shadow-xs' : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel da Silva Gomes"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={resBirthDate}
                    onChange={(e) => setResBirthDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Grau Cognitivo</label>
                  <select
                    value={resCog}
                    onChange={(e) => setResCog(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium"
                  >
                    <option value="Ligeiro">Ligeiro 🟢</option>
                    <option value="Moderado">Moderado 🟡</option>
                    <option value="Grave">Grave 🔴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Autonomia Física / Mobilidade</label>
                <select
                  value={resPhys}
                  onChange={(e) => setResPhys(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium"
                >
                  <option value="Independente">Independente 🏃‍♂️</option>
                  <option value="Mobilidade Reduzida">Mobilidade Reduzida / Auxiliares 🚶‍♂️</option>
                  <option value="Cadeira de Rodas">Dependente / Cadeira de Rodas ♿</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Interesses / Hobbies (Separados por vírgulas)</label>
                <input
                  type="text"
                  placeholder="Ex: Fado, Cartas, Contar histórias, Tricô"
                  value={resInterests}
                  onChange={(e) => setResInterests(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Observações Particulares (Saúde, alergias, rotinas)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Gosta que lhe chamem Manel. Fica agitado ao fim da tarde."
                  value={resObs}
                  onChange={(e) => setResObs(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddResidentModal(false)}
                className="px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-xs"
              >
                Gravar Utente
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {showEditResidentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-resident-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0 mb-2">
              <h3 className="font-display font-bold text-slate-800 text-base">
                Editar Ficha do Utente
              </h3>
              <button
                onClick={() => setShowEditResidentModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold cursor-pointer"
                id="btn-close-edit-resident-modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateResidentSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
              {/* Foto de Perfil Selection/Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">Foto do Utente</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  {/* Current Photo Preview */}
                  <div className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-200 bg-white shrink-0 flex items-center justify-center">
                    {editResPhoto ? (
                      <img
                        src={editResPhoto}
                        alt="Foto do Utente"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300 text-[10px] text-center font-semibold p-1">Sem foto</div>
                    )}
                    {editResPhoto && (
                      <button
                        type="button"
                        onClick={() => setEditResPhoto('')}
                        className="absolute inset-0 bg-black/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        title="Remover Foto"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-medium">Carregue um ficheiro do computador ou escolha uma das fotos sugeridas abaixo.</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('edit-res-photo-input')?.click()}
                        className="text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        📁 Carregar Ficheiro
                      </button>
                      <input
                        type="file"
                        id="edit-res-photo-input"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, true)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-semibold text-gray-500">Fotos sugeridas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditResPhoto(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                          editResPhoto === url ? 'border-indigo-600 scale-105 shadow-xs' : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel da Silva Gomes"
                  value={editResName}
                  onChange={(e) => setEditResName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={editResBirthDate}
                    onChange={(e) => setEditResBirthDate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Grau Cognitivo</label>
                  <select
                    value={editResCog}
                    onChange={(e) => setEditResCog(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium"
                  >
                    <option value="Ligeiro">Ligeiro 🟢</option>
                    <option value="Moderado">Moderado 🟡</option>
                    <option value="Grave">Grave 🔴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Autonomia Física / Mobilidade</label>
                <select
                  value={editResPhys}
                  onChange={(e) => setEditResPhys(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium"
                >
                  <option value="Independente">Independente 🏃‍♂️</option>
                  <option value="Mobilidade Reduzida">Mobilidade Reduzida / Auxiliares 🚶‍♂️</option>
                  <option value="Cadeira de Rodas">Dependente / Cadeira de Rodas ♿</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Interesses / Hobbies (Separados por vírgulas)</label>
                <input
                  type="text"
                  placeholder="Ex: Fado, Cartas, Contar histórias, Tricô"
                  value={editResInterests}
                  onChange={(e) => setEditResInterests(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Observações Particulares (Saúde, alergias, rotinas)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Gosta que lhe chamem Manel. Fica agitado ao fim da tarde."
                  value={editResObs}
                  onChange={(e) => setEditResObs(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditResidentModal(false)}
                className="px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {residentToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="delete-resident-confirm-modal">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-base">
                Confirmar Eliminação
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tem a certeza que deseja eliminar o registo de <span className="font-bold text-gray-800">{residentToDelete.name}</span>?
              </p>
              <p className="text-[10px] text-red-500 bg-red-50/50 p-2.5 rounded-lg border border-red-100/50 leading-relaxed">
                ⚠️ <strong>Atenção:</strong> Esta ação é irreversível. Todas as notas de evolução, relatórios e dados de progresso associados a este utente serão eliminados permanentemente.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setResidentToDelete(null)}
                className="flex-1 py-2.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors font-medium cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteResident(residentToDelete.id);
                  if (selectedResidentId === residentToDelete.id) {
                    setSelectedResidentId(residents.filter(r => r.id !== residentToDelete.id)[0]?.id || '');
                  }
                  setResidentToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer text-center"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
