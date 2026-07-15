import { Activity, Resident, ScheduledActivity, ResidentProgressLog, Reminder } from './types';

export const ORIGINAL_PREDEFINED_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    title: 'Jogo da Memória dos Provérbios',
    description: 'Exercício de completar ditos populares e provérbios antigos portugueses para estimular a memória semântica e a fluência verbal.',
    category: 'cognitiva',
    durationMinutes: 45,
    materials: ['Cartões com metades de provérbios', 'Quadro branco', 'Marcador'],
    objectives: ['Estimular a memória a longo prazo', 'Promover a interação social', 'Exercitar a linguagem']
  },
  {
    id: 'act_2',
    title: 'Oficina de Reminiscências (Fotos Antigas)',
    description: 'Sessão de partilha baseada em fotografias de monumentos, objetos e tradições do século passado, ativando memórias biográficas e emocionais.',
    category: 'cognitiva',
    durationMinutes: 50,
    materials: ['Fotografias impressas em tamanho grande', 'Objetos antigos (ex: ferro de passar, moedor de café)'],
    objectives: ['Evocar recordações pessoais', 'Fomentar a autoestima', 'Estimular a comunicação verbal']
  },
  {
    id: 'act_3',
    title: 'Quiz de Cultura Geral e Raciocínio',
    description: 'Perguntas dinâmicas divididas por temas (geografia, história, culinária e cinema) com níveis de dificuldade ajustados ao grupo.',
    category: 'cognitiva',
    durationMinutes: 40,
    materials: ['Fichas de perguntas', 'Campainha ou botão de resposta'],
    objectives: ['Treinar a atenção e velocidade de processamento', 'Exercitar o raciocínio dedutivo']
  },
  {
    id: 'act_4',
    title: 'Ginástica Sénior na Cadeira',
    description: 'Exercícios físicos de baixo impacto focados em alongamentos, mobilidade articular de membros superiores/inferiores e fortalecimento suave.',
    category: 'fisica',
    durationMinutes: 45,
    materials: ['Cadeiras sem braços', 'Bolas de esponja pequenas', 'Fitas elásticas de resistência leve'],
    objectives: ['Melhorar a amplitude de movimento', 'Prevenir a rigidez muscular', 'Estimular a circulação sanguínea']
  },
  {
    id: 'act_5',
    title: 'Torneio de Balão Gigante',
    description: 'Atividade lúdica de voleibol ou ténis adaptada com balões grandes e coloridos, mantendo os residentes sentados para total segurança.',
    category: 'fisica',
    durationMinutes: 35,
    materials: ['Balões gigantes de látex ou de praia', 'Rede leve ou fita de demarcação'],
    objectives: ['Trabalhar a coordenação óculo-manual', 'Estimular reflexos rápidos', 'Fomentar a gargalhada e o divertimento']
  },
  {
    id: 'act_6',
    title: 'Terapia do Ritmo com Percussão',
    description: 'Utilização de pequenos instrumentos de percussão (pandeiretas, maracas, triângulos) para acompanhar ritmos de músicas tradicionais.',
    category: 'musica',
    durationMinutes: 45,
    materials: ['Instrumentos de percussão diversos', 'Leitor de áudio', 'Playlist de música popular portuguesa'],
    objectives: ['Estimular a coordenação rítmica', 'Promover a expressão emocional', 'Sincronização motora e auditiva']
  },
  {
    id: 'act_7',
    title: 'Cantar é Viver (Fados e Cantigas)',
    description: 'Sessão coral de canto partilhado com letras impressas em tamanho de letra aumentado. Inclui momentos de fado clássico e folclore popular.',
    category: 'musica',
    durationMinutes: 60,
    materials: ['Cancioneiro com letras aumentadas', 'Microfone (opcional)', 'Acompanhamento (guitarra ou faixa instrumental)'],
    objectives: ['Exercitar a capacidade respiratória', 'Reduzir a ansiedade e states depressivos', 'Estimular a memória lírica']
  },
  {
    id: 'act_8',
    title: 'Atelier de Jardinagem Terapêutica',
    description: 'Transplante de pequenas plantas aromáticas e flores para vasos individuais. Foco no estímulo sensorial através da terra e cheiros.',
    category: 'outro',
    durationMinutes: 50,
    materials: ['Vasos pequenos', 'Terra vegetal', 'Mudas de hortelã, alecrim e flores', 'Pá pequena', 'Luvas'],
    objectives: ['Estimular a motricidade fina', 'Proporcionar estímulos sensoriais táteis e olfativos', 'Fomentar a sensação de utilidade']
  }
];

const NEW_ACTIVITIES_RAW: [string, string, string, string, number, string, string][] = [
  // COGNITIVAS
  ['act_cog_1', 'Oficina de Estimulação da Memória (Memórias de Infância)', 'Sessões de partilha focadas em recordar jogos de infância, a escola primária e os primeiros trabalhos.', 'cognitiva', 45, 'Fotografias antigas, Caderno de notas, Objetos de infância', 'Estimular a memória autobiográfica, Fomentar a partilha de vivências'],
  ['act_cog_2', 'Clube de Leitura Dinâmico', 'Leitura partilhada de notícias semanais ou capítulos de livros clássicos portugueses, seguida de debate.', 'cognitiva', 50, 'Livros clássicos, Jornais, Óculos de leitura', 'Estimular a leitura e fonação, Fomentar o debate de ideias, Trabalhar a atenção focada'],
  ['act_cog_3', 'Sessão de Provérbios Populares', 'Completar provérbios conhecidos ("Mais vale um pássaro na mão...") ou debater o seu significado.', 'cognitiva', 40, 'Cartões de provérbios, Quadro branco', 'Exercitar a memória semântica, Promover o raciocínio verbal, Relembrar a sabedoria popular'],
  ['act_cog_4', 'Bingo Temático (Frutas, Cidades, Animais)', 'Em vez de números, as cartelas têm imagens ou nomes de temas específicos para exercitar a associação visual.', 'cognitiva', 45, 'Cartelas temáticas ilustradas, Fichas ou feijões para marcar', 'Estimular a associação visual, Treinar a discriminação de imagens, Fomentar o divertimento'],
  ['act_cog_5', 'Jogo de Palavras Cruzadas Gigante', 'Projeção ou desenho de um painel de palavras cruzadas na parede para resolução em grupo.', 'cognitiva', 50, 'Projetor ou Quadro Gigante, Marcadores coloridos', 'Trabalhar o vocabulário e ortografia, Fomentar a cooperação em grupo, Treinar a flexibilidade cognitiva'],
  ['act_cog_6', 'Exercícios de Cálculo Mental Divertido', 'Pequenos problemas matemáticos simulando compras no mercado de antigamente ("Se a batata custava 2 escudos...").', 'cognitiva', 40, 'Quadro para contas, Problemas impressos, Moedas antigas fictícias', 'Treinar o cálculo mental, Estimular o raciocínio numérico, Exercitar a memória de trabalho'],
  ['act_cog_7', 'Caixa de Sensações (Estimulação Sensorial)', 'Identificar objetos comuns de olhos vendados usando apenas o tato e o olfato (ex: alecrim, chaves, lã).', 'cognitiva', 30, 'Caixa opaca com aberturas, Objetos variados, Ervas aromáticas', 'Estimular os sentidos do tato e olfato, Trabalhar o reconhecimento gnósico, Evocar memórias sensoriais'],
  ['act_cog_8', 'Oficina de Escrita Criativa / Poesia', 'Criação coletiva de quadras populares ou pequenos poemas sobre as estações do ano.', 'cognitiva', 45, 'Papel e caneta, Dicionário de rimas, Quadro para brainstorming', 'Fomentar a criatividade literária, Treinar a motricidade fina na escrita, Expressar sentimentos por escrito'],
  ['act_cog_9', 'Descubra o Intruso', 'Apresentar listas de 4 palavras onde uma não pertence ao grupo (ex: maçã, banana, laranja, martelo).', 'cognitiva', 30, 'Fichas com palavras ou imagens, Quadro', 'Treinar a categorização semântica, Estimular o raciocínio lógico-dedutivo'],
  ['act_cog_10', 'Apanhar a Letra', 'Dizer palavras que comecem com uma determinada letra dentro de uma categoria (ex: "Animais com a letra C").', 'cognitiva', 35, 'Cartões com letras, Temporizador', 'Exercitar a fluência verbal fonológica, Treinar a velocidade de evocação, Estimular a atenção'],
  ['act_cog_11', 'Quebra-Cabeças Adaptados', 'Montagem de puzzles de peças grandes com imagens históricas ou paisagens familiares.', 'cognitiva', 45, 'Puzzles de peças grandes, Superfície plana', 'Estimular as competências viscoconstrutivas, Trabalhar a motricidade fina e paciência'],
  ['act_cog_12', 'Exercício de Orientação Temporal e Espacial', 'Início do dia com a atualização do "Quadro do Dia" (data, dia da semana, estado do tempo, estação e efemérides).', 'cognitiva', 20, 'Quadro magnético interativo, Cartões de datas e clima', 'Reforçar a orientação têmporo-espacial, Favorecer a consciência do quotidiano, Promover rotinas diárias'],
  ['act_cog_13', 'Associação de Pares (Jogos de Memória)', 'Cartas viradas para baixo com pares de imagens antigas ou monumentos nacionais.', 'cognitiva', 35, 'Cartas de pares ilustradas, Mesa de jogo', 'Treinar a memória visual a curto prazo, Trabalhar a atenção e foco'],
  ['act_cog_14', 'Debates sobre Atualidade', 'Discussão moderada sobre notícias do jornal ou da televisão, estimulando a opinião crítica.', 'cognitiva', 50, 'Artigos de jornal impresso, Noticiários em vídeo', 'Estimular o pensamento crítico, Promover a comunicação e debate respeitoso'],
  ['act_cog_15', 'Sopa de Letras Temática', 'Fichas de sopa de letras com tamanho de letra ampliado sobre temas como "A Cozinha", "Ofícios Antigos".', 'cognitiva', 40, 'Fichas de sopa de letras ampliadas, Lápis ou marcadores', 'Estimular a varredura visual, Trabalhar a atenção focada, Promover o vocabulário'],
  ['act_cog_16', 'Jogo do "Quem Sou Eu?"', 'Um idoso tem uma imagem ou nome de uma figura pública histórica colada na testa e faz perguntas ao grupo para adivinhar quem é.', 'cognitiva', 45, 'Fita adesiva, Imagens de figuras históricas', 'Exercitar o raciocínio dedutivo, Estimular o conhecimento histórico, Fomentar a diversão coletiva'],
  ['act_cog_17', 'Cálculo com Dinheiro Fictício', 'Simulação de trocos e pagamentos com notas e moedas de brincadeira para reforçar a autonomia financeira quotidiana.', 'cognitiva', 40, 'Notas e moedas falsas de Euro, Artigos de supermercado simulados', 'Reforçar a autonomia financeira nas AVDs, Exercitar cálculos matemáticos básicos'],
  ['act_cog_18', 'Oficina de Árvores Genealógicas', 'Desenhar e preencher a árvore genealógica de cada utente com o apoio de fotografias de família.', 'cognitiva', 60, 'Cartolina, Canetas, Fotografias familiares, Cola', 'Trabalhar a identidade pessoal, Resgatar memórias familiares, Estimular a psicomotricidade'],
  ['act_cog_19', 'Ordenação Temporal de Imagens', 'Sequenciar cartões que mostram processos diários (ex: fazer café, plantar uma flor, vestir-se).', 'cognitiva', 30, 'Cartões de processos sequenciais', 'Exercitar as funções executivas, Trabalhar o planeamento lógico de ações'],
  ['act_cog_20', 'Reconhecimento de Silhuetas', 'Identificar monumentos, utensílios ou animais através do contorno de figuras pretas.', 'cognitiva', 35, 'Cartões com silhuetas, Quadro de respostas', 'Estimular o reconhecimento visual, Trabalhar a gnosia visual e atenção'],
  ['act_cog_21', 'Ditados Populares e Ortográficos', 'Escrita de pequenos textos nostálgicos para exercitar a motricidade fina e a ortografia.', 'cognitiva', 40, 'Caderno, Caneta, Textos nostálgicos selecionados', 'Trabalhar a escrita e motricidade fina, Treinar a ortografia e atenção auditiva'],
  ['act_cog_22', 'Histórias Encadeadas', 'O animador começa uma história e cada participante tem de adicionar uma frase lógica para continuar o enredo.', 'cognitiva', 45, 'Nenhum, Gravador de voz', 'Fomentar a criatividade e imaginação, Treinar a atenção sequencial e memória auditiva'],
  ['act_cog_23', 'Jogo das Diferenças Visual', 'Encontrar 5 ou 7 diferenças entre duas imagens projetadas ou impressas em tamanho A3.', 'cognitiva', 30, 'Imagens impressas A3 ou projetor, Marcadores', 'Trabalhar a percepção e varredura visual, Treinar a concentração'],
  ['act_cog_24', 'Sessões de Estimulação Cognitiva Computorizada', 'Utilização de tablets com aplicações simples de jogos de lógica adaptados a seniores.', 'cognitiva', 40, 'Tablets, Aplicações de jogos de lógica', 'Desenvolver competências digitais, Trabalhar raciocínio e atenção de forma lúdica'],
  ['act_cog_25', 'Associação de Monumentos e Cidades', 'Ligar imagens de monumentos famosos de Portugal às respetivas regiões ou distritos (ex: Torre de Belém - Lisboa).', 'cognitiva', 45, 'Imagens de monumentos, Cartões de distritos', 'Estimular o conhecimento histórico-cultural, Exercitar a memória semântica regional'],
  ['act_cog_26', 'Geografia de Portugal', 'Identificar rios, serras e distritos num mapa em branco e gigante de Portugal.', 'cognitiva', 45, 'Mapa em branco gigante de Portugal, Alfinetes ou etiquetas coloridas', 'Relembrar conhecimentos geográficos, Fomentar a orientação espacial do país'],
  ['act_cog_27', 'Descrição Detalhada de Imagens', 'Apresentar uma pintura ou fotografia clássica e pedir aos idosos que descrevam todos os pormenores que conseguem ver.', 'cognitiva', 35, 'Quadros de arte célebres ou fotos clássicas', 'Treinar a atenção e análise de detalhes, Exercitar a linguagem expressiva e vocabulário'],
  ['act_cog_28', 'Exercício de Sinónimos e Antónimos', 'Jogo verbal rápido de correspondência de palavras opostas ou semelhantes.', 'cognitiva', 30, 'Lista de palavras preparadas', 'Estimular a agilidade verbal, Treinar o acesso ao léxico mental'],
  ['act_cog_29', 'Jogo das Marcas Antigas', 'Recordar e associar marcas que já não existem ou que mudaram de imagem (ex: Sabão Confiança, Fermento Royal, Pasta Medicinal Couto).', 'cognitiva', 40, 'Anúncios antigos, Embalagens vintage ou réplicas', 'Estimular a reminiscência comercial, Ativar memórias nostálgicas de consumo'],
  ['act_cog_30', 'Oficina de Provadores (Estimulação Gustativa)', 'Degustação às cegas de pequenas porções de alimentos para identificar o sabor (doce, salgado, ácido, amargo).', 'cognitiva', 35, 'Vendas para os olhos, Copos com sumos ou porções de alimentos', 'Estimular as papilas gustativas e o olfato, Trabalhar a gnosia gustativa'],

  // FISICAS
  ['act_fis_1', 'Ginástica Sénior Sentada', 'Exercícios de mobilidade articular de braços, pescoço e pernas realizados de forma segura em cadeiras.', 'fisica', 45, 'Cadeiras seguras, Bolas pequenas', 'Melhorar flexibilidade, Promover mobilidade articular'],
  ['act_fis_2', 'Yoga Sentado / Yoga Adaptado', 'Exercícios de respiração (pranayama) conjugados com alongamentos suaves e posturas adaptadas.', 'fisica', 40, 'Música calma, Tapetes pequenos', 'Estimular respiração, Promover alongamento e calma'],
  ['act_fis_3', 'Caminhada Matinal nos Jardins', 'Percursos curtos e planos nas áreas exteriores do lar para apanhar vitamina D e promover a socialização.', 'fisica', 30, 'Calçado confortável, Chapéus', 'Promover exercício aeróbico leve, Absorção de Vitamina D'],
  ['act_fis_4', 'Circuito de Equilíbrio Preventivo', 'Exercícios de marcha ultrapassando pequenos obstáculos baixos ou seguindo linhas marcadas no chão com fita adesiva.', 'fisica', 45, 'Obstáculos de espuma, Fitas coloridas de chão', 'Treino de equilíbrio, Prevenção de quedas'],
  ['act_fis_5', 'Jogo de Petanca Adaptado', 'Versão de salão ou jardim com bolas mais leves e fáceis de manusear.', 'fisica', 50, 'Bolas de petanca macias', 'Trabalhar pontaria e força leve'],
  ['act_fis_6', 'Balonismo Terapêutico (Voleibol de Balão)', 'Manter um balão de ar no ar usando as mãos, pés ou cabeceamentos, sentados em círculo.', 'fisica', 40, 'Balões coloridos', 'Estimular reflexos coordenados'],
  ['act_fis_7', 'Exercícios de Alongamento Global', 'Sessões focadas em esticar suavemente as costas, ombros e pernas para aliviar a rigidez matinal.', 'fisica', 30, 'Música instrumental suave', 'Aliviar rigidez muscular, Alongamento integral'],
  ['act_fis_8', 'Oficina de Motricidade Fina com Molas de Roupa', 'Colocar e retirar molas coloridas nas bordas de um prato ou caixa de cartão para trabalhar a pinça digital.', 'fisica', 35, 'Molas de roupa coloridas, Pratos de papel', 'Trabalhar pinça digital e coordenação'],
  ['act_fis_9', 'Treino de Força Suave com Halteres de Espuma', 'Exercícios de resistência usando pesos muito leves (0.5 kg) ou garrafas de água pequenas.', 'fisica', 40, 'Pesos de espuma, Garrafas de areia de 0.5kg', 'Fortalecimento muscular progressivo'],
  ['act_fis_10', 'Exercícios de Coordenação com Bolas de Esponja', 'Lançamentos suaves entre os participantes ou contra um alvo macio na parede.', 'fisica', 40, 'Bolas de esponja coloridas', 'Trabalhar lançamentos e receções'],
  ['act_fis_11', 'Dança Sénior Adaptada', 'Coreografias simples com passos repetidos, que podem ser executadas sentadas ou com o apoio de uma cadeira.', 'fisica', 45, 'Música alegre, Leitor de som', 'Estimular coordenação e ritmo, Promover alegria'],
  ['act_fis_12', 'Hidroginástica para Idosos', 'Exercícios de baixo impacto articular em água aquecida.', 'fisica', 45, 'Flutuadores, Piscina aquecida', 'Exercício em ambiente de gravidade reduzida'],
  ['act_fis_13', 'Exercícios Kegel e Core Sentado', 'Fortalecimento dos músculos pélvicos e abdominais profundos para melhoria da postura e controlo da incontinência.', 'fisica', 30, 'Cadeiras confortáveis', 'Melhorar postura corporal, Prevenção de incontinência'],
  ['act_fis_14', 'Jogo do Alvo com Velcro', 'Lançamento de dardos ou bolas de velcro contra um alvo de tecido na parede para treinar a pontaria.', 'fisica', 35, 'Painel de alvo com velcro, Bolas de velcro', 'Estimular pontaria e alcance de membros superiores'],
  ['act_fis_15', 'Atividade de Jardinagem Terapêutica', 'Cuidar de floreiras altas, plantar sementes e regar flores.', 'fisica', 50, 'Floreiras elevadas, Sementes, Regador, Pás', 'Estimular a motricidade e o bem-estar psicológico'],
  ['act_fis_16', 'Exercícios de Respiração e Relaxamento Muscular Progressivo', 'Sessão focada em inspirar/expirar profundamente e relaxar diferentes grupos musculares.', 'fisica', 30, 'Música ambiente relaxante', 'Reduzir ansiedade e relaxamento profundo'],
  ['act_fis_17', 'Jogo de Bowling de Salão', 'Utilização de pinos de plástico e bolas leves para exercitar a flexão do tronco e o lançamento direcionado.', 'fisica', 45, 'Kit de bowling de plástico leve', 'Exercitar flexão lombar, Trabalhar orientação espacial'],
  ['act_fis_18', 'Passagem de Bola em Cadeia', 'Passar uma bola medicinal leve ou bola de pilates ao longo de uma fila de participantes usando rotação do tronco.', 'fisica', 40, 'Bolas de pilates leves', 'Melhorar mobilidade rotacional do tronco'],
  ['act_fis_19', 'Marcha com Ritmo e Palmas', 'Caminhada simulada no lugar (sentados ou de pé) acompanhando o ritmo marcado com palmas ou pandeireta.', 'fisica', 35, 'Pandeireta, Ritmo sonoro', 'Trabalhar marcha simulada e batimento rítmico'],
  ['act_fis_20', 'Exercícios com Elásticos de Resistência (Bandas Elásticas)', 'Exercícios bilaterais para fortalecer os braços e o peitoral, controlando a tensionamento.', 'fisica', 40, 'Bandas elásticas médias de resistência', 'Melhorar força muscular de membros superiores'],
  ['act_fis_21', 'Massagem de Mãos Mútua / Automassagem', 'Massajar as próprias mãos ou as de um companheiro com creme hidratante, estimulando a circulação.', 'fisica', 30, 'Creme hidratante com aroma agradável', 'Melhorar circulação periférica das mãos, Estímulo sensorial'],
  ['act_fis_22', 'Estafeta de Copos com Água', 'Passar água de um copo para o outro ao longo de uma mesa, treinando a estabilidade da mão.', 'fisica', 35, 'Copos de plástico, Água colorida', 'Trabalhar estabilidade fina das mãos'],
  ['act_fis_23', 'Arremesso de Argolas', 'Lançar argolas plásticas para encaixar em pinos ou garrafas pesadas com água.', 'fisica', 40, 'Suporte de pinos, Argolas coloridas', 'Estimular coordenação óculo-manual'],
  ['act_fis_24', 'Treino Funcional de Levantar e Sentar', 'Praticar o movimento correto de levantar da cadeira de forma autónoma e segura.', 'fisica', 30, 'Cadeiras robustas', 'Aumentar autonomia diária, Fortalecer quadríceps'],
  ['act_fis_25', 'Jogo da Malha Adaptado', 'Lançamento de discos de borracha ou sacos de feijão em direção a um alvo desenhado no chão.', 'fisica', 45, 'Discos de borracha, Alvo em vinil ou giz', 'Estimular motricidade e diversão social'],
  ['act_fis_26', 'Exercícios de Expressão Corporal', 'Representar emoções ou simular ações quotidianas através do corpo.', 'fisica', 45, 'Nenhum, Espelho grande', 'Estimular consciência corporal, Promover autoexpressão'],
  ['act_fis_27', 'Alongamentos de Dedos com Elásticos de Cabelo', 'Colocar elásticos em redor dos dedos e abri-los para fortalecer os pequenos extensores da mão.', 'fisica', 30, 'Elásticos de cabelo macios', 'Trabalhar músculos intrínsecos e extensores da mão'],
  ['act_fis_28', 'Exercícios com Pedaleiras de Chão', 'Utilização de pequenos pedais enquanto estão confortavelmente sentados num cadeirão, para melhorar a circulação das pernas.', 'fisica', 35, 'Pedaleiras mecânicas de chão', 'Estimular circulação venosa e flexão dos joelhos'],
  ['act_fis_29', 'Jogo do "Siga o Mestre" Motor', 'Um participante lidera e faz movimentos corporais lentos e os restantes têm de replicar exatamente igual.', 'fisica', 40, 'Nenhum', 'Fomentar atenção concentrada e imitação motora'],
  ['act_fis_30', 'Sessão de Taichi Adaptado', 'Movimentos fluidos, lentos e coordenados focados na transferência de peso de forma controlada.', 'fisica', 45, 'Música oriental serena', 'Melhorar equilíbrio dinâmico e tranquilidade mental'],

  // MUSICAIS
  ['act_mus_1', 'Cante Alentejano / Cantares Tradicionais', 'Formação de um grupo coral informal para cantar canções tradicionais portuguesas.', 'musica', 50, 'Letras das canções, Pandeiretas', 'Estimular o canto coral, Preservar tradições locais'],
  ['act_mus_2', 'Karaoke Sénior', 'Cantar canções de fado, marchas populares ou músicas dos anos 50, 60 e 70 com a letra projetada.', 'musica', 60, 'Microfone, Ecrã de projeção, Letras de música', 'Exercitar dicção e fonação, Divertimento'],
  ['act_mus_3', 'Oficina de Musicoterapia Passiva', 'Audição relaxante de música clássica ou sons da natureza em ambiente de penumbra para acalmar a ansiedade.', 'musica', 40, 'Colunas de som, Projeções suaves', 'Acalmar a ansiedade, Relaxamento sensorial'],
  ['act_mus_4', 'Bandinha Rítmica (Instrumentos de Percussão)', 'Distribuição de chocalhos, pandeiretas, maracas e triângulos para acompanhar canções populares.', 'musica', 45, 'Maracas, Pandeiretas, Triângulos', 'Trabalhar o ritmo coletivo, Coordenação manual'],
  ['act_mus_5', 'Identificar a Canção (Qual é a Música?)', 'Tocar os primeiros segundos de uma melodia instrumental para que os utentes adivinhem o título.', 'musica', 40, 'Leitor de música, Lista de canções famosas', 'Estimular o reconhecimento auditivo, Ativação de memória musical'],
  ['act_mus_6', 'Oficina de Construção de Instrumentos Reciclados', 'Criar maracas com garrafas PET e arroz, ou tambores com latas de metal e balões.', 'musica', 50, 'Garrafas PET, Latas, Arroz, Balões', 'Estimular motricidade e criatividade, Reciclagem lúdica'],
  ['act_mus_7', 'Tarde de Fados', 'Sessão dedicada à audição ou interpretação de fados clássicos.', 'musica', 60, 'Playlist de Fados, Letras impressas', 'Evocação emocional, Identidade nacional'],
  ['act_mus_8', 'Análise de Letras de Canções Antigas', 'Ler as letras de canções populares e debater o seu contexto histórico.', 'musica', 45, 'Letras impressas em papel A4', 'Estimular reflexão e debate, Linguagem verbal'],
  ['act_mus_9', 'Bingo Musical', 'Em vez de números, as cartelas têm títulos de músicas ou artistas.', 'musica', 50, 'Cartelas de bingo musical, Marcadores', 'Discriminação auditiva e visual, Socialização'],
  ['act_mus_10', 'Aulas de Ritmo com Copos (Cup Games)', 'Fazer ritmos simples numa mesa batendo palmas e movendo copos de plástico de forma coordenada.', 'musica', 40, 'Copos plásticos resistentes', 'Treino de motricidade fina e coordenação bilateral'],
  ['act_mus_11', 'Sessão de Movimento ao Som de Ritmos do Mundo', 'Mover partes do corpo ao ritmo de músicas de diferentes culturas.', 'musica', 45, 'Músicas variadas do mundo', 'Promover ritmo corporal, Coordenação psicomotora'],
  ['act_mus_12', 'Cantigas ao Desafio (Sessão Criativa)', 'Estimular a criação improvisada de rimas simples cantadas ao som de uma concertina.', 'musica', 45, 'Acordeão ou concertina (ou gravação)', 'Estimular raciocínio rápido, Diversão e criatividade'],
  ['act_mus_13', 'Contar Histórias Através de Canções', 'Criar um fio condutor narrativo onde, em momentos-chave, o grupo canta uma música que se enquadra na história.', 'musica', 50, 'Roteiro da história, Lista de músicas', 'Estruturação de enredos, Evocação lírica conjunta'],
  ['act_mus_14', 'Jogos Rítmicos com Palmas e Pés', 'Bater palmas reproduzindo padrões rítmicos propostos pelo monitor.', 'musica', 35, 'Nenhum', 'Desenvolver atenção e resposta rítmica'],
  ['act_mus_15', 'Sessões de Lullabies (Canções de Embalar)', 'Recordar e cantar as canções de ninar que cantavam aos filhos e netos.', 'musica', 40, 'Letras das canções de ninar', 'Ativar memórias afetivas profundas, Calma mental'],
  ['act_mus_16', 'Associação de Sons da Natureza', 'Ouvir gravações de sons e identificar a origem exata.', 'musica', 35, 'Áudios de natureza de alta qualidade', 'Estimulação auditiva, Identificação gnósica'],
  ['act_mus_17', 'Exercícios de Respiração e Vocalização', 'Aquecimento vocal simples com escalas musicais básicas.', 'musica', 30, 'Nenhum', 'Melhorar capacidade expiratória, Preparação vocal'],
  ['act_mus_18', 'Adivinhas de Sons do Quotidiano', 'Identificar sons mecânicos ou domésticos gravados antigos.', 'musica', 40, 'Áudios de sons do quotidiano antigo', 'Reminiscência sonora, Treino cognitivo auditivo'],
  ['act_mus_19', 'Concerto de Talentos Internos', 'Espaço aberto para utentes que tocam algum instrumento se apresentarem aos restantes.', 'musica', 60, 'Instrumentos dos utentes', 'Trabalhar a autoconfiança, Sensação de utilidade'],
  ['act_mus_20', 'Dança de Salão Sentada', 'Movimentar os braços a par, simulando uma valsa ou um tango, ao som de clássicos de salão.', 'musica', 45, 'Música de dança de salão clássica', 'Simular coordenação de dança, Expressão física sentada'],
  ['act_mus_21', 'Oficina de Danças de Roda', 'Roda de mãos dadas para cantar e mover-se ao som de cantigas infantis tradicionais.', 'musica', 40, 'Lista de cantigas infantis', 'Resgatar memórias de infância, Promover a coesão social'],
  ['act_mus_22', 'Criação do Hino do Lar', 'Composição de uma letra original em grupo sobre o quotidiano e amizade na instituição.', 'musica', 60, 'Quadro para composição, Canetas', 'Fomentar pertença grupal, Estimular escrita criativa'],
  ['act_mus_23', 'Sessão de Lembranças Musicais (Banda Sonora da Minha Vida)', 'Cada semana, um utente escolhe uma canção marcante da sua vida e explica a sua história.', 'musica', 50, 'Canções específicas de cada participante', 'Identidade pessoal, Partilha íntima e empática'],
  ['act_mus_24', 'Canto e Expressão Facial', 'Cantar canções expressando teatralmente alegria, tristeza, surpresa ou raiva através do rosto.', 'musica', 45, 'Músicas com forte carga dramática', 'Exercitar expressão mimética, Fomentar catarse emocional'],
  ['act_mus_25', 'Jogo de Completar a Letra da Canção', 'Parar a música a meio de um verso e pedir ao grupo para continuar a cantar.', 'musica', 40, 'Leitor de música com pausa', 'Exercitar memória verbal, Treinar antecipação rítmica'],
  ['act_mus_26', 'Celebração das Janeiras e Cantares de Reis', 'Ensaio e apresentação de canções de Natal e Reis.', 'musica', 50, 'Letras das Janeiras, Instrumentos rítmicos', 'Envolvimento cultural sazonal, Promoção de tradições'],
  ['act_mus_27', 'Encontro Intergeracional Musical', 'Receber crianças de escolas ou infantários locais para cantar em conjunto.', 'musica', 60, 'Cancioneiro misto, Lembranças simples', 'Estímulo afetivo intergeracional, Combate à solidão'],
  ['act_mus_28', 'Desenho ao Som da Música', 'Desenhar ou pintar livremente em papel gigante expressando visualmente as emoções transmitidas pela música clássica.', 'musica', 50, 'Papel gigante em rolo, Guaches, Música sinfónica', 'Expressão plástica e emocional integrada'],
  ['act_mus_29', 'Oficina de Óperas e Clássicos', 'Introdução e audição comentada de grandes peças de música clássica.', 'musica', 45, 'Excertos de ópera e clássicos', 'Alimentar o reportório cultural, Relaxamento e escuta ativa'],
  ['act_mus_30', 'Terapia do Riso com Sons Divertidos', 'Emitir sons vocais engraçados e ritmados para quebrar o gelo e libertar endorfinas em grupo.', 'musica', 35, 'Imagens cómicas, pequenos guiões', 'Estimular o riso e bem-estar físico-mental'],

  // OUTROS
  ['act_out_1', 'Chá Convento / Chá de Partilha Semanal', 'Lanche convívio com chá e bolos tradicionais, onde os utentes conversam livremente em ambiente informal.', 'outro', 50, 'Bule de chá, Copos e chávenas, Biscoitos tradicionais', 'Trabalhar competências de conversação, Combater a solidão'],
  ['act_out_2', 'Atividades Intergeracionais (Cartas aos Netos/Escolas)', 'Troca de correspondência ou desenhos com alunos de escolas primárias locais.', 'outro', 45, 'Papel de carta, Envelopes, Canetas de feltro', 'Manter laços comunitários, Exercitar escrita epistolar'],
  ['act_out_3', 'Oficina de Culinária Terapêutica (Pastelaria)', 'Confecionar bolachas simples, broas ou descascar vegetais de forma segura.', 'outro', 60, 'Taças de mistura, Ingredientes pré-medidos, Rolos de massa', 'Manter competências funcionais nas AVDs, Autonomia pessoal'],
  ['act_out_4', 'Sessões de Cinema Clássico / Cineclube', 'Projeção de filmes do cinema português clássico seguida de debate e pipocas.', 'outro', 90, 'Ecrã gigante, Projetor, Filme clássico português', 'Estimular atenção e reminiscência histórica'],
  ['act_out_5', 'Artes Manuais (Trabalhos com Lã, Costura, Tricô)', 'Criação de mantas, cachecóis ou pequenos bonecos para doar.', 'outro', 60, 'Novelhos de lã, Agulhas de tricô arredondadas', 'Desenvolver motricidade fina, Promover altruísmo social'],
  ['act_out_6', 'Sessões de Espiritualidade / Terço Comunitário', 'Momentos de oração, leitura de textos sagrados ou reza do terço para os utentes que o desejarem.', 'outro', 40, 'Terços, Textos de leitura religiosa', 'Garantir apoio espiritual e bem-estar íntimo'],
  ['act_out_7', 'Comemoração de Aniversários do Mês', 'Festa conjunta mensal com bolo, música de parabéns e entrega de postais personalizados.', 'outro', 60, 'Bolo de aniversário, Velas, Postais manuscritos', 'Valorizar a pessoa individual, Estreitar laços sociais'],
  ['act_out_8', 'Oficina de Decoração de Época', 'Criação de decorações temáticas para o Natal, Páscoa, Santos Populares e Magusto.', 'outro', 50, 'Cartolinas, Fitas coloridas, Adereços sazonais', 'Estimular criatividade plástica, Promover consciência temporal'],
  ['act_out_9', 'Visitas Culturais Virtuais (Google Earth / Museus)', 'Utilizar o projetor para fazer visitas virtuais guiadas.', 'outro', 50, 'Computador, Projetor, Ecrã', 'Estimular curiosidade, Orientação espacial do passado'],
  ['act_out_10', 'Sessões de Estética e Autocuidado (Dia de Beleza)', 'Pintar unhas, fazer penteados, barbear cuidado e aplicação de cremes faciais para trabalhar a autoestima.', 'outro', 60, 'Vernizes hipoalergénicos, Creme facial, Escovas e pentes', 'Elevar autoimagem, Sensação de bem-estar corporal'],
  ['act_out_11', 'Jogos de Tabuleiro Clássicos', 'Tardes dedicadas ao Dominó, Damas, Jogo da Glória, Monopólio ou Cartas.', 'outro', 60, 'Tabuleiros de dominó, Cartas de jogar', 'Trabalhar lógica e estratégia, Socialização competitiva saudável'],
  ['act_out_12', 'Cuidado e Terapia com Animais (Zooterapia)', 'Visitas organizadas de cães de terapia ou outros animais domésticos.', 'outro', 45, 'Guloseimas para animais, Animais de terapia', 'Estímulo tátil e emocional extraordinário'],
  ['act_out_13', 'Desfiles Temáticos (Carnaval, Épocas)', 'Concursos de máscaras simples ou desfiles com roupas vintage.', 'outro', 60, 'Roupas antigas, Máscaras coloridas, Música de fundo', 'Promover desinibição e expressão dramática'],
  ['act_out_14', 'Feira de Artesanato do Lar / Venda de Solidariedade', 'Expor e vender os trabalhos manuais realizados pelos utentes.', 'outro', 90, 'Trabalhos manuais, Banca de feira decorada', 'Dar valor ao trabalho executado, Socialização exterior'],
  ['act_out_15', 'Sessões de Fotografia (Retratos de Vida)', 'Sessão fotográfica com os idosos vestidos a rigor, partilhando os seus melhores sorrisos.', 'outro', 50, 'Máquina fotográfica, Adereços variados', 'Trabalhar autoaceitação, Criação de recordações físicas'],
  ['act_out_16', 'Oficina de Origami e Recorte de Papel', 'Dobragens fáceis de papel colorido para exercitar a precisão das mãos.', 'outro', 45, 'Papel de cores variadas, Tesouras pontas redondas', 'Trabalhar precisão bimanual, Coordenação visoespacial'],
  ['act_out_17', 'Criação de um Jornal de Parede do Lar', 'Elaborar um jornal mensal com receitas, aniversários, poesias e notícias.', 'outro', 60, 'Placa de cortiça gigante, Folhas escritas, Fotografias', 'Estimular o sentido de comunidade informado'],
  ['act_out_18', 'Sessões de Meditação e Mindfulness Sénior', 'Exercícios simples de visualização criativa e foco no momento presente.', 'outro', 40, 'Música zen, Cadeirões relaxantes, Difusor de lavanda', 'Minimizar estresse, Aumentar a consciência corporal presente'],
  ['act_out_19', 'Oficina de Sabões e Velas Artesanais', 'Criação de pequenos sabonetes aromáticos usando glicerina e ervas secas.', 'outro', 50, 'Base de glicerina, Formas de silicone, Essências aromáticas', 'Estimular destreza tátil, Ativação olfativa e produção útil'],
  ['act_out_20', 'Tarde de Contos e Lendas Populares', 'Leitura e partilha de lendas e mitos de Portugal.', 'outro', 45, 'Livro de lendas tradicionais', 'Evocar o imaginário nacional, Favorecer escuta ativa'],
  ['act_out_21', 'Passeios de Estudo ao Exterior', 'Saídas organizadas de autocarro para praias, parques naturais ou santuários.', 'outro', 180, 'Autocarro adaptado, Merendas individuais', 'Contacto com o meio externo, Quebra da rotina institucional'],
  ['act_out_22', 'Teatro de Fantoches / Teatro de Sombras', 'Criação de pequenas peças encenadas pelos idosos.', 'outro', 60, 'Fantoches de luva, Pequeno teatro de madeira ou pano', 'Trabalhar motricidade de dedos, Expressão dramática divertida'],
  ['act_out_23', 'Clube de Costura Criativa (Upcycling de Roupas)', 'Customizar roupas antigas dando-lhes uma nova utilidade.', 'outro', 60, 'Roupas velhas, Botões variados, Linhas e agulhas', 'Treino de motricidade fina avançada, Sustentabilidade'],
  ['act_out_24', 'Sessão de Fitas do Tempo (Linha da Vida)', 'Criar um grande painel mural onde cada idoso coloca um marco histórico pessoal.', 'outro', 50, 'Mural cronológico, Fitas coloridas, Marcadores', 'Estimular perspetiva histórica e integridade do ego'],
  ['act_out_25', 'Pintura e Modelação em Argila', 'Trabalhar argila ou plasticina para modelar pequenos vasos.', 'outro', 50, 'Argila auto-endurecível, Tinas com água, Espátulas', 'Trabalhar força palmar, Estímulo proprioceptivo e tridimensional'],
  ['act_out_26', 'Dia do Chapéu Divertido', 'Um dia temático onde todos os utentes e colaboradores criam e usam um chapéu original.', 'outro', 60, 'Chapéus de palha ou papelão, Rendas, Plumas, Cola', 'Fomentar o humor e descontração geral'],
  ['act_out_27', 'Oficina de Puzzles Tridimensionais', 'Construções simples de maquetes de madeira ou cartão.', 'outro', 45, 'Maquetes simples de encaixar', 'Melhorar orientação espacial e planeamento visomotor'],
  ['act_out_28', 'Jogos de Mímica e Charadas', 'Um voluntário representa um filme ou profissão através de gestos.', 'outro', 40, 'Cartões de tarefas de mímica', 'Estimular gesticulação e leitura corporal, Divertimento'],
  ['act_out_29', 'Oficina de Chás e Infusões', 'Conhecer as propriedades das plantas aromáticas, misturar ervas secas e provar infusões.', 'outro', 45, 'Hortelã, Camomila, Lúcia-lima, Tília, Bules', 'Reconhecer propriedades fitoterapêuticas, Ativação olfato/paladar'],
  ['act_out_30', 'Sessão "Saber de Experiência Feito"', 'Cada utente partilha uma competência ou conhecimento prático que dominava.', 'outro', 55, 'Objetos de suporte de cada atividade', 'Promover empoderamento pessoal, Partilha de saberes e legados']
];

export const PREDEFINED_ACTIVITIES: Activity[] = [
  ...ORIGINAL_PREDEFINED_ACTIVITIES,
  ...NEW_ACTIVITIES_RAW.map(([id, title, description, category, durationMinutes, materialsStr, objectivesStr]) => ({
    id,
    title,
    description,
    category: category as any,
    durationMinutes,
    materials: materialsStr.split(',').map(s => s.trim()).filter(s => s.length > 0),
    objectives: objectivesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }))
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res_1',
    name: 'Maria Amélia Silva',
    birthDate: '1938-04-12',
    cognitiveLevel: 'Ligeiro',
    physicalLevel: 'Independente',
    interests: ['Fado', 'Jardinagem', 'Costura', 'Provérbios'],
    observations: 'Muito participativa e comunicativa. Adora liderar grupos nas sessões de canto.',
    joinedDate: '2022-09-15',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 'res_2',
    name: 'Joaquim Antunes Santos',
    birthDate: '1935-11-23',
    cognitiveLevel: 'Moderado',
    physicalLevel: 'Mobilidade Reduzida',
    interests: ['Futebol', 'Jogos de Cartas', 'Música Clássica'],
    observations: 'Necessita de apoio de andarilho. Por vezes apresenta episódios de desorientação temporal, mas acalma-se com música antiga.',
    joinedDate: '2023-02-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 'res_3',
    name: 'Clarice Mendes Sousa',
    birthDate: '1941-07-05',
    cognitiveLevel: 'Ligeiro',
    physicalLevel: 'Cadeira de Rodas',
    interests: ['Pintura', 'Literatura', 'Quiz', 'Histórias Antigas'],
    observations: 'Cognitivamente muito ágil, mas tem limitações físicas acentuadas devido a artrite severa. Prefere atividades sentadas.',
    joinedDate: '2024-01-20',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 'res_4',
    name: 'António Jesus Oliveira',
    birthDate: '1937-02-28',
    cognitiveLevel: 'Grave',
    physicalLevel: 'Mobilidade Reduzida',
    interests: ['Natureza', 'Sons de Água', 'Instrumentos Rítmicos'],
    observations: 'Demência avançada (Alzheimer). Responde muito bem a estímulos sensoriais e ritmos musicais simples. Pouco verbal.',
    joinedDate: '2023-08-01',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 'res_5',
    name: 'Preciosa Costa Ramos',
    birthDate: '1940-09-18',
    cognitiveLevel: 'Moderado',
    physicalLevel: 'Independente',
    interests: ['Trabalhos Manuais', 'Culinária', 'Música Popular'],
    observations: 'Excelente motricidade fina. Por vezes recusa iniciar as atividades devido a apatia, mas integra-se bem com incentivo.',
    joinedDate: '2024-03-05',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'
  }
];

export const getInitialScheduledActivities = (): ScheduledActivity[] => {
  const list: ScheduledActivity[] = [
    {
      id: 'sch_1',
      activityId: 'act_1',
      title: 'Jogo da Memória dos Provérbios',
      description: 'Exercício de completar ditos populares e provérbios antigos portugueses para estimular a memória semântica e a fluência verbal.',
      category: 'cognitiva',
      date: '2026-07-06',
      slot: 'manha',
      time: '10:30',
      completed: true
    },
    {
      id: 'sch_2',
      activityId: 'act_4',
      title: 'Ginástica Sénior na Cadeira',
      description: 'Exercícios físicos de baixo impacto focados em alongamentos, mobilidade articular de membros superiores/inferiores e fortalecimento suave.',
      category: 'fisica',
      date: '2026-07-06',
      slot: 'tarde',
      time: '15:30',
      completed: true
    },
    {
      id: 'sch_3',
      activityId: 'act_6',
      title: 'Terapia do Ritmo com Percussão',
      description: 'Utilização de pequenos instrumentos de percussão (pandeiretas, maracas, triângulos) para acompanhar ritmos de músicas tradicionais.',
      category: 'musica',
      date: '2026-07-08',
      slot: 'manha',
      time: '10:30',
      completed: true
    },
    {
      id: 'sch_4',
      activityId: 'act_8',
      title: 'Atelier de Jardinagem Terapêutica',
      description: 'Transplante de pequenas plantas aromáticas e flores para vasos individuais. Foco no estímulo sensorial através da terra e cheiros.',
      category: 'outro',
      date: '2026-07-09',
      slot: 'tarde',
      time: '15:30',
      completed: true
    },
    {
      id: 'sch_5',
      activityId: 'act_2',
      title: 'Oficina de Reminiscências (Fotos Antigas)',
      description: 'Sessão de partilha baseada em fotografias de monumentos, objetos e tradições do século passado, ativando memórias biográficas e emocionais.',
      category: 'cognitiva',
      date: '2026-07-13',
      slot: 'manha',
      time: '10:15',
      completed: false
    },
    {
      id: 'sch_6',
      activityId: 'act_5',
      title: 'Torneio de Balão Gigante',
      description: 'Atividade lúdica de voleibol ou ténis adaptada com balões grandes e coloridos, mantendo os residentes sentados para total segurança.',
      category: 'fisica',
      date: '2026-07-13',
      slot: 'tarde',
      time: '15:00',
      completed: false
    },
    {
      id: 'sch_7',
      activityId: 'act_7',
      title: 'Cantar é Viver (Fados e Cantigas)',
      description: 'Sessão coral de canto partilhado com letras impressas em tamanho de letra aumentado. Inclui momentos de fado clássico e folclore popular.',
      category: 'musica',
      date: '2026-07-15',
      slot: 'manha',
      time: '10:30',
      completed: false
    },
    {
      id: 'sch_8',
      activityId: 'act_3',
      title: 'Quiz de Cultura Geral e Raciocínio',
      description: 'Perguntas dinâmicas divididas por temas (geografia, história, culinária e cinema) com níveis de dificuldade ajustados ao grupo.',
      category: 'cognitiva',
      date: '2026-07-16',
      slot: 'manha',
      time: '10:30',
      completed: false
    },
    {
      id: 'sch_9',
      activityId: 'act_4',
      title: 'Ginástica Sénior na Cadeira',
      description: 'Exercícios físicos de baixo impacto focados em alongamentos, mobilidade articular de membros superiores/inferiores e fortalecimento suave.',
      category: 'fisica',
      date: '2026-07-17',
      slot: 'tarde',
      time: '15:30',
      completed: false
    }
  ];

  return list;
};

export const getInitialProgressLogs = (): ResidentProgressLog[] => {
  return [
    {
      id: 'log_1',
      residentId: 'res_1',
      scheduledActivityId: 'sch_1',
      date: '2026-07-06',
      activityTitle: 'Jogo da Memória dos Provérbios',
      category: 'cognitiva',
      participation: 'alta',
      cognitiveScore: 5,
      physicalScore: 3,
      socialScore: 5,
      notes: 'Maria Amélia conhecia quase todos os provérbios. Ajudou ativamente os outros residentes a completar as frases.'
    },
    {
      id: 'log_2',
      residentId: 'res_2',
      scheduledActivityId: 'sch_1',
      date: '2026-07-06',
      activityTitle: 'Jogo da Memória dos Provérbios',
      category: 'cognitiva',
      participation: 'media',
      cognitiveScore: 3,
      physicalScore: 3,
      socialScore: 3,
      notes: 'O Sr. Joaquim demorou um pouco a engajar-se, mas conseguiu lembrar-se de dois provérbios da sua infância agrícola.'
    },
    {
      id: 'log_3',
      residentId: 'res_3',
      scheduledActivityId: 'sch_1',
      date: '2026-07-06',
      activityTitle: 'Jogo da Memória dos Provérbios',
      category: 'cognitiva',
      participation: 'alta',
      cognitiveScore: 4,
      physicalScore: 2,
      socialScore: 4,
      notes: 'Demonstrou excelente raciocínio rápido. Expressou muita felicidade por interagir.'
    },
    {
      id: 'log_4',
      residentId: 'res_4',
      scheduledActivityId: 'sch_1',
      date: '2026-07-06',
      activityTitle: 'Jogo da Memória dos Provérbios',
      category: 'cognitiva',
      participation: 'baixa',
      cognitiveScore: 1,
      physicalScore: 2,
      socialScore: 2,
      notes: 'António esteve bastante apático. Sorriu com a animação geral, mas não participou diretamente no jogo verbal.'
    },
    {
      id: 'log_5',
      residentId: 'res_1',
      scheduledActivityId: 'sch_2',
      date: '2026-07-06',
      activityTitle: 'Ginástica Sénior na Cadeira',
      category: 'fisica',
      participation: 'alta',
      cognitiveScore: 4,
      physicalScore: 5,
      socialScore: 4,
      notes: 'Executou todos os alongamentos com ótima amplitude. Muita energia.'
    },
    {
      id: 'log_6',
      residentId: 'res_2',
      scheduledActivityId: 'sch_2',
      date: '2026-07-06',
      activityTitle: 'Ginástica Sénior na Cadeira',
      category: 'fisica',
      participation: 'alta',
      cognitiveScore: 3,
      physicalScore: 3,
      socialScore: 4,
      notes: 'Esforçou-se bastante nos exercícios de pernas. Sentiu alguma fadiga ao final, mas descansou e recuperou bem.'
    },
    {
      id: 'log_7',
      residentId: 'res_3',
      scheduledActivityId: 'sch_2',
      date: '2026-07-06',
      activityTitle: 'Ginástica Sénior na Cadeira',
      category: 'fisica',
      participation: 'media',
      cognitiveScore: 4,
      physicalScore: 2,
      socialScore: 3,
      notes: 'Mobilidade dos braços excelente, mas devido à dor nas articulações fez exercícios mais curtos e lentos.'
    },
    {
      id: 'log_8',
      residentId: 'res_4',
      scheduledActivityId: 'sch_3',
      date: '2026-07-08',
      activityTitle: 'Terapia do Ritmo com Percussão',
      category: 'musica',
      participation: 'alta',
      cognitiveScore: 2,
      physicalScore: 4,
      socialScore: 5,
      notes: 'Excelente resposta ao pandeiro. Acompanhou o ritmo perfeitamente e balançou a cabeça sorrindo. Muito positivo para o seu estado de ânimo.'
    },
    {
      id: 'log_9',
      residentId: 'res_2',
      scheduledActivityId: 'sch_3',
      date: '2026-07-08',
      activityTitle: 'Terapia do Ritmo com Percussão',
      category: 'musica',
      participation: 'media',
      cognitiveScore: 3,
      physicalScore: 3,
      socialScore: 3,
      notes: 'Manteve o ritmo com as maracas. Lembrou-se de uma canção antiga e tentou cantarolar.'
    },
    {
      id: 'log_10',
      residentId: 'res_5',
      scheduledActivityId: 'sch_3',
      date: '2026-07-08',
      activityTitle: 'Terapia do Ritmo com Percussão',
      category: 'musica',
      participation: 'alta',
      cognitiveScore: 4,
      physicalScore: 4,
      socialScore: 4,
      notes: 'Estava relutante no início, mas depois de escolher a pandeireta divertiu-se imenso.'
    }
  ];
};

export const getInitialReminders = (): Reminder[] => {
  return [
    {
      id: 'rem_1',
      text: 'Preparar fotos e objetos antigos para a Oficina de Reminiscências de hoje de manhã.',
      date: '2026-07-13',
      type: 'atividade',
      completed: false
    },
    {
      id: 'rem_2',
      text: 'Encher 4 balões gigantes extra para o torneio de tarde.',
      date: '2026-07-13',
      type: 'atividade',
      completed: false
    },
    {
      id: 'rem_3',
      text: 'Lembrar de hidratar a Dona Clarice extra na atividade física, devido às dores de calor.',
      date: '2026-07-13',
      type: 'saude',
      completed: false
    },
    {
      id: 'rem_4',
      text: 'Imprimir e afixar o plano mensal de atividades no mural do refeitório.',
      date: '2026-07-14',
      type: 'geral',
      completed: false
    }
  ];
};
