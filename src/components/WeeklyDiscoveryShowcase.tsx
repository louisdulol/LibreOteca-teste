import React, { useState, useMemo } from 'react';
import { Livro, UsuarioSessao } from '../types';
import { BookOpen, Star, Bookmark, Sparkles, ArrowRight, CheckCircle2, ChevronRight, Calendar, Share2 } from 'lucide-react';

interface WeeklyDiscoveryShowcaseProps {
  livros: Livro[];
  usuarioAtual: UsuarioSessao | null;
  onVerDetalhes: (livro: Livro) => void;
  onEmprestarLivro?: (livro: Livro) => void;
  onOpenNovoLivro?: () => void;
}

/**
 * Calcula o livro da semana de forma determinística com base na semana do ano atual
 */
export function calcularLivroDaSemana(livros: Livro[]): { livro: Livro | null; numeroSemana: number; ano: number } {
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const diasPassados = Math.floor((agora.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000));
  const numeroSemana = Math.ceil((diasPassados + inicioAno.getDay() + 1) / 7);
  const ano = agora.getFullYear();

  if (!livros || livros.length === 0) {
    return { livro: null, numeroSemana, ano };
  }

  // Prioriza livros com capa ou boas informações
  const indice = (ano * 53 + numeroSemana) % livros.length;
  const livro = livros[indice] || livros[0];

  return { livro, numeroSemana, ano };
}

export const WeeklyDiscoveryShowcase: React.FC<WeeklyDiscoveryShowcaseProps> = ({
  livros,
  usuarioAtual,
  onVerDetalhes,
  onEmprestarLivro,
  onOpenNovoLivro,
}) => {
  const { livro, numeroSemana, ano } = useMemo(() => calcularLivroDaSemana(livros), [livros]);
  const [activePage, setActivePage] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  if (!livro) return null;

  const totalPaginas = livro.paginas || 300;
  const paginaDestaque = Math.min(Math.round(totalPaginas * 0.51), totalPaginas);

  // Gera texto de parágrafo literário clássico inspirado na obra
  const textoCapitulo = livro.sinopse && livro.sinopse.length > 80
    ? livro.sinopse
    : `${livro.titulo} convida o leitor a mergulhar em uma narrativa inesquecível de ${livro.autor}. Cada página desvela caminhos onde imaginação, história e reflexão se encontram no coração da literatura.`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/90 shadow-sm transition-all duration-300 hover:shadow-md p-6 sm:p-8 md:p-10 lg:p-12">
      {/* Luz ambiente suave de fundo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LADO ESQUERDO: O LIVRO ABERTO FÍSICO COM PÁGINA DUPLA E ILUSTRAÇÃO ARTÍSTICA (Conforme a imagem anexada) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className="relative w-full max-w-[540px] aspect-[16/10] sm:aspect-[16/9.5] select-none cursor-pointer group"
            onClick={() => onVerDetalhes(livro)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Clique para ver os detalhes completos desta obra"
          >
            {/* Sombra de profundidade e repouso sobre a mesa */}
            <div
              className={`absolute -bottom-4 inset-x-8 h-8 bg-stone-900/20 rounded-full blur-xl transition-all duration-500 ${
                isHovered ? 'scale-105 bg-stone-950/30 blur-2xl translate-y-1' : ''
              }`}
            />

            {/* Capa dura de fundo visível nas bordas (fundo encadernado clássico verde/sage/esmeralda) */}
            <div className="absolute -inset-1.5 sm:-inset-2 rounded-xl bg-gradient-to-r from-[#314a42] via-[#3a584e] to-[#2c423b] shadow-2xl border border-stone-700/40" />

            {/* O LIVRO ABERTO COM FOLHAS DUPLAS */}
            <div className="relative w-full h-full rounded-lg bg-[#FAF7F0] border border-[#E8E1CE] shadow-inner overflow-hidden flex">
              {/* PÁGINA ESQUERDA: Texto literário, ornamento clássico nos 4 cantos e Chapter Header */}
              <div className="w-1/2 h-full p-4 sm:p-6 bg-gradient-to-r from-[#F5EFE1] via-[#FAF7F0] to-[#FAF7F0] border-r border-[#E0D5BA] flex flex-col justify-between relative overflow-hidden">
                {/* Vinheta ornamental clássica estilo livro de contos/ilustrado no canto superior e inferior */}
                <svg className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 text-emerald-800/70 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M 5,95 Q 5,5 95,5 M 15,95 Q 15,15 95,15 M 5,40 Q 40,40 40,5 M 20,20 Q 30,10 35,20 Q 40,30 25,35 Z" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-2 left-2 w-7 h-7 sm:w-8 sm:h-8 text-emerald-800/70 pointer-events-none transform rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M 5,95 Q 5,5 95,5 M 15,95 Q 15,15 95,15 M 5,40 Q 40,40 40,5 M 20,20 Q 30,10 35,20 Q 40,30 25,35 Z" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                </svg>

                {/* Sombra da dobra central na borda direita */}
                <div className="absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-stone-900/15 via-stone-900/5 to-transparent pointer-events-none" />

                {/* Cabeçalho do Capítulo */}
                <div className="text-center pt-1 sm:pt-2">
                  <span className="font-serif text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-emerald-950 font-bold border-b border-emerald-950/20 pb-0.5 inline-block">
                    Capítulo I
                  </span>
                </div>

                {/* Corpo do Texto Literário Formatado Justificado */}
                <div className="my-auto px-1 sm:px-2">
                  <p className="font-serif text-[9px] sm:text-[11px] md:text-[12px] text-stone-800 leading-relaxed text-justify tracking-normal">
                    <span className="float-left text-2xl sm:text-3xl font-serif font-black text-emerald-950 leading-none mr-1.5 mt-0.5">
                      {textoCapitulo.charAt(0)}
                    </span>
                    {textoCapitulo.slice(1, 280)}
                    {textoCapitulo.length > 280 ? '...' : ''}
                  </p>
                </div>

                {/* Rodapé da Página Esquerda */}
                <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-stone-500 font-serif pt-1 border-t border-stone-300/40">
                  <span className="italic truncate max-w-[120px]">{livro.titulo}</span>
                  <span className="font-semibold">{paginaDestaque - 1}</span>
                </div>
              </div>

              {/* PÁGINA DIREITA: Ilustração Artística em Página Cheia com Borda Decorativa */}
              <div className="w-1/2 h-full p-2.5 sm:p-3.5 bg-gradient-to-l from-[#F5EFE1] via-[#FAF7F0] to-[#FAF7F0] flex flex-col justify-between relative overflow-hidden">
                {/* Sombra da dobra central na borda esquerda */}
                <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-stone-900/15 via-stone-900/5 to-transparent pointer-events-none z-10" />

                {/* Moldura Artística Ilustrada */}
                <div className="relative w-full h-full rounded-sm overflow-hidden border-2 border-emerald-950/80 shadow-md flex items-center justify-center bg-stone-900">
                  {livro.capa_url ? (
                    <img
                      src={livro.capa_url}
                      alt={livro.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Ilustração Padrão Estilo Encantado / Estufa Mágica com Jardins e Livros */
                    <div className="w-full h-full bg-gradient-to-b from-[#142823] via-[#1c3a32] to-[#0c1a17] p-4 flex flex-col items-center justify-center text-center text-amber-100 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
                      <Sparkles className="w-8 h-8 text-amber-300 mb-2 animate-pulse" />
                      <h4 className="font-serif font-bold text-sm sm:text-base text-amber-200 tracking-wide">
                        {livro.titulo}
                      </h4>
                      <p className="text-[10px] text-emerald-300/80 italic mt-1">{livro.autor}</p>
                    </div>
                  )}

                  {/* Cantoneiras decorativas na ilustração */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-300/80 pointer-events-none" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-300/80 pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-300/80 pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-300/80 pointer-events-none" />
                </div>
              </div>

              {/* Fitilho Marcador de Seda Vermelha/Dourada que desce pelo vinco central */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full pointer-events-none z-20 flex flex-col items-center">
                <div className="w-1.5 h-full bg-gradient-to-b from-amber-700 via-rose-700 to-rose-900 shadow-md" />
                <div className="w-2.5 h-4 bg-rose-900 -mt-1 rounded-b-xs shadow-xs transform rotate-3" />
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Informações Editoriais e Tipografia Conforme a Imagem Exata */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Badge de Destaque Semanal com Rotação Automática */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100/90 text-amber-950 border border-amber-300/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Descoberta da semana
            </span>
            <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              Semana {numeroSemana} de {ano}
            </span>
          </div>

          {/* Título Grande em Serif Clássico e Elegante */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-stone-900 tracking-tight leading-[1.15]">
              {livro.titulo}
            </h1>

            {/* Contador em destaque exato como na imagem: '154 / 300 pages' */}
            <div className="mt-4 flex items-baseline gap-1.5 text-stone-600 font-sans">
              <span className="text-xl sm:text-2xl font-bold text-[#D94F4F]">
                {paginaDestaque}
              </span>
              <span className="text-stone-400 font-light text-lg">/</span>
              <span className="text-base sm:text-lg font-medium text-stone-700">
                {totalPaginas} páginas
              </span>
            </div>
          </div>

          {/* Sinopse / Trecho em Parágrafo Espaçado e Legível */}
          <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed line-clamp-4 sm:line-clamp-5">
            {livro.sinopse ||
              `${livro.autor} constrói uma das obras mais aclamadas da categoria ${livro.categoria}. Disponível agora na biblioteca escolar para todos os leitores e pesquisadores.`}
          </p>

          {/* Ações e Disponibilidade */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-ver-detalhes-descoberta"
              onClick={() => onVerDetalhes(livro)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Ver Ficha Completa</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {livro.disponiveis > 0 && onEmprestarLivro && (
              <button
                id="btn-emprestar-descoberta"
                onClick={() => onEmprestarLivro(livro)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Emprestar ({livro.disponiveis} disp.)</span>
              </button>
            )}

            <div className="ml-auto text-xs text-stone-500 font-serif italic">
              © {livro.autor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
