import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Printer,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Smile,
  ShieldCheck,
  Search,
  Eye,
  Type,
} from 'lucide-react';

interface TutorialProfessoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

interface PassoTutorial {
  numero: number;
  titulo: string;
  subtitulo: string;
  icone: React.ElementType;
  cor: string;
  passos: string[];
  dicaPratica: string;
}

const PASSOS: PassoTutorial[] = [
  {
    numero: 1,
    titulo: 'Como Emprestar um Livro para um Aluno',
    subtitulo: 'Tudo feito em apenas 3 cliques rápidos no balcão',
    icone: ArrowRightLeft,
    cor: 'text-amber-400 bg-amber-500/20 border border-amber-500/30',
    passos: [
      'Clique no botão dourado "Empréstimo" no topo da tela.',
      'Escolha o Livro que o aluno está levando (você pode digitar o nome ou código da etiqueta).',
      'Escolha o Aluno na lista de alunos cadastrados.',
      'O sistema já calcula automaticamente a data de devolução (7 dias). Clique no botão "Confirmar Empréstimo". Pronto! O exemplar já sai do acervo.',
    ],
    dicaPratica:
      'Se o aluno já tiver livros em atraso, o sistema avisa você na mesma hora para evitar que novos livros fiquem retidos.',
  },
  {
    numero: 2,
    titulo: 'Como Registrar a Devolução de um Livro',
    subtitulo: 'Quando o aluno entrega o livro de volta na biblioteca',
    icone: CheckCircle2,
    cor: 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30',
    passos: [
      'Vá na aba "Empréstimos & Devoluções" no topo da tela.',
      'Encontre o nome do aluno ou o título do livro na lista.',
      'Clique no botão verde "Registrar Devolução".',
      'Confirme com um clique. O livro volta a ficar disponível no acervo imediatamente para outro aluno poder ler!',
    ],
    dicaPratica:
      'Não precisa calcular multas ou dias na mão: o LibreOteca registra tudo automaticamente no histórico do leitor.',
  },
  {
    numero: 3,
    titulo: 'Como Renovar o Prazo de Leitura',
    subtitulo: 'Quando o aluno precisa de mais tempo para terminar o livro',
    icone: Calendar,
    cor: 'text-sky-400 bg-sky-500/20 border border-sky-500/30',
    passos: [
      'Vá na aba "Empréstimos & Devoluções".',
      'Localize o empréstimo do aluno.',
      'Clique no botão azul "Renovar Prazo (+7 dias)".',
      'A nova data de devolução é atualizada no mesmo instante.',
    ],
    dicaPratica:
      'O sistema marca quantas renovações o aluno já fez para você ter controle pedagógico.',
  },
  {
    numero: 4,
    titulo: 'Como Cadastrar um Livro Novo (Automático)',
    subtitulo: 'Não precisa digitar tudo na mão: a internet busca para você',
    icone: Sparkles,
    cor: 'text-purple-400 bg-purple-500/20 border border-purple-500/30',
    passos: [
      'No topo da tela, clique em "Explorar Open Library".',
      'Digite o nome do livro ou o autor (por exemplo: "Dom Casmurro" ou "Harry Potter").',
      'O LibreOteca busca a capa oficial, ano, páginas e sinopse direto do catálogo mundial.',
      'Clique em "Importar para Meu Acervo". O livro é cadastrado em 2 segundos com código próprio!',
    ],
    dicaPratica:
      'Se preferir cadastrar um livro físico local manualmente, basta clicar em "Novo Livro" e preencher os campos com calma.',
  },
  {
    numero: 5,
    titulo: 'Como Imprimir a Etiqueta com Código de Barras',
    subtitulo: 'Para colar na lombada ou contracapa do livro físico',
    icone: Printer,
    cor: 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30',
    passos: [
      'Na aba "Acervo de Livros", clique no livro desejado.',
      'Abrirá a ficha do livro. Clique no botão "Etiqueta".',
      'Aparecerá a etiqueta pronta com o código interno (ex: LO-000001) e o código de barras.',
      'Basta clicar em Imprimir na sua impressora comum e recortar para colar no livro.',
    ],
    dicaPratica:
      'Essa etiqueta facilita muito quando você for identificar o livro nas estantes da biblioteca.',
  },
  {
    numero: 6,
    titulo: 'Como Ver os Alunos com Livros Atrasados',
    subtitulo: 'Identifique rapidamente quem precisa devolver sem perder tempo',
    icone: AlertTriangle,
    cor: 'text-rose-400 bg-rose-500/20 border border-rose-500/30',
    passos: [
      'Olhe no topo da tela: se houver algum atraso, aparecerá um aviso com o total de atrasos.',
      'Basta clicar nele ou na aba "Empréstimos & Devoluções".',
      'Clique no filtro "Em Atraso".',
      'Você verá o nome do aluno, telefone, turma e há quantos dias o livro está atrasado.',
    ],
    dicaPratica:
      'Você pode clicar em "Exportar CSV" para abrir no Excel ou imprimir uma folha para levar à sala de aula.',
  },
];

export const TutorialProfessoresModal: React.FC<TutorialProfessoresModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [passoAtivo, setPassoAtivo] = useState(0);
  const [letraGrande, setLetraGrande] = useState(false);

  const atual = PASSOS[passoAtivo];
  const IconeAtual = atual.icone;

  const handlePrintGuia = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guia Rápido do Bibliotecário - LibreOteca</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #222; line-height: 1.5; }
            h1 { font-size: 22px; color: #78350f; border-bottom: 2px solid #78350f; padding-bottom: 8px; margin-bottom: 16px; }
            h2 { font-size: 16px; color: #1c1917; margin-top: 18px; margin-bottom: 6px; }
            ol { padding-left: 20px; font-size: 13px; }
            li { margin-bottom: 4px; }
            .box-dica { background: #fef3c7; border-left: 4px solid #b45309; padding: 8px 12px; font-size: 12px; margin-top: 8px; }
            .footer { margin-top: 30px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>LibreOteca • Guia Passo a Passo da Biblioteca</h1>
          <p style="font-size: 13px; color: #555;">Guia prático para fixar ou guardar na mesa da biblioteca.</p>
          ${PASSOS.map(
            p => `
            <div>
              <h2>${p.numero}. ${p.titulo}</h2>
              <ol>
                ${p.passos.map(step => `<li>${step}</li>`).join('')}
              </ol>
              <div class="box-dica"><strong>Dica:</strong> ${p.dicaPratica}</div>
            </div>
          `
          ).join('')}
          <div class="footer">
            LibreOteca • Sistema Livre para Bibliotecas Públicas e Escolares • Imprimido em ${new Date().toLocaleDateString('pt-BR')}
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guia Passo a Passo para Professores e Bibliotecários"
      subtitle="Instruções claras e fáceis, sem palavras difíceis, para facilitar seu dia a dia"
      maxWidth="3xl"
      zIndex="z-[80]"
    >
      <div className={`space-y-4 ${letraGrande ? 'text-base' : 'text-sm'}`}>
        {/* Barra superior de acessibilidade e ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Smile className="w-4 h-4" />
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              Criado com carinho para quem cuida dos livros
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLetraGrande(!letraGrande)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                letraGrande
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Aumentar tamanho do texto para leitura confortável"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{letraGrande ? 'Letra Normal' : 'Letra Grande (A+)'}</span>
            </button>

            <button
              onClick={handlePrintGuia}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Imprimir Guia em Papel</span>
            </button>
          </div>
        </div>

        {/* Seletor de Tópicos do Tutorial */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PASSOS.map((passo, idx) => {
            const Icon = passo.icone;
            const isSelected = passoAtivo === idx;
            return (
              <button
                key={passo.numero}
                onClick={() => setPassoAtivo(idx)}
                className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-500/15 text-slate-900 dark:text-white border-amber-500 shadow-xs scale-102 font-bold'
                    : 'bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center mb-1.5 ${
                    isSelected ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold block truncate max-w-full text-slate-900 dark:text-white">
                  Passo {passo.numero}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                  {passo.titulo.split(' ')[1] || 'Passo'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cartão Central do Passo Ativo */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${atual.cor}`}>
              <IconeAtual className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 mb-1">
                Passo {atual.numero} de {PASSOS.length}
              </span>
              <h3 className={`font-serif font-bold text-slate-900 dark:text-white leading-tight ${letraGrande ? 'text-2xl' : 'text-xl'}`}>
                {atual.titulo}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">{atual.subtitulo}</p>
            </div>
          </div>

          {/* Relação de Passos Numerados */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            {atual.passos.map((instrucao, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {index + 1}
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-xs sm:text-sm">{instrucao}</p>
              </div>
            ))}
          </div>

          {/* Dica Prática */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-xs uppercase tracking-wider">
                Dica importante para o seu dia a dia:
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed text-xs">{atual.dicaPratica}</p>
            </div>
          </div>
        </div>

        {/* Navegação Entre Passos (Anterior / Próximo) */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPassoAtivo(prev => Math.max(0, prev - 1))}
            disabled={passoAtivo === 0}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Passo Anterior</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Passo {passoAtivo + 1} de {PASSOS.length}
          </span>

          {passoAtivo < PASSOS.length - 1 ? (
            <button
              onClick={() => setPassoAtivo(prev => Math.min(PASSOS.length - 1, prev + 1))}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <span>Próximo Passo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <span>Entendido! Concluir</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
