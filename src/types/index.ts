export interface Livro {
  id: string;
  isbn?: string;
  codigo_interno: string;
  titulo: string;
  autor: string;
  categoria: string;
  capa_url?: string;
  total_exemplares: number;
  disponiveis: number;
  ano_publicacao?: number | null;
  paginas?: number | null;
  editora?: string;
  sinopse?: string;
  criado_em: string;
}

export type TipoLeitor = 'aluno' | 'professor' | 'comunidade' | 'funcionario';

export interface Leitor {
  id: string;
  nome: string;
  matricula: string;
  telefone: string;
  email?: string;
  tipo: TipoLeitor;
  ativo: boolean;
  anonimizado?: boolean;
  criado_em: string;
  observacoes?: string;
}

export interface Emprestimo {
  id: string;
  livro_id: string;
  leitor_id: string;
  usuario_id?: string;
  emprestado_em: string; // YYYY-MM-DD
  devolucao_prevista: string; // YYYY-MM-DD
  devolvido_em: string | null; // YYYY-MM-DD or null
  renovacoes: number;
  observacao?: string;
}

export interface EmprestimoComDetalhes extends Emprestimo {
  livro?: Livro;
  leitor?: Leitor;
  atrasado: boolean;
  dias_atraso: number;
  dias_restantes: number;
}

export interface AuditoriaRegistro {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  tabela_afetada: 'livros' | 'leitores' | 'emprestimos' | 'configuracoes';
  registro_id?: string;
  detalhes: string;
  criado_em: string;
}

export interface ConfiguracoesBiblioteca {
  nome_biblioteca: string;
  tipo_instituicao: 'escola' | 'publica' | 'comunitaria' | 'universitaria';
  prazo_padrao_dias: number;
  limite_emprestimos_por_leitor: number;
  bloquear_leitor_com_atraso: boolean;
  permitir_renovacao_com_atraso: boolean;
}

export type UserRole = 'professor' | 'aluno';

export interface ContaUsuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: UserRole;
  matricula?: string;
  turma?: string;
  telefone?: string;
  criado_em: string;
  avatar_cor?: string;
}

export interface UsuarioSessao {
  id: string;
  nome: string;
  matricula: string;
  role: UserRole;
  leitor_id?: string; // associado ao registro de Leitor para alunos
  email: string;
  avatar_cor?: string;
  avatar_url?: string;
}

export interface ElementosCarteirinha {
  mostrarFoto: boolean;
  mostrarNome: boolean;
  mostrarCargo: boolean;
  mostrarMatricula: boolean;
  mostrarTurma: boolean;
  mostrarGenero: boolean;
  mostrarQrCode: boolean;
  mostrarBiblioteca: boolean;
  mostrarValidade: boolean;
}

export interface EstiloCarteirinha {
  ativa: boolean; // Se a carteirinha digital está ativada no perfil
  layout: 'padrao-esquerda' | 'moderno-direita' | 'credencial-topo' | 'minimalista-sleek';
  background: string; // ID do preset ou 'personalizado'
  corFundoCustom?: string; // Cor livre da roda de cores
  corFundoSecundaria?: string; // Segunda cor para gradiente livre
  usarGradienteCustom?: boolean;
  corTextoCustom?: string; // Cor livre do texto da carteirinha
  corBordaCustom?: string; // Cor livre da borda
  textura: 'nenhuma' | 'pontilhado' | 'ondas' | 'geometrica' | 'linhas' | 'estrelas' | 'pixel-grid';
  molduraAvatar?: 'nenhuma' | 'ouro-real' | 'neon-pulse' | 'orbita-cosmica' | 'pixel-retro' | 'cristal-arcano' | 'fogo-cyber';
  fonte: 'sans' | 'serif' | 'mono' | 'display' | 'cursiva' | 'retro';
  posicaoQrCode: 'canto-inferior-direito' | 'rodape-central' | 'oculto';
  generoFavorito?: string;
  anoValidade?: string;
  arredondamento?: 'nenhum' | 'pequeno' | 'medio' | 'total';
  tamanhoCard?: 'compacto' | 'padrao' | 'expandido';
  elementos: ElementosCarteirinha;
}

export interface PerfilUsuario {
  id: string; // UID do usuário
  nome: string;
  email: string;
  role: UserRole;
  matricula?: string;
  turma?: string;
  avatarUrl?: string;
  avatarConfig?: {
    estilo: string;
    seed: string;
    corFundo: string;
  };
  molduraAvatar?: 'nenhuma' | 'ouro-real' | 'neon-pulse' | 'orbita-cosmica' | 'pixel-retro' | 'cristal-arcano' | 'fogo-cyber';
  corPerfilCustom?: string; // Cor livre da roda de cores para o perfil
  corDestaqueCustom?: string; // Cor de destaque da roda de cores
  temaPerfil?: 'steam-midnight' | 'steam-summer' | 'cosmic-nebula' | 'cyberpunk-neon' | 'crimson-dark' | 'emerald-sanctuary' | 'parchment-classic' | 'personalizado';
  livroDestaqueId?: string; // Livro em destaque na vitrine do perfil estilo Steam
  perfilPublico: boolean; // Controle de privacidade: público ou privado
  bio?: string;
  metaLeituraAnual?: number;
  generosFavoritos?: string[];
  carteirinha: EstiloCarteirinha;
  atualizado_em?: string;
}

export interface ComentarioLivro {
  id: string;
  livro_id: string;
  leitor_id: string;
  autor_nome: string;
  autor_tipo: TipoLeitor;
  nota: number; // 1 a 5
  texto: string;
  criado_em: string;
  status: 'aprovado' | 'bloqueado_filtro' | 'removido_professor';
  motivo_bloqueio?: string;
  termo_bloqueado?: string;
  curtidas?: number;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
  publisher?: string[];
  number_of_pages_median?: number;
}

export type ActiveTab =
  | 'acervo'
  | 'emprestimos'
  | 'leitores'
  | 'relatorios'
  | 'configuracoes'
  | 'comentarios'
  | 'minhas-estatisticas'
  | 'perfil';

