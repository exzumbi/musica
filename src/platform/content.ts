export const REVIEW_DATE = "2026-11-02";
export type Source = {
  label: string;
  url: string;
  status: "consulted" | "pending";
  detail?: string;
};
const omt = (file: string, label: string): Source => ({
  label: "Open Music Theory · " + label,
  url:
    "https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/master/" +
    file +
    ".md",
  status: "consulted",
  detail:
    "Texto consultado no repositório oficial. Explicação e exercícios desta plataforma são originais.",
});
export const sources = {
  notation: omt("basicNotation", "Basic notation"),
  rhythm: omt("rhythmicValues", "Rhythmic values"),
  meter: omt("meter", "Meter and time signatures"),
  scales: omt("scales", "Scales and scale degrees"),
  triads: omt("triads", "Triads and seventh chords"),
  intervals: omt("intervals", "Intervals and dyads"),
  function: omt("harmonicFunctions", "Harmonic functions"),
  baroque: omt(
    "bassoContinuo-history",
    "A brief history of the basso continuo",
  ),
  form: omt("classicalThemes", "Classical theme types"),
  history: {
    label: "The Metropolitan Museum of Art · Heilbrunn Timeline of Art History",
    url: "https://www.metmuseum.org/toah",
    status: "pending",
  } as Source,
  met: {
    label: "The Metropolitan Museum of Art · Baroque Music",
    url: "https://www.metmuseum.org/essays/baroque-music",
    status: "pending",
  } as Source,
  orchestra: {
    label: "Philharmonia Orchestra · Instrumentos",
    url: "https://philharmonia.co.uk/resources/instruments/",
    status: "pending",
  } as Source,
  brazil: {
    label: "Musica Brasilis · Acervo e compositores",
    url: "https://musicabrasilis.org.br/",
    status: "pending",
  } as Source,
  indigenous: {
    label: "Instituto Socioambiental · Povos Indígenas no Brasil",
    url: "https://pib.socioambiental.org/",
    status: "pending",
  } as Source,
  iphan: {
    label: "IPHAN · Patrimônio cultural brasileiro",
    url: "https://www.gov.br/iphan/pt-br",
    status: "pending",
  } as Source,
  library: {
    label: "Library of Congress · National Jukebox",
    url: "https://www.loc.gov/collections/national-jukebox/about-this-collection/",
    status: "pending",
  } as Source,
};
export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  goal: string;
  body: string[];
  lab:
    | "sound"
    | "pulse"
    | "notes"
    | "steps"
    | "rhythm"
    | "interval"
    | "scale"
    | "chord"
    | "inversion"
    | "key"
    | "cadence"
    | "mode";
  activity: string;
  review: string;
  options: string[];
  answer: number;
  explanation: string;
  sources: Source[];
  chord: string;
};
export const lessons: Lesson[] = [
  {
    id: "som",
    title: "O som tem muitas dimensões",
    subtitle: "Altura, duração, intensidade e timbre",
    minutes: 10,
    goal: "Distinguir som grave e agudo sem confundir altura com volume.",
    body: [
      "Altura é o que percebemos como grave ou agudo. Neste exemplo, aumentar a frequência faz o som ficar mais agudo. Intensidade se relaciona com a energia do som e com o volume percebido, não com sua altura.",
      "Duração é quanto tempo o som permanece. Timbre ajuda a distinguir fontes mesmo quando tocam a mesma nota. O sintetizador abaixo simplifica esses parâmetros; não imita instrumentos reais.",
    ],
    lab: "sound",
    activity:
      "Compare as duas alturas e identifique a mais aguda. Depois altere duração, volume e timbre sem mudar a nota.",
    review: "Se uma nota fica mais forte, ela necessariamente fica mais aguda?",
    options: [
      "Sim, força e altura são a mesma coisa.",
      "Não. Intensidade e altura são dimensões diferentes.",
    ],
    answer: 1,
    explanation:
      "Volume maior não muda necessariamente a frequência. Uma nota grave também pode ser forte.",
    sources: [sources.notation, sources.intervals],
    chord: "Nota C",
  },
  {
    id: "pulso",
    title: "Encontre a pulsação",
    subtitle: "Pulso, andamento, ritmo e compasso",
    minutes: 12,
    goal: "Manter uma pulsação e separar andamento de desenho rítmico.",
    body: [
      "Pulsação é uma referência recorrente no tempo. Andamento indica a velocidade dessa referência, frequentemente em BPM. Ritmo é a organização das durações e silêncios em relação a ela.",
      "O compasso organiza pulsos em grupos. Em 4/4, usaremos a semínima como pulso. Em 6/8, a contagem usual tem dois pulsos de semínima pontuada, cada um dividido em três colcheias. Nem toda música se organiza assim.",
    ],
    lab: "pulse",
    activity:
      "Ouça uma referência a 80 BPM e bata pelo menos cinco pulsos. A avaliação mede regularidade aproximada, sem exigir precisão de laboratório.",
    review:
      "No 6/8 usado aqui, cada pulso de semínima pontuada contém quantas colcheias?",
    options: ["Duas", "Três", "Seis"],
    answer: 1,
    explanation:
      "São dois pulsos por compasso; cada um contém três colcheias. O número 6 conta as subdivisões.",
    sources: [sources.meter, sources.rhythm],
    chord: "C",
  },
  {
    id: "notas",
    title: "Uma nota, dois lugares",
    subtitle: "Teclado, pauta e acidentes",
    minutes: 12,
    goal: "Relacionar teclas às posições de notas na clave de Sol.",
    body: [
      "A pauta ou pentagrama tem cinco linhas. A clave define a referência de altura: na clave de Sol, a segunda linha de baixo para cima é Sol4. Dó4 fica em uma linha suplementar abaixo da pauta.",
      "Sustenido eleva um semitom; bemol abaixa um semitom. Teclas brancas também podem receber acidentes: Mi♯ soa como Fá no temperamento igual. A grafia depende do contexto.",
    ],
    lab: "notes",
    activity:
      "Clique nas teclas ou nos botões para mover a nota. Encontre e ouça Sol4 na segunda linha da clave de Sol.",
    review: "Na clave de Sol, a segunda linha de baixo para cima representa:",
    options: ["Dó4", "Sol4", "Lá4"],
    answer: 1,
    explanation:
      "A clave de Sol fixa Sol4 nessa segunda linha. Linhas e espaços vizinhos seguem a ordem das notas.",
    sources: [sources.notation],
    chord: "Nota G",
  },
  {
    id: "passos",
    title: "Passos pequenos, grandes caminhos",
    subtitle: "Tons e semitons",
    minutes: 10,
    goal: "Medir distâncias pelo teclado incluindo as teclas pretas.",
    body: [
      "No temperamento igual, um semitom é a distância entre teclas adjacentes, sem pular nenhuma. Um tom corresponde a dois semitons. Mi–Fá e Si–Dó naturais já estão separados por um semitom.",
      "A distância em semitons descreve alturas, mas não resolve sozinha toda a grafia de um intervalo. Dó–Ré♯ e Dó–Mi♭ têm a mesma distância nesse sistema, porém nomes intervalares diferentes.",
    ],
    lab: "steps",
    activity:
      "Escolha uma segunda nota que fique exatamente um tom acima de Dó4.",
    review: "De Mi natural para Fá natural há:",
    options: ["Um tom", "Um semitom", "Dois tons"],
    answer: 1,
    explanation:
      "Não há uma tecla entre Mi e Fá. São vizinhos no teclado, portanto um semitom.",
    sources: [sources.scales, sources.intervals],
    chord: "Nota E",
  },
  {
    id: "ritmo",
    title: "Dê espaço ao silêncio",
    subtitle: "Figuras, pausas e construção de compassos",
    minutes: 15,
    goal: "Completar um compasso 4/4 com figuras e pausas.",
    body: [
      "As figuras indicam durações relativas. Neste exercício, a semínima vale um pulso, a mínima dois e a colcheia meio. A pausa ocupa tempo, mesmo sem som.",
      "Um compasso 4/4 comporta quatro semínimas. Isso pode ser preenchido por diferentes combinações de sons e silêncios. A demonstração toca apenas as figuras sonoras; a duração das pausas é respeitada.",
    ],
    lab: "rhythm",
    activity:
      "Monte quatro pulsos incluindo ao menos uma pausa. Ouça e confira a soma antes de verificar.",
    review: "Uma mínima mais duas semínimas preenchem um compasso 4/4?",
    options: ["Sim: 2 + 1 + 1 = 4", "Não: faltam dois pulsos"],
    answer: 0,
    explanation:
      "As durações somam quatro semínimas. Outros arranjos também podem preencher o compasso.",
    sources: [sources.rhythm, sources.meter],
    chord: "C",
  },
  {
    id: "intervalos",
    title: "Escute a distância",
    subtitle: "Intervalos melódicos e harmônicos",
    minutes: 15,
    goal: "Reconhecer uma segunda maior, terça maior ou quinta justa em um exemplo auditivo.",
    body: [
      "Um intervalo relaciona duas alturas. Quando as ouvimos em sequência, o intervalo é melódico; juntas, ele é harmônico. A contagem de letras fornece o número, e os semitons ajudam a determinar a qualidade.",
      "Dó–Ré é uma segunda maior (2 semitons), Dó–Mi uma terça maior (4) e Dó–Sol uma quinta justa (7). O exercício começa com essas três possibilidades e permite repetir o áudio e pedir uma dica.",
    ],
    lab: "interval",
    activity:
      "Ouça duas notas sem ver o nome da segunda e identifique o intervalo. Repita sem limite; use a dica se precisar.",
    review: "Dó4 e Mi4 formam:",
    options: ["Terça maior", "Terça menor", "Quarta justa"],
    answer: 0,
    explanation:
      "Dó–Ré–Mi conta três nomes, e Dó–Mi percorre quatro semitons: terça maior.",
    sources: [sources.intervals],
    chord: "C",
  },
  {
    id: "escalas",
    title: "Organize suas notas",
    subtitle: "Escalas maiores e menores naturais",
    minutes: 15,
    goal: "Construir uma escala maior e comparar sua terça com a menor natural.",
    body: [
      "Escala é uma organização de alturas. A escala maior segue T–T–S–T–T–T–S; a menor natural, T–S–T–T–S–T–T. T significa tom e S semitom. A tônica dá nome à escala.",
      "Existem outras formas de menor e usos que mudam com o contexto. Aqui começamos apenas pela menor natural. Ao mudar a tônica, preservamos o padrão intervalar e ajustamos a grafia das notas.",
    ],
    lab: "scale",
    activity:
      "Selecione os sete graus de Dó maior. Depois compare o padrão com Dó menor natural.",
    review: "Qual padrão começa a escala maior?",
    options: ["T–T–S", "T–S–T", "S–T–T"],
    answer: 0,
    explanation:
      "Os três primeiros passos da maior são tom, tom e semitom. Em Dó maior: Dó–Ré–Mi–Fá.",
    sources: [sources.scales],
    chord: "Cm",
  },
  {
    id: "acordes",
    title: "Construa sua primeira harmonia",
    subtitle: "Tríades, tétrades e a cor da terça",
    minutes: 15,
    goal: "Montar Dó maior e transformar sua terça para ouvir Dó menor.",
    body: [
      "Uma tríade reúne fundamental, terça e quinta. A tríade maior tem terça maior e quinta justa; a menor tem terça menor e quinta justa. Alterar a terça muda a qualidade sem mudar a fundamental.",
      "Acrescentar uma sétima pode formar uma tétrade. Em7 contém Mi, Sol, Si e Ré; Bm7 contém Si, Ré, Fá♯ e Lá; Bmaj7 usa Ré♯ e Lá♯. A qualidade precisa ser lida com cuidado.",
    ],
    lab: "chord",
    activity:
      "Selecione Dó, Mi e Sol para montar C. Em seguida compare o mesmo acorde com Mi♭ e abra-o na área Prática.",
    review: "Qual nota transforma C em Cm, mantendo Dó e Sol?",
    options: ["Mi♭ no lugar de Mi", "Fá no lugar de Sol", "Ré no lugar de Dó"],
    answer: 0,
    explanation:
      "A terça de C é Mi. Abaixá-la para Mi♭ produz a tríade menor Dó–Mi♭–Sol.",
    sources: [sources.triads, sources.intervals],
    chord: "Cm",
  },
  {
    id: "inversoes",
    title: "As mesmas notas, outro chão",
    subtitle: "Inversões e arpejos",
    minutes: 12,
    goal: "Mudar o baixo e distinguir inversão de arpejo.",
    body: [
      "Uma inversão muda qual nota do acorde está no baixo. C/E mantém Dó, Mi e Sol, mas coloca Mi como nota mais grave. Isso não é mudar a tônica para Mi.",
      "Arpejo significa tocar as notas em sequência. Um acorde em qualquer inversão pode ser arpejado. O laboratório permite comparar as disposições sem impor uma digitação universal de dedos.",
    ],
    lab: "inversion",
    activity:
      "Escolha Mi como baixo de C e ouça a primeira inversão em bloco e em arpejo.",
    review: "C/E significa:",
    options: ["Mi maior", "Dó maior com Mi no baixo", "Dó menor"],
    answer: 1,
    explanation:
      "A parte antes da barra identifica o acorde. A nota depois da barra indica o baixo.",
    sources: [sources.triads],
    chord: "C/E",
  },
  {
    id: "tonalidade",
    title: "Um lugar para voltar",
    subtitle: "Tonalidade e campo harmônico",
    minutes: 15,
    goal: "Relacionar uma escala maior aos acordes construídos sobre seus graus.",
    body: [
      "Tonalidade é uma organização em torno de uma tônica percebida no contexto. Não basta olhar o primeiro acorde de uma música para ter certeza de seu tom.",
      "Ao empilhar terças diatônicas em cada grau da escala maior, obtemos I, ii, iii, IV, V, vi e vii°. Em Dó maior: C, Dm, Em, F, G, Am e Bdim. São acordes do campo harmônico maior, não uma lista de todos os acordes possíveis na tonalidade.",
    ],
    lab: "key",
    activity:
      "Explore o campo harmônico de Dó maior e escolha o acorde do quinto grau.",
    review: "O primeiro acorde de uma cifra determina sozinho a tonalidade?",
    options: ["Sempre", "Não, o contexto é necessário"],
    answer: 1,
    explanation:
      "Uma peça pode começar fora da tônica, modular ou ter ambiguidades. O tom deve ser informado ou analisado com contexto.",
    sources: [sources.triads, sources.function, sources.scales],
    chord: "G",
  },
  {
    id: "cadencias",
    title: "Tensão, caminho e chegada",
    subtitle: "Funções harmônicas e cadências",
    minutes: 15,
    goal: "Ouvir a relação entre dominante e tônica em um exemplo tonal.",
    body: [
      "Na prática tonal que estudamos aqui, tônica pode dar sensação de apoio; predominante prepara um caminho; dominante frequentemente cria expectativa de resolução. Essas funções dependem do estilo e do contexto.",
      "Uma cadência participa da articulação de uma frase. G–C pode integrar uma chegada dominante–tônica em Dó maior, mas duas cifras isoladas não descrevem toda a condução de vozes, métrica e melodia necessárias para uma análise formal completa.",
    ],
    lab: "cadence",
    activity:
      "Monte uma sequência de acordes e conclua G–C. Compare a chegada com uma sequência que termina em G.",
    review: "Na sequência F–G–C em Dó maior, a relação final é:",
    options: [
      "Dominante para tônica",
      "Tônica para dominante",
      "Dois acordes idênticos",
    ],
    answer: 0,
    explanation:
      "G é o quinto grau e C o primeiro. O exemplo ilustra uma tendência tonal, sem universalizá-la para outros estilos.",
    sources: [sources.function],
    chord: "G7",
  },
  {
    id: "modos",
    title: "Mude o ponto de partida",
    subtitle: "Introdução a modos e transposição",
    minutes: 20,
    goal: "Comparar padrões de escalas e transpor mantendo relações intervalares.",
    body: [
      "Modos podem ser estudados como diferentes organizações intervalares em torno de uma tônica. Dórico tem terça menor e sexta maior; não é simplesmente tocar qualquer sequência de teclas brancas sem estabelecer um centro.",
      "Transpor desloca todas as alturas pela mesma distância. Na cifra, isso inclui o baixo após a barra e preserva a qualidade dos acordes. Capotraste e alteração de uma gravação são assuntos diferentes.",
    ],
    lab: "mode",
    activity:
      "Compare maior, menor natural e dórico. Mude a tônica para ouvir o mesmo padrão em outra altura.",
    review: "Ao transpor C/E um tom acima, obtemos:",
    options: ["D/F#", "D/E", "Cm/E"],
    answer: 0,
    explanation:
      "Dó sobe dois semitons para Ré, e Mi para Fá♯. A qualidade maior é preservada.",
    sources: [sources.scales, sources.intervals],
    chord: "D/F#",
  },
];
export type Period = {
  id: string;
  title: string;
  dates: string;
  context: string;
  audience: string;
  sound: string;
  instruments: string;
  forms: string;
  people: string;
  work: string;
  compare: string;
  sources: Source[];
};
export const periods: Period[] = [
  {
    id: "antiquity",
    title: "Antiguidade",
    dates: "antes de c. 500",
    context:
      "O recorte inclui tradições da Grécia e de Roma antigas que influenciaram discursos posteriores. Não representa todas as culturas da Antiguidade. Textos, imagens, instrumentos e poucos exemplos notados são fontes parciais; a experiência sonora não pode ser reconstituída com certeza.",
    audience:
      "Rituais, teatro, festas e educação, em sociedades com hierarquias e escravidão.",
    sound:
      "Relações entre poesia, canto e teoria modal antiga. Não confundir os nomes antigos dos modos com usos medievais ou modernos.",
    instruments:
      "Lira, cítara e aulos, entre outras práticas vocais e instrumentais.",
    forms:
      "Canto ligado à poesia, drama e rituais; categorias muito diferentes das formas de concerto atuais.",
    people:
      "Mesomedes; muitas pessoas que fizeram música não foram identificadas nas fontes preservadas.",
    work: "Epitáfio de Seikilos — exemplo notado preservado, não janela completa para toda a música antiga.",
    compare:
      "Que parte do que você imagina vem de evidência, e que parte vem de uma reconstrução moderna?",
    sources: [sources.history],
  },
  {
    id: "medieval",
    title: "Idade Média",
    dates: "c. 500–1400",
    context:
      "Sociedades diversas e mudanças ao longo de muitos séculos. A documentação escrita preservada privilegia instituições com recursos, especialmente religiosas.",
    audience:
      "Igrejas e mosteiros, cortes, festas e circulação de intérpretes; não apenas música sacra.",
    sound:
      "Canto monofônico e desenvolvimento de diferentes práticas polifônicas. A notação muda conforme necessidades e lugares.",
    instruments:
      "Vozes, flautas, vielas, alaúdes e outros instrumentos em contextos distintos.",
    forms: "Canto litúrgico, organum, moteto medieval e canções.",
    people:
      "Hildegard von Bingen, Guillaume de Machaut; tradições anônimas e orais.",
    work: "Hildegard: O vis aeternitatis.",
    compare:
      "Compare uma voz sem acompanhamento com várias linhas simultâneas. Quantas linhas você consegue seguir?",
    sources: [sources.notation, sources.history],
  },
  {
    id: "renaissance",
    title: "Renascimento",
    dates: "c. 1400–1600",
    context:
      "Cortes, instituições religiosas, vida urbana e impressão musical ampliam certas redes de circulação, com fortes desigualdades de acesso.",
    audience:
      "Capelas, cortes e espaços domésticos; repertórios vocais religiosos e seculares.",
    sound:
      "Imitação entre vozes e atenção ao texto em diferentes gêneros. As práticas não são uniformes entre regiões.",
    instruments:
      "Vozes, violas da gamba, alaúdes, instrumentos de sopro e teclas.",
    forms: "Missa, moteto e madrigal, além de danças instrumentais.",
    people:
      "Josquin des Prez, Giovanni Pierluigi da Palestrina, Maddalena Casulana.",
    work: "Casulana: madrigais; Josquin: Ave Maria… virgo serena.",
    compare:
      "Compare a entrada sucessiva de vozes com uma melodia acompanhada. O que sua atenção precisa fazer?",
    sources: [sources.history, sources.baroque],
  },
  {
    id: "baroque",
    title: "Barroco",
    dates: "c. 1600–1750",
    context:
      "Cortes e igrejas seguem centrais; teatros de ópera e diferentes mercados urbanos também importam. O baixo contínuo organiza muitas práticas de acompanhamento.",
    audience:
      "Cultos, cerimônias de corte, teatros e outros espaços com públicos e patrocínios distintos.",
    sound:
      "Contrastes, linhas em diálogo, ornamentação e diversas práticas tonais. Baixo contínuo não significa que toda obra tem a mesma textura.",
    instruments: "Cravo, órgão, cordas, sopros e vozes; formações variáveis.",
    forms: "Ópera, suíte, fuga, concerto e sonata barroca.",
    people:
      "Johann Sebastian Bach, Antonio Vivaldi, Barbara Strozzi, Élisabeth Jacquet de La Guerre.",
    work: "Bach: Paixão segundo São Mateus, coro inicial.",
    compare:
      "Ouça o baixo e depois uma linha superior. Como as partes dividem o espaço?",
    sources: [sources.baroque, sources.met],
  },
  {
    id: "classicism",
    title: "Classicismo",
    dates: "c. 1750–1820",
    context:
      "Patrocínio aristocrático, trabalho profissional e concertos públicos convivem. As datas indicam tendências e não fronteiras rígidas.",
    audience: "Salas de concerto, cortes, teatros e prática doméstica.",
    sound:
      "Articulação de frases, contrastes temáticos e exploração de formas; também há contraponto e complexidade.",
    instruments: "Orquestra, quarteto de cordas e piano em transformação.",
    forms: "Sinfonia, concerto, sonata, quarteto e ópera.",
    people:
      "Joseph Haydn, Wolfgang Amadeus Mozart, Marianna Martines, Ludwig van Beethoven em diferentes fases.",
    work: "Mozart: Quarteto K. 458, primeiro movimento.",
    compare:
      "Compare a repetição de uma ideia curta com uma entrada imitativa barroca. Evite tratar qualquer período como uma única sonoridade.",
    sources: [sources.form, sources.meter],
  },
  {
    id: "romanticism",
    title: "Romantismo",
    dates: "c. 1800–1910",
    context:
      "Urbanização, novas redes editoriais e concertos se relacionam com transformações sociais e políticas. Acesso à profissão é desigual por gênero, classe e raça.",
    audience:
      "Concertos públicos, salões, teatros e casas; obras circulam em partituras e arranjos.",
    sound:
      "Exploração de cor, expressividade, expansão e transformação de materiais. Tendências coexistem com formas herdadas.",
    instruments:
      "Piano, música de câmara, voz e orquestras de tamanhos diversos.",
    forms:
      "Lied, peça para piano, poema sinfônico, sinfonia, concerto e ópera.",
    people: "Clara Schumann, Fanny Hensel, Frédéric Chopin, Johannes Brahms.",
    work: "Clara Schumann: Trio com piano em Sol menor, op. 17.",
    compare:
      "O tema muda ao retornar? Compare o papel do piano solo com sua atuação em um trio.",
    sources: [sources.form, sources.library],
  },
  {
    id: "modern",
    title: "Século XX",
    dates: "c. 1900–2000",
    context:
      "Gravação, rádio, cinema, migrações, guerras e movimentos sociais transformam produção e escuta. “Moderno” não é um estilo único.",
    audience: "Concertos, emissoras, cinemas e escuta doméstica de gravações.",
    sound:
      "Tonalidades, atonalidades, novos timbres, ritmos e experimentações coexistem; muitas escolhas não cabem em uma narrativa de progresso linear.",
    instruments:
      "Formações tradicionais, percussões ampliadas e meios eletrônicos.",
    forms:
      "Ballet, obras orquestrais, câmara, eletroacústica e diferentes experimentações.",
    people:
      "Heitor Villa-Lobos, Lili Boulanger, Florence Price, Igor Stravinsky.",
    work: "Villa-Lobos: Bachianas brasileiras nº 5, Ária (Cantilena).",
    compare:
      "Compare a melodia cantada com a textura dos violoncelos. O timbre ajuda a reconhecer o retorno de uma ideia?",
    sources: [sources.brazil, sources.library],
  },
  {
    id: "contemporary",
    title: "Século XXI",
    dates: "c. 2000–hoje",
    context:
      "Redes digitais, circulação global e debates sobre instituições, identidade e acesso convivem com práticas locais e comunitárias.",
    audience:
      "Salas, escolas, festivais, espaços comunitários e plataformas digitais.",
    sound:
      "Pluralidade de linguagens; não há um único som que represente o século.",
    instruments:
      "Acústicos, eletrônicos, voz, ambientes e combinações interdisciplinares.",
    forms: "Concertos, instalações, performance e formatos híbridos.",
    people:
      "Compositores e compositoras vivos em contextos locais diversos; este módulo introdutório não pretende oferecer um cânone.",
    work: "Escolha uma obra recente em uma programação de orquestra ou festival e confira intérpretes e direitos.",
    compare:
      "Como o lugar de apresentação e a tecnologia mudam quem pode ouvir e participar?",
    sources: [sources.orchestra, sources.brazil],
  },
];
export const brazilModules = [
  {
    id: "indigenous",
    title: "Muitas músicas, muitos povos",
    scope: "Tradições indígenas · diversidade e contemporaneidade",
    text: "Não existe uma única “música indígena”. Povos, línguas, situações rituais e práticas contemporâneas têm histórias próprias. Priorize vozes indígenas e não trate registros como material livre para reutilizar. Certos conhecimentos e sons têm regras comunitárias de acesso.",
    activity:
      "Escolha um povo e registre quem apresenta a prática, em qual contexto e com qual autorização. Evite generalizar para outros povos.",
    sources: [sources.indigenous],
  },
  {
    id: "afro",
    title: "Diásporas e reinvenções",
    scope: "Tradições africanas e afro-brasileiras",
    text: "As Áfricas reúnem culturas diversas. A violência da escravização e a agência de populações africanas e descendentes são parte central das histórias musicais brasileiras. Religiões, festas, associações e bairros sustentam saberes que não se reduzem a um padrão rítmico.",
    activity:
      "Ao conhecer uma prática, anote o nome usado pela comunidade, seu contexto e quem transmite o conhecimento.",
    sources: [sources.iphan],
  },
  {
    id: "colonial",
    title: "Som, trabalho e poder",
    scope: "Contextos coloniais · séculos XVI–XIX, sem uniformidade regional",
    text: "Missões, irmandades, igrejas e espaços urbanos produziram encontros e coerções. Documentos preservados mostram apenas partes dessas relações. Pessoas negras, indígenas e mestiças participaram como criadoras, intérpretes e transmissoras, em condições desiguais.",
    activity:
      "Pergunte quem aparece como autor no documento e quais trabalhos musicais podem ter ficado sem nome.",
    sources: [sources.brazil, sources.iphan],
  },
  {
    id: "concert",
    title: "Música de concerto no Brasil",
    scope: "Instituições, compositores e compositoras · séculos XIX–XXI",
    text: "Conservatórios, teatros e redes de concerto têm histórias próprias no Brasil. Henrique Oswald, Alberto Nepomuceno, Villa-Lobos e compositores como Chiquinha Gonzaga e outras criadoras transitam por práticas e espaços diferentes; essas trajetórias não devem ser reduzidas a uma escola europeia transplantada.",
    activity:
      "Explore o roteiro de Bachianas brasileiras nº 5 e observe como instrumentação e título sugerem diálogos, sem resumir a obra a uma etiqueta nacional.",
    sources: [sources.brazil],
  },
  {
    id: "popular",
    title: "Choro, samba e vida urbana",
    scope: "Expressões populares · histórias específicas",
    text: "Choro e samba se desenvolvem em práticas coletivas, redes urbanas e disputas de reconhecimento. Não são versões menores da tradição de concerto. Há relações com festas, trabalho, racialização, circulação de partituras, rádio e indústria fonográfica.",
    activity:
      "Compare dois registros autorizados de uma mesma prática: instrumentação, ocasião e participação do público mudam?",
    sources: [sources.iphan, sources.brazil],
  },
  {
    id: "technology",
    title: "Quem grava, quem ouve?",
    scope: "Tecnologia, indústria e sociedade",
    text: "Fonógrafo, discos, rádio e plataformas digitais reorganizam a circulação, sem substituir totalmente práticas anteriores. Catálogos e gravações documentam escolhas de mercado, limites técnicos e relações de poder; não são retratos neutros de tudo que se fazia.",
    activity:
      "Confira a data de composição, a da gravação e a da digitalização. Anote quem controla os direitos de cada uma.",
    sources: [sources.library, sources.brazil],
  },
];
export type Work = {
  id: string;
  title: string;
  composer: string;
  period: string;
  formation: string;
  context: string;
  before: string;
  listen: string[];
  after: string;
  link: string;
  linkLabel: string;
  verifiedLink: boolean;
  theory: string;
  sources: Source[];
};
export const works: Work[] = [
  {
    id: "bach",
    title: "Paixão segundo São Mateus · coro inicial",
    composer: "Johann Sebastian Bach",
    period: "baroque",
    formation: "Vozes, coros e conjuntos instrumentais",
    context:
      "Obra sacra do século XVIII associada à prática luterana de Leipzig. O início oferece múltiplas camadas para seguir; não é necessário reconhecer cada voz de imediato.",
    before:
      "Você consegue escolher uma única linha para acompanhar sem tentar escutar tudo ao mesmo tempo?",
    listen: [
      "Primeira passagem: perceba a pulsação e o movimento da base.",
      "Segunda passagem: acompanhe uma linha vocal e perceba entradas de outros grupos.",
      "Compare camadas e diálogos; não confunda textura polifônica com volume alto.",
    ],
    after:
      "Qual linha chamou mais sua atenção? Que entrada ou contraste você percebeu ao ouvir de novo?",
    link: "https://open.spotify.com/track/6M1Eo5wuTl8f5qbpLCuph0",
    linkLabel: "Abrir gravação no Spotify",
    verifiedLink: true,
    theory: "pulso",
    sources: [sources.meter, sources.baroque],
  },
  {
    id: "mozart",
    title: "Quarteto de cordas K. 458 · I",
    composer: "Wolfgang Amadeus Mozart",
    period: "classicism",
    formation: "Dois violinos, viola e violoncelo",
    context:
      "O quarteto conhecido como “A caça” pertence ao conjunto dedicado a Haydn. Um grupo de quatro instrumentos pode criar diálogo, acompanhamento e mudanças de protagonismo.",
    before:
      "Como você espera que quatro instrumentos de cordas se diferenciem sem uma voz cantada?",
    listen: [
      "Acompanhe a ideia inicial e seus retornos.",
      "Procure trocas entre o registro mais agudo e a base.",
      "Perceba a subdivisão ternária do pulso em 6/8, sem precisar contar o movimento inteiro.",
    ],
    after:
      "A mesma ideia voltou exatamente igual? Qual instrumento parecia responder?",
    link: "https://open.spotify.com/track/1w6C2YqIHygosg9OY6v7Wl",
    linkLabel: "Abrir gravação no Spotify",
    verifiedLink: true,
    theory: "pulso",
    sources: [sources.meter, sources.form],
  },
  {
    id: "beethoven",
    title: "Sonata op. 27 nº 2 · I",
    composer: "Ludwig van Beethoven",
    period: "classicism",
    formation: "Piano solo",
    context:
      "A sonata frequentemente chamada “Ao luar” está na transição entre narrativas do Classicismo e do Romantismo. O apelido não deve substituir a atenção à música e ao título da obra.",
    before:
      "Um único piano pode fazer você ouvir planos diferentes ao mesmo tempo?",
    listen: [
      "Ouça o acompanhamento em movimento contínuo.",
      "Encontre a linha que parece cantar acima desse movimento.",
      "Compare a continuidade da textura com as mudanças de intensidade e harmonia.",
    ],
    after: "O que permaneceu e o que mudou enquanto a música avançava?",
    link: "https://open.spotify.com/track/70TI9J2rsGIuXyFqVzOswh",
    linkLabel: "Abrir gravação no Spotify",
    verifiedLink: true,
    theory: "inversoes",
    sources: [sources.meter, sources.form],
  },
  {
    id: "clara",
    title: "Trio com piano em Sol menor, op. 17 · I",
    composer: "Clara Schumann",
    period: "romanticism",
    formation: "Piano, violino e violoncelo",
    context:
      "Clara Schumann atuou como pianista e compositora no século XIX. O trio é um ponto de partida para perceber papéis que mudam entre os três instrumentos.",
    before: "O piano sempre acompanha, ou também pode apresentar o tema?",
    listen: [
      "Escolha uma versão do primeiro movimento em uma fonte oficial.",
      "Siga o instrumento que apresenta uma ideia e observe quem a retoma.",
      "Compare o que o piano faz quando as cordas assumem o primeiro plano.",
    ],
    after: "Que mudança de papel você percebeu entre piano e cordas?",
    link: "https://www.chambermusicsociety.org/",
    linkLabel: "Consultar catálogo institucional de música de câmara",
    verifiedLink: false,
    theory: "acordes",
    sources: [
      sources.form,
      {
        label: "Chamber Music Society of Lincoln Center · catálogo oficial",
        url: "https://www.chambermusicsociety.org/",
        status: "pending",
      },
    ],
  },
  {
    id: "villa",
    title: "Bachianas brasileiras nº 5 · Ária (Cantilena)",
    composer: "Heitor Villa-Lobos",
    period: "modern",
    formation: "Soprano e oito violoncelos",
    context:
      "A Ária, composta em 1938, integra uma obra brasileira do século XX para uma formação singular. O título propõe um diálogo com Bach; isso não a torna uma obra barroca.",
    before: "O que você imagina ao combinar uma voz aguda e oito violoncelos?",
    listen: [
      "Procure uma apresentação autorizada em catálogo de orquestra ou acervo.",
      "Observe a voz sem palavras na abertura e a relação com a base dos violoncelos.",
      "Perceba como a textura muda quando entra o texto. Não é necessário reproduzir a letra para estudar a obra.",
    ],
    after:
      "O que o timbre dos violoncelos permite ouvir de diferente em relação ao quarteto de Mozart?",
    link: "https://osesp.art.br/",
    linkLabel: "Consultar programação e acervo oficial da Osesp",
    verifiedLink: false,
    theory: "som",
    sources: [
      sources.brazil,
      {
        label: "Osesp · site institucional",
        url: "https://osesp.art.br/",
        status: "pending",
      },
    ],
  },
];
export const glossary = [
  ["Altura", "Percepção de grave e agudo, relacionada à frequência."],
  [
    "Timbre",
    "Qualidades que distinguem fontes sonoras além da altura e intensidade.",
  ],
  ["Pulso", "Referência temporal recorrente."],
  ["Ritmo", "Organização de durações e silêncios."],
  ["Motivo", "Ideia musical curta que pode voltar e ser transformada."],
  ["Tema", "Material musical reconhecível que pode estruturar uma obra."],
  ["Frase", "Unidade musical com algum sentido de percurso e articulação."],
  ["Textura", "Como as linhas ou camadas se relacionam."],
  ["Movimento", "Parte relativamente autônoma de uma obra maior."],
  [
    "Sinfonia",
    "Gênero associado principalmente à orquestra, frequentemente em vários movimentos.",
  ],
  [
    "Concerto",
    "Gênero que frequentemente coloca solista(s) em relação com um conjunto.",
  ],
  [
    "Sonata",
    "Termo histórico com usos distintos; frequentemente obra instrumental em movimentos. Forma-sonata é outro conceito.",
  ],
  [
    "Suíte",
    "Conjunto de peças, frequentemente associado a danças ou a um agrupamento temático.",
  ],
  [
    "Fuga",
    "Procedimento ou composição em que um sujeito circula por vozes em relações contrapontísticas.",
  ],
  ["Ópera", "Teatro musical que articula canto, cena, texto e instrumentos."],
  [
    "Cadência",
    "Articulação de uma frase musical; envolve mais que uma sequência isolada de cifras.",
  ],
  ["Arpejo", "Notas de um acorde executadas sucessivamente."],
  ["Tônica", "Altura ou acorde de referência em um contexto tonal ou modal."],
];
