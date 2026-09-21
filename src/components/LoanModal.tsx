import React, { useState, useEffect } from 'react';
import { Livro, Leitor, Emprestimo } from '../types';
import { StorageService } from '../lib/storage';
import { Modal } from './Modal';
import { Search, UserCheck, AlertTriangle, Calendar, BookOpen, Check, ArrowRight } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emprestimo: Emprestimo) => void;
  preSelectedLivro?: Livro | null;
  preSelectedLeitor?: Leitor | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedLivro,
  preSelectedLeitor,
}) => {
  const [leitores, setLeitores] = useState<Leitor[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [config, setConfig] = useState(StorageService.getConfiguracoes());

  const [selectedLeitorId, setSelectedLeitorId] = useState('');
  const [selectedLivroId, setSelectedLivroId] = useState('');
  const [searchLeitor, setSearchLeitor] = useState('');
  const [searchLivro, setSearchLivro] = useState('');
  const [prazoDias, setPrazoDias] = useState<number>(7);
  const [observacao, setObservacao] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allLeitores = StorageService.getLeitores().filter(l => l.ativo);
      const allLivros = StorageService.getLivros();
      const currentConfig = StorageService.getConfiguracoes();

      setLeitores(allLeitores);
      setLivros(allLivros);
      setConfig(currentConfig);
      setPrazoDias(currentConfig.prazo_padrao_dias || 7);
      setErrorMsg('');
      setObservacao('');

      if (preSelectedLeitor) {
        setSelectedLeitorId(preSelectedLeitor.id);
        setSearchLeitor(preSelectedLeitor.nome);
      } else {
        setSelectedLeitorId('');
        setSearchLeitor('');
      }

      if (preSelectedLivro) {
        setSelectedLivroId(preSelectedLivro.id);
        setSearchLivro(preSelectedLivro.titulo);
      } else {
        setSelectedLivroId('');
        setSearchLivro('');
      }
    }
  }, [isOpen, preSelectedLivro, preSelectedLeitor]);

  const selectedLeitor = leitores.find(l => l.id === selectedLeitorId);
  const selectedLivro = livros.find(l => l.id === selectedLivroId);

  // Validação do leitor em tempo real
  const emprestimosLeitor = StorageService.getEmprestimosComDetalhes().filter(
    e => e.leitor_id === selectedLeitorId && e.devolvido_em === null
  );
  const leitorTemAtraso = emprestimosLeitor.some(e => e.atrasado);
  const leitorNoLimite = emprestimosLeitor.length >= config.limite_emprestimos_por_leitor;

  const filteredLeitores = leitores.filter(l =>
    l.nome.toLowerCase().includes(searchLeitor.toLowerCase()) ||
    l.matricula.toLowerCase().includes(searchLeitor.toLowerCase())
  );

  const filteredLivros = livros.filter(l =>
    l.disponiveis > 0 &&
    (l.titulo.toLowerCase().includes(searchLivro.toLowerCase()) ||
     l.codigo_interno.toLowerCase().includes(searchLivro.toLowerCase()) ||
     (l.isbn && l.isbn.includes(searchLivro)))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedLeitorId) {
      setErrorMsg('Selecione o leitor que pegará o livro.');
      return;
    }
    if (!selectedLivroId) {
      setErrorMsg('Selecione o livro a ser emprestado.');
      return;
    }

    const resultado = StorageService.criarEmprestimo({
      livro_id: selectedLivroId,
      leitor_id: selectedLeitorId,
      prazo_dias: prazoDias,
      observacao: observacao.trim() || undefined,
    });

    if (!resultado.success) {
      setErrorMsg(resultado.message);
      return;
    }

    if (resultado.emprestimo) {
      onSuccess(resultado.emprestimo);
      onClose();
    }
  };

  const calcularDataDevolucao = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Novo Empréstimo"
      subtitle="Selecione o leitor cadastrado e o exemplar disponível no acervo"
      maxWidth="xl"
      zIndex="z-[80]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-2xl text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SELEÇÃO DO LEITOR */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Selecionar Leitor (Nome ou Matrícula)</span>
            </label>
            {selectedLeitor && (
              <span className="text-[11px] font-mono text-amber-300">
                Matrícula: {selectedLeitor.matricula}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Digite o nome ou matrícula do leitor..."
              value={searchLeitor}
              onChange={e => {
                setSearchLeitor(e.target.value);
                if (selectedLeitor && e.target.value !== selectedLeitor.nome) {
                  setSelectedLeitorId('');
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Lista de sugestões de leitores se não houver selecionado */}
          {!selectedLeitorId && searchLeitor.trim().length > 0 && (
            <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800 shadow-md">
              {filteredLeitores.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  Nenhum leitor ativo encontrado.
                </div>
              ) : (
                filteredLeitores.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLeitorId(l.id);
                      setSearchLeitor(l.nome);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white">{l.nome}</p>
                      <p className="text-[11px] text-slate-400">Matrícula: {l.matricula} • {l.tipo}</p>
                    </div>
                    <span className="text-[11px] text-amber-400 font-bold">Selecionar</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Feedback do leitor selecionado */}
          {selectedLeitor && (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Empréstimos em aberto no momento:</span>
                <span className="font-semibold text-white">
                  {emprestimosLeitor.length} de {config.limite_emprestimos_por_leitor} permitidos
                </span>
              </div>

              {leitorTemAtraso && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Atenção: Este leitor possui livros em atraso pendentes de devolução!</span>
                </div>
              )}

              {leitorNoLimite && (
                <div className="p-2.5 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-300 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>O leitor já atingiu o limite máximo de livros emprestados simultâneos.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. SELEÇÃO DO LIVRO */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Selecionar Livro Disponível</span>
            </label>
            {selectedLivro && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800">
                {selectedLivro.codigo_interno} • {selectedLivro.disponiveis} disp.
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Digite o título, código (LO-000001) ou ISBN..."
              value={searchLivro}
              onChange={e => {
                setSearchLivro(e.target.value);
                if (selectedLivro && e.target.value !== selectedLivro.titulo) {
                  setSelectedLivroId('');
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Sugestões de livros disponíveis */}
          {!selectedLivroId && searchLivro.trim().length > 0 && (
            <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800 shadow-md">
              {filteredLivros.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  Nenhum livro disponível encontrado com esse termo.
                </div>
              ) : (
                filteredLivros.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLivroId(l.id);
                      setSearchLivro(l.titulo);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-serif font-bold text-white">{l.titulo}</p>
                      <p className="text-[11px] text-slate-400">
                        {l.autor} • <span className="font-mono text-amber-300">{l.codigo_interno}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {l.disponiveis} disponível(is)
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. PRAZO E OBSERVAÇÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Prazo de Devolução</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[7, 14, 21].map(dias => (
                <button
                  key={dias}
                  type="button"
                  onClick={() => setPrazoDias(dias)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    prazoDias === dias
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {dias} dias
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Devolução prevista: <strong className="text-white">{calcularDataDevolucao(prazoDias)}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observação / Finalidade
            </label>
            <input
              type="text"
              placeholder="Ex: Trabalho de sociologia, pesquisa..."
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Rodapé com Botão de Confirmação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!selectedLeitorId || !selectedLivroId}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Empréstimo</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
