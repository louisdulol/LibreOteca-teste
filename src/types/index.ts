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
  | 'minhas-estatisticas';

