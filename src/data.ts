import { Activity, Resident, ScheduledActivity, ResidentProgressLog, Reminder } from './types';

export const ORIGINAL_PREDEFINED_ACTIVITIES: Activity[] = [
  {
    id: 'act_leitura_jornal',
    title: 'Atividade de Estimulação Cognitiva - Intelectuais / Formativas - Leitura do Jornal',
    description: 'Leitura diária comentada de notícias, efemérides e debates sobre temas atuais nacionais e internacionais para exercitar a atenção, raciocínio de atualidades e interação social.',
    category: 'cognitiva',
    durationMinutes: 45,
    materials: ['Jornais diários portugueses', 'Óculos de leitura adicionais', 'Lupa se necessário'],
    objectives: ['Estimular a atenção focada', 'Promover o raciocínio crítico e verbalização', 'Manter contacto com a realidade quotidiana']
  },
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
  ['act_out_30', 'Sessão "Saber de Experiência Feito"', 'Cada utente partilha uma competência ou conhecimento prático que dominava.', 'outro', 55, 'Objetos de suporte de cada atividade', 'Promover empoderamento pessoal, Partilha de saberes e legados'],

  // --- NOVAS 80 ATIVIDADES GERIÁTRICAS DE ANIMAÇÃO SOCIOCULTURAL ---
  // COGNITIVAS (20 Novas Atividades)
  ['act_cog_31', 'Jogo dos Anagramas e Palavras Desordenadas', 'Exercício de reorganizar letras baralhadas para formar palavras relacionadas com a cozinha tradicional e vilas portuguesas.', 'cognitiva', 40, 'Fichas de anagramas ampliadas, Lápis, Borracha', 'Exercitar a flexibilidade cognitiva, Estimular a memória ortográfica'],
  ['act_cog_32', 'Adivinhas das Feiras e Mercados Tradicionais', 'Sessão de adivinhas sobre frutas, vegetais, animais de capoeira e utensílios agrícolas antigos.', 'cognitiva', 45, 'Cartões de adivinhas, Campainha para resposta', 'Estimular a linguagem e inferência lógica, Fomentar o riso e a sociabilidade'],
  ['act_cog_33', 'Criptograma dos Provérbios Nacionais', 'Descodificar provérbios antigos substituindo símbolos e números por letras correspondentes.', 'cognitiva', 45, 'Fichas de criptogramas com grelha de código, Lápis', 'Trabalhar a atenção dividida, Exercitar o raciocínio dedutivo'],
  ['act_cog_34', 'Sopa de Letras Temática: Ervas Medicinais e Aromáticas', 'Procura de nomes de plantas tradicionais (alecrim, alfazema, camomila) em caça-palavras de tamanho A3 com letra grande.', 'cognitiva', 40, 'Fichas de sopa de letras A3, Marcadores coloridos', 'Treinar a varredura visual, Exercitar o vocabulário botânico'],
  ['act_cog_35', 'Associação de Marcas e Anúncios de Rádio Antigos', 'Relacionar slogans históricos das décadas de 50 e 60 com as respetivas marcas de produtos de higiene e mercearia.', 'cognitiva', 45, 'Gravações áudio vintage, Cartões de logótipos antigos', 'Estimular a memória remota autobiográfica, Promover recordações de infância'],
  ['act_cog_36', 'Caça-Palavras das Festas Populares e Romarias', 'Localizar termos relacionados com o Santo António, São João, marchas e arraiais em grelhas adaptadas.', 'cognitiva', 40, 'Fichas de caça-palavras, Lápis de cor', 'Exercitar a discriminação visual, Celebrar tradições festivas'],
  ['act_cog_37', 'Categorização: A Caixa do Carpinteiro e da Costureira', 'Separar uma lista de objetos e imagens entre duas profissões tradicionais (linha, dedal, serrote, martelo).', 'cognitiva', 35, 'Cartões ilustrados de ferramentas, Caixas organizadoras', 'Treinar a categorização semântica, Estimular a gnosia visual'],
  ['act_cog_38', 'Jogo da Memória dos Monumentos do Norte ao Sul', 'Associar fotografias de monumentos emblemáticos (Palácio da Pena, Sé de Braga, Castelo de Guimarães) aos distritos corretos.', 'cognitiva', 45, 'Cartões de monumentos e mapas regionais', 'Preservar conhecimentos de geografia cultural, Exercitar a memória de evocação'],
  ['act_cog_39', 'Linha do Tempo das Grandes Invenções do Século XX', 'Ordenar cronologicamente invenções que mudaram a vida diária (rádio, televisão a cores, telefone, frigorífico).', 'cognitiva', 45, 'Fita do tempo em vinil, Cartões com datas e inventos', 'Trabalhar o raciocínio temporal, Fomentar a discussão e partilha de histórias'],
  ['act_cog_40', 'Simulação do Orçamento do Mercado de Domingo', 'Somar preços fictícios de compras de legumes e peixe e calcular o troco com cédulas e moedas pedagógicas.', 'cognitiva', 40, 'Tabela de preços, Dinheiro pedagógico em notas e moedas', 'Reforçar o cálculo mental prático, Manter a autonomia em AVDs'],
  ['act_cog_41', 'Descubra o Intruso Gastronómico Regional', 'Identificar qual o prato típico que não pertence à gastronomia alentejana, minhota ou algarvia apresentada na lista.', 'cognitiva', 35, 'Fichas temáticas com opções gastronómicas', 'Estimular a memória semântica culinária, Promover a interação do grupo'],
  ['act_cog_42', 'Jogo das Palavras Encadeadas (Frutas e Flores)', 'Dizer o nome de uma fruta ou flor que comece com a última letra da palavra anterior dita pelo companheiro.', 'cognitiva', 35, 'Quadro para registo de palavras, Bola de esponja', 'Exercitar a fluência verbal fonológica, Trabalhar a atenção concentrada'],
  ['act_cog_43', 'Completar Expressões Idiomáticas Portuguesas', 'O monitor lê o início de uma expressão popular ("Meter a foice em...", "Dar novos mundos ao...") para o grupo completar.', 'cognitiva', 35, 'Lista de expressões idiomáticas, Campainha', 'Estimular a linguagem automática, Relembrar a cultura lírica popular'],
  ['act_cog_44', 'Leitura e Interpretação de Lendas de Portugal', 'Leitura partilhada da Lenda do Galo de Barcelos ou do Milagre das Rosas com perguntas de compreensão e debate.', 'cognitiva', 50, 'Textos impressos em fonte ampliada (18pt), Marcadores', 'Promover a fonação e focar a atenção, Estimular a compreensão de texto'],
  ['act_cog_45', 'Exercício de Memória Auditiva: Sons do Meio Rural', 'Ouvir curtos excertos sonoros (chocalho de ovelha, moenda de água, galo a cantar) e identificar a origem do som.', 'cognitiva', 35, 'Ficheiros áudio de ambiente rural, Colunas de som', 'Trabalhar a gnosia auditiva, Ativar memórias afetivas rurais'],
  ['act_cog_46', 'Jogo de Lógica dos Parentescos da Família', 'Resolver pequenos enigmas de relações familiares ("O filho do meu irmão é meu...").', 'cognitiva', 35, 'Fichas de perguntas, Quadro branco', 'Exercitar o raciocínio dedutivo, Trabalhar conceitos de genealogia'],
  ['act_cog_47', 'Sopa de Letras: Vilas e Aldeias Históricas', 'Descobrir nomes de vilas históricas portuguesas (Monsanto, Piódão, Marvão) em grelhas gigantes.', 'cognitiva', 40, 'Fichas A3 com sopa de letras, Canetas de feltro', 'Estimular a varredura visual, Reforçar a memória geográfica'],
  ['act_cog_48', 'Associação de Provérbios e Significados Práticos', 'Ligar a frase do provérbio à mensagem moral ou conselho prático do dia a dia.', 'cognitiva', 40, 'Cartões bipartidos com velcros', 'Exercitar a abstração e interpretação de conceitos'],
  ['act_cog_49', 'Exercício de Descrição e Imaginação: A Mala de Viagem', 'Decidir quais os objetos essenciais a guardar numa mala de viagem imaginária para a praia ou para a montanha.', 'cognitiva', 40, 'Mala física antiga, Objetos variados', 'Trabalhar o planeamento executivo e categorização'],
  ['act_cog_50', 'Jogo dos Opostos e Sinónimos em Poesia', 'Encontrar o antónimo ou sinónimo de palavras destacadas em poemas clássicos de Fernando Pessoa ou Florbela Espanca.', 'cognitiva', 45, 'Poemas impressos com lacunas, Lápis', 'Estimular o vocabulário e a apreciação literária'],

  // FÍSICAS (15 Novas Atividades)
  ['act_fis_31', 'Ginástica com Arcos e Argolas Coloridas', 'Exercícios de rotação e elevação dos braços segurando arcos leves de plástico para amplitude articular.', 'fisica', 45, 'Arcos plásticos leves, Cadeiras sem braços', 'Aumentar a amplitude dos ombros, Fortalecer a postura do tronco'],
  ['act_fis_32', 'Basquetebol Adaptado na Cadeira', 'Lançamento de bolas de esponja leve em direção a cestos flexíveis posicionados a diferentes distâncias.', 'fisica', 40, 'Bolas leves, Cestos de rede dobráveis', 'Melhorar a coordenação óculo-manual, Trabalhar o controlo da força'],
  ['act_fis_33', 'Jogo do Cornhole Sénior (Lançamento de Sacos)', 'Lançar pequenos sacos de pano cheios de feijão para acertar num orifício num tabuleiro inclinado de madeira.', 'fisica', 45, 'Tabuleiro de Cornhole adaptado, Sacos de feijão', 'Estimular a precisão motora e rotação do ombro, Promover o convívio'],
  ['act_fis_34', 'Dança Terapêutica com Fitas de Cetim', 'Movimentos ritmados de braços criando ondulações com fitas coloridas ao som de marchas populares.', 'fisica', 40, 'Bastões com fitas de cetim, Música de marcha', 'Promover a mobilidade articular superior de forma lúdica'],
  ['act_fis_35', 'Circuito de Deslize com Discos nos Pés', 'Movimentos de flexão e extensão das pernas mantendo os pés sobre discos deslizantes de tecido macio.', 'fisica', 35, 'Discos deslizantes para pés, Cadeiras estáveis', 'Melhorar a circulação venosa das pernas, Fortalecer o quadricípete'],
  ['act_fis_36', 'Treino de Motricidade Fina: Enfiamento de Pérolas Grandes', 'Criar colares ou pulseiras enfiando contas de madeira de grande dimensão em cordões rígidos.', 'fisica', 40, 'Contas de madeira grandes, Cordões sintéticos com ponta rígida', 'Trabalhar a preensão em pínça, Exercitar a coordenação bimanual'],
  ['act_fis_37', 'Exercícios com Bolas de Pilates de Tamanho Médio', 'Pressionar suavemente a bola com os braços e entre os joelhos para fortalecimento muscular isométrico.', 'fisica', 40, 'Bolas de Pilates de 25cm, Cadeiras', 'Fortalecer adutores e peitoral, Melhorar o controlo postural'],
  ['act_fis_38', 'Jogo da Malha em Discos Flutuantes de Salão', 'Lançamento de discos de borracha macia sobre um tapete com marcas numéricas no chão da sala.', 'fisica', 45, 'Discos de borracha macia, Tapete numérico', 'Exercitar a flexão lombar suave, Trabalhar a pontaria e noção de distância'],
  ['act_fis_39', 'Circuito de Marcha com Obstáculos de Esponja', 'Caminhada assistida ultrapassando pequenos blocos de esponja baixos para treinar o levantar dos pés.', 'fisica', 35, 'Blocos baixos de esponja, Corrimão ou apoio do fisioterapeuta', 'Prevenir tropeções e quedas, Treinar o padrão da marcha'],
  ['act_fis_40', 'Alongamentos Globais com Bastões de Madeira Leves', 'Elevação bilateral dos braços e torções gentis do tronco com bastões leves mantendo a postura ereta.', 'fisica', 40, 'Bastões de madeira de 1 metro, Música suave', 'Promover a expansão torácica, Aliviar a rigidez postural'],
  ['act_fis_41', 'Exercícios de Preensão com Bolas Anti-stresse', 'Apertar e soltar bolas de gel graduadas com cada mão para fortalecer os dedos e palma.', 'fisica', 30, 'Bolas anti-stresse de densidades variadas', 'Fortalecer a musculatura flexora dos dedos, Combater a rigidez de artrite'],
  ['act_fis_42', 'Jogo da Pesca Magnética Adaptada', 'Capturar figuras de peixes de cartão com um íman na ponta de uma cana flexível, sentados em grupo.', 'fisica', 40, 'Canas de pesca magnéticas, Peixes de cartão com rebite metálico', 'Trabalhar a estabilidade do ombro e pulso, Estimular a concentração'],
  ['act_fis_43', 'Estafeta de Passagem de Lenços e Bastões em Roda', 'Passar um lenço de seda de mão em mão ao longo de uma roda mantendo o ritmo sem deixar cair.', 'fisica', 35, 'Lenços de seda leves e coloridos', 'Treinar a velocidade de reação e preensão rápida'],
  ['act_fis_44', 'Ginástica de Mímicas de Profissões Rurais', 'Representar através do movimento corporal ações como semear, ceifar, lavar roupa na ribeira e amassar o pão.', 'fisica', 45, 'Música instrumental rústica', 'Estimular a consciência corporal e amplitude de movimento funcional'],
  ['act_fis_45', 'Treino de Equilíbrio Sentado sobre Almofadas de Ar', 'Manter o equilíbrio corporal sentados sobre uma almofada insuflada exercitando a musculatura estabilizadora.', 'fisica', 30, 'Almofadas de equilíbrio insufláveis', 'Exercitar o equilíbrio do tronco e proprioceção'],

  // MÚSICA (15 Novas Atividades)
  ['act_mus_31', 'Terapia dos Sinos Musicais Afinados', 'Cada utente segura um sino afinado com uma cor e toca a sua nota quando a sua cor é mostrada no painel.', 'musica', 45, 'Set de sinos musicais manuais coloridos, Cartões de cores', 'Promover a atenção seletiva, Desenvolver a harmonia em grupo'],
  ['act_mus_32', 'Marchas de Santo António e São João em Coro', 'Sessão de canto focado nas marchas populares mais conhecidas ("Manjerico", "Lisboa não sejas francesa").', 'musica', 50, 'Cancioneiro de marchas populares, Arcos de flores decorativos', 'Fortalecer a capacidade pulmonar, Resgatar o espírito festivo comunitário'],
  ['act_mus_33', 'Roda de Cantares do Mar e da Pesca', 'Interpretação coletiva de cantigas tradicionais ligadas ao mar ("A Manta de Oura", "Sou Barqueiro").', 'musica', 45, 'Letras das canções em tamanho gigante, Pandeiretas', 'Exercitar a dicção e afinação, Celebrar o património marítimo'],
  ['act_mus_34', 'Adivinhas Musicais com Castanholas e Triângulos', 'O animador toca apenas o ritmo de uma canção popular com o triângulo para o grupo adivinhar qual é.', 'musica', 40, 'Triângulos, Castanholas, Maracas', 'Treinar a escuta percetiva e memória rítmica'],
  ['act_mus_35', 'Audição Comentada de Fados de Coimbra', 'Audição de fados de Coimbra interpretados por guitarras portuguesas, acompanhada de contextualização histórica.', 'musica', 50, 'Gravações áudio de Fado de Coimbra, Fotografias da Universidade', 'Promover a calma e apreciação estética, Evocar memórias académicas'],
  ['act_mus_36', 'Jogo da Paragem Musical (Estátuas Sentadas)', 'Movimentar os braços ao ritmo da música e congelar o gesto imediatamente quando o som é interrompido.', 'musica', 35, 'Leitor de música com comando de pausa rápida', 'Trabalhar a inibição motora e atenção auditiva focalizada'],
  ['act_mus_37', 'Resgate dos Cantares de Trabalhos Rurais', 'Aprender e recordar canções que acompanhavam a ceifa, a desfolhada do milho e a apanha da azeitona.', 'musica', 45, 'Letras impressas de cantares tradicionais', 'Estimular a memória lírica, Valorizar as histórias de vida dos utentes'],
  ['act_mus_38', 'Eco Rítmico com Palmas e Batimentos no Peito', 'Repetir padrões rítmicos propostos (ex: duas palmas, uma batida no joelho) em sequências crescentes.', 'musica', 35, 'Nenhum', 'Exercitar a memória de trabalho motora e coordenação'],
  ['act_mus_39', 'Cancioneiro das Cantigas de Embalar e Infância', 'Cantar canções de ninar tradicionais ("Dorme com Deus", "Vai-te papão") partilhando memórias da maternidade e paternidade.', 'musica', 40, 'Cancioneiro com ilustrações vintage', 'Proporcionar acolhimento afetivo e relaxamento emocional'],
  ['act_mus_40', 'Sessão de Música Clássica e Relaxamento Guiado com "As Quatro Estações"', 'Escuta ativa do concerto "A Primavera" de Vivaldi combinada com exercícios de respiração abdominal.', 'musica', 40, 'Áudio de Vivaldi, Difusor de aromas suaves', 'Reduzir a frequência cardíaca e a ansiedade'],
  ['act_mus_41', 'Atelier de Percussão com Pandeiros e Pandeiretas', 'Marcar os tempos fortes e fracos de valsas e marchas utilizando instrumentos de pele.', 'musica', 45, 'Pandeiros de madeira, Pandeiretas com solhas', 'Trabalhar a sincronia motora e força dos pulsos'],
  ['act_mus_42', 'Cantar a Despique Adaptado (Desafio Amigável)', 'Criação de quadras populares simples cantadas em formato de diálogo bem-humorado entre dois lados da sala.', 'musica', 45, 'Concertina ou faixa de apoio em acordeão', 'Estimular a agilidade mental e o humor coletivo'],
  ['act_mus_43', 'Teatro Musical de Revista À Portuguesa', 'Interpretação dramática e cantada de números célebres do teatro de revista ("A Severa", "O Leão da Estrela").', 'musica', 60, 'Escarpas, Chapéus de época, Microfone', 'Fomentar a expressão dramática e a alegria com memórias de teatro'],
  ['act_mus_44', 'Sessão de Aromaterapia ao Som de Sons da Floresta', 'Audição de chilrear de pássaros e cursos de água combinada com a difusão de essência de eucalipto.', 'musica', 40, 'Áudio de sons da natureza, Difusor de óleos essenciais', 'Proporcionar imersão sensorial pacificadora'],
  ['act_mus_45', 'Identificação dos Sons dos Instrumentos Tradicionais', 'Ouvir excertos de cavaquinho, adufe, gaita de foles e viola campaniça para adivinhar o instrumento.', 'musica', 40, 'Áudios de instrumentos tradicionais, Imagens dos instrumentos', 'Enriquecer a cultura musical nacional e a gnosia auditiva'],

  // OUTRO / SÓCIO-CULTURAL (10 Novas Atividades)
  ['act_out_31', 'Oficina do Chá de Ervas e Conserva de Aromáticas', 'Secagem de folhas de hortelã e alfazema do jardim para embalar em saquinhos de pano decorados.', 'outro', 50, 'Folhas de plantas aromáticas, Saquinhos de organza, Fitas', 'Desenvolver a motricidade fina, Fomentar a sensação de produtividade'],
  ['act_out_32', 'Clube de Jogos de Cartas Clássicos (Bisca e Sueca)', 'Tarde de torneio amigável de cartas com mesa organizada e pontuação em quadro.', 'outro', 60, 'Baralhos de cartas portuguesas, Bloco de notas de pontuação', 'Promover a sociabilidade saudável e a memória estratégica'],
  ['act_out_33', 'Oficina de Culinária Terapêutica: Broas Castanholas', 'Amassar e moldar pequenas broas tradicionais de milho e canela de forma segura na cozinha pedagógica.', 'outro', 60, 'Farinha de milho, Açúcar, Canela, Tabuleiros de ir ao forno', 'Exercitar a motricidade palmar, Estimular o olfato e paladar'],
  ['act_out_34', 'Elaboração de Mantas de Croché e Tricô Solidárias', 'Unir quadrados de lã colorida tricotados pelos residentes para criar mantas acolhedoras.', 'outro', 60, 'Quadrados de lã tricotados, Agulhas de tapeçaria, Linhas', 'Fomentar o sentimento de utilidade e altruísmo social'],
  ['act_out_35', 'Atelier de Jardinagem: Horta Vertical de Coentros e Salsa', 'Semear sementes de temperos tradicionais em vasos pendurados na varanda do lar.', 'outro', 50, 'Vasos de suspensão, Terra vegetal, Sementes de coentros e salsa', 'Estimular o contacto com a terra e o cuidado continuado'],
  ['act_out_36', 'Álbum Histórico das Memórias do Lar', 'Montagem de uma grande fotobiografia coletiva com fotos das festas e atividades do lar.', 'outro', 50, 'Álbum de fotos de grande formato, Cantoneiras, Canetas decorativas', 'Reforçar o sentimento de pertença institucional e identidade'],
  ['act_out_37', 'Oficina de Saboaria Artesanal com Lavanda', 'Derreter base de glicerina e moldar pequenos sabonetes aromáticos adicionando flores de alfazema.', 'outro', 50, 'Base de glicerina vegetal, Formas de silicone, Óleo de lavanda', 'Trabalhar a precisão manual e a estimulação olfativa'],
  ['act_out_38', 'Tarde de Dominó e Damas em Tamanho Gigante', 'Jogos de tabuleiro adaptados com peças grandes em madeira de fácil preensão.', 'outro', 60, 'Jogos de dominó e damas XXL de madeira', 'Trabalhar a raciocínio estratégico e facilidade de visão'],
  ['act_out_39', 'Sessão de Oração e Cânticos de Agradecimento', 'Encontro comunitário para partilha de preces e leitura de salmos confortantes.', 'outro', 40, 'Livros de oração com letra grande, Velas LED de segurança', 'Oferecer suporte emocional e conforto espiritual'],
  ['act_out_40', 'Livro Comunitário das Receitas Tradicionais da Minha Terra', 'Cada utente dita a sua receita de família mais famosa para ser compilada num caderno artesanal.', 'outro', 55, 'Caderno de capa dura, Canetas, Fotografias de pratos', 'Valorizar o conhecimento culinário individual e a herança familiar'],

  // SENSORIAL (15 Novas Atividades) - NOVA CATEGORIA
  ['act_sens_1', 'Sessão Snoezelen de Luzes e Projeções Suaves', 'Ambiente relaxante com colunas de água luminosas, tubos de bolhas e projeções no teto ao som de música ambiente.', 'sensorial', 45, 'Coluna de água Snoezelen, Projetor de luzes, Pufes', 'Reduzir episódios de agitação, Proporcionar relaxamento profundo'],
  ['act_sens_2', 'Caixa de Texturas e Tecidos Antigos (Veludo, Lã, Seda)', 'Exploração tátil de retalhos de diferentes tecidos (seda, veludo, lã grossa, linho) para identificação sem olhar.', 'sensorial', 35, 'Caixa com aberturas de pano, Retalhos de tecidos variados', 'Estimular os recetores táteis da mão, Treinar a gnosia tátil'],
  ['act_sens_3', 'Aromaterapia das Especiarias e Ervas da Infância', 'Inalação guiada de frascos com aromas puros de canela, cravinho-da-índia, alecrim e café torrado.', 'sensorial', 35, 'Frascos opacos perfurados com especiarias secas', 'Despertar memórias afetivas profundas associadas ao olfato'],
  ['act_sens_4', 'Estimulação Auditiva Binaural e Sons do Mar', 'Escuta individualizada com auscultadores acolchoados de sons de ondas do mar e gaivotas para redução do stresse.', 'sensorial', 30, 'Auscultadores confortáveis, Leitor de áudio binaural', 'Promover o relaxamento do sistema nervoso e a serenidade'],
  ['act_sens_5', 'Banho de Pés Aromático com Sal Marinho e Alecrim', 'Momento de relaxamento imergindo os pés em água morna com sais minerais e ramos de alecrim fresco.', 'sensorial', 40, 'Bacias de hidromassagem para pés, Toalhas macias, Sais de alecrim', 'Melhorar a circulação periférica, Proporcionar conforto tátil excelente'],
  ['act_sens_6', 'Massagem Tátil de Mãos com Esferas de Silicone', 'Deslizar esferas com saliências suaves pelas mãos e antebraços dos residentes aplicando creme hidratante.', 'sensorial', 30, 'Esferas sensoriais com textura, Creme de massagem suave', 'Aumentar a consciência proprioceptiva, Aliviar a tensão das articulações'],
  ['act_sens_7', 'Caixa dos Sabores Tradicionais (Degustação às Cegas)', 'Provar pequenas porções de mel puro, marmelada, queijo de ovelha e sumo de limão identificando o gosto.', 'sensorial', 35, 'Colheres descartáveis, Porções de alimentos típicos', 'Estimular as papilas gustativas, Exercitar o reconhecimento do paladar'],
  ['act_sens_8', 'Exploração Térmica e Tátil com Pedras Marinhas', 'Sentir e manusear pedras da praia polidas ligeiramente aquecidas ou arrefecidas numa toalha.', 'sensorial', 30, 'Pedras de rio polidas, Recipiente térmico', 'Proporcionar estímulos térmicos seguros, Estimular a sensibilidade tátil'],
  ['act_sens_9', 'Terapia dos Aromas dos Citrinos e Laranjais', 'Descascar laranjas e tangerinas frescas sentindo o aroma dos óleos essenciais libertados pela casca.', 'sensorial', 35, 'Laranjas e tangerinas sumarentas, Pratos', 'Despertar o sentido olfativo e a motricidade fina das mãos'],
  ['act_sens_10', 'Painel Sensorial de Fechos, Botões e Trincos', 'Manipulação livre de um painel de madeira com trincos de metal, fechos de correr, velcro e interruptores.', 'sensorial', 40, 'Painel de atividades ocupacionais de madeira', 'Trabalhar as capacidades praxistas e a curiosidade tátil'],
  ['act_sens_11', 'Projeção de Cores Relaxantes e Fluidez de Água', 'Visualização num ecrã escurecido de padrões fluidos em tons de azul e verde acompanhada por harpa.', 'sensorial', 35, 'Projetor de vídeo, Ecrã grande, Música de harpa', 'Acalmar a mente e reduzir a ansiedade em estados demenciais'],
  ['act_sens_12', 'Mergulho Tátil em Caixa de Sementes e Grãos', 'Mergulhar as mãos numa bacia cheia de feijão seco, milho e arroz sentindo a pressão e textura dos grãos.', 'sensorial', 30, 'Bacias profundas, Grãos de feijão, milho e arroz', 'Fornecer estimulação proprioceptiva profunda às articulações das mãos'],
  ['act_sens_13', 'Aromaterapia do Café Torrado e Cacau', 'Ouvir a moagem manual do grão de café e inalar o aroma fresco do café acabado de moer.', 'sensorial', 30, 'Moinho de café manual vintage, Grãos de café', 'Estimular a auditiva e olfativa integrada com memórias de café'],
  ['act_sens_14', 'Sessão Vibratória com Almofadas Terapêuticas', 'Aplicação de vibração suave em almofadas nas costas e zona lombar para alívio da rigidez postural.', 'sensorial', 30, 'Almofadas de vibração suave, Cadeirões confortáveis', 'Relaxar a musculatura paravertebral e promover o bem-estar'],
  ['act_sens_15', 'Exploração de Elementos da Natureza (Conchas e Musgo)', 'Tocar e examinar conchas do mar, pinhas, musgo seco e cascas de sobreiro sentindo as rugosidades.', 'sensorial', 35, 'Tabuleiros com elementos naturais colecionados do campo', 'Estimular a curiosidade tátil e a ligação com a natureza'],

  // EXPRESSÃO ARTÍSTICA (10 Novas Atividades) - NOVA CATEGORIA
  ['act_art_1', 'Pintura de Mandalas Terapêuticas de Primavera', 'Colorir padrões geométricos simétricos com lápis de cor e marcadores para treino da precisão e foco.', 'expressao_artistica', 50, 'Fichas de mandalas em papel de 120g, Lápis de cor de qualidade', 'Exercitar o controlo motor fino, Promover o relaxamento e concentração'],
  ['act_art_2', 'Mosaico Português com Azulejos em Cartão', 'Pintar e colar pequenos azulejos de cartão com padrões geométricos tradicionais azuis e brancos.', 'expressao_artistica', 50, 'Moldes de azulejo em cartão, Tinta guache azul e branca, Pincéis', 'Desenvolver a coordenação visoespacial, Valorizar a arte do azulejo'],
  ['act_art_3', 'Oficina de Modelagem em Argila da Biscaia', 'Esculpir e modelar pequenas taças, folhas ou figuras simples usando argila auto-endurecível macia.', 'expressao_artistica', 50, 'Argila auto-endurecível branca, Espátulas de plástico, Água', 'Exercitar a força da musculatura palmar, Estimular a criação tridimensional'],
  ['act_art_4', 'Pintura em Tecido de Sacos de Pão Tradicionais', 'Personalizar sacos de pão de pano cru usando estampagem com carimbos e tintas laváveis para tecido.', 'expressao_artistica', 50, 'Sacos de pão em pano cru, Tintas para tecido, Carimbos de madeira', 'Trabalhar a motricidade e precisão, Produzir um objeto útil'],
  ['act_art_5', 'Teatro de Leitura Dramatizada "Lisboa de Antigamente"', 'Encenação de um pequeno guião de comédia ligeira com os utentes lendo papéis impressos em letra grande.', 'expressao_artistica', 60, 'Guiões de teatro com letra de 20pt, Adereços simples de figurino', 'Estimular a expressão verbal e dramática, Fomentar a gargalhada e desinibição'],
  ['act_art_6', 'Atelier de Colagem com Recortes de Revistas Vintage', 'Criar composições visuais em cartolina recortando imagens de modas, automóveis e paisagens antigas.', 'expressao_artistica', 50, 'Revistas antigas ou reproduções, Tesouras sem ponta, Cola de batom', 'Treinar a motricidade bimanual na tesoura, Estimular a criatividade visual'],
  ['act_art_7', 'Pintura com Carimbos de Batata e Esponjas', 'Imprimir padrões coloridos em rolos de papel gigante usando formas cortadas em batatas e esponjas.', 'expressao_artistica', 45, 'Batatas cortadas em formas, Esponjas, Tintas de água, Papel de rolo', 'Estimular a espontaneidade artística e coordenação motora'],
  ['act_art_8', 'Confeção de Lanternas e Vitrais em Papel de Seda', 'Colar retalhos de papel de seda colorido em moldes de papelão criando o efeito de vitrais luminosos.', 'expressao_artistica', 50, 'Moldes de papelão preto, Papel de seda colorido, Cola diluída', 'Trabalhar a precisão digital, Estimular o gosto pelas cores vibrantes'],
  ['act_art_9', 'Oficina de Máscaras e Adereços de Teatro Populares', 'Pintar e decorar máscaras de papelão com plumas, rendas e fitas para festas temáticas.', 'expressao_artistica', 50, 'Máscaras neutras em cartão, Plumas, Rendas, Tintas brilhantes', 'Estimular a imaginação e a coordenação fina de colagem'],
  ['act_art_10', 'Criação do Painel Mural Coletivo "A Nossa Aldeia"', 'Pintura conjunta num grande mural de papel pintando casas, igreja, árvores e moinhos da aldeia.', 'expressao_artistica', 60, 'Mural de papel pardo de 2 metros, Tintas de água, Pincéis de vários tamanhos', 'Fomentar o trabalho de equipa e a coesão do grupo no lar']
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

  // Generate Leitura do Jornal for every single day of July 2026 (1 to 31)
  for (let day = 1; day <= 31; day++) {
    const dateStr = `2026-07-${String(day).padStart(2, '0')}`;
    list.push({
      id: `sch_leitura_jornal_${day}`,
      activityId: 'act_leitura_jornal',
      title: 'Atividade de Estimulação Cognitiva - Intelectuais / Formativas - Leitura do Jornal',
      description: 'Leitura diária comentada de notícias, efemérides e debates sobre temas atuais nacionais e internacionais para exercitar a atenção, raciocínio de atualidades e interação social.',
      category: 'cognitiva',
      date: dateStr,
      slot: 'manha',
      time: '08:00',
      completed: day < 13
    });
  }

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
