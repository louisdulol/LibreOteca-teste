import React, { useState } from 'react';
import { Livro } from '../types';
import { EditorialCover } from './EditorialCover';
import { BookOpen, Star, Bookmark, ExternalLink } from 'lucide-react';

interface InteractiveOpeningBookProps {
  livro: Livro;
  onOpenDetail: (livro: Livro) => void;
  className?: string;
}

export const InteractiveOpeningBook: React.FC<InteractiveOpeningBookProps> = ({
  livro,
  onOpenDetail,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calcula trecho da sinopse ou texto padrão literário
  const sinopseTexto =
    livro.sinopse && livro.sinopse.trim().length > 0
      ? livro.sinopse
      : `Uma obra fascinante de ${livro.autor}, indispensável na estante e aguardando por sua leitura e reflexão.`;

  return (
    <div
      className={`relative select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetail(livro)}
      style={{ perspective: '1400px' }}
      title={`Clique para abrir a ficha completa de "${livro.titulo}"`}
    >
      {/* Dica interativa sutil de descoberta */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap ${
          isHovered
            ? 'opacity-0 -translate-y-2'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-900/90 text-amber-100 shadow-md backdrop-blur-xs">
          <BookOpen className="w-3 h-3 text-amber-300" />
          Passe o mouse para abrir o livro
        </span>
      </div>

      {/* Sombra de Contato Físico do Livro */}
      <div
        className={`absolute -bottom-3 inset-x-4 h-6 bg-stone-900/40 rounded-full blur-md transition-all duration-500 ${
          isHovered
            ? 'scale-x-125 bg-stone-950/50 blur-lg translate-y-1'
            : 'scale-x-100'
        }`}
      />

      {/* O LIVRO TRIDIMENSIONAL */}
      <div
        className="relative w-72 sm:w-80 md:w-96 h-56 sm:h-64 cursor-pointer transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? 'rotateY(-5deg) rotateX(2deg) translateY(-4px)'
            : 'rotateY(-18deg) rotateX(6deg) translateY(0px)',
        }}
      >
        {/* BLOCO DE PÁGINAS INTERNAS (Fundo fixo que aparece quando a capa abre) */}
        <div
          className="absolute inset-0 rounded-r-md bg-[#FAF6EE] border border-[#E4DCBF] shadow-xl overflow-hidden flex"
          style={{
            transform: 'translateZ(0px)',
          }}
        >
          {/* Páginas do Lado Esquerdo (Contracapa interna e ex-libris) */}
          <div className="w-1/2 h-full p-4 sm:p-5 border-r border-[#E2D8B9] bg-gradient-to-r from-[#F0E8D2] to-[#FAF6EE] flex flex-col justify-between relative overflow-hidden">
            {/* Vinco da dobra central com sombra realista */}
            <div className="absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-stone-900/15 to-transparent pointer-events-none" />

            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-900/70 font-semibold block">
                Ex-Libris • LibreOteca
              </span>
              <div className="mt-2.5">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-2">
                  {livro.titulo}
                </h4>
                <p className="text-[11px] text-stone-600 italic mt-0.5">
                  {livro.autor}
                </p>
              </div>
            </div>

            {/* Selo de Tombamento Escolar */}
            <div className="pt-2 border-t border-amber-900/15 flex items-center justify-between text-[10px] text-stone-500 font-mono">
              <span>Reg: {livro.codigo_interno}</span>
              <span className="font-bold text-amber-900">{livro.categoria}</span>
            </div>
          </div>

          {/* Páginas do Lado Direito (Texto do primeiro capítulo / sinopse) */}
          <div className="w-1/2 h-full p-4 sm:p-5 bg-gradient-to-l from-[#F0E8D2] to-[#FAF6EE] flex flex-col justify-between relative overflow-hidden">
            {/* Vinco da dobra central à esquerda */}
            <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-stone-900/15 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-[9px] text-stone-400 font-serif uppercase tracking-wider mb-1.5">
                <span>Capítulo I</span>
                <span>pág. 1</span>
              </div>
              <p className="font-serif text-[11px] sm:text-xs text-stone-700 leading-relaxed line-clamp-5 sm:line-clamp-6 text-justify">
                <span className="float-left text-2xl sm:text-3xl font-serif font-bold text-amber-950 leading-none mr-1.5 mt-0.5">
                  {sinopseTexto.charAt(0)}
                </span>
                {sinopseTexto.slice(1)}
              </p>
            </div>

            {/* Rodapé da Página Aberta com Botão de Ação */}
            <div className="pt-2 border-t border-[#E8DFCA] flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1 group-hover:underline">
                <span>Ler Ficha Completa</span>
                <span>→</span>
              </span>
              {livro.disponiveis > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {livro.disponiveis} disp.
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  Emprestado
                </span>
              )}
            </div>
          </div>

          {/* Fitilho / Marcador de Página em Fita de Cetim Vermelha/Dourada */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-b from-amber-700 via-rose-700 to-rose-800 shadow-md transition-all duration-700 pointer-events-none rounded-b-sm ${
              isHovered ? 'h-full translate-y-1 rotate-2' : 'h-14 -rotate-1'
            }`}
          >
            <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-400/60" />
          </div>
        </div>

        {/* PÁGINAS INTERMEDIÁRIAS (Efeito realista de folhas de papel foleando suavemente) */}
        <div
          className="absolute inset-y-1 right-2 left-1/2 rounded-r-sm bg-[#F5EFE1] border-r border-[#E0D4B2] shadow-sm pointer-events-none transition-transform duration-500 ease-out origin-left"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateY(-25deg) translateZ(1px)' : 'rotateY(0deg)',
          }}
        />
        <div
          className="absolute inset-y-1 right-3 left-1/2 rounded-r-sm bg-[#EDE3CE] border-r border-[#D9CB9E] shadow-sm pointer-events-none transition-transform duration-600 ease-out origin-left"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateY(-45deg) translateZ(2px)' : 'rotateY(0deg)',
          }}
        />

        {/* CAPA DA FRENTE (Que gira em 3D abrindo o livro com a dobradiça na lombada esquerda!) */}
        <div
          className="absolute inset-0 rounded-r-md rounded-l-xs overflow-hidden shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            transform: isHovered
              ? 'rotateY(-145deg) translateZ(4px)'
              : 'rotateY(0deg) translateZ(3px)',
          }}
        >
          {/* Lado Exterior da Capa (A capa do livro visível quando fechado) */}
          <div
            className="absolute inset-0 w-full h-full bg-stone-900 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <EditorialCover
              titulo={livro.titulo}
              autor={livro.autor}
              capaUrl={livro.capa_url}
              categoria={livro.categoria}
              ano={livro.ano_publicacao}
              size="lg"
              className="w-full h-full object-cover"
            />

            {/* Vinco / Dobra da Lombada Realista */}
            <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/50 via-white/15 to-transparent pointer-events-none" />

            {/* Borda direita simulando espessura do papel */}
            <div className="absolute right-0 inset-y-0 w-1 bg-gradient-to-l from-stone-200 to-stone-400 opacity-80 pointer-events-none" />

            {/* Badge de Disponibilidade na Capa */}
            <div className="absolute top-3 right-3 z-10">
              {livro.disponiveis > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-200 border border-emerald-400/40 shadow-md backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {livro.disponiveis} disponíveis
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-200 border border-rose-400/40 shadow-md backdrop-blur-xs">
                  Emprestado
                </span>
              )}
            </div>

            {/* Selo do Código na Capa */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-amber-200 border border-white/10 backdrop-blur-xs">
                {livro.codigo_interno}
              </span>
            </div>
          </div>

          {/* Lado Interior da Capa (Guardas de encadernação visíveis quando aberta) */}
          <div
            className="absolute inset-0 w-full h-full bg-[#EFE6CF] border border-[#D5C79E] p-4 flex flex-col justify-between text-stone-800"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="border border-amber-900/20 p-3 h-full rounded-sm flex flex-col justify-between bg-[#F7F2E4]/60">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-900/60 font-bold">
                  LibreOteca • Acervo
                </p>
                <h5 className="font-serif font-black text-sm text-stone-900 mt-2 line-clamp-2">
                  {livro.titulo}
                </h5>
                <p className="text-xs text-stone-600 italic mt-0.5">
                  {livro.autor}
                </p>
              </div>

              <div className="text-[10px] text-stone-500 font-mono flex items-center justify-between border-t border-amber-900/15 pt-2">
                <span>ISBN: {livro.isbn || 'N/A'}</span>
                <span>{livro.paginas ? `${livro.paginas} págs` : 'Edição Escolar'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
