// js/recipes.js - Definição dos Ingredientes e Fases do Jogo

export const INGREDIENTS = {
  limao_atomico: {
    id: 'limao_atomico',
    name: 'Xarope de Limão Atômico',
    shortName: 'Limão Atômico',
    color: '#a3e635',
    colorHex: [163, 230, 53],
    density: 1.2,
    bubbleColor: '#d9f99d',
    glowColor: 'rgba(163, 230, 53, 0.6)',
    bottleColor: '#84cc16',
    liquidColor: '#bef264',
    pourRate: 35, // ml por segundo
    description: 'Ácido o suficiente para dissolver colheres de prata.'
  },
  agua_ionizada: {
    id: 'agua_ionizada',
    name: 'Água Ionizada Gaseificada',
    shortName: 'Água Ionizada',
    color: '#38bdf8',
    colorHex: [56, 189, 248],
    density: 1.0,
    bubbleColor: '#e0f2fe',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    bottleColor: '#0284c7',
    liquidColor: '#7dd3fc',
    pourRate: 45,
    description: 'H2O enriquecida com elétrons soltos e muitas bolhas.'
  },
  rum_espacial: {
    id: 'rum_espacial',
    name: 'Rum Pirata Espacial',
    shortName: 'Rum Espacial',
    color: '#b45309',
    colorHex: [180, 83, 9],
    density: 0.95,
    bubbleColor: '#fde68a',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    bottleColor: '#78350f',
    liquidColor: '#d97706',
    pourRate: 35,
    description: 'Envelhecido 50 anos-luz em barris de carvalho estelar.'
  },
  hortela_nitro: {
    id: 'hortela_nitro',
    name: 'Suco de Hortelã Nitro',
    shortName: 'Hortelã Nitro',
    color: '#10b981',
    colorHex: [16, 185, 129],
    density: 1.05,
    bubbleColor: '#a7f3d0',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    bottleColor: '#047857',
    liquidColor: '#34d399',
    pourRate: 30,
    description: 'Refrescância tão intensa que congela as cordas vocais.'
  },
  soda_criogenica: {
    id: 'soda_criogenica',
    name: 'Soda Criogênica Zero Kelvin',
    shortName: 'Soda Criogênica',
    color: '#06b6d4',
    colorHex: [6, 182, 212],
    density: 1.0,
    bubbleColor: '#cffafe',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    bottleColor: '#0891b2',
    liquidColor: '#67e8f9',
    pourRate: 40,
    description: 'Bicarbonato quântico com efervescência perigosa.'
  },
  curacao_radioativo: {
    id: 'curacao_radioativo',
    name: 'Curaçao Azul Radioativo',
    shortName: 'Curaçao Azul',
    color: '#2563eb',
    colorHex: [37, 99, 235],
    density: 1.15,
    bubbleColor: '#bfdbfe',
    glowColor: 'rgba(37, 99, 235, 0.7)',
    bottleColor: '#1d4ed8',
    liquidColor: '#60a5fa',
    pourRate: 30,
    description: 'Brilha naturalmente no escuro. Não apontar para os olhos.'
  },
  vodka_estelar: {
    id: 'vodka_estelar',
    name: 'Vodka Estelar 99%',
    shortName: 'Vodka Estelar',
    color: '#f8fafc',
    colorHex: [248, 250, 252],
    density: 0.9,
    bubbleColor: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.8)',
    bottleColor: '#64748b',
    liquidColor: '#e2e8f0',
    pourRate: 40,
    description: 'Destilada no vácuo de uma nebulosa distante.'
  },
  groselha_uranio: {
    id: 'groselha_uranio',
    name: 'Elixir de Groselha de Urânio',
    shortName: 'Groselha Urânio',
    color: '#ec4899',
    colorHex: [236, 72, 153],
    density: 1.3,
    bubbleColor: '#fbcfe8',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    bottleColor: '#be185d',
    liquidColor: '#f472b6',
    pourRate: 25,
    description: 'Muito doce e absurdamente instável se agitado demais.'
  },
  tonica_quantica: {
    id: 'tonica_quantica',
    name: 'Tônica Quântica Fluorescente',
    shortName: 'Tônica Quântica',
    color: '#8b5cf6',
    colorHex: [139, 92, 246],
    density: 1.0,
    bubbleColor: '#ddd6fe',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    bottleColor: '#6d28d9',
    liquidColor: '#a78bfa',
    pourRate: 40,
    description: 'Contém quinino cósmico e fótons ultravioleta.'
  },
  pimenta_vulcanica: {
    id: 'pimenta_vulcanica',
    name: 'Licor de Pimenta Vulcânica',
    shortName: 'Pimenta Vulcânica',
    color: '#ef4444',
    colorHex: [239, 68, 68],
    density: 1.1,
    bubbleColor: '#fecaca',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    bottleColor: '#b91c1c',
    liquidColor: '#f87171',
    pourRate: 25,
    description: '1 milhão de graus Scoville. Ferve à temperatura ambiente.'
  },
  tequila_toxica: {
    id: 'tequila_toxica',
    name: 'Tequila do Deserto Tóxico',
    shortName: 'Tequila Tóxica',
    color: '#eab308',
    colorHex: [234, 179, 8],
    density: 0.92,
    bubbleColor: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    bottleColor: '#a16207',
    liquidColor: '#facc15',
    pourRate: 35,
    description: 'Feita de cactos mutantes cultivados perto de crateras.'
  },
  maracuja_combustivel: {
    id: 'maracuja_combustivel',
    name: 'Néctar de Maracujá Combustível',
    shortName: 'Maracujá Combustível',
    color: '#f97316',
    colorHex: [249, 115, 22],
    density: 1.25,
    bubbleColor: '#fed7aa',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    bottleColor: '#c2410c',
    liquidColor: '#fb923c',
    pourRate: 30,
    description: 'Aroma sedutor, mas altamente inflamável.'
  },
  polvora_doce: {
    id: 'polvora_doce',
    name: 'Essência de Pólvora Doce',
    shortName: 'Pólvora Doce',
    color: '#475569',
    colorHex: [71, 85, 105],
    density: 1.35,
    bubbleColor: '#cbd5e1',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    bottleColor: '#1e293b',
    liquidColor: '#64748b',
    pourRate: 25,
    description: 'Adiciona um sabor defumado e 95% de chance de detonação.'
  },
  absinto_meianoite: {
    id: 'absinto_meianoite',
    name: 'Absinto da Meia-Noite',
    shortName: 'Absinto Noturno',
    color: '#15803d',
    colorHex: [21, 128, 61],
    density: 0.88,
    bubbleColor: '#86efac',
    glowColor: 'rgba(34, 197, 94, 0.7)',
    bottleColor: '#14532d',
    liquidColor: '#22c55e',
    pourRate: 30,
    description: 'A lenda diz que faz quem bebe enxergar outras dimensões.'
  },
  antimateria_whisky: {
    id: 'antimateria_whisky',
    name: 'Whisky de Antimatéria',
    shortName: 'Whisky Antimatéria',
    color: '#7c3aed',
    colorHex: [124, 58, 237],
    density: 0.94,
    bubbleColor: '#c4b5fd',
    glowColor: 'rgba(124, 58, 237, 0.8)',
    bottleColor: '#4c1d95',
    liquidColor: '#a855f7',
    pourRate: 28,
    description: 'Se entrar em contato com matéria comum desbalanceada: BOOM!'
  }
};

export const LEVELS = [
  {
    id: 1,
    title: 'Fase 1: O Batismo do Barman',
    drinkName: 'Limonada Elétrica',
    subtitle: 'Um drink refrescante para calibrar seus reflexos.',
    glassCapacity: 250, // ml
    tolerance: 12, // ml de margem para cada ingrediente
    recipe: [
      { ingredientId: 'limao_atomico', targetMl: 70 },
      { ingredientId: 'agua_ionizada', targetMl: 130 }
    ],
    tips: 'Mantenha o botão pressionado para despejar. Solte um pouco antes de atingir a marca desejada!',
    storyDialogue: 'Bem-vindo ao Bar Ki Exprodi! Aqui uma gota a mais pode mandar todo o quarteirão pelos ares. Comece com uma Limonada simples!'
  },
  {
    id: 2,
    title: 'Fase 2: Calmaria Antes da Bomba',
    drinkName: 'Mojito Atômico',
    subtitle: 'Mais ingredientes, menos margem para erros.',
    glassCapacity: 260,
    tolerance: 8,
    recipe: [
      { ingredientId: 'rum_espacial', targetMl: 60 },
      { ingredientId: 'hortela_nitro', targetMl: 40 },
      { ingredientId: 'soda_criogenica', targetMl: 100 }
    ],
    tips: 'Atenção com a Hortelã Nitro: o fluxo dela é denso e a reação com o Rum é imediata!',
    storyDialogue: 'Um cliente alienígena pediu o Mojito Atômico da casa. Se você errar a soda criogênica, o copo congela e depois explode!'
  },
  {
    id: 3,
    title: 'Fase 3: O Mistério das Camadas',
    drinkName: 'Laguna Cibernética',
    subtitle: 'Cores vibrantes e densidades instáveis.',
    glassCapacity: 300,
    tolerance: 6,
    recipe: [
      { ingredientId: 'curacao_radioativo', targetMl: 50 },
      { ingredientId: 'vodka_estelar', targetMl: 60 },
      { ingredientId: 'groselha_uranio', targetMl: 40 },
      { ingredientId: 'tonica_quantica', targetMl: 80 }
    ],
    tips: 'Quatro componentes! A Groselha de Urânio é hiper densa: doses pequenas fazem o medidor de instabilidade subir rapidamente se errar!',
    storyDialogue: 'Essa bebida brilha no escuro e já derrubou três inspetores sanitários interestelares. Precisão cirúrgica agora!'
  },
  {
    id: 4,
    title: 'Fase 4: Perigo Nível Crítico',
    drinkName: 'Coquetel Molotov Tropical',
    subtitle: 'Um dos drinks mais perigosos da galáxia.',
    glassCapacity: 280,
    tolerance: 5,
    recipe: [
      { ingredientId: 'pimenta_vulcanica', targetMl: 45 },
      { ingredientId: 'tequila_toxica', targetMl: 65 },
      { ingredientId: 'maracuja_combustivel', targetMl: 70 },
      { ingredientId: 'polvora_doce', targetMl: 30 }
    ],
    tips: 'A Pólvora Doce tem uma margem minúscula. Cuidado extremo para não ultrapassar nem por 1 ml!',
    storyDialogue: 'Os piratas espaciais adoram esse drink porque ele serve tanto para comemorar quanto como granada tática de emergência!'
  },
  {
    id: 5,
    title: 'Fase 5: O Juízo Final Etílico',
    drinkName: 'O Exterminador do Fígado 3000',
    subtitle: 'A receita proibida pelo Conselho Galáctico.',
    glassCapacity: 320,
    tolerance: 3.5, // Margem desafiadora e eletrizante!
    recipe: [
      { ingredientId: 'absinto_meianoite', targetMl: 50 },
      { ingredientId: 'curacao_radioativo', targetMl: 45 },
      { ingredientId: 'limao_atomico', targetMl: 45 },
      { ingredientId: 'vodka_estelar', targetMl: 50 },
      { ingredientId: 'antimateria_whisky', targetMl: 50 }
    ],
    tips: 'A tolerância é de apenas ±3.5ml! Dê toques curtos nas garrafas para dosar mililitro a mililitro!',
    storyDialogue: 'Nenhum barman sobreviveu para contar a lenda de quem preparou esse coquetel com sucesso. Você tem o que é preciso?'
  }
];
