/**
 * MEGA FILTRO DE MODERAÇÃO E SEGURANÇA ESCOLAR — LibreOteca
 * Motor de alta rigidez contra termos ofensivos, palavrões, xingamentos,
 * cyberbullying, preconceito, discurso de ódio, violência, links suspeitos
 * e evasão por leetspeak / espaçamento proposital.
 *
 * Utilizado para validação estrita do Lema/Frase do Leitor, Resenhas do Mural,
 * Biografias e Comentários Comunitários.
 */

// 1. BANCO DE DADOS DE TERMOS PROIBIDOS E RAÍZES OFENSIVAS
const RAICES_OFENSIVAS_ESTRITAS: string[] = [
  // Palavrões clássicos e variações sexuais/escatológicas
  'puta', 'puto', 'putaria', 'putinha', 'putao', 'caralho', 'caralha', 'krl', 'krlh',
  'porra', 'porrada', 'porralouca', 'merda', 'merdinha', 'bosta', 'bostinha',
  'foder', 'foda', 'foda-se', 'fodasse', 'fodase', 'fudido', 'fudida', 'fudeu', 'fuder',
  'se foder', 'se fuder', 'vai se foder', 'toma no cu', 'tomar no cu', 'cuzao', 'cusao', 'cuzinho',
  'arrombado', 'arrombada', 'arrombar', 'cacete', 'kct', 'cassete',
  'buceta', 'bct', 'bucetinha', 'xoxota', 'xana', 'piroca', 'pica', 'pauzao',
  'penis', 'vagina', 'chupeta', 'punheta', 'siririca', 'boquete', 'suruba',

  // Xingamentos, ofensas morais e humilhações
  'idiota', 'idiotice', 'imbecil', 'burro', 'burra', 'burrice', 'anta', 'jumento',
  'otario', 'otaria', 'babaca', 'escroto', 'escrota', 'lixo', 'nojento', 'nojenta',
  'vagabundo', 'vagabunda', 'desgraca', 'desgracado', 'desgracada', 'maldito', 'maldita',
  'trouxa', 'trouxao', 'trouxona', 'cretino', 'cretina', 'safado', 'safada', 'ordinario',
  'canalha', 'patetico', 'incompetente', 'estupido', 'estupida', 'fedorento', 'fedida',
  'ridiculo', 'ridicula', 'verme', 'inutil', 'corno', 'corna', 'vadia', 'piranha',
  'bostao', 'merdoso', 'lixoso', 'marginal', 'escrotice', 'boçal', 'mercenario',

  // Siglas vulgares
  'fdp', 'pqp', 'vsf', 'vtnc', 'tnc', 'pnc', 'wtf', 'stfu', 'fck', 'fcku',

  // Discurso de ódio, capacitismo, homofobia e discriminação
  'viado', 'viadinho', 'bicha', 'boiola', 'sapatao', 'traveco', 'bichinha',
  'macaco', 'macaca', 'crioulo', 'chimpanze',
  'retardado', 'retardada', 'mongol', 'mongoloide', 'aleijado', 'esquisofrenico',
  'doente mental', 'anormal', 'louco de hospicio', 'leproso',

  // Violência, morte, ameaças e automutilação
  'suicidio', 'se mata', 'se mate', 'morra', 'morre', 'vai morrer', 'vou te matar',
  'vou te bater', 'vou te pegar', 'tiro na cabeca', 'esfaquear', 'sangue', 'degolar',
  'massacre', 'estupro', 'estuprar', 'pedofilia', 'pedofilo', 'nazista', 'hitler', 'facista',

  // Substâncias ilícitas
  'maconha', 'cocaina', 'crack', 'heroina', 'drogao', 'traficante', 'baseado', 'beck',

  // Inglês comum em invasões
  'bitch', 'asshole', 'fuck', 'fucker', 'fucking', 'shit', 'cunt', 'dick', 'pussy',
  'motherfucker', 'bastard', 'nigger', 'nigga', 'whore', 'slut'
];

// Expressões maldosas compostas
const EXPRESSOES_PROIBIDAS_REGEX: RegExp[] = [
  /pior\s+(aluno|prof|leitor|pessoa|coisa|escola|livro\s+da\s+historia)/i,
  /ningu[eé]m\s+(te\s+suporta|gosta\s+de\s+voc[eê]|liga\s+pra\s+voc[eê])/i,
  /livro\s+(um\s+lixo|uma\s+merda|uma\s+bosta|horr[ií]vel\s+demais)/i,
  /cala\s+(essa|a)?\s*boca/i,
  /voc[eê]\s+[eé]\s+(um\s+)?(feio|burro|chato|ot[aá]rio|lixo|in[uú]til|escroto)/i,
  /vai\s+(tomar\s+no|se\s+foder|se\s+lascar|pro\s+inferno)/i,
  /morra\s+(logo|diabo|seu)/i,
  /que\s+(se\s+foda|se\s+dane|lixo\s+de\s+gente)/i,
  /tem\s+que\s+morrer/i,
];

// URLs, Links e Padrões de Phishing/Divulgação
const LINKS_E_PHISHING_REGEX: RegExp[] = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /[a-zA-Z0-9-]+\.(com|net|org|br|io|gg|xyz|live|link|top|ru|cc)\b/i,
  /discord\.(gg|com\/invite)/i,
  /wa\.me\/\d+/i,
  /chat\.whatsapp\.com/i,
  /t\.me\/[a-zA-Z0-9_]+/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/i,
];

/**
 * Normalizador avançado anti-evasão:
 * Remove acentos, desfaz leetspeak (números e símbolos), remove repetições forçadas.
 */
export function normalizarTextoAvancado(texto: string): string {
  if (!texto) return '';

  let norm = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos

  // Converte Leetspeak comum (@, 4, 3, 1, 0, 5, $, 7, 8, etc.)
  norm = norm
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[\\]/g, 'v')
    .replace(/ph/g, 'f');

  // Reduz repetições forçadas: "pvoooooorrrrra" -> "pvorra", "buuuurro" -> "burro"
  norm = norm.replace(/(.)\1{2,}/g, '$1$1');

  return norm;
}

/**
 * Gera versão compactada removendo espaços e pontuações para pegar palavras disfarçadas:
 * Ex: "p.u.t.a", "p u t a", "p_u_t_a", "m-e-r-d-a"
 */
function compactarTexto(texto: string): string {
  return texto.replace(/[\s\-_.,;:!?'"\\/|#*()+=~^`]/g, '');
}

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  flaggedWords: string[];
  sanitizedText: string;
  helpfulAdvice?: string;
}

/**
 * MEGA FILTRO PRINCIPAL
 * Valida rigorosamente qualquer texto segundo as políticas educacionais do LibreOteca.
 */
export function validarMegaFiltro(
  texto: string,
  contexto: 'lema' | 'resenha' | 'bio' | 'geral' = 'geral'
): ModerationResult {
  if (!texto || texto.trim().length === 0) {
    if (contexto === 'lema') {
      return {
        isAllowed: true,
        flaggedWords: [],
        sanitizedText: '',
      };
    }
    return {
      isAllowed: false,
      reason: 'O texto não pode ficar em branco.',
      flaggedWords: [],
      sanitizedText: '',
      helpfulAdvice: 'Escreva um texto respeitoso compartilhando suas ideias.',
    };
  }

  const textoLimpo = texto.trim();

  // Limite de tamanho conforme contexto
  const limiteMax = contexto === 'lema' ? 90 : contexto === 'bio' ? 300 : 1200;
  if (textoLimpo.length > limiteMax) {
    return {
      isAllowed: false,
      reason: `Texto muito longo. O limite para ${
        contexto === 'lema' ? 'o lema é de 90 caracteres' : `${limiteMax} caracteres`
      }.`,
      flaggedWords: ['limite_caracteres_excedido'],
      sanitizedText: textoLimpo.slice(0, limiteMax),
    };
  }

  // 1. Detecção de Links, URLs, Convites e Scripts maliciosos
  for (const regexLink of LINKS_E_PHISHING_REGEX) {
    if (regexLink.test(textoLimpo)) {
      return {
        isAllowed: false,
        reason: 'Não é permitido incluir links externos, sites, convites ou códigos neste campo.',
        flaggedWords: ['link_externo_ou_script'],
        sanitizedText: textoLimpo.replace(regexLink, '[link removido]'),
        helpfulAdvice: 'Mantenha o conteúdo estritamente focado em literatura, livros e aprendizado.',
      };
    }
  }

  const textoNormalizado = normalizarTextoAvancado(textoLimpo);
  const textoCompactado = compactarTexto(textoNormalizado);
  const palavrasDetectadas: string[] = [];

  // 2. Verificação de Palavras Individuais e Raízes Estritas
  const tokensSeparados = textoNormalizado.split(/[\s,.;:!?()\-_'"\\/|]+/).filter(Boolean);

  for (const termo of RAICES_OFENSIVAS_ESTRITAS) {
    const termoNorm = normalizarTextoAvancado(termo);

    // A) Checagem como token isolado
    if (tokensSeparados.includes(termoNorm)) {
      if (!palavrasDetectadas.includes(termo)) palavrasDetectadas.push(termo);
      continue;
    }

    // B) Checagem no texto compactado (pega "p.u.t.a", "p u t a", etc.)
    if (termoNorm.length >= 3 && textoCompactado.includes(termoNorm)) {
      // Exceções para falsos positivos em português comum
      const falsosPositivos: Record<string, string[]> = {
        'cu': ['curioso', 'cuidado', 'cultura', 'curto', 'curso', 'curar', 'culpa', 'escudo', 'discutir', 'ocupar'],
        'pau': ['pausa', 'paula', 'paulista'],
        'foda': ['afobado'],
        'pica': ['pica-pau', 'tipica', 'picada'],
      };

      let ehFalsoPositivo = false;
      if (falsosPositivos[termoNorm]) {
        for (const fp of falsosPositivos[termoNorm]) {
          if (textoNormalizado.includes(fp)) {
            ehFalsoPositivo = true;
            break;
          }
        }
      }

      if (!ehFalsoPositivo) {
        if (!palavrasDetectadas.includes(termo)) palavrasDetectadas.push(termo);
      }
    }
  }

  // 3. Verificação de Expressões Maldosas e Hostis
  for (const reg of EXPRESSOES_PROIBIDAS_REGEX) {
    if (reg.test(textoNormalizado) || reg.test(textoLimpo)) {
      palavrasDetectadas.push('expressão hostil / ofensiva');
      break;
    }
  }

  // 4. Verificação de Agressividade (Excesso de CAIXA ALTA + !!!)
  if (contexto === 'resenha' || contexto === 'bio') {
    const contemCapsAgressivo =
      textoLimpo.length > 25 &&
      textoLimpo.replace(/[^A-Z]/g, '').length / textoLimpo.replace(/[^a-zA-Z]/g, '').length > 0.8;
    const excessoExclamacoes = (textoLimpo.match(/!{3,}/g) || []).length > 0;

    if (contemCapsAgressivo && excessoExclamacoes) {
      palavrasDetectadas.push('tom agressivo (caixa alta e múltiplos pontos de exclamação)');
    }
  }

  // Se alguma violação for encontrada, bloqueia terminantemente
  if (palavrasDetectadas.length > 0) {
    return {
      isAllowed: false,
      reason:
        contexto === 'lema'
          ? 'O lema contém termos ou expressões não permitidas no ambiente escolar.'
          : 'O texto contém palavras ou expressões consideradas inadequadas para o ambiente escolar.',
      flaggedWords: palavrasDetectadas,
      sanitizedText: censurarTexto(textoLimpo, palavrasDetectadas),
      helpfulAdvice:
        contexto === 'lema'
          ? 'Dica: Escolha uma frase inspiradora sobre livros, conhecimento, curiosidade ou aventura.'
          : 'Dica: Você pode expressar críticas construtivas sobre a narrativa ou personagens, com respeito e sem palavrões.',
    };
  }

  return {
    isAllowed: true,
    flaggedWords: [],
    sanitizedText: textoLimpo,
  };
}

/**
 * Validador estrito exclusivo para a "Frase/Lema do Leitor"
 */
export function validarLemaLeitor(lema: string): {
  valido: boolean;
  motivo?: string;
  termos?: string[];
} {
  if (!lema || lema.trim().length === 0) {
    return { valido: true };
  }

  const res = validarMegaFiltro(lema, 'lema');
  return {
    valido: res.isAllowed,
    motivo: res.reason,
    termos: res.flaggedWords,
  };
}

/**
 * Validador oficial de resenhas literárias do Mural
 */
export function avaliarComentario(texto: string): ModerationResult {
  return validarMegaFiltro(texto, 'resenha');
}

/**
 * Substitui palavras ofensivas por asteriscos para pré-visualização segura
 */
export function censurarTexto(texto: string, termos: string[]): string {
  let resultado = texto;
  for (const termo of termos) {
    if (termo.length < 3 || termo.includes(' ')) continue;
    try {
      const regex = new RegExp(`\\b${termo}\\b`, 'gi');
      resultado = resultado.replace(regex, '***');
    } catch {
      // Ignora erro de regex inválido
    }
  }
  return resultado;
}
