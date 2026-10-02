import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { EstiloCarteirinha, PerfilUsuario } from '../types';
import { CarteirinhaLeitorCard } from './CarteirinhaLeitorCard';
import {
  Palette,
  Layers,
  LayoutTemplate,
  Type,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  Printer,
  Shield,
  QrCode,
  Calendar,
  BookOpen,
} from 'lucide-react';

interface CarteirinhaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfil: PerfilUsuario;
  estiloInicial: EstiloCarteirinha;
  nomeBiblioteca: string;
  onSalvar: (novoEstilo: EstiloCarteirinha) => void;
}

const PRESETS_BACKGROUND = [
  // Gradientes
  { id: 'gradiente-aurora', nome: 'Aurora Boreal', bgClass: 'from-emerald-600 to-indigo-950', hex: '#059669' },
  { id: 'gradiente-sunset', nome: 'Sunset Velvet', bgClass: 'from-purple-900 to-amber-700', hex: '#581c87' },
  { id: 'gradiente-cyber', nome: 'Cyber Neon', bgClass: 'from-slate-950 to-blue-900', hex: '#020617' },
  { id: 'gradiente-ouro', nome: 'Ouro Nobre', bgClass: 'from-amber-600 to-yellow-600', hex: '#b45309' },
  { id: 'gradiente-retrowave', nome: 'Retro Synthwave', bgClass: 'from-fuchsia-900 to-cyan-900', hex: '#701a75' },
  { id: 'gradiente-deepocean', nome: 'Deep Ocean', bgClass: 'from-blue-950 to-slate-950', hex: '#082f49' },
  { id: 'gradiente-sakura', nome: 'Cherry Blossom', bgClass: 'from-pink-900 to-rose-950', hex: '#831843' },
  { id: 'gradiente-bloodmoon', nome: 'Blood Moon', bgClass: 'from-red-950 to-stone-950', hex: '#450a0a' },
  { id: 'gradiente-cosmic', nome: 'Poeira Cósmica', bgClass: 'from-violet-950 to-purple-900', hex: '#2e1065' },
  { id: 'gradiente-emerald', nome: 'Santuário Verde', bgClass: 'from-emerald-950 to-teal-950', hex: '#022c22' },

  // Sólidos
  { id: 'solido-navy', nome: 'Navy Royale', bgClass: 'from-[#0b172a] to-[#0b172a]', hex: '#0b172a' },
  { id: 'solido-emerald', nome: 'Esmeralda', bgClass: 'from-[#062e24] to-[#062e24]', hex: '#062e24' },
  { id: 'solido-ruby', nome: 'Rubi Imperial', bgClass: 'from-[#2e0915] to-[#2e0915]', hex: '#2e0915' },
  { id: 'solido-obsidian', nome: 'Obsidiana Dark', bgClass: 'from-[#090d16] to-[#090d16]', hex: '#090d16' },
  { id: 'solido-purple', nome: 'Ametista Real', bgClass: 'from-[#1e1035] to-[#1e1035]', hex: '#1e1035' },
  { id: 'solido-amber', nome: 'Âmbar Queimado', bgClass: 'from-[#331c07] to-[#331c07]', hex: '#331c07' },
  { id: 'solido-parchment', nome: 'Pergaminho', bgClass: 'from-[#f5ebd7] to-[#e4d4b8]', hex: '#f5ebd7' },
];

const CORES_PALETA_RAPIDA = [
  '#0f172a', '#1e1b4b', '#064e3b', '#450a0a', '#78350f', '#3b0764', '#082f49',
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff',
];

const ELEMENTOS_PADRAO = {
  mostrarFoto: true,
  mostrarNome: true,
  mostrarCargo: true,
  mostrarMatricula: true,
  mostrarTurma: true,
  mostrarGenero: true,
  mostrarQrCode: true,
  mostrarBiblioteca: true,
  mostrarValidade: true,
};

export const CarteirinhaEditorModal: React.FC<CarteirinhaEditorModalProps> = ({
  isOpen,
  onClose,
  perfil,
  estiloInicial,
  nomeBiblioteca,
  onSalvar,
}) => {
  const [estilo, setEstilo] = useState<EstiloCarteirinha>(() => ({
    ...estiloInicial,
    elementos: {
      ...ELEMENTOS_PADRAO,
      ...(estiloInicial?.elementos || {}),
    },
  }));

  const [abaAtiva, setAbaAtiva] = useState<'cores' | 'elementos' | 'layout' | 'fontes'>('cores');

  // Sincroniza sempre que abrir
  useEffect(() => {
    if (isOpen && estiloInicial) {
      setEstilo({
        ...estiloInicial,
        elementos: {
          ...ELEMENTOS_PADRAO,
          ...(estiloInicial.elementos || {}),
        },
      });
    }
  }, [isOpen, estiloInicial]);

  const atualizarCampo = (campos: Partial<EstiloCarteirinha>) => {
    setEstilo(prev => ({
      ...prev,
      ...campos,
    }));
  };

  const toggleElemento = (chave: keyof typeof ELEMENTOS_PADRAO) => {
    setEstilo(prev => {
      const currentElementos = prev.elementos || ELEMENTOS_PADRAO;
      return {
        ...prev,
        elementos: {
          ...currentElementos,
          [chave]: !currentElementos[chave],
        },
      };
    });
  };

  const ativarTodosElementos = () => {
    setEstilo(prev => ({
      ...prev,
      elementos: {
        mostrarFoto: true,
        mostrarNome: true,
        mostrarCargo: true,
        mostrarMatricula: true,
        mostrarTurma: true,
        mostrarGenero: true,
        mostrarQrCode: true,
        mostrarBiblioteca: true,
        mostrarValidade: true,
      },
    }));
  };

  const apenasEssenciais = () => {
    setEstilo(prev => ({
      ...prev,
      elementos: {
        mostrarFoto: true,
        mostrarNome: true,
        mostrarCargo: true,
        mostrarMatricula: true,
        mostrarTurma: false,
        mostrarGenero: false,
        mostrarQrCode: true,
        mostrarBiblioteca: true,
        mostrarValidade: false,
      },
    }));
  };

  const handleSalvar = () => {
    onSalvar(estilo);
    onClose();
  };

  const handleRestaurarPadrao = () => {
    setEstilo({
      ativa: true,
      layout: 'padrao-esquerda',
      background: 'gradiente-aurora',
      textura: 'nenhuma',
      fonte: 'sans',
      posicaoQrCode: 'canto-inferior-direito',
      arredondamento: 'medio',
      tamanhoCard: 'padrao',
      anoValidade: '2026 / 2027',
      generoFavorito: 'Literatura Brasileira',
      corFundoCustom: undefined,
      corFundoSecundaria: undefined,
      usarGradienteCustom: false,
      corTextoCustom: undefined,
      corBordaCustom: undefined,
      elementos: {
        mostrarFoto: true,
        mostrarNome: true,
        mostrarCargo: true,
        mostrarMatricula: true,
        mostrarTurma: true,
        mostrarGenero: true,
        mostrarQrCode: true,
        mostrarBiblioteca: true,
        mostrarValidade: true,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalização Completa da Carteirinha Digital"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* PREVIEW AO VIVO INTERATIVO NO TOPO DO MODAL */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-inner">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Pré-visualização Interativa em Tempo Real</span>
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Cartão</span>
            </button>
          </div>

          {/* O Cartão Interativo — clicar em partes dele alterna para a aba relevante */}
          <div className="w-full flex justify-center py-1">
            <CarteirinhaLeitorCard
              perfil={perfil}
              estilo={estilo}
              nomeBiblioteca={nomeBiblioteca}
              interactiveMode={true}
              onSelectSection={sec => setAbaAtiva(sec)}
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Dica: Clique no fundo, foto, textos ou QR Code da carteirinha para pular direto para a seção de edição.
          </p>
        </div>

        {/* ABAS DE CUSTOMIZAÇÃO COMPLETA */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'cores', label: 'Cores & Fundos', icon: Palette, desc: 'Presets & Roda de Cores' },
            { id: 'elementos', label: 'Elementos & Campos', icon: Layers, desc: 'Ativar / Remover' },
            { id: 'layout', label: 'Layout & Formato', icon: LayoutTemplate, desc: 'Posição & Bordas' },
            { id: 'fontes', label: 'Tipografia & Fontes', icon: Type, desc: 'Estilos de Texto' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAbaAtiva(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-5">
          {/* ABA 1: CORES & FUNDOS (PRESETS + RODA DE CORES COMPLETA + TEXTURAS) */}
          {abaAtiva === 'cores' && (
            <div className="space-y-6">
              {/* Presets Prontos */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Presets de Temas Prontos</span>
                  </label>
                  <span className="text-[10px] text-slate-400">17 combinações refinadas</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {PRESETS_BACKGROUND.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        atualizarCampo({
                          background: item.id,
                          corFundoCustom: undefined,
                          corFundoSecundaria: undefined,
                          usarGradienteCustom: false,
                        })
                      }
                      className={`h-12 rounded-xl bg-gradient-to-r ${item.bgClass} p-2 flex items-center justify-between border transition-all cursor-pointer ${
                        estilo.background === item.id && !estilo.corFundoCustom
                          ? 'border-white ring-2 ring-amber-400 shadow-md scale-105'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-xs truncate">
                        {item.nome}
                      </span>
                      {estilo.background === item.id && !estilo.corFundoCustom && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roda de Cores Completa & Personalização Livre */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Roda de Todas as Cores (Liberdade Total)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Escolha qualquer tonalidade do espectro</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Cor Principal */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Cor de Fundo Principal
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={estilo.corFundoCustom || '#0f172a'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corFundoCustom: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={estilo.corFundoCustom || '#0f172a'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corFundoCustom: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>

                  {/* Gradiente Secundário */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-300">
                        2ª Cor (Gradiente)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          atualizarCampo({
                            usarGradienteCustom: !estilo.usarGradienteCustom,
                            background: 'personalizado',
                          })
                        }
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                          estilo.usarGradienteCustom
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {estilo.usarGradienteCustom ? 'Ativo' : 'Desativado'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={!estilo.usarGradienteCustom}
                        value={estilo.corFundoSecundaria || '#1e1b4b'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corFundoSecundaria: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 shrink-0 disabled:opacity-40"
                      />
                      <input
                        type="text"
                        disabled={!estilo.usarGradienteCustom}
                        value={estilo.corFundoSecundaria || '#1e1b4b'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corFundoSecundaria: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white disabled:opacity-40"
                        placeholder="#1e1b4b"
                      />
                    </div>
                  </div>

                  {/* Cor do Texto */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Cor do Texto
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={estilo.corTextoCustom || '#ffffff'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corTextoCustom: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={estilo.corTextoCustom || '#ffffff'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corTextoCustom: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Cor da Borda */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Cor da Borda
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={estilo.corBordaCustom || '#38bdf8'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corBordaCustom: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={estilo.corBordaCustom || '#38bdf8'}
                        onChange={e =>
                          atualizarCampo({
                            background: 'personalizado',
                            corBordaCustom: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        placeholder="#38bdf8"
                      />
                    </div>
                  </div>
                </div>

                {/* Paleta Rápida de Cores */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5">Sugestões rápidas de cores:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CORES_PALETA_RAPIDA.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          atualizarCampo({
                            background: 'personalizado',
                            corFundoCustom: c,
                          })
                        }
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 rounded-lg border border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Texturas Vetoriais Nítidas */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <label className="text-xs font-bold text-white block">
                  Textura Vetorial de Fundo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { id: 'nenhuma', label: 'Nenhuma' },
                    { id: 'estrelas', label: 'Constelações' },
                    { id: 'ondas', label: 'Ondas Topo' },
                    { id: 'pontilhado', label: 'Pontilhado' },
                    { id: 'linhas', label: 'Diagonais' },
                    { id: 'geometrica', label: 'Geométrica' },
                    { id: 'pixel-grid', label: 'Pixel Grid' },
                  ].map(tex => (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => atualizarCampo({ textura: tex.id as any })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        estilo.textura === tex.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {tex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: ELEMENTOS & CAMPOS (CONTROLE TOTAL DE REMOVER OU EDITAR) */}
          {abaAtiva === 'elementos' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Controle de Elementos do Cartão</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ative ou remova qualquer elemento individualmente:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={ativarTodosElementos}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Ativar Todos
                  </button>
                  <button
                    type="button"
                    onClick={apenasEssenciais}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Modo Essencial
                  </button>
                </div>
              </div>

              {/* Grid de Toggles dos Elementos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'mostrarFoto', label: 'Foto / Avatar do Leitor', desc: 'Avatar circular em moldura' },
                  { key: 'mostrarNome', label: 'Nome do Titular', desc: 'Nome do aluno ou professor' },
                  { key: 'mostrarCargo', label: 'Cargo / Função', desc: 'Aluno Leitor ou Docente' },
                  { key: 'mostrarMatricula', label: 'Matrícula / ID', desc: 'Código oficial do leitor' },
                  { key: 'mostrarTurma', label: 'Turma / Série', desc: 'Turma escolar do aluno' },
                  { key: 'mostrarGenero', label: 'Gênero Literário', desc: 'Categoria favorita' },
                  { key: 'mostrarBiblioteca', label: 'Cabeçalho da Biblioteca', desc: 'Nome oficial da instituição' },
                  { key: 'mostrarValidade', label: 'Validade / Ano Letivo', desc: 'Ano de vigência do cartão' },
                  { key: 'mostrarQrCode', label: 'QR Code de Validação', desc: 'Código escaneável nítido' },
                ].map(item => {
                  const currentElementos = estilo.elementos || ELEMENTOS_PADRAO;
                  const isChecked = Boolean(currentElementos[item.key as keyof typeof ELEMENTOS_PADRAO]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleElemento(item.key as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-400/50 text-white shadow-xs'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`block text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Campos Editáveis de Dados */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Gênero Literário Favorito Exibido
                  </label>
                  <input
                    type="text"
                    value={estilo.generoFavorito || ''}
                    onChange={e => atualizarCampo({ generoFavorito: e.target.value })}
                    placeholder="Ex: Literatura Brasileira, Ficção, Mangá..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Validade / Ano Letivo
                  </label>
                  <input
                    type="text"
                    value={estilo.anoValidade || '2026 / 2027'}
                    onChange={e => atualizarCampo({ anoValidade: e.target.value })}
                    placeholder="Ex: 2026 / 2027"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: LAYOUT & FORMATO */}
          {abaAtiva === 'layout' && (
            <div className="space-y-6">
              {/* 1. Modelos de Layout */}
              <div>
                <label className="text-xs font-bold text-white block mb-2.5">
                  Modelo de Disposição (Layout)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'padrao-esquerda', nome: 'Clássico Estudantil', desc: 'Foto à esquerda, dados no meio e QR code à direita' },
                    { id: 'moderno-direita', nome: 'Moderno Espelhado', desc: 'Dados à esquerda, QR code e foto à direita' },
                    { id: 'credencial-topo', nome: 'Crachá Vertical', desc: 'Foto centralizada no topo e dados abaixo' },
                    { id: 'minimalista-sleek', nome: 'Linha Sleek', desc: 'Formato compacto horizontal ultra-limpo' },
                  ].map(lay => (
                    <button
                      key={lay.id}
                      type="button"
                      onClick={() => atualizarCampo({ layout: lay.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        estilo.layout === lay.id
                          ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-white mb-1">
                        {lay.nome}
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        {lay.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tamanho e Arredondamento */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Tamanho do Cartão
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'compacto', label: 'Compacto' },
                      { id: 'padrao', label: 'Padrão' },
                      { id: 'expandido', label: 'Expandido' },
                    ].map(tam => (
                      <button
                        key={tam.id}
                        type="button"
                        onClick={() => atualizarCampo({ tamanhoCard: tam.id as any })}
                        className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          estilo.tamanhoCard === tam.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        {tam.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Bordas Arredondadas
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'nenhum', label: 'Reto' },
                      { id: 'pequeno', label: 'Suave' },
                      { id: 'medio', label: 'Padrão' },
                      { id: 'total', label: 'Total' },
                    ].map(arr => (
                      <button
                        key={arr.id}
                        type="button"
                        onClick={() => atualizarCampo({ arredondamento: arr.id as any })}
                        className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          estilo.arredondamento === arr.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        {arr.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Posição do QR Code
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'canto-inferior-direito', label: 'Lateral / Canto' },
                      { id: 'oculto', label: 'Ocultar QR' },
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => atualizarCampo({ posicaoQrCode: pos.id as any })}
                        className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          estilo.posicaoQrCode === pos.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: TIPOGRAFIA & FONTES */}
          {abaAtiva === 'fontes' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Família Tipográfica
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  Escolha o estilo de fonte que será aplicado a todos os textos da carteirinha:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'sans', nome: 'Moderna Sans-Serif', fonteClass: 'font-sans', desc: 'Limpa, contemporânea e de máxima legibilidade' },
                  { id: 'serif', nome: 'Editorial Serif', fonteClass: 'font-serif', desc: 'Clássica, acadêmica e elegante' },
                  { id: 'mono', nome: 'Monospace Tecnológica', fonteClass: 'font-mono', desc: 'Estilo código, terminal e credencial técnica' },
                  { id: 'display', nome: 'Display Black', fonteClass: 'font-sans font-black', desc: 'Marcante, robusta e de alto impacto' },
                  { id: 'cursiva', nome: 'Cursiva Elegante', fonteClass: 'font-serif italic', desc: 'Caligráfica, refinada e sofisticada' },
                  { id: 'retro', nome: 'Retrô Gamer 8-bit', fonteClass: 'font-mono uppercase tracking-widest', desc: 'Nostálgica, pixel-art e futurista' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => atualizarCampo({ fonte: item.id as any })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      estilo.fonte === item.id
                        ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`block text-sm font-bold text-white mb-0.5 ${item.fonteClass}`}>
                      {item.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTÕES DE AÇÃO NO RODAPÉ DO MODAL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleRestaurarPadrao}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Carteirinha</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
