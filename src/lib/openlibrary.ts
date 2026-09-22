import { OpenLibraryDoc } from '../types';
import {
  traduzirTituloParaPortugues,
  fetchBrasilApiByIsbn,
  normalizarCaixaTitulo,
} from './portugueseTitles';

export interface OpenLibraryBookDetails {
  titulo: string;
  autor: string;
  isbn?: string;
  capa_url?: string;
  categoria?: string;
  ano_publicacao?: number;
  paginas?: number;
  editora?: string;
  sinopse?: string;
}

export function cleanIsbn(isbn: string): string {
  return isbn.replace(/[^0-9X]/gi, '').toUpperCase();
}

/**
 * Sanitiza o nome do autor removendo resquícios de índices numéricos como ", 0"
 */
export function cleanAuthorName(authorStr?: string | string[]): string {
  if (!authorStr) return 'Autor Desconhecido';
  if (Array.isArray(authorStr)) {
    const valid = authorStr
      .map(s => String(s).trim())
      .filter(s => s && !/^\d+$/.test(s));
    return valid.length > 0 ? valid.slice(0, 3).join(', ') : 'Autor Desconhecido';
  }
  return authorStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s && !/^\d+$/.test(s))
    .join(', ') || 'Autor Desconhecido';
}

/**
 * Normaliza categorias/assuntos comuns do Open Library para categorias em português
 */
export function normalizeCategory(subjects?: string[]): string {
  if (!subjects || subjects.length === 0) return 'Geral';
  const subStr = subjects.join(' ').toLowerCase();

  if (subStr.includes('brazilian') || subStr.includes('brasil') || subStr.includes('portuguese')) return 'Literatura Brasileira';
  if (subStr.includes('juvenile') || subStr.includes('children') || subStr.includes('infantil') || subStr.includes('fairy')) return 'Infanto-Juvenil';
  if (subStr.includes('fantasy') || subStr.includes('fantasia') || subStr.includes('magic') || subStr.includes('wizard')) return 'Fantasia e Magia';
  if (subStr.includes('science fiction') || subStr.includes('ficção científica') || subStr.includes('sci-fi')) return 'Ficção Científica';
  if (subStr.includes('fiction') || subStr.includes('ficção') || subStr.includes('novel') || subStr.includes('romance')) return 'Ficção e Romance';
  if (subStr.includes('poetry') || subStr.includes('poesia') || subStr.includes('poems')) return 'Poesia';
  if (subStr.includes('history') || subStr.includes('história') || subStr.includes('historical')) return 'História e Sociedade';
  if (subStr.includes('philosophy') || subStr.includes('filosofia')) return 'Filosofia';
  if (subStr.includes('science') || subStr.includes('ciência') || subStr.includes('physics') || subStr.includes('biology')) return 'Ciências';
  if (subStr.includes('comic') || subStr.includes('quadrinho') || subStr.includes('manga') || subStr.includes('graphic')) return 'Quadrinhos e HQ';
  if (subStr.includes('biography') || subStr.includes('biografia') || subStr.includes('memoir')) return 'Biografia e Memórias';
  if (subStr.includes('education') || subStr.includes('educação') || subStr.includes('pedagogy')) return 'Didático e Educação';
  if (subStr.includes('suspense') || subStr.includes('thriller') || subStr.includes('mystery') || subStr.includes('mistério')) return 'Mistério e Suspense';
  if (subStr.includes('adventure') || subStr.includes('aventura')) return 'Aventura';

  // Retorna o primeiro assunto limpo traduzido
  const first = subjects[0].trim();
  return first.length > 25 ? first.slice(0, 25) + '...' : first;
}

/**
 * Consulta a Open Library API e BrasilAPI buscando por ISBN garantindo português
 */
export async function fetchBookByISBN(isbnInput: string): Promise<OpenLibraryBookDetails | null> {
  const isbn = cleanIsbn(isbnInput);
  if (!isbn) return null;

  // 1. Prioridade máxima: BrasilAPI (100% em português brasileiro oficial)
  try {
    const brasilData = await fetchBrasilApiByIsbn(isbn);
    if (brasilData && brasilData.titulo) {
      return {
        titulo: traduzirTituloParaPortugues(normalizarCaixaTitulo(brasilData.titulo)),
        autor: brasilData.autor,
        isbn,
        capa_url: brasilData.capa_url || `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        categoria: brasilData.categoria || 'Literatura',
        ano_publicacao: brasilData.ano_publicacao,
        paginas: brasilData.paginas,
        editora: brasilData.editora,
        sinopse: brasilData.sinopse,
      };
    }
  } catch (e) {
    console.warn('BrasilAPI fallback para Open Library:', e);
  }

  // 2. Open Library API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const bookKey = `ISBN:${isbn}`;
      const book = data[bookKey];

      if (book) {
        const autor = book.authors && book.authors.length > 0
          ? cleanAuthorName(book.authors.map((a: { name: string }) => a.name))
          : 'Autor Desconhecido';

        const capaUrl = book.cover?.large || book.cover?.medium || book.cover?.small || `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

        const subjects = book.subjects?.map((s: { name: string }) => s.name) || [];
        const categoria = normalizeCategory(subjects);

        let anoPublicacao: number | undefined;
        if (book.publish_date) {
          const yearMatch = book.publish_date.match(/\b(19\d\d|20\d\d)\b/);
          if (yearMatch) anoPublicacao = parseInt(yearMatch[1], 10);
        }

        const editora = book.publishers && book.publishers.length > 0 ? book.publishers[0].name : undefined;
        const rawTitle = book.title || 'Sem título';
        const tituloPt = traduzirTituloParaPortugues(normalizarCaixaTitulo(rawTitle));

        return {
          titulo: tituloPt,
          autor,
          isbn,
          capa_url: capaUrl,
          categoria,
          ano_publicacao: anoPublicacao,
          paginas: book.number_of_pages,
          editora,
          sinopse: typeof book.notes === 'string' ? book.notes : undefined,
        };
      }
    }

    // Fallback: search.json
    const searchUrl = `https://openlibrary.org/search.json?isbn=${isbn}&limit=1`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.docs && searchData.docs.length > 0) {
        const doc: OpenLibraryDoc = searchData.docs[0];
        const rawTitle = doc.title || 'Sem título';
        return {
          titulo: traduzirTituloParaPortugues(normalizarCaixaTitulo(rawTitle)),
          autor: cleanAuthorName(doc.author_name),
          isbn,
          capa_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
          categoria: normalizeCategory(doc.subject),
          ano_publicacao: doc.first_publish_year,
          editora: doc.publisher?.[0],
          paginas: doc.number_of_pages_median,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Falha ao consultar Open Library por ISBN:', err);
    return null;
  }
}

/**
 * Busca livros na Open Library por texto livre garantindo nomes traduzidos para Português
 */
export async function searchOpenLibrary(query: string): Promise<OpenLibraryBookDetails[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=20&fields=key,title,author_name,first_publish_year,isbn,cover_i,subject,publisher,number_of_pages_median`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Status de busca Open Library: ${response.status}`);
    }

    const data = await response.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.map((doc: OpenLibraryDoc) => {
      const primeIsbn = doc.isbn && doc.isbn.length > 0 ? doc.isbn[0] : undefined;
      const capaUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : primeIsbn
        ? `https://covers.openlibrary.org/b/isbn/${primeIsbn}-L.jpg`
        : undefined;

      const rawTitle = doc.title || 'Sem título';
      const tituloPt = traduzirTituloParaPortugues(normalizarCaixaTitulo(rawTitle));

      return {
        titulo: tituloPt,
        autor: cleanAuthorName(doc.author_name),
        isbn: primeIsbn,
        capa_url: capaUrl,
        categoria: normalizeCategory(doc.subject),
        ano_publicacao: doc.first_publish_year,
        paginas: doc.number_of_pages_median,
        editora: doc.publisher?.[0],
      };
    });
  } catch (err) {
    console.error('Erro na pesquisa Open Library:', err);
    return [];
  }
}
