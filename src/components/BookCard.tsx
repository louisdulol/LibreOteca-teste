import React from 'react';
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
  const [menuOpen, setMenuOpen] = React.useState(false);

  const temDisponivel = livro.disponiveis > 0;
  const porcentagem = Math.round((livro.disponiveis / livro.total_exemplares) * 100);

  return (
    <div
      id={`book-card-${livro.id}`}
      className="group relative flex flex-col bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all duration-200"
    >
      {/* Top Banner / Capa com o novo sistema EditorialCover */}
      <div
        onClick={() => onVerDetalhes(livro)}
        className="relative h-52 w-full bg-stone-950 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        <EditorialCover
          titulo={livro.titulo}
          autor={livro.autor}
          capaUrl={livro.capa_url}
          categoria={livro.categoria}
          ano={livro.ano_publicacao}
          size="md"
          className="h-52 w-full"
        />

        {/* Badge do código interno no canto superior esquerdo */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-black/75 text-stone-100 backdrop-blur-xs border border-white/10 shadow-xs">
            {livro.codigo_interno}
          </span>
        </div>

        {/* Badge da categoria no canto superior direito */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-stone-900 backdrop-blur-xs shadow-xs">
            {livro.categoria}
          </span>
        </div>
      </div>

      {/* Conteúdo textual */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4
            onClick={() => onVerDetalhes(livro)}
            className="text-base font-serif font-bold text-stone-900 line-clamp-1 hover:text-amber-800 cursor-pointer transition-colors"
            title={livro.titulo}
          >
            {livro.titulo}
          </h4>
          <p className="text-xs text-stone-600 font-medium mt-0.5 line-clamp-1">{livro.autor}</p>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
            {livro.ano_publicacao && <span>Ano {livro.ano_publicacao}</span>}
            {livro.ano_publicacao && livro.paginas && <span>•</span>}
            {livro.paginas && <span>{livro.paginas} págs</span>}
          </div>
        </div>

        {/* Status de exemplares */}
        <div className="mt-3.5 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-500 font-medium">Disponibilidade:</span>
            <span
              className={`font-semibold ${
                temDisponivel
                  ? livro.disponiveis === livro.total_exemplares
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {livro.disponiveis} de {livro.total_exemplares} un.
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                temDisponivel
                  ? livro.disponiveis === livro.total_exemplares
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                  : 'bg-rose-400'
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
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-2xs active:scale-95"
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
                    ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs active:scale-95'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {temDisponivel ? 'Emprestar' : 'Esgotado'}
              </button>

              <button
                id={`btn-detalhes-${livro.id}`}
                onClick={() => onVerDetalhes(livro)}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
                title="Ver detalhes da obra"
              >
                <Eye className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  id={`btn-menu-${livro.id}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
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
                    <div className="absolute right-0 bottom-full mb-1.5 z-40 w-40 bg-white border border-stone-200 rounded-xl shadow-xl py-1 text-xs">
                      <button
                        id={`btn-editar-${livro.id}`}
                        onClick={() => {
                          setMenuOpen(false);
                          onEditar(livro);
                        }}
                        className="w-full text-left px-3.5 py-2 text-stone-700 hover:bg-stone-100 flex items-center gap-2 font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                        Editar Livro
                      </button>
                      <button
                        id={`btn-excluir-${livro.id}`}
                        onClick={() => {
                          setMenuOpen(false);
                          onExcluir(livro);
                        }}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Excluir do Acervo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Visitante não logado: Ver Ficha */
            <button
              onClick={() => onVerDetalhes(livro)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Detalhes do Livro</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
