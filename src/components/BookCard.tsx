import React, { useState } from 'react';
import { Livro, UsuarioSessao } from '../types';
import { StorageService } from '../lib/storage';
import { EditorialCover } from './EditorialCover';
import {
  ArrowRightLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface BookCardProps {
  livro: Livro;
  usuarioAtual?: UsuarioSessao | null;
  onEmprestar: (livro: Livro) => void;
  onEditar: (livro: Livro) => void;
  onExcluir: (livro: Livro) => void;
  onVerDetalhes: (livro: Livro) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  livro,
  usuarioAtual,
  onEmprestar,
  onEditar,
  onExcluir,
  onVerDetalhes,
}) => {
  const usuario = usuarioAtual !== undefined ? usuarioAtual : StorageService.getSessaoUsuario();
  const isProfessor = usuario?.role === 'professor';
  const isAluno = usuario?.role === 'aluno';
  const [menuOpen, setMenuOpen] = useState(false);

  const temDisponivel = livro.disponiveis > 0;
  const porcentagem = Math.round((livro.disponiveis / livro.total_exemplares) * 100);

  return (
    <div
      id={`book-card-${livro.id}`}
      className="group relative flex flex-col bg-[#131926] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-black/40 transition-all duration-300"
    >
      {/* Top Banner / Capa com o EditorialCover */}
      <div
        onClick={() => onVerDetalhes(livro)}
        className="relative h-44 sm:h-56 w-full bg-[#0d121c] overflow-hidden cursor-pointer flex items-center justify-center group-hover:brightness-105 transition-all"
      >
        <EditorialCover
          titulo={livro.titulo}
          autor={livro.autor}
          capaUrl={livro.capa_url}
          categoria={livro.categoria}
          ano={livro.ano_publicacao}
          size="md"
          className="h-44 sm:h-56 w-full"
        />

        {/* Badge do código interno no canto superior esquerdo */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20">
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold bg-black/80 text-amber-300 backdrop-blur-xs border border-white/10 shadow-xs">
            {livro.codigo_interno}
          </span>
        </div>

        {/* Badge da categoria no canto superior direito */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-900/90 text-slate-200 border border-slate-700/50 backdrop-blur-xs shadow-xs">
            {livro.categoria}
          </span>
        </div>
      </div>

      {/* Conteúdo textual */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4
            onClick={() => onVerDetalhes(livro)}
            className="text-sm sm:text-base font-serif font-bold text-white line-clamp-1 hover:text-amber-400 cursor-pointer transition-colors"
            title={livro.titulo}
          >
            {livro.titulo}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">{livro.autor}</p>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
            {livro.ano_publicacao && <span>{livro.ano_publicacao}</span>}
            {livro.ano_publicacao && livro.paginas && <span>•</span>}
            {livro.paginas && <span>{livro.paginas} págs</span>}
          </div>
        </div>

        {/* Status de exemplares */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Disponibilidade:</span>
            <span
              className={`font-semibold text-xs ${
                temDisponivel
                  ? livro.disponiveis === livro.total_exemplares
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {livro.disponiveis} de {livro.total_exemplares} un.
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                temDisponivel
                  ? livro.disponiveis === livro.total_exemplares
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${porcentagem}%` }}
            />
          </div>
        </div>

        {/* Ações inferiores adaptadas por Perfil */}
        <div className="mt-4 flex items-center gap-2">
          {isAluno ? (
            /* Botão para Aluno: Ver Ficha & Comentários */
            <button
              onClick={() => onVerDetalhes(livro)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-xs active:scale-95 border border-slate-700 hover:border-amber-500/40"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Ficha & Comentar</span>
            </button>
          ) : isProfessor ? (
            /* Botões do Professor: Emprestar, Ver, Editar e Excluir */
            <>
              <button
                id={`btn-emprestar-${livro.id}`}
                onClick={() => onEmprestar(livro)}
                disabled={!temDisponivel}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  temDisponivel
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-xs active:scale-95'
                    : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {temDisponivel ? 'Emprestar' : 'Esgotado'}
              </button>

              <button
                id={`btn-detalhes-${livro.id}`}
                onClick={() => onVerDetalhes(livro)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                title="Ver detalhes da obra"
              >
                <Eye className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  id={`btn-menu-${livro.id}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                  title="Opções de gerenciamento"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-1.5 z-40 w-44 bg-[#1a2233] border border-slate-700/80 rounded-xl shadow-2xl py-1 text-xs text-slate-200">
                      <button
                        id={`btn-editar-${livro.id}`}
                        onClick={() => {
                          setMenuOpen(false);
                          onEditar(livro);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        Editar Livro
                      </button>
                      <button
                        id={`btn-excluir-${livro.id}`}
                        onClick={() => {
                          setMenuOpen(false);
                          onExcluir(livro);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        Excluir do Acervo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => onVerDetalhes(livro)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Detalhes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
