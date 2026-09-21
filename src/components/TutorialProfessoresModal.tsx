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
    cor: 'text-amber-800 bg-amber-100',
    passos: [
      'Clique no botão marrom "Empréstimo" no topo da tela.',
      'Escolha o Livro que o aluno está levando (você pode digitar o nome ou código da etiqueta).',
      'Escolha o Aluno na lista de alunos cadastrados.',
      'O sistema já calcula automaticamente a data de devolução (7 dias). Clique no botão verde "Confirmar Empréstimo". Pronto! O exemplar já sai do acervo.',
    ],
    dicaPratica:
      'Se o aluno já tiver livros em atraso, o sistema avisa você na mesma hora para evitar que novos livros fiquem retidos.',
  },
  {
    numero: 2,
    titulo: 'Como Registrar a Devolução de um Livro',
    subtitulo: 'Quando o aluno entrega o livro de volta na biblioteca',
    icone: CheckCircle2,
    cor: 'text-emerald-800 bg-emerald-100',
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
    cor: 'text-sky-800 bg-sky-100',
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
    cor: 'text-purple-800 bg-purple-100',
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
    cor: 'text-indigo-800 bg-indigo-100',
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
    cor: 'text-rose-800 bg-rose-100',
    passos: [
      'Olhe no topo da tela: se houver algum atraso, aparecerá um aviso vermelho piscando com o total de atrasos.',
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
    >
      <div className={`space-y-5 ${letraGrande ? 'text-base' : 'text-sm'}`}>
        {/* Barra superior de acessibilidade e ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-800 text-white rounded-lg">
              <Smile className="w-4 h-4" />
            </span>
            <span className="font-semibold text-amber-950 text-xs sm:text-sm">
              Criado com carinho para quem cuida dos livros
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLetraGrande(!letraGrande)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                letraGrande
                  ? 'bg-amber-800 text-white border-amber-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
              title="Aumentar tamanho do texto para leitura confortável"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{letraGrande ? 'Letra Normal' : 'Letra Grande (A+)'}</span>
            </button>

            <button
              onClick={handlePrintGuia}
              className="px-3 py-1.5 bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
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
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-102'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                    isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold block truncate max-w-full">
                  Passo {passo.numero}
                </span>
                <span className="text-[10px] opacity-80 truncate max-w-full">
                  {passo.titulo.split(' ')[1] || 'Passo'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cartão Central do Passo Ativo */}
        <div className="p-5 sm:p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${atual.cor}`}>
              <IconeAtual className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 mb-1">
                Passo {atual.numero} de {PASSOS.length}
              </span>
              <h3 className={`font-serif font-bold text-stone-900 leading-tight ${letraGrande ? 'text-2xl' : 'text-xl'}`}>
                {atual.titulo}
              </h3>
              <p className="text-stone-600 mt-1">{atual.subtitulo}</p>
            </div>
          </div>

          {/* Relação de Passos Numerados */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            {atual.passos.map((instrucao, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/70 border border-stone-100"
              >
                <div className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {index + 1}
                </div>
                <p className="text-stone-800 font-medium leading-relaxed">{instrucao}</p>
              </div>
            ))}
          </div>

          {/* Dica Prática */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block text-xs uppercase tracking-wider">
                Dica importante para o seu dia a dia:
              </span>
              <p className="text-emerald-900 mt-0.5 leading-relaxed">{atual.dicaPratica}</p>
            </div>
          </div>
        </div>

        {/* Navegação Entre Passos (Anterior / Próximo) */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPassoAtivo(prev => Math.max(0, prev - 1))}
            disabled={passoAtivo === 0}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Passo Anterior</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Passo {passoAtivo + 1} de {PASSOS.length}
          </span>

          {passoAtivo < PASSOS.length - 1 ? (
            <button
              onClick={() => setPassoAtivo(prev => Math.min(PASSOS.length - 1, prev + 1))}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Próximo Passo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
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
