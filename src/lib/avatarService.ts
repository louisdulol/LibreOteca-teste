/**
 * Serviço de geração e customização de avatares vetoriais seguros.
 * Utiliza o DiceBear 9.x para criar avatares expressivos, leves e 100% seguros a partir de seeds únicas.
 */

export interface AvatarEstilo {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
}

export const ESTILOS_AVATAR: AvatarEstilo[] = [
  {
    id: 'adventurer',
    nome: 'Aventureiro Literário',
    descricao: 'Personagens ilustrados com expressões vivas e estilos dinâmicos',
    icone: 'Compass',
  },
  {
    id: 'bottts',
    nome: 'Robô Leitor',
    descricao: 'Amigáveis robôs cibernéticos leitores com antenas e visores',
    icone: 'Bot',
  },
  {
    id: 'personas',
    nome: 'Estudante Clássico',
    descricao: 'Estilo editorial minimalista e elegante para alunos e professores',
    icone: 'GraduationCap',
  },
  {
    id: 'lorelei',
    nome: 'Editorial Artístico',
    descricao: 'Traços refinados de aquarela e retratos contemporâneos',
    icone: 'Palette',
  },
  {
    id: 'micah',
    nome: 'Minimalista Moderno',
    descricao: 'Formas geométricas limpas e estética contemporânea',
    icone: 'Square',
  },
  {
    id: 'fun-emoji',
    nome: 'Expressivo',
    descricao: 'Expressões divertidas e reações amigáveis',
    icone: 'Smile',
  },
  {
    id: 'thumbs',
    nome: 'Carinhas Divertidas',
    descricao: 'Design lúdico e expressivo para leitores jovens',
    icone: 'Smile',
  },
  {
    id: 'pixel-art',
    nome: 'Retrô Pixel Art',
    descricao: 'Nostálgicos avatares em 8-bits pixelizados',
    icone: 'Gamepad2',
  },
];

export const CORES_FUNDO_AVATAR = [
  { id: 'f59e0b', nome: 'Âmbar Dourado', bgClass: 'bg-amber-500' },
  { id: '10b981', nome: 'Esmeralda', bgClass: 'bg-emerald-500' },
  { id: '3b82f6', nome: 'Azul Royale', bgClass: 'bg-blue-500' },
  { id: '8b5cf6', nome: 'Púrpura Místico', bgClass: 'bg-purple-500' },
  { id: 'ec4899', nome: 'Rosa Radiante', bgClass: 'bg-pink-500' },
  { id: '06b6d4', nome: 'Ciano Oceano', bgClass: 'bg-cyan-500' },
  { id: 'f97316', nome: 'Laranja Solar', bgClass: 'bg-orange-500' },
  { id: '334155', nome: 'Grafite Obsidian', bgClass: 'bg-slate-700' },
];

export const SUGESTOES_SEEDS_MAGICAS = [
  'dragao_leitor',
  'mestre_dos_livros',
  'galaxia_cosmica',
  'feiticeiro_sussurrante',
  'guardiao_da_biblioteca',
  'viajante_estelar',
  'detetive_das_sombras',
  'astronave_42',
  'fênix_dourada',
  'cavaleiro_da_tavola',
  'coruja_sabedoria',
  'explorador_de_mundos',
  'alquimista_das_paginas',
  'lenda_do_tempo',
  'ciber_leitor',
];

export interface AvatarConfig {
  estilo: string;
  seed: string;
  corFundo: string;
  acessorios?: string;
}

export function buildAvatarUrl(config: AvatarConfig): string {
  const estilo = config.estilo || 'adventurer';
  const seed = encodeURIComponent(config.seed || 'leitor');
  const corFundo = config.corFundo || 'f59e0b';

  return `https://api.dicebear.com/9.x/${estilo}/svg?seed=${seed}&backgroundColor=${corFundo}`;
}

export function gerarConfiguracaoAleatoria(nomeBase: string = 'leitor'): AvatarConfig {
  const estiloAleatorio = ESTILOS_AVATAR[Math.floor(Math.random() * ESTILOS_AVATAR.length)].id;
  const corAleatoria = CORES_FUNDO_AVATAR[Math.floor(Math.random() * CORES_FUNDO_AVATAR.length)].id;
  const seedAleatoria =
    Math.random() > 0.4
      ? SUGESTOES_SEEDS_MAGICAS[Math.floor(Math.random() * SUGESTOES_SEEDS_MAGICAS.length)]
      : `${nomeBase}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    estilo: estiloAleatorio,
    seed: seedAleatoria,
    corFundo: corAleatoria,
  };
}
