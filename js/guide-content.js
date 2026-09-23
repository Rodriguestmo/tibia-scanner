// Conteudo do guia "Como usar" nos 3 idiomas. Mesma estrutura em todos (tests/check.js confere).
// Blocos: {p}, {h}, {ul:[...]}, {steps:[...]}, {tip}, {warn}, {ev:[[icone, nome, texto]]}, {ex:{title, text, link}}.
(function () {
  "use strict";
  window.GUIDE_CONTENT = {
    "pt-BR": [
      { icon: "logo", title: "Bem-vindo ao Tibia Scanner", blocks: [
        { p: "O Tibia Scanner observa o servidor Miracle 24 horas por dia e procura personagens que provavelmente pertencem à mesma conta (alts) ou a pessoas que se conhecem. Ele não acessa nada privado: usa só páginas públicas do site (quem está online, últimas mortes, banimentos, casas, guildas e perfis)." },
        { h: "O que o número em % significa" },
        { p: "Cada ligação entre dois personagens tem uma confiança de 0% a 99%. É a chance estimada de os dois serem a mesma conta, calculada a partir das provas encontradas. O scanner nunca mostra 100%: probabilidade não é certeza." },
        { ul: [
          "Verde (80% ou mais): evidência forte e repetida, quase sempre relog em vários dias.",
          "Amarelo (50% a 79%): suspeita séria, normalmente inferida ou com poucas repetições.",
          "Cinza (abaixo de 50%): sinais fracos, como nome parecido ou mesma guilda.",
          "Azul: aliados (jogam juntos), não mesma conta.",
          "Laranja pontilhado: inimigos (um matou o outro), não mesma conta."
        ] },
        { warn: "Use o resultado como pista, nunca como prova única. Amigos que revezam o mesmo horário podem parecer alts; confira sempre as evidências cruas." },
        { tip: "Os dados crescem com o tempo. Nos primeiros dias o grafo fica quase vazio; depois de uma semana de coleta os relogs começam a aparecer com força." }
      ] },
      { icon: "globe", title: "Primeiros passos", blocks: [
        { steps: [
          "Entre com a senha na tela de login. A sessão dura 2 horas; depois disso o site pede a senha de novo.",
          "No topo, escolha o idioma (PT, EN ou SV). A troca é instantânea e não recarrega a página.",
          "Escolha o fuso horário (UTC, Brasil ou Suécia). Todas as datas e o heatmap passam a usar esse fuso; o selo ao lado (por exemplo UTC−3) mostra a diferença para o UTC.",
          "Use o botão de sol/lua para alternar entre tema escuro e claro.",
          "No celular, o menu fica escondido no botão de três linhas, no canto superior esquerdo."
        ] },
        { h: "Indicador de saúde" },
        { ul: [
          "Verde (Online): o scanner está coletando normalmente.",
          "Amarelo (Instável): o site do Miracle demorou ou recusou; o scanner está esperando antes de tentar de novo.",
          "Vermelho (Offline): o servidor do scanner não responde ou está parado há mais de 30 minutos."
        ] },
        { tip: "Passe o mouse sobre o indicador para ver o horário do último poll e o modo de coleta (pico, intermediário, parado ou cooldown)." }
      ] },
      { icon: "graph", title: "Grafo", blocks: [
        { p: "O grafo é o mapa geral. Cada bolinha é um personagem e cada linha é uma associação encontrada." },
        { ul: [
          "Cor da bolinha: personagens do mesmo cluster (grupo provável) têm a mesma cor.",
          "Borda vermelha grossa: personagem marcado como alvo.",
          "Cor e espessura da linha: quanto mais grossa e mais verde, maior a confiança.",
          "Linha tracejada: vínculo inferido por transitividade (A liga com B e B liga com C, então A provavelmente liga com C).",
          "Linha azul: aliados; os dois estiveram online juntos, então não são a mesma conta, mas jogam juntos.",
          "Linha laranja pontilhada: inimigos; um matou o outro.",
          "Passe o mouse sobre uma linha para ver a confiança e os tipos de evidência com ícones."
        ] },
        { h: "Filtros" },
        { ul: [
          "Buscar personagem: mostra só as ligações de quem tem esse texto no nome.",
          "Faixa de confiança: por padrão começa em 85%, mostrando só as ligações fortes. Baixe o controle para ver suspeitas mais fracas.",
          "Janela temporal: mostra só vínculos que surgiram nos últimos 7, 30 ou 90 dias.",
          "Vocação e guilda: limitam os personagens exibidos.",
          "Tipo de evidência: marque um ou mais tipos para ver só as ligações que têm aquela prova.",
          "Mostrar aliados e inimigos: liga ou desliga as linhas azuis e laranja."
        ] },
        { tip: "Clique em qualquer bolinha para abrir o painel lateral com a ficha completa. O botão Exportar PNG salva a imagem do grafo como está na tela." },
        { ex: { title: "Experimente", text: "Digite \"teste\" na busca do grafo: aparecem Teste e os alts de demonstração.", link: "#graph" } }
      ] },
      { icon: "target", title: "Painel do personagem e alvos", blocks: [
        { p: "Ao clicar num personagem no grafo abre-se um painel à direita com:" },
        { ul: [
          "Ficha: level, vocação, residência, guilda, tipo de conta, último login e quando o scanner o viu pela primeira vez.",
          "Heatmap de atividade: dia da semana × hora; quanto mais forte a cor, mais tempo online naquele horário.",
          "Lista de evidências: todos os personagens ligados a ele, com % e ícones; clicar abre o comparador.",
          "Histórico de guildas, casas, banimentos, mortes e mortes causadas."
        ] },
        { h: "Marcar como alvo" },
        { p: "Um alvo recebe atenção especial da coleta: quando ele desloga o scanner passa a olhar a lista de online a cada 5 segundos por 2 minutos (para pegar o relog do alt), quando morre olha a cada 10 segundos e, quando loga, o perfil dele é atualizado na hora. Se ficar online muitas horas seguidas entra em modo sombra." },
        { tip: "Personagens com alguma ligação de 50% ou mais já são tratados como alvo automaticamente." }
      ] },
      { icon: "investigation", title: "Investigação", blocks: [
        { p: "A Investigação reúne tudo sobre um personagem em uma tela, no estilo de um relatório de caso." },
        { steps: [
          "Digite o nome exato do personagem e clique em Investigar.",
          "À esquerda: ficha, heatmap, sessões dos últimos 30 dias (cada barra é um período online) e históricos.",
          "À direita: mini grafo com os suspeitos e a lista de suspeitos ordenada pela confiança.",
          "Cada suspeito traz a frase do detetive explicando o porquê e as evidências; clique numa evidência para ver as linhas cruas (por exemplo: 20:14:05 A deslogou / 20:14:17 B logou).",
          "Descartados mostra quem já foi visto online junto com ele e, por isso, nunca pode ser a mesma conta."
        ] },
        { p: "Exportar PNG salva o mini grafo; Exportar PDF gera um relatório com ficha, suspeitos, explicações e o grafo, no idioma e no fuso escolhidos." },
        { ex: { title: "Exemplo", text: "Abra a investigação do personagem Teste.", link: "#investigation/Teste" } }
      ] },
      { icon: "compare", title: "Comparador", blocks: [
        { p: "Coloca dois personagens lado a lado para você decidir se são a mesma pessoa." },
        { ul: [
          "Veredito no topo: a confiança e a explicação completa do par.",
          "Dois heatmaps: dourado para o personagem A e azul para o B. Alts costumam ocupar horários que se encaixam, sem nunca se sobrepor.",
          "Tabela de campos: vocação, level, residência, sexo, conta, comentário, loyalty, guilda e país; linhas em verde coincidem.",
          "Guildas em comum e lista de evidências do par, com as linhas cruas."
        ] },
        { ex: { title: "Exemplo", text: "Compare Teste com Teste 1 (mesma conta, relog em 7 dias).", link: "#compare/Teste/Teste 1" } }
      ] },
      { icon: "clusters", title: "Clusters", blocks: [
        { p: "Um cluster é um grupo de personagens que provavelmente pertence a uma mesma pessoa ou grupo. O scanner monta os clusters com o algoritmo Louvain usando só ligações de 50% ou mais." },
        { ul: [
          "A lista vem ordenada pela pontuação (confiança média × tamanho do grupo).",
          "Clique num nome para abrir a investigação daquele personagem.",
          "Ver no grafo leva ao grafo já centralizado nos membros do cluster."
        ] },
        { tip: "Um cluster grande com confiança média alta costuma ser uma pessoa com vários alts (makers, banks, bloqueadores)." }
      ] },
      { icon: "detective", title: "Detetive", blocks: [
        { p: "Faça a pergunta em linguagem natural com dois nomes e o scanner responde com uma explicação numerada." },
        { ul: [
          "Formatos aceitos: \"Teste e Teste 1\", \"Teste and Teste 1\", \"Teste och Teste 1\", \"Teste vs Teste 1\" ou \"Teste, Teste 1\".",
          "A resposta diz a chance, lista os motivos do mais forte para o mais fraco e avisa quando os dois NUNCA estiveram online juntos.",
          "Se os dois já foram vistos juntos, a resposta diz que não são a mesma conta e mostra quando isso aconteceu."
        ] },
        { ex: { title: "Exemplo de resposta", text: "Teste e Teste 1 têm 99% de chance de serem a mesma conta porque: (1) 7 logins-relog com média de 12s em 7 dias distintos, (2) nomes parecidos, (3) guilda em comum, (4) NUNCA online juntos.", link: "#detective" } }
      ] },
      { icon: "timeline", title: "Timeline e últimas 24h", blocks: [
        { h: "Timeline animada" },
        { p: "Mostra como a teia de ligações cresceu dia a dia. Arraste o controle ou clique em Reproduzir: cada ligação aparece no dia em que foi detectada pela primeira vez." },
        { h: "Últimas 24h" },
        { ul: [
          "Novos vínculos, relogs detectados (com o intervalo em segundos), pares descartados, banimentos, trocas de casa e entradas em guildas.",
          "Ao vivo: feed em tempo real (WebSocket) com logins, logouts, relogs, mortes e banimentos enquanto a página está aberta.",
          "Relogs e descartes também aparecem como avisos no canto da tela."
        ] }
      ] },
      { icon: "relog", title: "Como o scanner correlaciona", blocks: [
        { h: "Relog (a prova mais forte)" },
        { p: "Como uma conta não pode ter dois personagens online ao mesmo tempo, quem troca de personagem desloga e loga logo depois. O scanner registra toda vez que B loga até 30 segundos depois de A deslogar e calcula a chance de isso ser coincidência, considerando quantas vezes A costuma deslogar." },
        { ul: [
          "1 relog isolado: cerca de 35% (pode ser acaso).",
          "Relog em 2 dias diferentes: passa de 90%.",
          "Relog em 5 dias diferentes: 99%.",
          "Vários relogs no mesmo dia valem menos que relogs em dias diferentes."
        ] },
        { h: "Exclusão mútua (zera)" },
        { p: "Se os dois aparecem online na mesma leitura, mesmo uma única vez, é impossível serem a mesma conta. O par vai para 0% e é descartado para sempre, não importa quantas outras provas existam." },
        { h: "Sinais fracos somados" },
        { p: "Nome parecido, casa passada adiante, guilda em comum, ban no mesmo lote, comentário igual e horários parecidos somam de forma controlada: cada um reduz a chance de tudo ser coincidência. Exemplo: nome (10%) + casa (20%) + ban (15%) resulta em cerca de 40%, não em 99%." },
        { h: "Transitividade" },
        { p: "Se A é alt de B (99%) e B é alt de C (99%), o scanner infere A e C com 99% × 99% × 0,8 = 79% e desenha a linha tracejada. Nunca infere para pares já descartados." },
        { h: "Aliados e inimigos" },
        { p: "Aliados (azul): morreram juntos para o mesmo inimigo, mataram juntos (os dois aparecem na mesma morte) ou matam sempre as mesmas pessoas. Inimigos (laranja): um matou o outro. Os dois são placares separados da confiança de conta: quem joga junto ou se mata estava online ao mesmo tempo, então não é a mesma conta." }
      ] },
      { icon: "metadata", title: "Tipos de evidência", blocks: [
        { ev: [
          ["relog", "Correlação temporal", "A desloga e B loga em até 30s, repetidamente; também horários e duração de sessão parecidos."],
          ["exclusion", "Exclusão mútua", "Os dois foram vistos online juntos: descartado para sempre."],
          ["naming", "Nome similar", "Mesma raiz de nome ignorando títulos (Sir, Lord, Maker, Bank...), mais forte com vocação diferente."],
          ["guild", "Guilda", "Guildas em comum, principalmente entrando e saindo nos mesmos dias."],
          ["house", "Casa", "A casa passou de um personagem para o outro no mesmo dia."],
          ["metadata", "Metadados fixos", "Comentário de perfil idêntico, mesmo lote de banimento, rename no mesmo dia."],
          ["network", "Aliados", "Morreram juntos, mataram juntos, matam as mesmas vítimas ou morreram no mesmo minuto."],
          ["enemy", "Inimizade", "Um matou o outro (PK). Nunca conta como amizade."],
          ["highscore", "Highscores", "Aparecem e somem juntos nos rankings (quando a coleta de highscores estiver ativa)."],
          ["transitive", "Inferido", "Ligação deduzida por um personagem em comum."]
        ] }
      ] },
      { icon: "clusters", title: "Exemplos de correlação", blocks: [
        { p: "Os personagens Teste, Teste 1 a Teste 6 são dados de demonstração criados para mostrar cada situação." },
        { ex: { title: "Mesma conta: Teste e Teste 1 (99%)", text: "Teste desloga todo dia por volta das 21h30 e Teste 1 loga 12 segundos depois, em 7 dias diferentes. Os dois nunca foram vistos juntos.", link: "#compare/Teste/Teste 1" } },
        { ex: { title: "Inferido: Teste e Teste 2 (79%, tracejado)", text: "Teste 2 faz relog depois do Teste 1 e tem o mesmo comentário de perfil. Como Teste já é alt do Teste 1, o scanner infere Teste e Teste 2.", link: "#investigation/Teste 2" } },
        { ex: { title: "Suspeita moderada: Teste e Teste 3 (39%)", text: "A casa do Teste passou para o Teste 3 no mesmo dia e os dois foram banidos no mesmo minuto pelo mesmo motivo. Sinais fracos: vale investigar, não concluir.", link: "#compare/Teste/Teste 3" } },
        { ex: { title: "Descartado: Teste e Teste 4 (0%)", text: "Houve um relog que parecia suspeito, mas depois os dois apareceram online ao mesmo tempo. A exclusão mútua zera o par para sempre.", link: "#compare/Teste/Teste 4" } },
        { ex: { title: "Aliados: Teste e Teste 5 (azul)", text: "Morreram juntos para dragon lords em três dias. Estavam online juntos: não é alt, é parceiro de hunt.", link: "#compare/Teste/Teste 5" } },
        { ex: { title: "Inimigos: Teste 5 e Teste 6 (laranja)", text: "Teste 6 matou o Teste 5 quatro vezes. Aparece como inimizade, nunca como amizade.", link: "#compare/Teste 5/Teste 6" } }
      ] },
      { icon: "live", title: "Coleta, dicas e limites", blocks: [
        { h: "Como a coleta funciona" },
        { ul: [
          "Lista de online: a cada 15s no horário de pico (18h às 2h), 30s no intermediário e 45s de madrugada.",
          "Últimas mortes a cada 1 a 3 minutos, banimentos e guildas a cada 30 minutos, casas a cada 6 horas e perfis aos poucos (alvos primeiro).",
          "Se o site demorar ou bloquear, o scanner espera cada vez mais (30s, 1, 2, 5... até 60 minutos) e volta ao normal na primeira resposta boa."
        ] },
        { h: "Dicas" },
        { ul: [
          "Comece pela Investigação de quem você quer entender e depois use o Comparador nos suspeitos.",
          "Desconfie de ligações só por horário parecido: muita gente joga no horário nobre.",
          "Um único relog é só uma pista; espere repetições em dias diferentes.",
          "Marque como alvo quem você está acompanhando para a coleta ficar mais precisa."
        ] },
        { warn: "Os dados vêm de páginas públicas e o resultado é estatístico. Não use o scanner para expor, perseguir ou acusar ninguém sem confirmação." }
      ] }
    ],
    "en": [
      { icon: "logo", title: "Welcome to Tibia Scanner", blocks: [
        { p: "Tibia Scanner watches the Miracle server 24 hours a day and looks for characters that probably belong to the same account (alts) or to people who know each other. It accesses nothing private: it only uses public pages of the website (who is online, latest deaths, bans, houses, guilds and profiles)." },
        { h: "What the % means" },
        { p: "Every link between two characters has a confidence from 0% to 99%. It is the estimated chance that both are the same account, computed from the evidence found. The scanner never shows 100%: probability is not certainty." },
        { ul: [
          "Green (80% or more): strong, repeated evidence, almost always relogs on several days.",
          "Yellow (50% to 79%): serious suspicion, usually inferred or with few repetitions.",
          "Grey (below 50%): weak signals such as a similar name or the same guild.",
          "Blue: allies (they play together), not the same account.",
          "Dotted orange: enemies (one killed the other), not the same account."
        ] },
        { warn: "Treat the result as a lead, never as the only proof. Friends who take turns at the same hours can look like alts; always check the raw evidence." },
        { tip: "The data grows over time. In the first days the graph is almost empty; after a week of collection relogs start to show up strongly." }
      ] },
      { icon: "globe", title: "Getting started", blocks: [
        { steps: [
          "Log in with the password on the login screen. The session lasts 2 hours; after that the site asks for the password again.",
          "At the top, choose the language (PT, EN or SV). The switch is instant and does not reload the page.",
          "Choose the timezone (UTC, Brazil or Sweden). Every date and the heatmap use it; the badge next to it (for example UTC−3) shows the offset from UTC.",
          "Use the sun/moon button to switch between dark and light theme.",
          "On a phone, the menu is behind the three-line button in the top left corner."
        ] },
        { h: "Health indicator" },
        { ul: [
          "Green (Online): the scanner is collecting normally.",
          "Yellow (Unstable): the Miracle website was slow or refused; the scanner is waiting before trying again.",
          "Red (Offline): the scanner server does not answer or has been stopped for more than 30 minutes."
        ] },
        { tip: "Hover over the indicator to see the time of the last poll and the collection mode (peak, intermediate, quiet or cooldown)." }
      ] },
      { icon: "graph", title: "Graph", blocks: [
        { p: "The graph is the overall map. Each dot is a character and each line is a link that was found." },
        { ul: [
          "Dot colour: characters in the same cluster (probable group) share a colour.",
          "Thick red border: character marked as a target.",
          "Line colour and width: the thicker and greener, the higher the confidence.",
          "Dashed line: link inferred by transitivity (A links to B and B links to C, so A probably links to C).",
          "Blue line: allies; both were online together, so they are not the same account, but they play together.",
          "Dotted orange line: enemies; one killed the other.",
          "Hover over a line to see the confidence and the evidence types with icons."
        ] },
        { h: "Filters" },
        { ul: [
          "Search character: shows only links of names containing that text.",
          "Confidence range: starts at 85% by default, showing only strong links. Lower it to see weaker suspicions.",
          "Time window: shows only links that appeared in the last 7, 30 or 90 days.",
          "Vocation and guild: limit the characters shown.",
          "Evidence type: tick one or more types to see only links that have that proof.",
          "Show allies and enemies: turns the blue and orange lines on or off."
        ] },
        { tip: "Click any dot to open the side panel with the full profile. Export PNG saves the graph image exactly as it is on screen." },
        { ex: { title: "Try it", text: "Type \"teste\" in the graph search: Teste and the demo alts appear.", link: "#graph" } }
      ] },
      { icon: "target", title: "Character panel and targets", blocks: [
        { p: "Clicking a character on the graph opens a panel on the right with:" },
        { ul: [
          "Profile: level, vocation, residence, guild, account type, last login and when the scanner first saw it.",
          "Activity heatmap: day of week × hour; the stronger the colour, the more time online at that hour.",
          "Evidence list: every linked character with % and icons; clicking opens the comparison.",
          "History of guilds, houses, bans, deaths and kills."
        ] },
        { h: "Mark as target" },
        { p: "A target gets special attention from the collector: when it logs out the scanner reads the online list every 5 seconds for 2 minutes (to catch the alt's relog), when it dies every 10 seconds, and when it logs in its profile is refreshed right away. If it stays online for many hours in a row it enters shadow mode." },
        { tip: "Characters with any link of 50% or more are already treated as targets automatically." }
      ] },
      { icon: "investigation", title: "Investigation", blocks: [
        { p: "The Investigation gathers everything about one character on a single screen, like a case report." },
        { steps: [
          "Type the exact character name and click Investigate.",
          "On the left: profile, heatmap, sessions of the last 30 days (each bar is an online period) and histories.",
          "On the right: mini graph with the suspects and the suspect list ordered by confidence.",
          "Each suspect has the detective sentence explaining why and the evidence; click an item to see the raw lines (for example: 20:14:05 A logged out / 20:14:17 B logged in).",
          "Ruled out lists everyone already seen online together with it, who can therefore never be the same account."
        ] },
        { p: "Export PNG saves the mini graph; Export PDF creates a report with profile, suspects, explanations and graph, in the chosen language and timezone." },
        { ex: { title: "Example", text: "Open the investigation of the character Teste.", link: "#investigation/Teste" } }
      ] },
      { icon: "compare", title: "Compare", blocks: [
        { p: "Puts two characters side by side so you can decide whether they are the same person." },
        { ul: [
          "Verdict at the top: the confidence and the full explanation of the pair.",
          "Two heatmaps: gold for character A and blue for B. Alts usually fill hours that fit together without ever overlapping.",
          "Field table: vocation, level, residence, sex, account, comment, loyalty, guild and country; green rows match.",
          "Guilds in common and the evidence list of the pair, with raw lines."
        ] },
        { ex: { title: "Example", text: "Compare Teste with Teste 1 (same account, relog on 7 days).", link: "#compare/Teste/Teste 1" } }
      ] },
      { icon: "clusters", title: "Clusters", blocks: [
        { p: "A cluster is a group of characters that probably belongs to one person or group. The scanner builds clusters with the Louvain algorithm using only links of 50% or more." },
        { ul: [
          "The list is sorted by score (average confidence × group size).",
          "Click a name to open that character's investigation.",
          "Show on graph opens the graph already centred on the cluster members."
        ] },
        { tip: "A large cluster with high average confidence is usually one person with several alts (makers, banks, blockers)." }
      ] },
      { icon: "detective", title: "Detective", blocks: [
        { p: "Ask in plain language with two names and the scanner answers with a numbered explanation." },
        { ul: [
          "Accepted forms: \"Teste e Teste 1\", \"Teste and Teste 1\", \"Teste och Teste 1\", \"Teste vs Teste 1\" or \"Teste, Teste 1\".",
          "The answer gives the chance, lists the reasons from strongest to weakest and says when the two were NEVER online together.",
          "If the two were already seen together, the answer says they are not the same account and shows when it happened."
        ] },
        { ex: { title: "Sample answer", text: "Teste and Teste 1 have 99% chance of being the same account because: (1) 7 relog logins averaging 12s over 7 distinct days, (2) similar names, (3) guild in common, (4) NEVER online together.", link: "#detective" } }
      ] },
      { icon: "timeline", title: "Timeline and last 24h", blocks: [
        { h: "Animated timeline" },
        { p: "Shows how the web of links grew day by day. Drag the slider or click Play: each link appears on the day it was first detected." },
        { h: "Last 24h" },
        { ul: [
          "New links, detected relogs (with the gap in seconds), ruled-out pairs, bans, house changes and guild joins.",
          "Live: real-time feed (WebSocket) with logins, logouts, relogs, deaths and bans while the page is open.",
          "Relogs and rule-outs also pop up as notices in the corner of the screen."
        ] }
      ] },
      { icon: "relog", title: "How the scanner correlates", blocks: [
        { h: "Relog (the strongest proof)" },
        { p: "An account cannot have two characters online at once, so whoever switches characters logs out and logs in right after. The scanner records every time B logs in up to 30 seconds after A logs out and computes the chance of that being a coincidence, taking into account how often A usually logs out." },
        { ul: [
          "1 isolated relog: about 35% (may be chance).",
          "Relog on 2 different days: above 90%.",
          "Relog on 5 different days: 99%.",
          "Several relogs on the same day are worth less than relogs on different days."
        ] },
        { h: "Mutual exclusion (resets to zero)" },
        { p: "If both appear online in the same reading, even once, they cannot be the same account. The pair goes to 0% and is ruled out forever, no matter how much other evidence exists." },
        { h: "Weak signals added up" },
        { p: "Similar name, house handed over, guild in common, same ban batch, identical comment and similar hours add up in a controlled way: each one lowers the chance that everything is a coincidence. Example: name (10%) + house (20%) + ban (15%) gives about 40%, not 99%." },
        { h: "Transitivity" },
        { p: "If A is an alt of B (99%) and B is an alt of C (99%), the scanner infers A and C at 99% × 99% × 0.8 = 79% and draws a dashed line. It never infers for pairs already ruled out." },
        { h: "Allies and enemies" },
        { p: "Allies (blue): died together to the same enemy, killed together (both in the same death) or keep killing the same people. Enemies (orange): one killed the other. Both are scores separate from account confidence: people who play together or kill each other were online at the same time, so they are not the same account." }
      ] },
      { icon: "metadata", title: "Evidence types", blocks: [
        { ev: [
          ["relog", "Temporal correlation", "A logs out and B logs in within 30s, repeatedly; also similar hours and session length."],
          ["exclusion", "Mutual exclusion", "Both were seen online together: ruled out forever."],
          ["naming", "Similar name", "Same name root ignoring titles (Sir, Lord, Maker, Bank...), stronger with a different vocation."],
          ["guild", "Guild", "Guilds in common, especially joining and leaving on the same days."],
          ["house", "House", "The house passed from one character to the other on the same day."],
          ["metadata", "Fixed metadata", "Identical profile comment, same ban batch, rename on the same day."],
          ["network", "Allies", "Died together, killed together, kill the same victims or died in the same minute."],
          ["enemy", "Enmity", "One killed the other (PK). Never counts as friendship."],
          ["highscore", "Highscores", "Appear and vanish together on the rankings (when highscore collection is enabled)."],
          ["transitive", "Inferred", "Link deduced through a character in common."]
        ] }
      ] },
      { icon: "clusters", title: "Correlation examples", blocks: [
        { p: "The characters Teste, Teste 1 to Teste 6 are demo data created to show each situation." },
        { ex: { title: "Same account: Teste and Teste 1 (99%)", text: "Teste logs out every day around 21:30 and Teste 1 logs in 12 seconds later, on 7 different days. They were never seen together.", link: "#compare/Teste/Teste 1" } },
        { ex: { title: "Inferred: Teste and Teste 2 (79%, dashed)", text: "Teste 2 relogs after Teste 1 and has the same profile comment. Since Teste is already an alt of Teste 1, the scanner infers Teste and Teste 2.", link: "#investigation/Teste 2" } },
        { ex: { title: "Moderate suspicion: Teste and Teste 3 (39%)", text: "Teste's house passed to Teste 3 on the same day and both were banned in the same minute for the same reason. Weak signals: worth investigating, not concluding.", link: "#compare/Teste/Teste 3" } },
        { ex: { title: "Ruled out: Teste and Teste 4 (0%)", text: "There was a relog that looked suspicious, but later both appeared online at the same time. Mutual exclusion resets the pair forever.", link: "#compare/Teste/Teste 4" } },
        { ex: { title: "Allies: Teste and Teste 5 (blue)", text: "They died together to dragon lords on three days. They were online together: not an alt, a hunting partner.", link: "#compare/Teste/Teste 5" } },
        { ex: { title: "Enemies: Teste 5 and Teste 6 (orange)", text: "Teste 6 killed Teste 5 four times. It shows up as enmity, never as friendship.", link: "#compare/Teste 5/Teste 6" } }
      ] },
      { icon: "live", title: "Collection, tips and limits", blocks: [
        { h: "How collection works" },
        { ul: [
          "Online list: every 15s at peak time (18:00 to 02:00), 30s at intermediate hours and 45s late at night.",
          "Latest deaths every 1 to 3 minutes, bans and guilds every 30 minutes, houses every 6 hours and profiles little by little (targets first).",
          "If the site is slow or blocks, the scanner waits longer each time (30s, 1, 2, 5... up to 60 minutes) and returns to normal on the first good answer."
        ] },
        { h: "Tips" },
        { ul: [
          "Start with the Investigation of whoever you want to understand, then use Compare on the suspects.",
          "Be wary of links based only on similar hours: many people play at prime time.",
          "A single relog is just a lead; wait for repetitions on different days.",
          "Mark the characters you follow as targets so collection gets more precise."
        ] },
        { warn: "The data comes from public pages and the result is statistical. Do not use the scanner to expose, harass or accuse anyone without confirmation." }
      ] }
    ],
    "sv": [
      { icon: "logo", title: "Välkommen till Tibia Scanner", blocks: [
        { p: "Tibia Scanner bevakar servern Miracle dygnet runt och letar efter karaktärer som troligen tillhör samma konto (alts) eller personer som känner varandra. Den kommer inte åt något privat: den använder bara webbplatsens offentliga sidor (vem som är online, senaste dödsfall, avstängningar, hus, gillen och profiler)." },
        { h: "Vad procenten betyder" },
        { p: "Varje koppling mellan två karaktärer har en konfidens från 0% till 99%. Det är den uppskattade chansen att båda är samma konto, beräknad utifrån de bevis som hittats. Skannern visar aldrig 100%: sannolikhet är inte säkerhet." },
        { ul: [
          "Grön (80% eller mer): starka, upprepade bevis, nästan alltid relog under flera dagar.",
          "Gul (50% till 79%): allvarlig misstanke, oftast härledd eller med få upprepningar.",
          "Grå (under 50%): svaga signaler, som liknande namn eller samma gille.",
          "Blå: allierade (spelar tillsammans), inte samma konto.",
          "Prickig orange: fiender (den ena dödade den andra), inte samma konto."
        ] },
        { warn: "Använd resultatet som ledtråd, aldrig som enda bevis. Vänner som turas om vid samma tider kan se ut som alts; kontrollera alltid de råa bevisen." },
        { tip: "Datan växer med tiden. De första dagarna är grafen nästan tom; efter en veckas insamling börjar relogs synas tydligt." }
      ] },
      { icon: "globe", title: "Kom igång", blocks: [
        { steps: [
          "Logga in med lösenordet på inloggningssidan. Sessionen varar i 2 timmar; därefter ber sidan om lösenordet igen.",
          "Välj språk högst upp (PT, EN eller SV). Bytet sker direkt utan att sidan laddas om.",
          "Välj tidszon (UTC, Brasilien eller Sverige). Alla datum och heatmap använder den; märket bredvid (till exempel UTC+2) visar skillnaden mot UTC.",
          "Använd sol/måne-knappen för att växla mellan mörkt och ljust tema.",
          "På mobilen finns menyn bakom knappen med tre streck uppe till vänster."
        ] },
        { h: "Hälsoindikator" },
        { ul: [
          "Grön (Online): skannern samlar in som vanligt.",
          "Gul (Instabil): Miracles webbplats var långsam eller vägrade; skannern väntar innan den försöker igen.",
          "Röd (Offline): skannerns server svarar inte eller har stått still i mer än 30 minuter."
        ] },
        { tip: "Håll muspekaren över indikatorn för att se tiden för senaste poll och insamlingsläget (topp, mellan, lugnt eller cooldown)." }
      ] },
      { icon: "graph", title: "Graf", blocks: [
        { p: "Grafen är översiktskartan. Varje prick är en karaktär och varje linje är en funnen koppling." },
        { ul: [
          "Prickens färg: karaktärer i samma kluster (trolig grupp) har samma färg.",
          "Tjock röd kant: karaktär markerad som mål.",
          "Linjens färg och tjocklek: ju tjockare och grönare, desto högre konfidens.",
          "Streckad linje: koppling härledd genom transitivitet (A kopplas till B och B till C, alltså kopplas A troligen till C).",
          "Blå linje: allierade; båda var online samtidigt, så de är inte samma konto men spelar tillsammans.",
          "Prickig orange linje: fiender; den ena dödade den andra.",
          "Håll muspekaren över en linje för att se konfidensen och bevistyperna med ikoner."
        ] },
        { h: "Filter" },
        { ul: [
          "Sök karaktär: visar bara kopplingar för namn som innehåller texten.",
          "Konfidensintervall: börjar på 85% som standard och visar bara starka kopplingar. Sänk reglaget för att se svagare misstankar.",
          "Tidsfönster: visar bara kopplingar som uppstått de senaste 7, 30 eller 90 dagarna.",
          "Yrke och gille: begränsar vilka karaktärer som visas.",
          "Bevistyp: kryssa i en eller flera typer för att bara se kopplingar med det beviset.",
          "Visa allierade och fiender: slår på eller av de blå och orange linjerna."
        ] },
        { tip: "Klicka på en prick för att öppna sidopanelen med hela profilen. Exportera PNG sparar grafen precis som den ser ut på skärmen." },
        { ex: { title: "Prova", text: "Skriv \"teste\" i grafens sökfält: Teste och demo-altsen visas.", link: "#graph" } }
      ] },
      { icon: "target", title: "Karaktärspanel och mål", blocks: [
        { p: "Klickar du på en karaktär i grafen öppnas en panel till höger med:" },
        { ul: [
          "Profil: nivå, yrke, hemort, gille, kontotyp, senaste inloggning och när skannern såg den första gången.",
          "Aktivitets-heatmap: veckodag × timme; ju starkare färg, desto mer tid online den timmen.",
          "Bevislista: alla kopplade karaktärer med % och ikoner; ett klick öppnar jämförelsen.",
          "Historik över gillen, hus, avstängningar, dödsfall och dödanden."
        ] },
        { h: "Markera som mål" },
        { p: "Ett mål får särskild uppmärksamhet: när det loggar ut läser skannern onlinelistan var 5:e sekund i 2 minuter (för att fånga altens relog), när det dör var 10:e sekund, och när det loggar in uppdateras profilen direkt. Är det online många timmar i sträck går det in i skuggläge." },
        { tip: "Karaktärer med någon koppling på 50% eller mer behandlas redan automatiskt som mål." }
      ] },
      { icon: "investigation", title: "Utredning", blocks: [
        { p: "Utredningen samlar allt om en karaktär på en skärm, som en ärenderapport." },
        { steps: [
          "Skriv karaktärens exakta namn och klicka på Utred.",
          "Till vänster: profil, heatmap, sessioner de senaste 30 dagarna (varje stapel är en period online) och historik.",
          "Till höger: minigraf med de misstänkta och listan över misstänkta sorterad efter konfidens.",
          "Varje misstänkt har detektivens mening som förklarar varför och bevisen; klicka på ett bevis för att se de råa raderna (till exempel: 20:14:05 A loggade ut / 20:14:17 B loggade in).",
          "Uteslutna visar alla som setts online samtidigt med den och därför aldrig kan vara samma konto."
        ] },
        { p: "Exportera PNG sparar minigrafen; Exportera PDF skapar en rapport med profil, misstänkta, förklaringar och graf, på valt språk och i vald tidszon." },
        { ex: { title: "Exempel", text: "Öppna utredningen av karaktären Teste.", link: "#investigation/Teste" } }
      ] },
      { icon: "compare", title: "Jämför", blocks: [
        { p: "Visar två karaktärer sida vid sida så att du kan avgöra om de är samma person." },
        { ul: [
          "Utlåtande högst upp: konfidensen och hela förklaringen för paret.",
          "Två heatmaps: guld för karaktär A och blå för B. Alts brukar fylla tider som passar ihop utan att någonsin överlappa.",
          "Fälttabell: yrke, nivå, hemort, kön, konto, kommentar, loyalty, gille och land; gröna rader matchar.",
          "Gemensamma gillen och parets bevislista med råa rader."
        ] },
        { ex: { title: "Exempel", text: "Jämför Teste med Teste 1 (samma konto, relog under 7 dagar).", link: "#compare/Teste/Teste 1" } }
      ] },
      { icon: "clusters", title: "Kluster", blocks: [
        { p: "Ett kluster är en grupp karaktärer som troligen tillhör samma person eller grupp. Skannern bygger klustren med Louvain-algoritmen och använder bara kopplingar på 50% eller mer." },
        { ul: [
          "Listan sorteras efter poäng (genomsnittlig konfidens × gruppens storlek).",
          "Klicka på ett namn för att öppna den karaktärens utredning.",
          "Visa i grafen öppnar grafen centrerad på klustrets medlemmar."
        ] },
        { tip: "Ett stort kluster med hög genomsnittlig konfidens är oftast en person med flera alts (makers, banker, blockers)." }
      ] },
      { icon: "detective", title: "Detektiv", blocks: [
        { p: "Ställ frågan med vanliga ord och två namn, så svarar skannern med en numrerad förklaring." },
        { ul: [
          "Godkända former: \"Teste e Teste 1\", \"Teste and Teste 1\", \"Teste och Teste 1\", \"Teste vs Teste 1\" eller \"Teste, Teste 1\".",
          "Svaret anger chansen, listar skälen från starkast till svagast och säger när de två ALDRIG varit online samtidigt.",
          "Om de två redan setts tillsammans säger svaret att de inte är samma konto och visar när det hände."
        ] },
        { ex: { title: "Exempelsvar", text: "Teste och Teste 1 har 99% chans att vara samma konto eftersom: (1) 7 relog-inloggningar med i snitt 12s under 7 olika dagar, (2) liknande namn, (3) gemensamt gille, (4) ALDRIG online samtidigt.", link: "#detective" } }
      ] },
      { icon: "timeline", title: "Tidslinje och senaste 24h", blocks: [
        { h: "Animerad tidslinje" },
        { p: "Visar hur nätet av kopplingar växte dag för dag. Dra i reglaget eller klicka på Spela: varje koppling dyker upp den dag den först upptäcktes." },
        { h: "Senaste 24h" },
        { ul: [
          "Nya kopplingar, upptäckta relogs (med intervallet i sekunder), uteslutna par, avstängningar, husbyten och gilleinträden.",
          "Live: realtidsflöde (WebSocket) med inloggningar, utloggningar, relogs, dödsfall och avstängningar medan sidan är öppen.",
          "Relogs och uteslutningar visas också som notiser i skärmens hörn."
        ] }
      ] },
      { icon: "relog", title: "Hur skannern korrelerar", blocks: [
        { h: "Relog (det starkaste beviset)" },
        { p: "Ett konto kan inte ha två karaktärer online samtidigt, så den som byter karaktär loggar ut och loggar in direkt efter. Skannern registrerar varje gång B loggar in upp till 30 sekunder efter att A loggat ut och beräknar chansen att det är en slump, med hänsyn till hur ofta A brukar logga ut." },
        { ul: [
          "1 enstaka relog: cirka 35% (kan vara slump).",
          "Relog under 2 olika dagar: över 90%.",
          "Relog under 5 olika dagar: 99%.",
          "Flera relogs samma dag väger mindre än relogs olika dagar."
        ] },
        { h: "Ömsesidig uteslutning (nollställer)" },
        { p: "Om båda syns online i samma avläsning, även en enda gång, kan de inte vara samma konto. Paret går till 0% och utesluts för alltid, oavsett hur många andra bevis som finns." },
        { h: "Svaga signaler tillsammans" },
        { p: "Liknande namn, överlämnat hus, gemensamt gille, samma avstängningsomgång, identisk kommentar och liknande tider läggs ihop kontrollerat: var och en minskar chansen att allt är en slump. Exempel: namn (10%) + hus (20%) + avstängning (15%) ger cirka 40%, inte 99%." },
        { h: "Transitivitet" },
        { p: "Om A är alt till B (99%) och B är alt till C (99%) härleder skannern A och C till 99% × 99% × 0,8 = 79% och ritar en streckad linje. Den härleder aldrig för par som redan uteslutits." },
        { h: "Allierade och fiender" },
        { p: "Allierade (blå): dog tillsammans mot samma fiende, dödade tillsammans (båda i samma dödsfall) eller dödar samma personer. Fiender (orange): den ena dödade den andra. Båda är poäng skilda från kontokonfidensen: de som spelar tillsammans eller dödar varandra var online samtidigt, så de är inte samma konto." }
      ] },
      { icon: "metadata", title: "Bevistyper", blocks: [
        { ev: [
          ["relog", "Tidsmässig korrelation", "A loggar ut och B loggar in inom 30 s, upprepade gånger; även liknande tider och sessionslängd."],
          ["exclusion", "Ömsesidig uteslutning", "Båda sågs online samtidigt: utesluten för alltid."],
          ["naming", "Liknande namn", "Samma namnrot utan titlar (Sir, Lord, Maker, Bank...), starkare med olika yrke."],
          ["guild", "Gille", "Gemensamma gillen, särskilt inträde och utträde samma dagar."],
          ["house", "Hus", "Huset gick från den ena karaktären till den andra samma dag."],
          ["metadata", "Fast metadata", "Identisk profilkommentar, samma avstängningsomgång, namnbyte samma dag."],
          ["network", "Allierade", "Dog tillsammans, dödade tillsammans, dödar samma offer eller dog samma minut."],
          ["enemy", "Fiendskap", "Den ena dödade den andra (PK). Räknas aldrig som vänskap."],
          ["highscore", "Highscores", "Dyker upp och försvinner tillsammans på topplistorna (när insamling av highscores är aktiv)."],
          ["transitive", "Härledd", "Koppling härledd via en gemensam karaktär."]
        ] }
      ] },
      { icon: "clusters", title: "Korrelationsexempel", blocks: [
        { p: "Karaktärerna Teste, Teste 1 till Teste 6 är demodata som skapats för att visa varje situation." },
        { ex: { title: "Samma konto: Teste och Teste 1 (99%)", text: "Teste loggar ut varje dag runt 21:30 och Teste 1 loggar in 12 sekunder senare, under 7 olika dagar. De har aldrig setts tillsammans.", link: "#compare/Teste/Teste 1" } },
        { ex: { title: "Härledd: Teste och Teste 2 (79%, streckad)", text: "Teste 2 gör relog efter Teste 1 och har samma profilkommentar. Eftersom Teste redan är alt till Teste 1 härleder skannern Teste och Teste 2.", link: "#investigation/Teste 2" } },
        { ex: { title: "Måttlig misstanke: Teste och Teste 3 (39%)", text: "Testes hus gick till Teste 3 samma dag och båda stängdes av samma minut av samma skäl. Svaga signaler: värt att utreda, inte att dra slutsatser av.", link: "#compare/Teste/Teste 3" } },
        { ex: { title: "Utesluten: Teste och Teste 4 (0%)", text: "Det fanns en relog som såg misstänkt ut, men senare var båda online samtidigt. Ömsesidig uteslutning nollställer paret för alltid.", link: "#compare/Teste/Teste 4" } },
        { ex: { title: "Allierade: Teste och Teste 5 (blå)", text: "De dog tillsammans mot dragon lords tre dagar. De var online samtidigt: inte en alt utan en jaktkompis.", link: "#compare/Teste/Teste 5" } },
        { ex: { title: "Fiender: Teste 5 och Teste 6 (orange)", text: "Teste 6 dödade Teste 5 fyra gånger. Det visas som fiendskap, aldrig som vänskap.", link: "#compare/Teste 5/Teste 6" } }
      ] },
      { icon: "live", title: "Insamling, tips och begränsningar", blocks: [
        { h: "Hur insamlingen fungerar" },
        { ul: [
          "Onlinelistan: var 15:e sekund under topptid (18:00 till 02:00), var 30:e sekund mellan och var 45:e sekund på natten.",
          "Senaste dödsfall var 1 till 3 minuter, avstängningar och gillen var 30:e minut, hus var 6:e timme och profiler lite i taget (mål först).",
          "Om webbplatsen är långsam eller blockerar väntar skannern längre varje gång (30 s, 1, 2, 5... upp till 60 minuter) och går tillbaka till det normala vid första bra svar."
        ] },
        { h: "Tips" },
        { ul: [
          "Börja med Utredning av den du vill förstå och använd sedan Jämför på de misstänkta.",
          "Var skeptisk mot kopplingar som bara bygger på liknande tider: många spelar på bästa sändningstid.",
          "En enda relog är bara en ledtråd; vänta på upprepningar olika dagar.",
          "Markera karaktärerna du följer som mål så blir insamlingen mer exakt."
        ] },
        { warn: "Datan kommer från offentliga sidor och resultatet är statistiskt. Använd inte skannern för att hänga ut, trakassera eller anklaga någon utan bekräftelse." }
      ] }
    ]
  };
})();
