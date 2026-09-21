import { normalizeCategory } from './openlibrary';
import { cleanGoogleBooksCoverUrl, buildOpenLibraryCoverUrl } from './coverFinder';
import {
  traduzirTituloParaPortugues,
  fetchBrasilApiByIsbn,
  normalizarCaixaTitulo,
} from './portugueseTitles';

export interface IdentifiedBook {
  titulo: string;
  autor: string;
  isbn?: string;
  sinopse?: string;
  ano_publicacao?: number;
  paginas?: number;
  editora?: string;
  categoria: string;
  capa_url?: string;
  capas_disponiveis: string[];
  fonte: 'BrasilAPI' | 'Google Books' | 'Open Library';
}

/**
 * Identifica livros na internet com máxima prioridade para o idioma Português (BrasilAPI, Google Books pt-BR e Open Library).
 * Busca sinopse completa em português, autor, ano de lançamento, número de páginas, editora, categorias e capas de alta qualidade.
 */
export async function identifyBookOnline(query: string): Promise<IdentifiedBook[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const results: IdentifiedBook[] = [];
  const rawIsbn = trimmed.replace(/[-\s]/g, '');
  const isIsbn = /^(97(8|9))?\d{9}(\d|X)$/i.test(rawIsbn);

  // 1. Se for ISBN, consulta imediatamente a BrasilAPI para obter cadastro nacional 100% em português
  if (isIsbn) {
    try {
      const brasilData = await fetchBrasilApiByIsbn(rawIsbn);
      if (brasilData && brasilData.titulo) {
        const cover = brasilData.capa_url || buildOpenLibraryCoverUrl('isbn', rawIsbn, 'L');
        results.push({
          titulo: traduzirTituloParaPortugues(normalizarCaixaTitulo(brasilData.titulo)),
          autor: brasilData.autor,
          isbn: rawIsbn,
          sinopse: brasilData.sinopse,
          ano_publicacao: brasilData.ano_publicacao,
          paginas: brasilData.paginas,
          editora: brasilData.editora,
          categoria: brasilData.categoria || 'Literatura',
          capa_url: cover,
          capas_disponiveis: [cover, buildOpenLibraryCoverUrl('isbn', rawIsbn, 'L')],
          fonte: 'BrasilAPI',
        });
      }
    } catch (e) {
      console.warn('BrasilAPI falha:', e);
    }
  }

  // 2. Consulta ao Google Books API com preferência de idioma pt-BR
  try {
    const cleanQuery = isIsbn ? `isbn:${rawIsbn}` : trimmed;
    const gbooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      cleanQuery
    )}&hl=pt-BR&maxResults=6`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(gbooksUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const info = item.volumeInfo || {};
          if (!info.title) continue;

          // Extrai ISBN
          let isbn: string | undefined;
          if (info.industryIdentifiers && Array.isArray(info.industryIdentifiers)) {
            const isbn13 = info.industryIdentifiers.find(
              (id: { type: string; identifier: string }) => id.type === 'ISBN_13'
            );
            const isbn10 = info.industryIdentifiers.find(
              (id: { type: string; identifier: string }) => id.type === 'ISBN_10'
            );
            isbn = isbn13?.identifier || isbn10?.identifier;
          }

          // Extrai ano
          let ano: number | undefined;
          if (info.publishedDate) {
            const match = info.publishedDate.match(/\b(18|19|20)\d{2}\b/);
            if (match) ano = parseInt(match[0], 10);
          }

          // Capas com limpeza cuidadosa
          const capas: string[] = [];
          if (info.imageLinks) {
            const highRes =
              info.imageLinks.extraLarge ||
              info.imageLinks.large ||
              info.imageLinks.medium ||
              info.imageLinks.thumbnail ||
              info.imageLinks.smallThumbnail;
            if (highRes) {
              capas.push(cleanGoogleBooksCoverUrl(highRes, false));
            }
          }
          if (isbn) {
            capas.push(buildOpenLibraryCoverUrl('isbn', isbn, 'L'));
          }

          const primaryCover = capas[0] || (isbn ? buildOpenLibraryCoverUrl('isbn', isbn, 'M') : undefined);
          const categoria = normalizeCategory(info.categories);
          const tituloFinal = traduzirTituloParaPortugues(normalizarCaixaTitulo(info.title));

          // Evita duplicar se já foi adicionado pela BrasilAPI
          const alreadyExists = results.some(
            r => r.isbn && isbn && r.isbn === isbn
          );

          if (!alreadyExists) {
            results.push({
              titulo: tituloFinal,
              autor: info.authors ? info.authors.join(', ') : 'Autor Desconhecido',
              isbn: isbn || (isIsbn ? rawIsbn : undefined),
              sinopse: info.description || undefined,
              ano_publicacao: ano,
              paginas: info.pageCount || undefined,
              editora: info.publisher || undefined,
              categoria,
              capa_url: primaryCover,
              capas_disponiveis: Array.from(new Set(capas)),
              fonte: 'Google Books',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Google Books API consulta avisou:', err);
  }

  // 3. Se poucos resultados ou busca por ISBN, complementa com Open Library
  if (results.length < 3) {
    try {
      const olUrl = isIsbn
        ? `https://openlibrary.org/api/books?bibkeys=ISBN:${rawIsbn}&jscmd=data&format=json`
        : `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=5`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const olRes = await fetch(olUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (olRes.ok) {
        const olData = await olRes.json();
        if (isIsbn) {
          const key = `ISBN:${rawIsbn}`;
          const book = olData[key];
          if (book && !results.some(r => r.isbn === rawIsbn)) {
            const autor = book.authors?.map((a: { name: string }) => a.name).join(', ') || 'Autor Desconhecido';
            let ano: number | undefined;
            if (book.publish_date) {
              const m = book.publish_date.match(/\b(18|19|20)\d{2}\b/);
              if (m) ano = parseInt(m[0], 10);
            }
            const cover = book.cover?.large || book.cover?.medium;
            results.push({
              titulo: traduzirTituloParaPortugues(normalizarCaixaTitulo(book.title || 'Livro Sem Título')),
              autor,
              isbn: rawIsbn,
              sinopse: typeof book.notes === 'string' ? book.notes : undefined,
              ano_publicacao: ano,
              paginas: book.number_of_pages,
              editora: book.publishers?.[0]?.name,
              categoria: normalizeCategory(book.subjects?.map((s: { name: string }) => s.name)),
              capa_url: cover,
              capas_disponiveis: cover ? [cover] : [],
              fonte: 'Open Library',
            });
          }
        } else if (olData.docs && Array.isArray(olData.docs)) {
          for (const doc of olData.docs.slice(0, 3)) {
            const isbnDoc = doc.isbn?.[0];
            const coverUrl = doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
              : isbnDoc
              ? `https://covers.openlibrary.org/b/isbn/${isbnDoc}-L.jpg`
              : undefined;

            const tituloTraduzido = traduzirTituloParaPortugues(normalizarCaixaTitulo(doc.title || ''));

            const alreadyExists = results.some(
              r => r.titulo.toLowerCase().trim() === tituloTraduzido.toLowerCase().trim()
            );

            if (!alreadyExists && tituloTraduzido) {
              results.push({
                titulo: tituloTraduzido,
                autor: doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Autor Desconhecido',
                isbn: isbnDoc,
                ano_publicacao: doc.first_publish_year,
                paginas: doc.number_of_pages_median,
                editora: doc.publisher?.[0],
                categoria: normalizeCategory(doc.subject),
                capa_url: coverUrl,
                capas_disponiveis: coverUrl ? [coverUrl] : [],
                fonte: 'Open Library',
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Open Library consulta avisou:', err);
    }
  }

  return results;
}
