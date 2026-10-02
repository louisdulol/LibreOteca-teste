/**
 * Serviço de busca inteligente de resumos e sinopses ESTRITAMENTE EM PORTUGUÊS (pt-BR).
 * Garante que livros cadastrados no LibreOteca NUNCA recebam sinopses em inglês ou de outros livros.
 */

export interface ResumoResultado {
  sinopse: string;
  fonte: 'Base Nacional' | 'Wikipédia (pt-BR)' | 'Google Books (pt-BR)' | 'BrasilAPI';
}

function limparHtmlTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validador estrito de idioma Português:
 * Rejeita qualquer texto em inglês ou outros idiomas.
 */
export function isTextoEmPortugues(texto: string): boolean {
  if (!texto || texto.trim().length < 20) return false;
  const t = ` ${texto.toLowerCase().replace(/[^a-zà-ú\s]/g, ' ')} `;

  // Palavras e expressões inconfundivelmente em inglês
  const marcadoresIngles = [
    ' the ', ' and ', ' of ', ' with ', ' that ', ' this ', ' story ', ' from ',
    ' her ', ' his ', ' was ', ' were ', ' about ', ' would ', ' could ', ' she ',
    ' one of ', ' in the ', ' by the ', ' living in ', ' narrated by ', ' unfortunates ',
    ' slums ', ' eking ', ' loves ', ' boyfriend ', ' ugly ', ' underfed ', ' sickly ',
    ' unloved ', ' recoils ', ' misery ', ' doesn t ', ' seems ', ' territory ',
    ' published ', ' author ', ' novel ', ' which ', ' their ', ' they ', ' when ',
    ' what ', ' where ', ' there ', ' have ', ' been ', ' has ', ' life s ', ' tale is '
  ];

  for (const m of marcadoresIngles) {
    if (t.includes(m)) {
      return false; // Rejeição imediata se contiver marcadores de inglês
    }
  }

  // Contagem de palavras tipicamente em português
  const marcadoresPortugues = [
    ' de ', ' da ', ' do ', ' das ', ' dos ', ' em ', ' um ', ' uma ',
    ' com ', ' para ', ' não ', ' que ', ' seu ', ' sua ', ' este ', ' esta ',
    ' livro ', ' história ', ' personagem ', ' sobre ', ' narrativa ', ' vida ',
    ' por ', ' mais ', ' como ', ' ao ', ' aos ', ' na ', ' no ', ' nas ', ' nos ',
    ' romance ', ' obra ', ' autor ', ' autora ', ' literatura ', ' jovem '
  ];

  let contagemPortugues = 0;
  for (const w of marcadoresPortugues) {
    if (t.includes(w)) contagemPortugues++;
  }

  return contagemPortugues >= 2;
}

/**
 * Normaliza título para busca exata (remove pontuação e acentos)
 */
export function normalizarTituloBusca(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Base Curada de Resumos Oficiais e Consagrados da Literatura em Português
 */
const SINOPSE_CLASSICOS_PT: Record<string, string> = {
  'a hora da estrela':
    'Último livro publicado em vida por Clarice Lispector em 1977, A Hora da Estrela narra a comovente e áspera trajetória de Macabéa, uma jovem órfã alagoana que vive no Rio de Janeiro como datilógrafa. Alienada da própria miséria e alimentando-se de sonhos ingênuos, Macabéa tem sua rotina entrecortada pelo namorado Olímpico e pelas cartas da cartomante Madame Carlota. A obra é narrada pelo escritor fictício Rodrigo S.M., que reflete sobre o papel da escrita e o drama social da invisibilidade humana.',
  'hora da estrela':
    'Último livro publicado em vida por Clarice Lispector em 1977, A Hora da Estrela narra a comovente e áspera trajetória de Macabéa, uma jovem órfã alagoana que vive no Rio de Janeiro como datilógrafa. Alienada da própria miséria e alimentando-se de sonhos ingênuos, Macabéa tem sua rotina entrecortada pelo namorado Olímpico e pelas cartas da cartomante Madame Carlota. A obra é narrada pelo escritor fictício Rodrigo S.M., que reflete sobre o papel da escrita e o drama social da invisibilidade humana.',
  'dom casmurro':
    'Publicado em 1899, Dom Casmurro é um dos maiores clássicos de Machado de Assis e do Realismo brasileiro. Narrado em primeira pessoa pelo amargurado Bento Santiago (Bentinho), o romance reconstrói sua história de amor juvenil com a enigmática Capitu e seu melhor amigo Escobar, culminando em uma obsessão implacável e no eterno dilema sobre a traição.',
  'memorias postumas de bras cubas':
    'Marco inaugural do Realismo no Brasil (1881), a obra inova com a voz de um "defunto autor". Brás Cubas relata sua vida burguesa no Rio de Janeiro do século XIX com ironia cortante, pessimismo elegante e profunda reflexão filosófica sobre a hipocrisia das relações humanas.',
  'quincas borba':
    'Obra-prima de Machado de Assis (1891) que dá continuidade à filosofia humanitista ("Ao vencedor, as batatas!"). Rubião, pacato professor de Barbacena, herda a fortuna do filósofo Quincas Borba e parte para a corte no Rio de Janeiro, onde se torna vítima de parasitas sociais e de sua própria ilusão.',
  'o alienista':
    'Célebre novela de Machado de Assis ambientada em Itaguaí. O renomado Dr. Simão Bacamarte funda o hospício Casa Verde para estudar as patologias da mente humana, mas seus critérios científicos se tornam cada vez mais extremados, internando praticamente toda a população da vila.',
  'capitaes da areia':
    'Publicado em 1937 por Jorge Amado, retrata o cotidiano de um grupo de meninos abandonados que habitam um trapiche nas praias de Salvador. Liderados pelo corajoso Pedro Bala, os jovens enfrentam a hostilidade da sociedade e da polícia, revelando os contrastes de dor, liberdade, camaradagem e sobrevivência da infância marginalizada.',
  'gabriela cravo e canela':
    'Romance clássico de Jorge Amado ambientado na Ilhéus dos anos 1920. A chegada da retirante sertaneja Gabriela com seu aroma de cravo e cor de canela revoluciona o pacato cotidiano da cidade dos coronéis do cacau e o coração do comerciante árabe Nacib.',
  'tieta do agreste':
    'Famoso romance de Jorge Amado. Após mais de vinte anos de ausência, Tieta retorna rica e deslumbrante à pequena cidade baiana de Santana do Agreste, abalando a hipocrisia e a moralidade dos moradores locais com sua generosidade e espírito libertário.',
  'dona flor e seus dois maridos':
    'Obra de Jorge Amado que narra a história da professora de culinária Dona Flor em Salvador. Após a morte súbita do primeiro marido, o boêmio e sedutor Vadinho, Flor se casa com o metódico farmacêutico Teodoro, até que o fantasma de Vadinho retorna para dividir sua cama e coração.',
  'quarto de despejo':
    'Diário real e contundente de Carolina Maria de Jesus, catadora de papel na favela do Canindé em São Paulo nos anos 1950. A autora descreve com crueza poética e autenticidade a fome cotidiana, o preconceito, a maternidade e a luta pela dignidade humana em um dos documentos mais marcantes da literatura brasileira.',
  'torto arado':
    'Romance premiado de Itamar Vieira Junior ambientado no sertão da Chapada Diamantina. A trama segue as irmãs Bibiana e Belonísia após encontrarem uma misteriosa faca de prata na mala de sua avó, tecendo uma saga inesquecível sobre ancestralidade quilombola, trabalho na terra, resistência e espiritualidade.',
  'olhos dagua':
    'Coletânea premiada de contos de Conceição Evaristo. Com sua prosa marcada pela "escrevivência", a autora mergulha no cotidiano da população afro-brasileira nas periferias urbanas, retratando a dor, a maternidade, o afeto e a força ancestral das mulheres negras.',
  'o cortico':
    'Obra-prima do Naturalismo brasileiro de Aluísio Azevedo (1890). O romance disseca a vida agitada e promíscua em uma habitação coletiva no Rio de Janeiro, expondo as ambições do comerciante João Romão, a sensualidade de Rita Baiana e a degradação de Jerônimo sob o peso do meio social.',
  'vidas secas':
    'Publicado em 1938 por Graciliano Ramos, acompanha a saga da família de retirantes sertanejos composta por Fabiano, Sinhá Vitória, os dois filhos e a cadela Baleia, fugindo da seca impiedosa em busca de um lugar de sobrevivência e esperança no sertão.',
  'sao bernardo':
    'Romance psicológico de Graciliano Ramos (1934). Paulo Honório, homem rústico que construiu sua fazenda São Bernardo à custa de brutalidade e ambição desmedida, escreve suas memórias tentando compreender o suicídio de sua esposa Madalena.',
  'o pequeno principe':
    'Clássico atemporal de Antoine de Saint-Exupéry sobre um piloto que sofre um acidente no deserto do Saara e encontra um jovem príncipe vindo de um asteroide distante. Uma fábula poética sobre amizade, responsabilidade, amor e a capacidade de enxergar com o coração.',
  '1984':
    'Distopia magistral de George Orwell que introduziu o conceito do Grande Irmão (Big Brother). Na Oceania, sob o domínio do Partido e da Polícia do Pensamento, o funcionário Winston Smith ousa questionar a censura e o controle total da verdade.',
  'a revolucao dos bichos':
    'Fábula política de George Orwell em que os animais da Granja do Solar se rebelam contra seus donos humanos para construir uma sociedade de igualdade, até que os porcos assumem o poder e reproduzem a mesma opressão que prometeram combater.',
  'o alquimista':
    'Best-seller internacional de Paulo Coelho que narra a jornada do jovem pastor andaluz Santiago pelo deserto do Egito em busca de um tesouro nas Pirâmides, descobrindo o valor de perseguir sua Lenda Pessoal e escutar os sinais do universo.',
  'auto da compadecida':
    'Famosa peça teatral de Ariano Suassuna ambientada no sertão paraibano. João Grilo e Chicó utilizam de astúcia e esperteza para escapar da pobreza e dos poderosos locais, culminando em um célebre julgamento celestial intermediado pela Virgem Maria.',
  'grande sertao veredas':
    'Monumento literário de Guimarães Rosa (1956). O ex-jagunço Riobaldo narra ao interlocutor anônimo suas memórias de guerra nos sertões de Minas Gerais e Bahia, sua paixão enigmática por Diadorim e o eterno mistério sobre a existência do demônio.',
  'triste fim de policarpo quaresma':
    'Romance pré-modernista de Lima Barreto (1915). O patriota ingênuo Policarpo Quaresma propõe o tupi-guarani como língua oficial do Brasil e enfrenta a incompreensão, a burocracia e a truculência do regime de Floriano Peixoto.',
  'macunaima':
    'Rapsódia modernista de Mário de Andrade (1928). As aventuras do "herói sem nenhum caráter", nascido no fundo da mata virgem, em sua viagem a São Paulo para recuperar o amuleto sagrado muiraquitã tomado pelo gigante Piaimã.',
  'o tempo e o vento':
    'Magnum opus de Érico Veríssimo que recria dois séculos da história do Rio Grande do Sul através da saga épica da família Terra Cambará, desde a fundação de Santa Fé até os conflitos da Revolução Federalista.',
  'o quinze':
    'Romance pioneiro do regionalismo modernista de Rachel de Queiroz (1930), retratando a dramática seca de 1915 no Ceará através do drama dos retirantes Chico Bento e Cordulina e do amor entre Vicente e Conceição.',
  'morte e vida severina':
    'Auto de natal pernambucano em versos de João Cabral de Melo Neto. Acompanha a peregrinação do retirante Severino da serra da Borborema até o litoral do Recife, descobrindo a celebração da vida em meio à miséria sertaneja.',
  'ensaio sobre a cegueira':
    'Romance impactante de José Saramago. Uma epidemia de cegueira branca atinge subitamente uma cidade contemporânea, levando o governo a isolar os doentes em um manicômio onde o colapso moral e a luta brutal pela sobrevivência expõem a fragilidade humana.',
  'cem anos de solidao':
    'Obra-prima de Gabriel García Márquez e ápice do realismo mágico latino-americano. Narra as sete gerações da família Buendía e a ascensão e queda da lendária aldeia de Macondo.',
  'a metamorfose':
    'Célebre novela de Franz Kafka (1915). O caixeiro-viajante Gregor Samsa acorda certa manhã transformado em um inseto monstruoso, deflagrando o isolamento, a repulsa e a crueldade de sua própria família.',
  'a menina que roubava livros':
    'Romance emocionante de Markus Zusak ambientado na Alemanha nazista. Narrado pela própria Morte, acompanha a jovem Liesel Meminger, que encontra consolo e coragem roubando livros e aprendendo a ler com seu pai adotivo.',
  'o diario de anne frank':
    'Testemunho real e comovente da adolescente judia Anne Frank durante os dois anos em que viveu escondida com sua família em um anexo secreto em Amsterdã para escapar da perseguição nazista.',
  'meu pe de laranja lima':
    'Clássico comovente de José Mauro de Vasconcelos. A infância de Zezé, menino pobre de seis anos em Bangu, dotado de imaginação vívida e sensibilidade profunda, que conversa com seu pé de laranja lima e encontra afeto no generoso Portuga.',
  'a droga da obediencia':
    'Sucesso juvenil de Pedro Bandeira (1984). Os Karas — Miguel, Calú, Magrí, Crânio e Chumbinho — investigam o misterioso desaparecimento de estudantes em colégios de São Paulo e descobrem um plano sinistro para controlar a mente dos jovens.',
};

/**
 * Consulta a Wikipédia em Português com validação estrita do título
 */
async function buscarNaWikipediaPt(titulo: string): Promise<string | null> {
  try {
    const tituloBuscaNorm = normalizarTituloBusca(titulo);

    // 1. Tenta resumo direto pelo título
    const urlDireta = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(urlDireta, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (
        data.extract &&
        data.extract.length > 50 &&
        data.type !== 'disambiguation' &&
        isTextoEmPortugues(data.extract)
      ) {
        const pageTitleNorm = normalizarTituloBusca(data.title || '');
        if (
          pageTitleNorm.includes(tituloBuscaNorm) ||
          tituloBuscaNorm.includes(pageTitleNorm) ||
          tituloBuscaNorm.split(' ').some(w => w.length > 4 && pageTitleNorm.includes(w))
        ) {
          return data.extract.trim();
        }
      }
    }

    // 2. Tenta busca por texto na Wikipedia pt
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${titulo} livro romance`
    )}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const firstHit = searchData.query?.search?.[0];
      if (firstHit && firstHit.title) {
        const hitTitleNorm = normalizarTituloBusca(firstHit.title);
        // Garante que o resultado da Wikipedia realmente se refere ao livro pesquisado
        if (
          hitTitleNorm.includes(tituloBuscaNorm) ||
          tituloBuscaNorm.includes(hitTitleNorm) ||
          tituloBuscaNorm.split(' ').some(w => w.length > 4 && hitTitleNorm.includes(w))
        ) {
          const pageRes = await fetch(
            `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit.title)}`
          );
          if (pageRes.ok) {
            const pageData = await pageRes.json();
            if (
              pageData.extract &&
              pageData.extract.length > 50 &&
              pageData.type !== 'disambiguation' &&
              isTextoEmPortugues(pageData.extract)
            ) {
              return pageData.extract.trim();
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Busca Wikipédia pt falhou:', err);
  }
  return null;
}

/**
 * Consulta ao Google Books com restrição estrita de idioma em Português
 */
async function buscarNoGoogleBooksPt(
  titulo: string,
  autor?: string,
  isbn?: string
): Promise<string | null> {
  try {
    const isbnLimpo = isbn ? isbn.replace(/[^0-9X]/gi, '').toUpperCase() : '';
    let query = '';

    if (isbnLimpo) {
      query = `isbn:${isbnLimpo}`;
    } else if (autor) {
      query = `intitle:${encodeURIComponent(titulo.trim())}+inauthor:${encodeURIComponent(
        autor.trim()
      )}`;
    } else {
      query = `intitle:${encodeURIComponent(titulo.trim())}`;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=pt&hl=pt-BR&maxResults=4`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const tituloBuscaNorm = normalizarTituloBusca(titulo);

        for (const item of data.items) {
          const info = item.volumeInfo || {};
          const desc = info.description;
          const bookTitle = info.title ? normalizarTituloBusca(info.title) : '';

          // Validação: Garante que o livro do resultado corresponde à busca
          const tituloCombina =
            isbnLimpo ||
            bookTitle.includes(tituloBuscaNorm) ||
            tituloBuscaNorm.includes(bookTitle) ||
            (tituloBuscaNorm.split(' ').length > 1 &&
              tituloBuscaNorm.split(' ').filter(w => w.length > 3).some(w => bookTitle.includes(w)));

          if (!tituloCombina) continue;

          // Validação: Descrição deve existir e ser estritamente em português
          if (desc && desc.trim().length > 40) {
            const limpo = limparHtmlTags(desc);
            if (isTextoEmPortugues(limpo)) {
              return limpo;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Google Books pt-BR falhou:', err);
  }
  return null;
}

/**
 * Consulta à BrasilAPI por ISBN (garantido em Português)
 */
async function buscarNaBrasilApi(isbn: string): Promise<string | null> {
  const isbnLimpo = isbn.replace(/[^0-9X]/gi, '').toUpperCase();
  if (!isbnLimpo) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbnLimpo}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.synopsis && data.synopsis.trim().length > 30) {
        const limpo = data.synopsis.trim();
        if (isTextoEmPortugues(limpo)) {
          return limpo;
        }
      }
    }
  } catch (err) {
    console.warn('BrasilAPI falhou:', err);
  }
  return null;
}

/**
 * Função Principal de Busca de Resumo:
 * 1. Base Curada Nacional de Literatura em Português
 * 2. BrasilAPI (Cadastro Nacional do Livro por ISBN)
 * 3. Wikipédia pt-BR (com correspondência de título)
 * 4. Google Books pt-BR com langRestrict=pt e validador estrito de português
 */
export async function buscarResumoOnline(
  titulo: string,
  autor?: string,
  isbn?: string
): Promise<ResumoResultado | null> {
  const tituloLimpo = titulo ? titulo.trim() : '';
  const tituloNormalizado = normalizarTituloBusca(tituloLimpo);

  // 1. Base Curada Nacional em Português (Prioridade Absoluta)
  if (tituloNormalizado && SINOPSE_CLASSICOS_PT[tituloNormalizado]) {
    return {
      sinopse: SINOPSE_CLASSICOS_PT[tituloNormalizado],
      fonte: 'Base Nacional',
    };
  }

  // Correspondência por inclusão de chave
  for (const [chave, sinopse] of Object.entries(SINOPSE_CLASSICOS_PT)) {
    if (
      tituloNormalizado.includes(chave) ||
      (chave.length > 5 && chave.includes(tituloNormalizado))
    ) {
      return {
        sinopse,
        fonte: 'Base Nacional',
      };
    }
  }

  // 2. Consulta à BrasilAPI se houver ISBN
  if (isbn) {
    const sinopseBrasilApi = await buscarNaBrasilApi(isbn);
    if (sinopseBrasilApi) {
      return {
        sinopse: sinopseBrasilApi,
        fonte: 'BrasilAPI',
      };
    }
  }

  // 3. Consulta à Wikipédia em Português
  if (tituloLimpo && tituloLimpo.length >= 3) {
    const sinopseWiki = await buscarNaWikipediaPt(tituloLimpo);
    if (sinopseWiki) {
      return {
        sinopse: sinopseWiki,
        fonte: 'Wikipédia (pt-BR)',
      };
    }
  }

  // 4. Consulta ao Google Books com filtro estrito de português
  const sinopseGoogle = await buscarNoGoogleBooksPt(tituloLimpo, autor, isbn);
  if (sinopseGoogle) {
    return {
      sinopse: sinopseGoogle,
      fonte: 'Google Books (pt-BR)',
    };
  }

  return null;
}
