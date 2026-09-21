/**
 * Sistema Avançado de Identificação de Capas Reais de Livros
 * Busca em múltiplas fontes (Google Books, Open Library e Edições Brasileiras)
 * Valida se as imagens realmente carregam (elimina pixels vazios 1x1 e links quebrados)
 */

export interface RealCoverOption {
  url: string;
  urlOriginal?: string;
  tituloEdicao?: string;
  autor?: string;
  editora?: string;
  ano?: number;
  fonte: 'Google Books' | 'Open Library' | 'Arquivo Local' | 'Link Direto';
  resolucao?: string;
}

/**
 * Limpa URLs do Google Books para garantir HTTPS, remover distorções (edge=curl)
 * e obter a maior resolução possível
 */
export function cleanGoogleBooksCoverUrl(url: string, highRes = true): string {
  if (!url) return '';
  let clean = url.trim().replace(/^http:\/\//i, 'https://');
  clean = clean.replace(/&edge=curl/gi, '');

  if (highRes) {
    // Tenta solicitar zoom maior caso esteja em zoom=1
    if (clean.includes('zoom=1')) {
      clean = clean.replace('zoom=1', 'zoom=2');
    }
  }
  return clean;
}

/**
 * Constrói URL de capa do Open Library com default=false para evitar o GIF 1x1 vazio
 */
export function buildOpenLibraryCoverUrl(type: 'id' | 'isbn' | 'olid', val: string | number, size: 'L' | 'M' = 'L'): string {
  return `https://covers.openlibrary.org/b/${type}/${val}-${size}.jpg?default=false`;
}

/**
 * Valida no navegador se uma URL de imagem é real e possui dimensões visíveis
 * Rejeita erros de rede, imagens corrompidas e os pixels vazios 1x1 retornados por algumas APIs
 */
export function probeImage(url: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const img = new Image();
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        img.src = '';
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        // Rejeita imagens com menos de 10x10 (ex: pixels 1x1 de fallback do Open Library)
        if (img.naturalWidth > 15 && img.naturalHeight > 15) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    };

    img.onerror = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

/**
 * Busca exaustiva de capas reais na web por Título, Autor e/ou ISBN
 */
export async function findRealBookCovers(params: {
  titulo?: string;
  autor?: string;
  isbn?: string;
  termoLivre?: string;
}): Promise<RealCoverOption[]> {
  const { titulo, autor, isbn, termoLivre } = params;
  const rawQuery = (termoLivre || titulo || isbn || '').trim();
  if (!rawQuery && !isbn) return [];

  const candidateCovers: RealCoverOption[] = [];
  const cleanIsbnStr = isbn ? isbn.replace(/[^0-9X]/gi, '').toUpperCase() : '';

  // 1. Se tem ISBN, busca prioritária com ISBN direto no Google Books
  const promises: Promise<void>[] = [];

  // A) Google Books por ISBN
  if (cleanIsbnStr) {
    promises.push(
      (async () => {
        try {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbnStr}&maxResults=5`);
          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              for (const item of data.items) {
                const info = item.volumeInfo || {};
                if (info.imageLinks) {
                  const url =
                    info.imageLinks.extraLarge ||
                    info.imageLinks.large ||
                    info.imageLinks.medium ||
                    info.imageLinks.thumbnail ||
                    info.imageLinks.smallThumbnail;
                  if (url) {
                    const cleaned = cleanGoogleBooksCoverUrl(url, false);
                    candidateCovers.push({
                      url: cleaned,
                      tituloEdicao: info.title,
                      autor: info.authors?.join(', '),
                      editora: info.publisher,
                      ano: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : undefined,
                      fonte: 'Google Books',
                      resolucao: 'Edição ISBN exata',
                    });
                  }
                }
              }
            }
          }
        } catch {
          // ignora falha pontual
        }
      })()
    );

    // Open Library por ISBN direto
    candidateCovers.push({
      url: buildOpenLibraryCoverUrl('isbn', cleanIsbnStr, 'L'),
      tituloEdicao: titulo,
      autor,
      fonte: 'Open Library',
      resolucao: 'Alta resolução',
    });
  }

  // B) Google Books por Título e Autor (Encontra dezenas de edições com capas de editoras brasileiras)
  const queryParts: string[] = [];
  if (titulo) queryParts.push(`intitle:${titulo}`);
  if (autor) queryParts.push(`inauthor:${autor}`);
  const gbooksSearchQuery = queryParts.length > 0 ? queryParts.join('+') : encodeURIComponent(rawQuery);

  promises.push(
    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${gbooksSearchQuery}&maxResults=12&printType=books`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            for (const item of data.items) {
              const info = item.volumeInfo || {};
              if (info.imageLinks) {
                // Tenta extrair a capa de melhor resolução
                const rawUrl =
                  info.imageLinks.extraLarge ||
                  info.imageLinks.large ||
                  info.imageLinks.medium ||
                  info.imageLinks.thumbnail ||
                  info.imageLinks.smallThumbnail;

                if (rawUrl) {
                  const cleaned = cleanGoogleBooksCoverUrl(rawUrl, false);
                  candidateCovers.push({
                    url: cleaned,
                    tituloEdicao: info.title,
                    autor: info.authors ? info.authors.join(', ') : undefined,
                    editora: info.publisher,
                    ano: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : undefined,
                    fonte: 'Google Books',
                    resolucao: info.imageLinks.large ? 'Alta' : 'Padrão',
                  });
                }
              }
            }
          }
        }
      } catch {
        // ignora
      }
    })()
  );

  // C) Open Library Search API
  const olQuery = titulo || rawQuery;
  if (olQuery) {
    promises.push(
      (async () => {
        try {
          const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
            olQuery
          )}&limit=10&fields=title,author_name,cover_i,isbn,publisher,first_publish_year`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.docs && Array.isArray(data.docs)) {
              for (const doc of data.docs) {
                if (doc.cover_i) {
                  candidateCovers.push({
                    url: buildOpenLibraryCoverUrl('id', doc.cover_i, 'L'),
                    tituloEdicao: doc.title,
                    autor: doc.author_name ? doc.author_name.join(', ') : undefined,
                    editora: doc.publisher ? doc.publisher[0] : undefined,
                    ano: doc.first_publish_year,
                    fonte: 'Open Library',
                    resolucao: 'Alta resolução',
                  });
                } else if (doc.isbn && doc.isbn.length > 0) {
                  candidateCovers.push({
                    url: buildOpenLibraryCoverUrl('isbn', doc.isbn[0], 'L'),
                    tituloEdicao: doc.title,
                    autor: doc.author_name ? doc.author_name.join(', ') : undefined,
                    editora: doc.publisher ? doc.publisher[0] : undefined,
                    ano: doc.first_publish_year,
                    fonte: 'Open Library',
                    resolucao: 'Média',
                  });
                }
              }
            }
          }
        } catch {
          // ignora
        }
      })()
    );
  }

  await Promise.all(promises);

  // Remove duplicatas exatas de URL
  const uniqueMap = new Map<string, RealCoverOption>();
  for (const item of candidateCovers) {
    if (!item.url) continue;
    // Normaliza URL para chave única
    const key = item.url.replace('&zoom=2', '').replace('&zoom=1', '');
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  const allUnique = Array.from(uniqueMap.values());
  if (allUnique.length === 0) return [];

  // Valida em paralelo quais imagens realmente abrem sem erro
  const validationResults = await Promise.all(
    allUnique.map(async (item) => {
      const works = await probeImage(item.url, 4500);
      return { item, works };
    })
  );

  return validationResults.filter(r => r.works).map(r => r.item);
}
