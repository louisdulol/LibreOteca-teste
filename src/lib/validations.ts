import { z } from 'zod';

export const livroSchema = z.object({
  isbn: z.string().trim().optional(),
  codigo_interno: z.string().min(3, 'Código interno deve ter no mínimo 3 caracteres'),
  titulo: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  autor: z.string().min(2, 'O autor deve ter pelo menos 2 caracteres'),
  categoria: z.string().min(2, 'Selecione ou informe uma categoria'),
  capa_url: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  total_exemplares: z.coerce.number().int().min(1, 'Mínimo de 1 exemplar'),
  disponiveis: z.coerce.number().int().min(0, 'Disponíveis não pode ser negativo'),
  ano_publicacao: z.coerce.number().int().optional().nullable(),
  paginas: z.coerce.number().int().optional().nullable(),
  editora: z.string().optional(),
  sinopse: z.string().optional(),
}).refine(data => data.disponiveis <= data.total_exemplares, {
  message: 'Exemplares disponíveis não podem ultrapassar o total de exemplares',
  path: ['disponiveis'],
});

export const leitorSchema = z.object({
  nome: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  matricula: z.string().min(2, 'Matrícula ou identificador é obrigatório'),
  telefone: z.string().min(8, 'Telefone de contato é obrigatório'),
  email: z.string().email('E-mail em formato inválido').optional().or(z.literal('')),
  tipo: z.enum(['aluno', 'professor', 'comunidade', 'funcionario']),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
});

export const emprestimoSchema = z.object({
  livro_id: z.string().uuid('ID do livro inválido').or(z.string().min(1, 'Selecione um livro')),
  leitor_id: z.string().uuid('ID do leitor inválido').or(z.string().min(1, 'Selecione um leitor')),
  emprestado_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de empréstimo inválida'),
  devolucao_prevista: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data prevista inválida'),
  observacao: z.string().optional(),
});
