/**
 * Filtro de Moderação de Comentários Escolares para o LibreOteca
 * Protege alunos e a comunidade contra cyberbullying, termos ofensivos,
 * preconceito, palavras de baixo calão e assédio.
 */

// Lista de termos e padrões proibidos no ambiente escolar
const TERMOS_PROIBIDOS: string[] = [
  // Ofensas e xingamentos comuns
  'idiota', 'imbecil', 'burro', 'burra', 'anta', 'otario', 'otaria',
  'babaca', 'escroto', 'escrota', 'lixo', 'merda', 'bosta', 'porcaria',
  'arrombado', 'arrombada', 'vagabundo', 'vagabunda', 'desgraca', 'desgraçado', 'desgraçada',
  'fdp', 'pqp', 'vsf', 'vtnc', 'puta', 'puto', 'caralho', 'porra',
  'cacete', 'foda', 'fodasse', 'foda-se', 'se foder', 'toma no cu', 'tomar no cu',
  'retardado', 'retardada', 'doente mental', 'mongol', 'aleijado',
  'viado', 'viadinho', 'bicha', 'sapatão', 'macaco', 'macaca',
  'nojento', 'nojenta', 'ridiculo', 'ridicula', 'feio demais', 'feia demais',
  'morra', 'morre', 'se mata', 'suicidio', 'vou te matar', 'vou te bater',
  'cala a boca', 'cala boca', 'cala a boquinha', 'trouxa', 'trouxao',
  'incompetente', 'safado', 'safada', 'estupido', 'estupida', 'cretino', 'cretina'
];

// Expressões compostas maldosas que devem ser barradas
const EXPRESSOES_MALDOSAS: RegExp[] = [
  /pior\s+(aluno|prof|pessoa|humano|coisa\s+do\s+mundo)/i,
  /ningu[eé]m\s+(te\s+aguenta|gosta\s+de\s+voc[eê]|suporta)/i,
  /livro\s+(um\s+lixo|uma\s+merda|bosta|horr[ií]vel\s+demais)/i,
  /autor\s+(idiota|imbecil|burro|lixo)/i,
  /vai\s+se\s+(foder|lascar|fuder)/i,
  /cala\s+(essa|a)?\s*boca/i,
  /voc[eê]\s+[eé]\s+(um\s+)?(feio|burro|chato|ot[aá]rio|lixo|in[uú]til)/i,
];

// Normaliza texto para pegar disfarces: acentos, leetspeak (@, 1, 3, 0, etc.) e repetições
function normalizarTexto(texto: string): string {
  let norm = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos

  // Troca números/símbolos usados para burlar (1337)
  norm = norm
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/7/g, 't');

  // Reduz caracteres repetidos excessivos: "buuuurro" -> "burro"
  norm = norm.replace(/(.)\1{2,}/g, '$1$1');

  return norm;
}

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  flaggedWords: string[];
  sanitizedText: string;
  helpfulAdvice?: string;
}

/**
 * Avalia o texto do comentário com filtros heurísticos e semânticos em português
 */
export function avaliarComentario(texto: string): ModerationResult {
  if (!texto || texto.trim().length === 0) {
    return {
      isAllowed: false,
      reason: 'O comentário não pode ficar em branco.',
      flaggedWords: [],
      sanitizedText: '',
      helpfulAdvice: 'Escreva um parágrafo compartilhando o que achou da história ou personagens.',
    };
  }

  const textoLimpo = texto.trim();
  const textoNormalizado = normalizarTexto(textoLimpo);
  const palavrasDetectadas: string[] = [];

  // 1. Verificação contra termos individuais proibidos
  // Divide em palavras considerando pontuações
  const palavrasNorm = textoNormalizado.split(/[\s,.;:!?()\-_'"\\/]+/);

  for (const termo of TERMOS_PROIBIDOS) {
    const termoNorm = normalizarTexto(termo);
    // Checagem de palavra exata
    if (palavrasNorm.includes(termoNorm)) {
      if (!palavrasDetectadas.includes(termo)) {
        palavrasDetectadas.push(termo);
      }
    } else {
      // Checagem se o texto contém termo com espaços disfarçados (ex: "i d i o t a")
      const regexComEspaco = new RegExp(termoNorm.split('').join('\\s*'), 'i');
      if (regexComEspaco.test(textoNormalizado) && termoNorm.length >= 4) {
        if (!palavrasDetectadas.includes(termo)) {
          palavrasDetectadas.push(termo);
        }
      }
    }
  }

  // 2. Verificação de expressões maldosas compostas
  for (const reg of EXPRESSOES_MALDOSAS) {
    if (reg.test(textoNormalizado)) {
      palavrasDetectadas.push('expressão desrespeitosa');
    }
  }

  // 3. Verificação de gritaria agressiva (tudo em CAIXA ALTA + exclamações agressivas)
  const contemMaisDe70PorcentoCaps =
    textoLimpo.length > 20 &&
    (textoLimpo.replace(/[^A-Z]/g, '').length / textoLimpo.replace(/[^a-zA-Z]/g, '').length) > 0.75;

  const excessoExclamacoes = (textoLimpo.match(/!{3,}/g) || []).length > 0;

  if (contemMaisDe70PorcentoCaps && excessoExclamacoes) {
    palavrasDetectadas.push('tom excessivamente agressivo (caixa alta e múltiplos pontos de exclamação)');
  }

  // Se alguma violação for encontrada, bloqueia
  if (palavrasDetectadas.length > 0) {
    return {
      isAllowed: false,
      reason: 'O comentário contém palavras ou expressões consideradas inadequadas para o ambiente escolar.',
      flaggedWords: palavrasDetectadas,
      sanitizedText: censurarTexto(textoLimpo, palavrasDetectadas),
      helpfulAdvice:
        'Lembre-se: críticas literárias são bem-vindas, desde que com respeito! Você pode dizer que não gostou do ritmo, do enredo ou do desfecho, sem ofensas pessoais ou palavrões.',
    };
  }

  return {
    isAllowed: true,
    flaggedWords: [],
    sanitizedText: textoLimpo,
  };
}

/**
 * Substitui palavras ofensivas por asteriscos para pré-visualização segura
 */
export function censurarTexto(texto: string, termos: string[]): string {
  let resultado = texto;
  for (const termo of termos) {
    if (termo.length < 3) continue;
    const regex = new RegExp(`\\b${termo}\\b`, 'gi');
    resultado = resultado.replace(regex, '***'.repeat(Math.ceil(termo.length / 3)));
  }
  return resultado;
}
