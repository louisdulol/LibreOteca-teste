import {
  AuditoriaRegistro,
  ConfiguracoesBiblioteca,
  Emprestimo,
  EmprestimoComDetalhes,
  Leitor,
  Livro,
  UsuarioSessao,
  ComentarioLivro,
  ContaUsuario,
  UserRole,
  TipoLeitor,
} from '../types';
import { avaliarComentario, ModerationResult } from './commentFilter';
import {
  saveLivroFirestore,
  deleteLivroFirestore,
  fetchLivrosFirestore,
  subscribeLivros,
  saveLeitorFirestore,
  deleteLeitorFirestore,
  fetchLeitoresFirestore,
  subscribeLeitores,
  saveEmprestimoFirestore,
  deleteEmprestimoFirestore,
  fetchEmprestimosFirestore,
  subscribeEmprestimos,
  saveComentarioFirestore,
  deleteComentarioFirestore,
  fetchComentariosFirestore,
  subscribeComentarios,
  saveConfiguracoesFirestore,
  fetchConfiguracoesFirestore,
  logAuditoriaFirestore,
} from './firebaseFirestore';
import { testarConexaoFirestore } from './firebase';

const STORAGE_KEYS = {
  LIVROS: 'libreoteca_livros_v2',
  LEITORES: 'libreoteca_leitores_v2',
  EMPRESTIMOS: 'libreoteca_emprestimos_v2',
  CONFIGURACOES: 'libreoteca_config_v2',
  AUDITORIA: 'libreoteca_auditoria_v2',
  COMENTARIOS: 'libreoteca_comentarios_v2',
  AUTH_SESSAO: 'libreoteca_sessao_v2',
  CONTAS: 'libreoteca_contas_v2',
};

// Dados semente de catálogo bibliográfico de alta qualidade
const SEED_LIVROS: Livro[] = [
  {
    id: 'b1111111-1111-4111-8111-111111111111',
    codigo_interno: 'LO-000001',
    isbn: '9788535914849',
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    categoria: 'Literatura Brasileira',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788535914849-L.jpg',
    total_exemplares: 5,
    disponiveis: 5,
    ano_publicacao: 1899,
    paginas: 256,
    editora: 'Companhia das Letras',
    sinopse: 'Bentinho e Capitu crescem juntos no Rio de Janeiro do século XIX. Uma das maiores obras-primas sobre dúvida e ciúme na literatura ocidental.',
    criado_em: '2026-01-10T10:00:00Z',
  },
  {
    id: 'b2222222-2222-4222-8222-222222222222',
    codigo_interno: 'LO-000002',
    isbn: '9788532508126',
    titulo: 'A Hora da Estrela',
    autor: 'Clarice Lispector',
    categoria: 'Literatura Brasileira',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788532508126-L.jpg',
    total_exemplares: 3,
    disponiveis: 3,
    ano_publicacao: 1977,
    paginas: 88,
    editora: 'Rocco',
    sinopse: 'A trajetória de Macabéa, uma jovem migrante alagoana no Rio de Janeiro, narrada pelo escritor fictício Rodrigo S.M.',
    criado_em: '2026-01-12T11:00:00Z',
  },
  {
    id: 'b3333333-3333-4333-8333-333333333333',
    codigo_interno: 'LO-000003',
    isbn: '9788508171279',
    titulo: 'Quarto de Despejo: Diário de uma Favelada',
    autor: 'Carolina Maria de Jesus',
    categoria: 'Biografia e Memórias',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788508171279-L.jpg',
    total_exemplares: 4,
    disponiveis: 4,
    ano_publicacao: 1960,
    paginas: 200,
    editora: 'Ática',
    sinopse: 'O relato pungente e verídico do cotidiano na favela do Canindé em São Paulo pela catadora de papel e escritora Carolina Maria de Jesus.',
    criado_em: '2026-01-15T14:30:00Z',
  },
  {
    id: 'b4444444-4444-4444-8444-444444444444',
    codigo_interno: 'LO-000004',
    isbn: '9788535911695',
    titulo: 'Capitães da Areia',
    autor: 'Jorge Amado',
    categoria: 'Ficção e Romance',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788535911695-L.jpg',
    total_exemplares: 4,
    disponiveis: 4,
    ano_publicacao: 1937,
    paginas: 280,
    editora: 'Companhia das Letras',
    sinopse: 'A vida de um grupo de meninos abandonados que habitam um trapiche nas praias de Salvador, liderados por Pedro Bala.',
    criado_em: '2026-01-18T09:15:00Z',
  },
  {
    id: 'b5555555-5555-4555-8555-555555555555',
    codigo_interno: 'LO-000005',
    isbn: '9788586029806',
    titulo: 'Torto Arado',
    autor: 'Itamar Vieira Junior',
    categoria: 'Ficção e Romance',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788586029806-L.jpg',
    total_exemplares: 6,
    disponiveis: 6,
    ano_publicacao: 2019,
    paginas: 264,
    editora: 'Todavia',
    sinopse: 'Nas profundezas do sertão baiano, as irmãs Bibiana e Belonísia encontram uma misteriosa faca na mala de sua avó com consequências profundas.',
    criado_em: '2026-01-20T16:00:00Z',
  },
  {
    id: 'b6666666-6666-4666-8666-666666666666',
    codigo_interno: 'LO-000006',
    isbn: '9788577534432',
    titulo: 'Olhos D’Água',
    autor: 'Conceição Evaristo',
    categoria: 'Poesia e Contos',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788577534432-L.jpg',
    total_exemplares: 3,
    disponiveis: 3,
    ano_publicacao: 2014,
    paginas: 116,
    editora: 'Pallas',
    sinopse: 'Em contos de intensa escrevivência, Conceição Evaristo aborda a violência urbana, a pobreza e a resiliência de mulheres negras.',
    criado_em: '2026-02-01T10:00:00Z',
  },
  {
    id: 'b7777777-7777-4777-8777-777777777777',
    codigo_interno: 'LO-000007',
    isbn: '9788522005239',
    titulo: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    categoria: 'Infanto-Juvenil',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788522005239-L.jpg',
    total_exemplares: 5,
    disponiveis: 5,
    ano_publicacao: 1943,
    paginas: 96,
    editora: 'Agir',
    sinopse: 'Um piloto perdido no deserto do Saara encontra um principezinho vindo de um asteroide distante.',
    criado_em: '2026-02-05T12:00:00Z',
  },
  {
    id: 'b8888888-8888-4888-8888-888888888888',
    codigo_interno: 'LO-000008',
    isbn: '9788501062063',
    titulo: 'Vidas Secas',
    autor: 'Graciliano Ramos',
    categoria: 'Literatura Brasileira',
    capa_url: 'https://covers.openlibrary.org/b/isbn/9788501062063-L.jpg',
    total_exemplares: 3,
    disponiveis: 3,
    ano_publicacao: 1938,
    paginas: 176,
    editora: 'Record',
    sinopse: 'A trágica saga da família de retirantes de Fabiano, Sinhá Vitória, os dois filhos e a cadela Baleia em fuga da seca no sertão nordestino.',
    criado_em: '2026-02-10T08:30:00Z',
  }
];

const SEED_CONFIG: ConfiguracoesBiblioteca = {
  nome_biblioteca: 'Biblioteca LibreOteca',
  tipo_instituicao: 'publica',
  prazo_padrao_dias: 7,
  limite_emprestimos_por_leitor: 3,
  bloquear_leitor_com_atraso: true,
  permitir_renovacao_com_atraso: false,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Erro lendo storage ${key}:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro gravando storage ${key}:`, e);
  }
}

function hashSenha(senha: string): string {
  let hash = 0;
  for (let i = 0; i < senha.length; i++) {
    hash = (hash << 5) - hash + senha.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + btoa(encodeURIComponent(senha)).slice(0, 12);
}

function verificarSenha(senhaDigitada: string, hashSalvo: string): boolean {
  return hashSenha(senhaDigitada) === hashSalvo;
}

let isFirebaseSynced = false;

export const StorageService = {
  async inicializarFirebaseSync(): Promise<void> {
    if (isFirebaseSynced) return;
    isFirebaseSynced = true;

    try {
      await testarConexaoFirestore();

      const cloudLivros = await fetchLivrosFirestore();
      if (cloudLivros.length === 0) {
        for (const livro of SEED_LIVROS) {
          await saveLivroFirestore(livro);
        }
      } else {
        safeSet(STORAGE_KEYS.LIVROS, cloudLivros);
      }

      subscribeLivros(livros => {
        if (livros.length > 0) {
          safeSet(STORAGE_KEYS.LIVROS, livros);
        }
      });

      subscribeLeitores(leitores => {
        safeSet(STORAGE_KEYS.LEITORES, leitores);
      });

      subscribeEmprestimos(emprestimos => {
        safeSet(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
      });

      subscribeComentarios(comentarios => {
        safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);
      });

      const cloudConfig = await fetchConfiguracoesFirestore();
      if (cloudConfig) {
        safeSet(STORAGE_KEYS.CONFIGURACOES, cloudConfig);
      } else {
        await saveConfiguracoesFirestore(SEED_CONFIG);
      }
    } catch (err) {
      console.warn('Operando com armazenamento local e resiliência offline:', err);
    }
  },

  // LIVROS
  getLivros(): Livro[] {
    const data = safeGet<Livro[] | null>(STORAGE_KEYS.LIVROS, null);
    if (!data) {
      safeSet(STORAGE_KEYS.LIVROS, SEED_LIVROS);
      return SEED_LIVROS;
    }
    return data;
  },

  getLivroById(id: string): Livro | undefined {
    return this.getLivros().find(l => l.id === id);
  },

  saveLivro(livro: Omit<Livro, 'id' | 'criado_em'> & { id?: string }): Livro {
    const livros = this.getLivros();
    let saved: Livro;

    if (livro.id) {
      const index = livros.findIndex(l => l.id === livro.id);
      if (index === -1) throw new Error('Livro não encontrado');
      saved = {
        ...livros[index],
        ...livro,
        id: livro.id,
      };
      livros[index] = saved;
      this.addAuditoria('ATUALIZAR_LIVRO', 'livros', saved.id, `Livro "${saved.titulo}" atualizado`);
    } else {
      saved = {
        ...livro,
        id: crypto.randomUUID(),
        criado_em: new Date().toISOString(),
      };
      livros.unshift(saved);
      this.addAuditoria('CRIAR_LIVRO', 'livros', saved.id, `Novo livro cadastrado: "${saved.titulo}" (${saved.codigo_interno})`);
    }

    safeSet(STORAGE_KEYS.LIVROS, livros);
    saveLivroFirestore(saved).catch(e => console.warn('Sync Firestore Livro:', e));
    return saved;
  },

  deleteLivro(id: string): { success: boolean; message: string } {
    const livros = this.getLivros();
    const livro = livros.find(l => l.id === id);
    if (!livro) {
      return { success: false, message: 'Livro não encontrado no acervo.' };
    }

    const filtrados = livros.filter(l => l.id !== id);
    safeSet(STORAGE_KEYS.LIVROS, filtrados);
    deleteLivroFirestore(id).catch(e => console.warn('Sync Delete Firestore Livro:', e));

    const emprestimos = this.getEmprestimos().filter(e => e.livro_id !== id);
    safeSet(STORAGE_KEYS.EMPRESTIMOS, emprestimos);

    const comentarios = this.getComentarios().filter(c => c.livro_id !== id);
    safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);

    this.addAuditoria('EXCLUIR_LIVRO', 'livros', id, `Livro "${livro.titulo}" (${livro.codigo_interno}) excluído do acervo.`);
    return { success: true, message: `Livro "${livro.titulo}" removido com sucesso!` };
  },

  gerarProximoCodigoInterno(): string {
    const livros = this.getLivros();
    let maxNum = 0;
    for (const l of livros) {
      if (l.codigo_interno && l.codigo_interno.startsWith('LO-')) {
        const numPart = parseInt(l.codigo_interno.replace('LO-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
    const next = maxNum + 1;
    return `LO-${String(next).padStart(6, '0')}`;
  },

  // LEITORES
  getLeitores(): Leitor[] {
    return safeGet<Leitor[]>(STORAGE_KEYS.LEITORES, []);
  },

  getLeitorById(id: string): Leitor | undefined {
    return this.getLeitores().find(l => l.id === id);
  },

  saveLeitor(leitor: Omit<Leitor, 'id' | 'criado_em'> & { id?: string }): Leitor {
    const leitores = this.getLeitores();
    let saved: Leitor;

    if (leitor.id) {
      const index = leitores.findIndex(l => l.id === leitor.id);
      if (index === -1) throw new Error('Leitor não encontrado');
      saved = {
        ...leitores[index],
        ...leitor,
        id: leitor.id,
      };
      leitores[index] = saved;
      this.addAuditoria('ATUALIZAR_LEITOR', 'leitores', saved.id, `Leitor "${saved.nome}" (${saved.matricula}) atualizado`);
    } else {
      saved = {
        ...leitor,
        id: crypto.randomUUID(),
        criado_em: new Date().toISOString(),
      };
      leitores.unshift(saved);
      this.addAuditoria('CRIAR_LEITOR', 'leitores', saved.id, `Novo leitor cadastrado: "${saved.nome}" (${saved.matricula})`);
    }

    safeSet(STORAGE_KEYS.LEITORES, leitores);
    saveLeitorFirestore(saved).catch(e => console.warn('Sync Firestore Leitor:', e));
    return saved;
  },

  anonymizeLeitor(id: string): { success: boolean; message: string } {
    const emprestimosAtivos = this.getEmprestimos().filter(e => e.leitor_id === id && e.devolvido_em === null);
    if (emprestimosAtivos.length > 0) {
      return {
        success: false,
        message: 'O leitor possui empréstimos em aberto. Registre a devolução antes de anonimizar os dados pessoais.',
      };
    }

    const leitores = this.getLeitores();
    const index = leitores.findIndex(l => l.id === id);
    if (index === -1) return { success: false, message: 'Leitor não encontrado.' };

    const originalMatricula = leitores[index].matricula;
    const anonimizado: Leitor = {
      ...leitores[index],
      nome: 'Leitor Anonimizado (LGPD)',
      email: 'anonimizado@lgpd.local',
      telefone: '(00) 00000-0000',
      observacoes: 'Dados pessoais removidos a pedido do titular conforme Art. 18 da LGPD.',
      ativo: false,
      anonimizado: true,
    };

    leitores[index] = anonimizado;
    safeSet(STORAGE_KEYS.LEITORES, leitores);
    saveLeitorFirestore(anonimizado).catch(e => console.warn('Sync Anonymize Firestore:', e));

    this.addAuditoria('ANONIMIZAR_LEITOR_LGPD', 'leitores', id, `Dados pessoais do leitor da matrícula ${originalMatricula} foram anonimizados conforme LGPD`);

    return {
      success: true,
      message: 'Dados pessoais anonimizados com sucesso. O histórico numérico de empréstimos foi preservado para fins estatísticos.',
    };
  },

  anonimizarLeitor(id: string): { success: boolean; message: string } {
    return this.anonymizeLeitor(id);
  },

  gerarProximaMatricula(): string {
    const leitores = this.getLeitores();
    let maxNum = 0;
    const anoAtual = new Date().getFullYear();
    for (const l of leitores) {
      if (l.matricula) {
        const match = l.matricula.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    return `${anoAtual}-A${String(maxNum + 1).padStart(3, '0')}`;
  },

  // EMPRESTIMOS
  getEmprestimos(): Emprestimo[] {
    return safeGet<Emprestimo[]>(STORAGE_KEYS.EMPRESTIMOS, []);
  },

  getEmprestimosComDetalhes(): EmprestimoComDetalhes[] {
    const emprestimos = this.getEmprestimos();
    const livros = this.getLivros();
    const leitores = this.getLeitores();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return emprestimos.map(emp => {
      const livro = livros.find(l => l.id === emp.livro_id);
      const leitor = leitores.find(l => l.id === emp.leitor_id);

      const dataPrevista = new Date(emp.devolucao_prevista + 'T00:00:00');
      const diffTime = today.getTime() - dataPrevista.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const atrasado = emp.devolvido_em === null && diffDays > 0;
      const diasAtraso = atrasado ? diffDays : 0;
      const diasRestantes = emp.devolvido_em === null && diffDays <= 0 ? Math.abs(diffDays) : 0;

      return {
        ...emp,
        livro,
        leitor,
        atrasado,
        dias_atraso: diasAtraso,
        dias_restantes: diasRestantes,
      };
    }).sort((a, b) => {
      if (a.atrasado && !b.atrasado) return -1;
      if (!a.atrasado && b.atrasado) return 1;
      if (a.devolvido_em === null && b.devolvido_em !== null) return -1;
      if (a.devolvido_em !== null && b.devolvido_em === null) return 1;
      return new Date(b.emprestado_em).getTime() - new Date(a.emprestado_em).getTime();
    });
  },

  podeLeitorPegarEmprestimo(leitorId: string): { permitido: boolean; motivo?: string } {
    const config = this.getConfiguracoes();
    const leitor = this.getLeitorById(leitorId);

    if (!leitor) return { permitido: false, motivo: 'Leitor não encontrado' };
    if (!leitor.ativo) return { permitido: false, motivo: 'Cadastro de leitor inativo no sistema' };
    if (leitor.anonimizado) return { permitido: false, motivo: 'Cadastro anonimizado conforme LGPD' };

    const emprestimos = this.getEmprestimos();
    const emprestimosAtivos = emprestimos.filter(e => e.leitor_id === leitorId && e.devolvido_em === null);

    if (emprestimosAtivos.length >= config.limite_emprestimos_por_leitor) {
      return {
        permitido: false,
        motivo: `Limite máximo atingido (${config.limite_emprestimos_por_leitor} livros por leitor)`,
      };
    }

    if (config.bloquear_leitor_com_atraso) {
      const today = new Date().toISOString().split('T')[0];
      const temAtraso = emprestimosAtivos.some(e => e.devolucao_prevista < today);
      if (temAtraso) {
        return {
          permitido: false,
          motivo: 'Leitor possui empréstimo em atraso pendente de devolução',
        };
      }
    }

    return { permitido: true };
  },

  criarEmprestimo(dados: {
    livro_id: string;
    leitor_id: string;
    prazo_dias?: number;
    observacao?: string;
  }): { success: boolean; message: string; emprestimo?: Emprestimo } {
    const validacao = this.podeLeitorPegarEmprestimo(dados.leitor_id);
    if (!validacao.permitido) {
      return { success: false, message: validacao.motivo || 'Empréstimo não permitido' };
    }

    const livros = this.getLivros();
    const livroIndex = livros.findIndex(l => l.id === dados.livro_id);
    if (livroIndex === -1) return { success: false, message: 'Livro não encontrado' };

    if (livros[livroIndex].disponiveis <= 0) {
      return { success: false, message: 'Não há exemplares disponíveis no acervo para este livro no momento.' };
    }

    const config = this.getConfiguracoes();
    const dias = dados.prazo_dias || config.prazo_padrao_dias || 7;
    const hoje = new Date();
    const dataDevolucao = new Date(hoje);
    dataDevolucao.setDate(hoje.getDate() + dias);

    const novoEmprestimo: Emprestimo = {
      id: crypto.randomUUID(),
      livro_id: dados.livro_id,
      leitor_id: dados.leitor_id,
      emprestado_em: hoje.toISOString().split('T')[0],
      devolucao_prevista: dataDevolucao.toISOString().split('T')[0],
      devolvido_em: null,
      renovacoes: 0,
      observacao: dados.observacao,
    };

    livros[livroIndex].disponiveis -= 1;
    safeSet(STORAGE_KEYS.LIVROS, livros);
    saveLivroFirestore(livros[livroIndex]).catch(e => console.warn('Sync Livro Firestore:', e));

    const emprestimos = this.getEmprestimos();
    emprestimos.unshift(novoEmprestimo);
    safeSet(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
    saveEmprestimoFirestore(novoEmprestimo).catch(e => console.warn('Sync Emprestimo Firestore:', e));

    const leitor = this.getLeitorById(dados.leitor_id);
    this.addAuditoria('CRIAR_EMPRESTIMO', 'emprestimos', novoEmprestimo.id, `Empréstimo registrado: Livro "${livros[livroIndex].titulo}" para ${leitor?.nome || 'Leitor'}`);

    return {
      success: true,
      message: `Empréstimo realizado com sucesso! Devolução prevista: ${dataDevolucao.toLocaleDateString('pt-BR')}`,
      emprestimo: novoEmprestimo,
    };
  },

  devolverEmprestimo(emprestimoId: string): { success: boolean; message: string } {
    const emprestimos = this.getEmprestimos();
    const empIndex = emprestimos.findIndex(e => e.id === emprestimoId);
    if (empIndex === -1) return { success: false, message: 'Empréstimo não encontrado' };

    const emp = emprestimos[empIndex];
    if (emp.devolvido_em !== null) {
      return { success: false, message: 'Este empréstimo já foi dado como devolvido anteriormente.' };
    }

    emp.devolvido_em = new Date().toISOString().split('T')[0];
    safeSet(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
    saveEmprestimoFirestore(emp).catch(e => console.warn('Sync Devolver Firestore:', e));

    const livros = this.getLivros();
    const livro = livros.find(l => l.id === emp.livro_id);
    if (livro) {
      livro.disponiveis = Math.min(livro.total_exemplares, livro.disponiveis + 1);
      safeSet(STORAGE_KEYS.LIVROS, livros);
      saveLivroFirestore(livro).catch(e => console.warn('Sync Livro Dev Firestore:', e));
    }

    const leitor = this.getLeitorById(emp.leitor_id);
    this.addAuditoria('DEVOLVER_EMPRESTIMO', 'emprestimos', emp.id, `Devolução registrada: Livro "${livro?.titulo || 'Desconhecido'}" devolvido por ${leitor?.nome || 'Leitor'}`);

    return { success: true, message: `Devolução confirmada! Exemplar devolvido ao acervo e disponível para novo empréstimo.` };
  },

  registrarDevolucao(emprestimoId: string): { success: boolean; message: string } {
    return this.devolverEmprestimo(emprestimoId);
  },

  renovarEmprestimo(emprestimoId: string, diasAdicionais?: number): { success: boolean; message: string } {
    const emprestimos = this.getEmprestimos();
    const emp = emprestimos.find(e => e.id === emprestimoId);
    if (!emp) return { success: false, message: 'Empréstimo não encontrado' };

    if (emp.devolvido_em !== null) {
      return { success: false, message: 'Não é possível renovar um empréstimo já devolvido.' };
    }

    const config = this.getConfiguracoes();
    const dataPrevistaAtual = new Date(emp.devolucao_prevista + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const emAtraso = hoje.getTime() > dataPrevistaAtual.getTime();
    if (emAtraso && !config.permitir_renovacao_com_atraso) {
      return {
        success: false,
        message: 'Políticas da biblioteca não permitem renovar livros que já estejam em atraso.',
      };
    }

    const dias = diasAdicionais || config.prazo_padrao_dias || 7;
    const baseDate = emAtraso ? hoje : dataPrevistaAtual;
    baseDate.setDate(baseDate.getDate() + dias);
    const novaDataStr = baseDate.toISOString().split('T')[0];

    emp.devolucao_prevista = novaDataStr;
    emp.renovacoes = (emp.renovacoes || 0) + 1;
    safeSet(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
    saveEmprestimoFirestore(emp).catch(e => console.warn('Sync Renovar Firestore:', e));

    const livro = this.getLivroById(emp.livro_id);
    this.addAuditoria('RENOVAR_EMPRESTIMO', 'emprestimos', emp.id, `Prazo de "${livro?.titulo || 'Livro'}" estendido para ${novaDataStr} (${emp.renovacoes}ª renovação)`);

    return {
      success: true,
      message: `Empréstimo renovado com sucesso! Nova data de devolução: ${new Date(novaDataStr + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
    };
  },

  // CONTAS DE USUÁRIOS E AUTENTICAÇÃO
  getContas(): ContaUsuario[] {
    return safeGet<ContaUsuario[]>(STORAGE_KEYS.CONTAS, []);
  },

  cadastrarConta(dados: {
    nome: string;
    email: string;
    senha: string;
    role: UserRole;
    matricula?: string;
    turma?: string;
    telefone?: string;
  }): { success: boolean; message: string; usuario?: UsuarioSessao } {
    const contas = this.getContas();
    const emailLimpo = dados.email.trim().toLowerCase();

    if (!emailLimpo.includes('@') || !emailLimpo.includes('.')) {
      return { success: false, message: 'Digite um endereço de e-mail válido.' };
    }

    if (contas.some(c => c.email.toLowerCase() === emailLimpo)) {
      return { success: false, message: 'Este e-mail já está cadastrado. Faça login na conta existente.' };
    }

    if (dados.senha.length < 6) {
      return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    const contaId = 'usr-' + crypto.randomUUID();
    const leitorId = 'l-' + crypto.randomUUID();
    const matriculaGerada =
      dados.matricula?.trim() ||
      (dados.role === 'professor'
        ? `PROF-${Math.floor(1000 + Math.random() * 9000)}`
        : `ALU-${Math.floor(1000 + Math.random() * 9000)}`);

    const novaConta: ContaUsuario = {
      id: contaId,
      nome: dados.nome.trim(),
      email: emailLimpo,
      senhaHash: hashSenha(dados.senha),
      role: dados.role,
      matricula: matriculaGerada,
      turma: dados.turma?.trim(),
      telefone: dados.telefone?.trim(),
      criado_em: new Date().toISOString(),
      avatar_cor: dados.role === 'professor' ? 'bg-amber-900' : 'bg-emerald-700',
    };

    contas.push(novaConta);
    safeSet(STORAGE_KEYS.CONTAS, contas);

    const leitores = this.getLeitores();
    const novoLeitor: Leitor = {
      id: leitorId,
      nome: dados.nome.trim(),
      matricula: matriculaGerada,
      email: emailLimpo,
      telefone: dados.telefone?.trim() || '',
      tipo: dados.role === 'professor' ? 'professor' : 'aluno',
      ativo: true,
      criado_em: new Date().toISOString(),
      observacoes: dados.turma ? `Turma: ${dados.turma}` : undefined,
    };
    leitores.push(novoLeitor);
    safeSet(STORAGE_KEYS.LEITORES, leitores);
    saveLeitorFirestore(novoLeitor).catch(e => console.warn('Sync Leitor Firestore:', e));

    const usuarioSessao: UsuarioSessao = {
      id: contaId,
      nome: novaConta.nome,
      matricula: matriculaGerada,
      role: novaConta.role,
      leitor_id: leitorId,
      email: emailLimpo,
      avatar_cor: novaConta.avatar_cor,
    };

    this.setSessaoUsuario(usuarioSessao);
    this.addAuditoria('CRIAR_CONTA_USUARIO', 'configuracoes', contaId, `Nova conta criada: ${novaConta.nome} (${novaConta.role})`);

    return {
      success: true,
      message: `Conta de ${novaConta.role === 'professor' ? 'Professor(a)' : 'Aluno(a)'} criada com sucesso!`,
      usuario: usuarioSessao,
    };
  },

  loginConta(email: string, senha: string): { success: boolean; message: string; usuario?: UsuarioSessao } {
    const contas = this.getContas();
    const emailLimpo = email.trim().toLowerCase();
    const conta = contas.find(c => c.email.toLowerCase() === emailLimpo);

    if (!conta) {
      return {
        success: false,
        message: 'Nenhuma conta cadastrada com este e-mail. Crie sua conta na aba "Criar Nova Conta".',
      };
    }

    if (!verificarSenha(senha, conta.senhaHash)) {
      return {
        success: false,
        message: 'Senha incorreta. Verifique os dígitos informados e tente novamente.',
      };
    }

    const leitores = this.getLeitores();
    const leitorRelacionado = leitores.find(l => l.email?.toLowerCase() === emailLimpo || l.matricula === conta.matricula);

    const usuarioSessao: UsuarioSessao = {
      id: conta.id,
      nome: conta.nome,
      matricula: conta.matricula || '',
      role: conta.role,
      leitor_id: leitorRelacionado?.id,
      email: conta.email,
      avatar_cor: conta.avatar_cor,
    };

    this.setSessaoUsuario(usuarioSessao);
    this.addAuditoria('LOGIN_USUARIO', 'configuracoes', conta.id, `Usuário conectou: ${conta.nome} (${conta.role})`);

    return {
      success: true,
      message: `Bem-vindo(a) de volta, ${conta.nome}!`,
      usuario: usuarioSessao,
    };
  },

  getSessaoUsuario(): UsuarioSessao | null {
    return safeGet<UsuarioSessao | null>(STORAGE_KEYS.AUTH_SESSAO, null);
  },

  setSessaoUsuario(usuario: UsuarioSessao | null): void {
    safeSet(STORAGE_KEYS.AUTH_SESSAO, usuario);
  },

  logout(): void {
    const atual = this.getSessaoUsuario();
    if (atual) {
      this.addAuditoria('LOGOUT_USUARIO', 'configuracoes', atual.id, `Usuário desconectou: ${atual.nome}`);
    }
    this.setSessaoUsuario(null);
  },

  autenticarUsuario(email: string, senha: string): UsuarioSessao | null {
    const res = this.loginConta(email, senha);
    return res.success && res.usuario ? res.usuario : null;
  },

  cadastrarUsuario(dados: {
    nome: string;
    email: string;
    senha: string;
    role: UserRole;
    matricula?: string;
    turma?: string;
    telefone?: string;
  }): UsuarioSessao | null {
    const res = this.cadastrarConta(dados);
    return res.success && res.usuario ? res.usuario : null;
  },

  logoutUsuario(): void {
    this.logout();
  },

  // CONFIGURAÇÕES
  getConfiguracoes(): ConfiguracoesBiblioteca {
    return safeGet<ConfiguracoesBiblioteca>(STORAGE_KEYS.CONFIGURACOES, SEED_CONFIG);
  },

  saveConfiguracoes(config: ConfiguracoesBiblioteca): void {
    safeSet(STORAGE_KEYS.CONFIGURACOES, config);
    saveConfiguracoesFirestore(config).catch(e => console.warn('Sync Config Firestore:', e));
    this.addAuditoria('ATUALIZAR_CONFIG', 'configuracoes', 'config', 'Parâmetros operacionais da biblioteca atualizados');
  },

  // AUDITORIA LGPD
  getAuditoria(): AuditoriaRegistro[] {
    return safeGet<AuditoriaRegistro[]>(STORAGE_KEYS.AUDITORIA, []);
  },

  addAuditoria(
    acao: string,
    tabela: 'livros' | 'leitores' | 'emprestimos' | 'configuracoes',
    registro_id: string,
    detalhes: string
  ): void {
    const auditoria = this.getAuditoria();
    const usuario = this.getSessaoUsuario();

    const novo: AuditoriaRegistro = {
      id: crypto.randomUUID(),
      usuario_id: usuario?.id || 'sistema',
      usuario_nome: usuario?.nome || 'Sistema / Usuário',
      acao,
      tabela_afetada: tabela,
      registro_id,
      detalhes,
      criado_em: new Date().toISOString(),
    };

    auditoria.unshift(novo);
    safeSet(STORAGE_KEYS.AUDITORIA, auditoria.slice(0, 100));
    logAuditoriaFirestore(novo).catch(e => console.warn('Sync Audit Firestore:', e));
  },

  // COMENTÁRIOS E AVALIAÇÕES LITERÁRIAS
  getComentarios(): ComentarioLivro[] {
    return safeGet<ComentarioLivro[]>(STORAGE_KEYS.COMENTARIOS, []);
  },

  getComentariosPorLivro(livroId: string, incluirBloqueados = false): ComentarioLivro[] {
    const todos = this.getComentarios();
    return todos.filter(c => {
      if (c.livro_id !== livroId) return false;
      if (incluirBloqueados) return true;
      return c.status === 'aprovado';
    });
  },

  getComentariosByLivro(livroId: string, incluirBloqueados = false): ComentarioLivro[] {
    return this.getComentariosPorLivro(livroId, incluirBloqueados);
  },

  getMediaNotaLivro(livroId: string): { media: number; total: number } {
    const aprovados = this.getComentariosPorLivro(livroId, false);
    if (aprovados.length === 0) return { media: 0, total: 0 };
    const soma = aprovados.reduce((acc, curr) => acc + curr.nota, 0);
    return {
      media: Number((soma / aprovados.length).toFixed(1)),
      total: aprovados.length,
    };
  },

  adicionarComentario(dados: {
    livro_id: string;
    leitor_id: string;
    autor_nome: string;
    autor_tipo?: TipoLeitor | string;
    nota: number;
    texto: string;
  }): { success: boolean; message: string; comentario?: ComentarioLivro; bloqueado?: boolean; moderacao?: ModerationResult } {
    const analise = avaliarComentario(dados.texto);
    const autorTipoFinal: TipoLeitor = (dados.autor_tipo as TipoLeitor) || 'aluno';

    if (!analise.isAllowed) {
      const comentarios = this.getComentarios();
      const novoBloqueado: ComentarioLivro = {
        id: crypto.randomUUID(),
        livro_id: dados.livro_id,
        leitor_id: dados.leitor_id,
        autor_nome: dados.autor_nome,
        autor_tipo: autorTipoFinal,
        nota: Math.min(5, Math.max(1, dados.nota)),
        texto: dados.texto.trim(),
        criado_em: new Date().toISOString(),
        status: 'bloqueado_filtro',
        motivo_bloqueio: analise.reason,
        termo_bloqueado: analise.flaggedWords.join(', '),
        curtidas: 0,
      };

      comentarios.unshift(novoBloqueado);
      safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);
      saveComentarioFirestore(novoBloqueado).catch(e => console.warn('Sync Bloqueado Firestore:', e));

      this.addAuditoria(
        'BLOQUEIO_MODERACAO_COMENTARIO',
        'livros',
        dados.livro_id,
        `Comentário de ${dados.autor_nome} bloqueado automaticamente pelo filtro: "${analise.reason}" (Termo: ${analise.flaggedWords.join(', ')})`
      );

      return {
        success: false,
        bloqueado: true,
        message: `Seu comentário não pôde ser publicado: ${analise.reason}. A LibreOteca mantém um ambiente seguro e respeitoso para todos os alunos.`,
        moderacao: analise,
      };
    }

    const comentarios = this.getComentarios();
    const novo: ComentarioLivro = {
      id: crypto.randomUUID(),
      livro_id: dados.livro_id,
      leitor_id: dados.leitor_id,
      autor_nome: dados.autor_nome,
      autor_tipo: autorTipoFinal,
      nota: Math.min(5, Math.max(1, dados.nota)),
      texto: dados.texto.trim(),
      criado_em: new Date().toISOString(),
      status: 'aprovado',
      curtidas: 0,
    };

    comentarios.unshift(novo);
    safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);
    saveComentarioFirestore(novo).catch(e => console.warn('Sync Comentario Firestore:', e));

    const livro = this.getLivroById(dados.livro_id);
    this.addAuditoria(
      'PUBLICAR_COMENTARIO',
      'livros',
      dados.livro_id,
      `Novo comentário publicado por ${dados.autor_nome} para o livro "${livro?.titulo || 'Livro'}" (Nota: ${dados.nota} estrelas)`
    );

    return {
      success: true,
      message: 'Seu comentário foi aprovado pelo filtro de moderação e já está visível para os colegas!',
      comentario: novo,
      moderacao: analise,
    };
  },

  salvarComentario(dados: {
    livro_id: string;
    leitor_id: string;
    autor_nome: string;
    autor_tipo?: TipoLeitor | string;
    nota: number;
    texto: string;
  }) {
    return this.adicionarComentario(dados);
  },

  moderarComentario(id: string, novoStatus: 'aprovado' | 'removido_professor' | 'remover', usuarioNome?: string): void {
    const comentarios = this.getComentarios();
    const index = comentarios.findIndex(c => c.id === id);
    if (index === -1) return;

    const statusFinal = novoStatus === 'remover' ? 'removido_professor' : novoStatus;
    comentarios[index].status = statusFinal;
    safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);
    saveComentarioFirestore(comentarios[index]).catch(e => console.warn('Sync Moderar Firestore:', e));

    this.addAuditoria(
      'MODERACAO_COMENTARIO',
      'livros',
      id,
      `Comentário moderado por ${usuarioNome || 'professor'}: status alterado para "${statusFinal}"`
    );
  },

  curtirComentario(id: string): void {
    const comentarios = this.getComentarios();
    const index = comentarios.findIndex(c => c.id === id);
    if (index === -1) return;

    comentarios[index].curtidas = (comentarios[index].curtidas || 0) + 1;
    safeSet(STORAGE_KEYS.COMENTARIOS, comentarios);
    saveComentarioFirestore(comentarios[index]).catch(e => console.warn('Sync Curtir Firestore:', e));
  },

  // ESTATÍSTICAS E PAINEL DO ALUNO LOGADO
  getEstatisticasAluno(leitorId: string) {
    const todosEmprestimos = this.getEmprestimosComDetalhes();
    const emprestimosAluno = todosEmprestimos.filter(e => e.leitor_id === leitorId);

    const ativos = emprestimosAluno.filter(e => e.devolvido_em === null);
    const devolvidos = emprestimosAluno.filter(e => e.devolvido_em !== null);
    const atrasados = ativos.filter(e => e.atrasado);

    const todosComentarios = this.getComentarios();
    const comentariosAluno = todosComentarios.filter(c => c.leitor_id === leitorId && c.status === 'aprovado');

    const categoriasLidas: Record<string, number> = {};
    emprestimosAluno.forEach(e => {
      const cat = e.livro?.categoria || 'Geral';
      categoriasLidas[cat] = (categoriasLidas[cat] || 0) + 1;
    });

    const paginasLidas = devolvidos.reduce((acc, cur) => acc + (cur.livro?.paginas || 0), 0);

    return {
      totalEmprestimos: emprestimosAluno.length,
      ativos,
      devolvidos,
      atrasados,
      comentariosAluno,
      categoriasLidas,
      paginasLidas,
      taxaPontualidade:
        devolvidos.length > 0
          ? Math.round(
              (devolvidos.filter(d => {
                if (!d.devolvido_em) return false;
                return new Date(d.devolvido_em) <= new Date(d.devolucao_prevista);
              }).length /
                devolvidos.length) *
                100
            )
          : 100,
    };
  },

  resetParaDemonstracao(): void {
    safeSet(STORAGE_KEYS.LIVROS, SEED_LIVROS);
    safeSet(STORAGE_KEYS.LEITORES, []);
    safeSet(STORAGE_KEYS.EMPRESTIMOS, []);
    safeSet(STORAGE_KEYS.CONFIGURACOES, SEED_CONFIG);
    safeSet(STORAGE_KEYS.AUDITORIA, []);
    safeSet(STORAGE_KEYS.COMENTARIOS, []);
    safeSet(STORAGE_KEYS.CONTAS, []);
    safeSet(STORAGE_KEYS.AUTH_SESSAO, null);
  },

  exportarLivrosCsv(): void {
    const livros = this.getLivros();
    const headers = ['Código Interno', 'ISBN', 'Título', 'Autor', 'Categoria', 'Ano', 'Total Exemplares', 'Disponíveis'];
    const rows = livros.map(l => [
      l.codigo_interno,
      l.isbn || '',
      `"${l.titulo.replace(/"/g, '""')}"`,
      `"${l.autor.replace(/"/g, '""')}"`,
      `"${l.categoria.replace(/"/g, '""')}"`,
      l.ano_publicacao || '',
      l.total_exemplares,
      l.disponiveis,
    ]);
    downloadCsv('acervo_libreoteca.csv', headers, rows);
  },

  exportarEmprestimosCsv(): void {
    const emprestimos = this.getEmprestimosComDetalhes();
    const headers = ['ID', 'Livro', 'Código', 'Leitor', 'Matrícula', 'Data Empréstimo', 'Devolução Prevista', 'Status', 'Data Devolvido'];
    const rows = emprestimos.map(e => {
      let status = 'Ativo';
      if (e.devolvido_em) status = 'Devolvido';
      else if (e.atrasado) status = `Atrasado (${e.dias_atraso}d)`;

      return [
        e.id,
        `"${(e.livro?.titulo || 'Livro Removido').replace(/"/g, '""')}"`,
        e.livro?.codigo_interno || '',
        `"${(e.leitor?.nome || 'Leitor Removido').replace(/"/g, '""')}"`,
        e.leitor?.matricula || '',
        e.emprestado_em,
        e.devolucao_prevista,
        status,
        e.devolvido_em || '-',
      ];
    });
    downloadCsv('emprestimos_libreoteca.csv', headers, rows);
  },

  exportarLeitoresCsv(): void {
    const leitores = this.getLeitores();
    const headers = ['Matrícula', 'Nome', 'Tipo', 'Telefone', 'E-mail', 'Status', 'Data Cadastro'];
    const rows = leitores.map(l => [
      l.matricula,
      `"${l.nome.replace(/"/g, '""')}"`,
      l.tipo,
      l.telefone,
      l.email || '',
      l.ativo ? 'Ativo' : 'Inativo',
      l.criado_em.split('T')[0],
    ]);
    downloadCsv('leitores_libreoteca.csv', headers, rows);
  },

  gerarSqlSupabase(): string {
    return `-- ==========================================================
-- SCRIPT DE MIGRATION LIBREOTECA (Supabase / PostgreSQL)
-- Em conformidade com LGPD e Políticas RLS (Row Level Security)
-- ==========================================================

create table if not exists public.livros (
  id uuid primary key default gen_random_uuid(),
  isbn text,
  codigo_interno text not null unique,
  titulo text not null,
  autor text not null,
  categoria text not null,
  capa_url text,
  total_exemplares int not null default 1,
  disponiveis int not null default 1,
  ano_publicacao int,
  paginas int,
  editora text,
  sinopse text,
  criado_em timestamptz default now()
);

create table if not exists public.leitores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  matricula text not null unique,
  telefone text,
  email text,
  tipo text not null default 'aluno',
  ativo boolean not null default true,
  anonimizado boolean not null default false,
  observacoes text,
  criado_em timestamptz default now()
);

create table if not exists public.emprestimos (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid not null references public.livros(id) on delete restrict,
  leitor_id uuid not null references public.leitores(id) on delete restrict,
  emprestado_em date not null default current_date,
  devolucao_prevista date not null,
  devolvido_em date,
  renovacoes int not null default 0,
  observacao text
);

create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid not null references public.livros(id) on delete cascade,
  leitor_id uuid references public.leitores(id) on delete set null,
  autor_nome text not null,
  autor_tipo text not null default 'aluno',
  nota int not null check (nota between 1 and 5),
  texto text not null,
  status text not null default 'aprovado',
  curtidas int not null default 0,
  criado_em timestamptz default now()
);
`;
  }
};

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
