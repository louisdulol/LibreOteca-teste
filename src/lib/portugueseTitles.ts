/**
 * Mapeamento e resolutor de títulos em Português para livros estrangeiros e Open Library.
 * Garante que obras clássicas e contemporâneas apareçam com seus títulos oficiais em português.
 */

export const TITULOS_TRADUZIDOS_PT: Record<string, string> = {
  // Harry Potter
  'harry potter and the philosopher\'s stone': 'Harry Potter e a Pedra Filosofal',
  'harry potter and the sorcerer\'s stone': 'Harry Potter e a Pedra Filosofal',
  'harry potter and the chamber of secrets': 'Harry Potter e a Câmara Secreta',
  'the chamber of secrets': 'Harry Potter e a Câmara Secreta',
  'harry potter and the prisoner of azkaban': 'Harry Potter e o Prisioneiro de Azkaban',
  'harry potter and the goblet of fire': 'Harry Potter e o Cálice de Fogo',
  'harry potter and the order of the phoenix': 'Harry Potter e a Ordem da Fênix',
  'harry potter and the half-blood prince': 'Harry Potter e o Enigma do Príncipe',
  'harry potter and the deathly hallows': 'Harry Potter e as Relíquias da Morte',
  'fantastic beasts and where to find them': 'Animais Fantásticos e Onde Habitam',

  // Fantasia e Ficção Científica
  'the little prince': 'O Pequeno Príncipe',
  'the hobbit': 'O Hobbit',
  'the lord of the rings': 'O Senhor dos Anéis',
  'the fellowship of the ring': 'A Sociedade do Anel',
  'the two towers': 'As Duas Torres',
  'the return of the king': 'O Retorno do Rei',
  'the silmarillion': 'O Silmarillion',
  'nineteen eighty-four': '1984',
  '1984': '1984',
  'animal farm': 'A Revolução dos Bichos',
  'brave new world': 'Admirável Mundo Novo',
  'fahrenheit 451': 'Fahrenheit 451',
  'dune': 'Duna',
  'the hitchhiker\'s guide to the galaxy': 'O Guia do Mochileiro das Galáxias',
  'foundation': 'Fundação',
  'the chronicles of narnia': 'As Crônicas de Nárnia',
  'the lion, the witch and the wardrobe': 'O Leão, a Feiticeira e o Guarda-Roupa',
  'prince caspian': 'Príncipe Caspian',
  'the voyage of the dawn treader': 'A Viagem do Peregrino da Alvorada',
  'the silver chair': 'A Cadeira de Prata',
  'the horse and his boy': 'O Cavalo e seu Menino',
  'the magician\'s nephew': 'O Sobrinho do Mago',
  'the last battle': 'A Última Batalha',
  'percy jackson & the olympians': 'Percy Jackson e os Olimpianos',
  'the lightning thief': 'O Ladrão de Raios',
  'the sea of monsters': 'O Mar de Monstros',
  'the titan\'s curse': 'A Maldição do Titã',
  'the battle of the labyrinth': 'A Batalha do Labirinto',
  'the last olympian': 'O Último Olimpiano',
  'the hunger games': 'Jogos Vorazes',
  'catching fire': 'Em Chamas',
  'mockingjay': 'A Esperança',
  'the maze runner': 'Maze Runner: Correr ou Morrer',
  'divergent': 'Divergente',

  // Clássicos Universais
  'pride and prejudice': 'Orgulho e Preconceito',
  'sense and sensibility': 'Razão e Sensibilidade',
  'emma': 'Emma',
  'jane eyre': 'Jane Eyre',
  'wuthering heights': 'O Morro dos Ventos Uivantes',
  'frankenstein': 'Frankenstein',
  'dracula': 'Drácula',
  'the picture of dorian gray': 'O Retrato de Dorian Gray',
  'the great gatsby': 'O Grande Gatsby',
  'the catcher in the rye': 'O Apanhador no Campo de Centeio',
  'to kill a mockingbird': 'O Sol É para Todos',
  'crime and punishment': 'Crime e Castigo',
  'the brothers karamazov': 'Os Irmãos Karamázov',
  'war and peace': 'Guerra e Paz',
  'anna karenina': 'Anna Kariênina',
  'the death of ivan ilyich': 'A Morte de Ivan Ilitch',
  'the metamorphosis': 'A Metamorfose',
  'the trial': 'O Processo',
  'the castle': 'O Castelo',
  'don quixote': 'Dom Quixote',
  'don quijote': 'Dom Quixote',
  'les misérables': 'Os Miseráveis',
  'the hunchback of notre-dame': 'O Corcunda de Notre-Dame',
  'the count of monte cristo': 'O Conde de Monte Cristo',
  'the three musketeers': 'Os Três Mosqueteiros',
  'twenty thousand leagues under the sea': 'Vinte Mil Léguas Submarinas',
  'journey to the center of the earth': 'Viagem ao Centro da Terra',
  'around the world in eighty days': 'A Volta ao Mundo em Oitenta Dias',
  'the stranger': 'O Estrangeiro',
  'the plague': 'A Peste',
  'the myth of sisyphus': 'O Mito de Sísifo',
  'one hundred years of solitude': 'Cem Anos de Solidão',
  'love in the time of cholera': 'O Amor nos Tempos do Cólera',
  'the old man and the sea': 'O Velho e o Mar',
  'for whom the bell tolls': 'Por Quem os Sinos Dobram',
  'a farewell to arms': 'Adeus às Armas',
  'moby-dick': 'Moby Dick',
  'moby dick': 'Moby Dick',
  'the scarlet letter': 'A Letra Escarlate',
  'heart of darkness': 'O Coração das Trevas',
  'the sound and the fury': 'O Som e a Fúria',
  'in search of lost time': 'Em Busca do Tempo Perdido',
  'swann\'s way': 'No Caminho de Swann',
  'ulysses': 'Ulisses',
  'dubliners': 'Dublinenses',
  'a portrait of the artist as a young man': 'Retrato do Artista Quando Jovem',
  'the divine comedy': 'A Divina Comédia',
  'inferno': 'Inferno',
  'the odyssey': 'A Odisseia',
  'the iliad': 'A Ilíada',
  'the republic': 'A República',
  'the prince': 'O Príncipe',
  'meditations': 'Meditações',
  'beyond good and evil': 'Além do Bem e do Mal',
  'thus spoke zarathustra': 'Assim Falou Zaratustra',
  'the genealogy of morals': 'Genealogia da Moral',

  // Infantis e Juvenis Clássicos
  'alice\'s adventures in wonderland': 'Alice no País das Maravilhas',
  'alice in wonderland': 'Alice no País das Maravilhas',
  'through the looking-glass': 'Alice Através do Espelho',
  'peter pan': 'Peter Pan',
  'pinocchio': 'Pinóquio',
  'the adventures of pinocchio': 'As Aventuras de Pinóquio',
  'the wizard of oz': 'O Mágico de Oz',
  'the wonderful wizard of oz': 'O Mágico de Oz',
  'charlie and the chocolate factory': 'A Fantástica Fábrica de Chocolate',
  'matilda': 'Matilda',
  'the bfg': 'O Bom Gigante Amigo',
  'the secret garden': 'O Jardim Secreto',
  'a little princess': 'A Princesinha',
  'little women': 'Mulherzinhas',
  'anne of green gables': 'Anne de Green Gables',
  'the adventures of tom sawyer': 'As Aventuras de Tom Sawyer',
  'adventures of huckleberry finn': 'As Aventuras de Huckleberry Finn',
  'treasure island': 'A Ilha do Tesouro',
  'robinson crusoe': 'Robinson Crusoé',
  'gulliver\'s travels': 'As Viagens de Gulliver',
  'the call of the wild': 'O Chamado da Floresta',
  'white fang': 'Caninos Brancos',
  'the jungle book': 'O Livro da Selva',
  'the wind in the willows': 'O Vento nos Salgueiros',
  'winnie-the-pooh': 'O Ursinho Pooh',
  'charlotte\'s web': 'A Teia de Charlotte',
  'bridge to terabithia': 'Ponte para Terabítia',
  'the diary of a young girl': 'O Diário de Anne Frank',

  // Autores contemporâneos e não-ficção
  'the alchemist': 'O Alquimista',
  'sapiens: a brief history of humankind': 'Sapiens: Uma Breve História da Humanidade',
  'sapiens': 'Sapiens: Uma Breve História da Humanidade',
  'homo deus: a brief history of tomorrow': 'Homo Deus: Uma Breve História do Amanhã',
  'homo deus': 'Homo Deus',
  '21 lessons for the 21st century': '21 Lições para o Século 21',
  'thinking, fast and slow': 'Rápido e Devagar: Duas Formas de Pensar',
  'atomic habits': 'Hábitos Atômicos',
  'the power of habit': 'O Poder do Hábito',
  'man\'s search for meaning': 'Em Busca de Sentido',
  'the subtle art of not giving a f*ck': 'A Sutil Arte de Ligar o F*da-se',
  'steve jobs': 'Steve Jobs',
  'shoe dog': 'A Marca da Vitória',
  'educated': 'A Menina da Montanha',
  'becoming': 'Minha História',
  'born a crime': 'Nascido do Crime',
};

/**
 * Traduz título em inglês para português de forma imediata ou normalizada
 */
export function traduzirTituloParaPortugues(titulo: string): string {
  if (!titulo) return titulo;
  const limpo = titulo.trim();
  const chave = limpo.toLowerCase().replace(/['"]/g, '');

  // 1. Busca exata no dicionário
  if (TITULOS_TRADUZIDOS_PT[chave]) {
    return TITULOS_TRADUZIDOS_PT[chave];
  }

  // 2. Busca parcial (ex: "Harry Potter and the Chamber of Secrets (Collector's Edition)")
  for (const [en, pt] of Object.entries(TITULOS_TRADUZIDOS_PT)) {
    if (chave.startsWith(en) || chave.includes(`: ${en}`) || chave.includes(` - ${en}`)) {
      return pt;
    }
  }

  return limpo;
}

/**
 * Consulta a BrasilAPI buscando ISBN para dados 100% em português brasileiro
 */
export async function fetchBrasilApiByIsbn(isbnLimpo: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbnLimpo}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          titulo: normalizarCaixaTitulo(data.title),
          autor: Array.isArray(data.authors) && data.authors.length > 0
            ? data.authors.join(', ')
            : 'Autor Desconhecido',
          editora: data.publisher || undefined,
          ano_publicacao: data.year ? parseInt(data.year, 10) : undefined,
          paginas: data.page_count ? parseInt(data.page_count, 10) : undefined,
          sinopse: data.synopsis || undefined,
          categoria: data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0
            ? data.subjects[0]
            : undefined,
          capa_url: data.cover_url || undefined,
        };
      }
    }
  } catch {
    // Falha silenciosa para tentar próximo provedor
  }
  return null;
}

/**
 * Normaliza caixa alta excessiva comum em bancos de dados de ISBN (ex: "MEMORIAS POSTUMAS" -> "Memórias Póstumas")
 */
export function normalizarCaixaTitulo(str: string): string {
  if (!str) return str;
  // Se for todo em maiúsculas com mais de 5 caracteres, converter para Title Case
  if (str === str.toUpperCase() && str.length > 4) {
    const palavrasMinusculas = ['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'um', 'uma', 'por', 'com', 'para'];
    return str
      .toLowerCase()
      .split(' ')
      .map((palavra, index) => {
        if (index > 0 && palavrasMinusculas.includes(palavra)) {
          return palavra;
        }
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(' ');
  }
  return str;
}
