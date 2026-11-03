# Dicionário Musical — plataforma pessoal de aprendizado

A aplicação agora tem sete áreas conectadas: **Prática, Teoria musical, Música clássica, História da música, Ferramentas, Cifras e repertório e Meus estudos**. O dicionário original permanece disponível na Prática.

## Primeiros passos

- **Teoria:** trilha de 12 aulas com objetivo, explicação, demonstração manipulável, atividade avaliada, dica, revisão e fontes. Inclui pauta/teclado, tons e semitons, construção de escalas e acordes, intervalos auditivos, compassos com pausas, pulsação, inversões, campo harmônico, sequências e modos. Concluir exige completar a atividade e acertar a revisão; não há obrigação de estudar todo dia.
- **Escuta:** cinco roteiros para Bach, Mozart, Beethoven, Clara Schumann e Villa-Lobos. Três links de gravação foram identificados no material consultado; os roteiros de Clara e Villa-Lobos têm links de catálogos institucionais, sem gravação direta conferida. Há questões antes/depois, anotações persistentes, favoritos e ligações com teoria/história. Não usamos timestamps não conferidos nem hospedamos as gravações.
- **História:** oito recortes da tradição ocidental de concerto e seis módulos brasileiros separados, com contexto, circulação, instrumentos, gêneros, pessoas, comparações e anotações. Datas aproximadas, sobreposições e limites das fontes são explícitos. As referências institucionais externas ainda aguardam conferência de acesso; o status aparece na interface.
- **Ferramentas:** afinador real por microfone e metrônomo Web Audio, em painel que pode ficar aberto sobre aulas e cifras. Botões globais no cabeçalho permitem acesso e interrupção. Use **Minimizar ferramenta** para liberar a tela mantendo seu estado; o painel compacto informa andamento ou estado do microfone. **Fechar** interrompe. Começar outro áudio interrompe o anterior.
- **Repertório:** busca apenas no catálogo local; dois exemplos próprios e importação TXT/ChordPro. Cole ou importe conteúdo que tenha direito de usar. Em TXT, revise as linhas marcadas como acordes. Letra preservada, diagramas clicáveis, tamanho do texto, rolagem automática opcional, favoritos, notas e listas. Ao mudar o tom, os acordes clicáveis já abrem na nova altura.
- **Meus estudos:** retome aula, obra, período ou música selecionada; veja concluídas e favoritos; crie listas, anote e exporte/importe tudo em JSON. Uma importação válida pede confirmação explícita antes de substituir os estudos atuais. Dados inválidos não substituem uma sessão existente.

### Afinador

Use HTTPS ou localhost. Clique **Ativar microfone** somente quando quiser captar, escolha modo cromático ou uma das seis cordas (E2 A2 D3 G3 B3 E4). Toque uma corda por vez, abafe as outras e espere o sinal estabilizar. A interface mostra nota, oitava, Hz, confiança e cents; só indica **Afinado** com sinal estável e a até ±5 cents. Uma nota de outra oitava não confirma uma corda-alvo como afinada.

Lá de referência ajustável entre 430 e 450 Hz, inicialmente 440 Hz. A nota de referência pausa a captura para evitar realimentação. **Encerrar captação**, fechar o painel ou iniciar outro áudio libera as faixas do microfone. Não há gravação, armazenamento nem envio de áudio. Erros de permissão, falta de dispositivo, contexto inseguro e suspensão são tratados.

O detector usa uma implementação própria baseada na função de diferenças normalizada do YIN, com refinamento parabólico. Testado com sinais conhecidos nas seis cordas em 44,1 e 48 kHz, pequenos desvios, harmônicos, ruído e silêncio. Testes de navegador alimentam a análise com uma MediaStream gerada por Web Audio e verificam encerramento. **Isso não substitui ensaio com microfones físicos de diferentes aparelhos**; ruído, harmônicos fortes, latência e comportamento do sistema podem limitar o resultado. Afine com cautela e confira a oitava antes de tensionar a corda.

### Metrônomo

30–240 BPM, campo numérico e slider, tap tempo, 2/4, 3/4, 4/4 e 6/8, acento inicial, subdivisões, volume próprio, modo silencioso visual e um compasso opcional de entrada. Em **6/8**, BPM refere-se à **semínima pontuada**: dois pulsos, cada um com três colcheias. A subdivisão de colcheias respeita essa diferença.

Cliques são agendados por `AudioContext.currentTime`, com janela de antecipação; o temporizador apenas alimenta a fila. A indicação visual segue o relógio de áudio e pode ter atraso de tela. Mudanças de BPM/compasso/subdivisão param e solicitam reinício para uma entrada previsível. Ao esconder a página ou se o contexto for suspenso, o metrônomo pausa com aviso; não se promete funcionamento sob bloqueio de tela.

### Transposição e arquivos

O parser de cifras do repertório preserva extensões mesmo quando o dicionário ainda não possui o diagrama correspondente. Por exemplo, `C/E` sobe um tom para `D/F#`, e `Am7(b5)` para `Bm7(b5)`. Qualidades e baixo são transpostos separadamente. Letras maiúsculas/minúsculas no sufixo não são descartadas.

Informe o tom original para selecionar um destino; o primeiro acorde não é tratado como prova da tonalidade. Use semitons mesmo sem tom informado. Escolha sustenidos ou bemóis, confira o deslocamento e restaure a versão original. Capotraste mostra o tom resultante separadamente. Não há processamento de gravações.

TXT preserva linhas da letra exatamente; somente linhas revisadas como acordes são alteradas. ChordPro mantém acordes vinculados aos trechos da letra. Quando o nome de um acorde cresce, espaços de uma linha TXT podem ser ampliados para evitar colisões; o texto da letra não muda. Arquivos TXT/CHO até 200 KB e backups JSON até 5 MB são aceitos. A exportação individual `.cho` guarda a versão original; o backup guarda também tom, preferência, tamanho, capotraste, notas e favoritos. Nenhum HTML importado é executado.

### Fontes e limitações editoriais

Consulte [a revisão das fontes](docs/SOURCES.md). Textos de teoria foram confrontados com o repositório oficial do **Open Music Theory**; as explicações e exercícios são originais. Referências institucionais de história, orquestra e acervos brasileiros foram identificadas, mas a política de rede impediu a consulta nesta sessão. Elas aparecem como **pendentes**, sem alegação de leitura. Os links Spotify foram extraídos das referências do livro, mas suas gravações não foram ouvidas nem cronometradas. Disponibilidade regional e eventual conta são externas à aplicação.

A integração de catálogo externo não foi implementada: não há scraping, promessas de qualquer música ou dependência de credenciais. O fluxo pessoal funciona inteiramente local. Direitos de composição, partitura/edição, letra/tradução e gravação são tratados separadamente.


Site em português do Brasil para consultar notas e acordes com diagramas SVG e demonstrações sonoras. React 19, TypeScript e Vite. Sem backend, login ou chaves de API. Fontes servidas localmente.

## Executar

Requer Node.js 22.18+ (validado com 24.19) e npm.

```sh
cd /workspace/musica
npm ci
npm run dev -- --port 5173
```

Abra a porta 5173 do servidor no navegador. Para uma instalação fora deste ambiente, execute os comandos no diretório em que clonou o repositório.

```sh
npm test          # teoria e integridade de todas as posições
npm run build    # TypeScript e versão de produção em dist/
npm run preview -- --port 4173
```

Testes de navegador usam Chromium do sistema em `/usr/bin/chromium`, configurável com `CHROMIUM_PATH`. Se necessário, instale Chromium ou indique seu executável. Com o servidor de desenvolvimento na porta 5173:

```sh
npm run test:e2e
```

Os testes executam cenários em desktop (1440 px) e celular (390 px), incluindo pesquisa, instrumentos, armazenamento local, teclado, áudio Web Audio real, interrupção e transposição. Capturas ficam em `test-results/`.

## Usar

1. Selecione o instrumento e pesquise uma cifra ou nome em português. Exemplos: `Em7`, `Si menor com sétima`, `Cmaj7`, `Dó maior com sétima maior`, `F#`, `Gb`, `Dsus4`, `Bdim`, `Caug`, `Am7(b5)`, `C/E`.
2. Letras sem sufixo, como `C`, significam acorde maior. Para uma nota isolada, use `nota C` ou `nota Dó`.
3. `BM7` pede uma escolha explícita entre `Bmaj7` e `Bm7`; a caixa de letras não é descartada indiscriminadamente.
4. Explore inversões/posições, alterne cifras e nomes, ou transponha por semitom. A troca de instrumento preserva a consulta.
5. Ouça o acorde ou um arpejo lento, ajuste o volume em tempo real e interrompa pelo botão quadrado. O som é síntese genérica das alturas, não reprodução fiel do instrumento. Só começa por interação.
6. Use o coração para salvar favoritos. Favoritos e últimas 16 pesquisas ficam apenas no navegador. A interface informa se o armazenamento estiver bloqueado.

## Cobertura real

- **Piano/teclado:** todas as tônicas com acidentes simples, notas isoladas; maior, menor, 7, m7, maj7, sus2, sus4, dim, aug, m7(b5); inversões e baixos pertencentes ao acorde. Notas e oitavas explícitas. Dedos não são impostos universalmente.
- **Violão e guitarra:** afinação E2 A2 D3 G3 B3 E4; posições editoriais de C, Am, Em, Em7, Bm7, Bmaj7, Cmaj7, D, Dm, Dsus4, G, F, F#, E, A, A7, Am7, G7, C/E, Bdim, Caug, Am7(b5). C e Em7 têm alternativas. Enarmonias equivalentes também funcionam. Cordas soltas, abafadas, dedos, pestanas, casa inicial, alturas reais e visualização para canhotos.
- **Cavaquinho:** D3 G3 B3 D4; C, Am, Em7, Em, G, D, F, Am7. C tem duas posições. A ausência de Cmaj7 completo é informada sem omitir silenciosamente notas.
- **Ukulele:** G4 C4 E4 A4, sol agudo reentrante. C, Am, Em, Em7, Bm7, Bmaj7, Cmaj7, F, G, D, Am7, A, Dsus4. C tem duas posições. O áudio considera as alturas reais das cordas, não apenas a ordem do desenho.
- **Baixo:** E1 A1 D2 G2, mapa de notas e intervalos até a 12ª casa. Reprodução em arpejo, sem sugerir acordes simultâneos.
- **Violino:** G3 D4 A4 E5, referências em semitons e regiões de dedos na primeira posição, não trastes. Notas individuais e arpejos. Não inclui cordas duplas/acordes simultâneos. A afinação e colocação exata dependem do estudo e do ouvido.
- **Gaita:** exige seleção de tipo e tonalidade. Diatônica Richter de 10 furos, notas naturais de sopro/aspiração; registro padrão da tônica entre G3 e F#4. Mostra as notas acessíveis, não afirma que podem formar um acorde simultâneo. Cromática, bends e overblows explicitamente indisponíveis.
- **Pandeiro:** área própria de técnicas e padrão visual de samba 2/4; sem acordes ou áudio simulado de percussão.

O catálogo de cordas é intencionalmente limitado. Nenhuma combinação nova de casas é gerada como posição tocável. Quando falta uma posição completa cadastrada, a interface informa e sugere explorar no piano. O modo comparar preserva essas limitações.

## Estrutura e origem musical

- `src/theory.ts`: parser, fórmulas, grafia diatônica, transposição e inversões. Sem chamadas a IA.
- `src/instruments.ts`: registro extensível de instrumentos, afinações, catálogo explícito de posições, validação das notas e mapa Richter.
- `src/diagrams.tsx`: diagramas SVG baseados nesses dados e alturas reais.
- `src/audio.ts`: síntese Web Audio, envelopes, controle de volume e interrupção.
- `src/main.tsx`: entrada da aplicação; `src/Practice.tsx`: interface e estado do dicionário original.

Fórmulas e mapeamentos foram escritos para este projeto a partir de relações musicais usuais. O catálogo é editorial próprio, não foi copiado de base externa. A validação automatizada confere a afinação, todas as notas do acorde, baixo quando indicado, tamanho dos vetores e alcance de casas. Essa conferência matemática não é tratada como prova geral de tocabilidade: só são oferecidas as posições explícitas do catálogo, sem classificar dificuldade universalmente. Em instrumentos de cordas, o menor som real só é imposto quando há baixo explícito na cifra; outras disposições aparecem com suas alturas tocadas.

Licenças das dependências: React/React DOM, Vite, Prettier e Fontsource — MIT; TypeScript e Playwright — Apache-2.0. DM Sans e Manrope — SIL Open Font License 1.1, distribuídas pelos pacotes Fontsource (arquivos de licença em `node_modules/@fontsource/*/LICENSE`). Não há imagens ou base musical externas.

## Identidade

O nome provisório aparece na marca em `src/platform/Platform.tsx`, na constante `APP_NAME` do dicionário em `src/Practice.tsx` e no título/metadados de `index.html`.

## Módulos da ampliação

- `src/platform/Platform.tsx`: navegação, conexões entre áreas, atalhos e parada global.
- `src/platform/content.ts`: 12 aulas, 8 períodos, 6 módulos brasileiros, 5 obras e glossário, com fontes e data de revisão.
- `src/platform/Labs.tsx` e `learning-music.ts`: atividades interativas e cálculos de apoio.
- `src/platform/Education.tsx`: trilha, escutas e história.
- `src/platform/Repertoire.tsx` e `repertoire-model.ts`: importação revisável, consulta, transposição e estudo de cifras.
- `src/platform/Studies.tsx`, `store.tsx`, `store-model.ts`: progresso local e backups validados.
- `src/tools/pitch.ts`: análise de frequência fundamental.
- `src/tools/metronome.ts`: plano de compassos e agendador de áudio.
- `src/tools/Tools.tsx`: permissão/ciclo de vida do microfone e controles das ferramentas.
- `src/audio-bus.ts`: exclusão mútua dos áudios/captação.
- `src/Practice.tsx`: dicionário original, mantido montado ao navegar para preservar a consulta.

A aparência respeita `prefers-reduced-motion`. Atividades têm botões e campos operáveis por teclado; nenhuma depende de arrastar ou exclusivamente de cor. Rolagem automática é opcional e pode ser pausada. A avaliação de batidas mede regularidade relativa, não sincronismo absoluto nem precisão de hardware.

## Produção no Cloudflare Worker `musica`

O destino é o Worker existente **`musica`**, com **Workers Static Assets**. A configuração e os passos estão em [docs/DEPLOY-CLOUDFLARE.md](docs/DEPLOY-CLOUDFLARE.md). Build: `npm run build`; assets: `./dist`; validação sem publicar: `npm run deploy:check`; deploy: **`npm run deploy`** (equivale a `npx wrangler deploy`). Branch `main`; Node `24.19.0`. `wrangler.jsonc` habilita `workers_dev` e fallback de SPA, sem `pages_build_output_dir`.

Não utilizar comandos Pages, nem o projeto ou domínio do Incômodo Coletivo. A URL gratuita HTTPS `workers.dev` será exibida pela Cloudflare após o deploy do Worker; este documento não afirma que uma URL tenha sido verificada.
