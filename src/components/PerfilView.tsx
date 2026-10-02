import React, { useState } from 'react';
import {
  PerfilUsuario,
  EstiloCarteirinha,
  UsuarioSessao,
  ConfiguracoesBiblioteca,
  Livro,
} from '../types';
import { StorageService } from '../lib/storage';
import { CarteirinhaLeitorCard } from './CarteirinhaLeitorCard';
import { CarteirinhaEditorModal } from './CarteirinhaEditorModal';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { AvatarConfig } from '../lib/avatarService';
import {
  User,
  Eye,
  EyeOff,
  Palette,
  Check,
  Heart,
  Sliders,
  Bookmark,
  Printer,
  Edit2,
  Calendar,
} from 'lucide-react';

interface PerfilViewProps {
  usuarioAtual: UsuarioSessao | null;
  config: ConfiguracoesBiblioteca;
  livros?: Livro[];
  onAtualizarSessao?: () => void;
}

const GENEROS_LITERARIOS = [
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Ficção e Romance',
  'Poesia e Contos',
  'Infanto-Juvenil',
  'História e Sociedade',
  'Ciências e Tecnologia',
  'Biografia e Memórias',
  'Didático e Educação',
  'Quadrinhos e HQ',
  'Fantasia e Magia',
  'Mistério e Suspense',
];

const TEMAS_STEAM_PERFIL = [
  {
    id: 'steam-midnight',
    nome: 'Steam Midnight',
    bg: 'bg-[#0f1622]',
    headerBg: 'from-blue-950/80 via-slate-900 to-[#0f1622]',
  },
  {
    id: 'cosmic-nebula',
    nome: 'Cosmic Nebula',
    bg: 'bg-[#150d24]',
    headerBg: 'from-purple-950/90 via-indigo-950 to-[#150d24]',
  },
  {
    id: 'cyberpunk-neon',
    nome: 'Cyberpunk Neon',
    bg: 'bg-[#0a0a14]',
    headerBg: 'from-fuchsia-950/90 via-blue-950 to-[#0a0a14]',
  },
  {
    id: 'steam-summer',
    nome: 'Steam Summer Gold',
    bg: 'bg-[#1a1405]',
    headerBg: 'from-amber-950/90 via-yellow-950 to-[#1a1405]',
  },
  {
    id: 'crimson-dark',
    nome: 'Crimson Nocturne',
    bg: 'bg-[#18060b]',
    headerBg: 'from-red-950/90 via-rose-950 to-[#18060b]',
  },
  {
    id: 'emerald-sanctuary',
    nome: 'Emerald Sanctuary',
    bg: 'bg-[#061810]',
    headerBg: 'from-emerald-950/90 via-teal-950 to-[#061810]',
  },
  {
    id: 'parchment-classic',
    nome: 'Classic Library',
    bg: 'bg-[#17130e]',
    headerBg: 'from-stone-900 via-amber-950/60 to-[#17130e]',
  },
];

const MOLDURAS_AVATAR = [
  { id: 'nenhuma', nome: 'Sem Moldura', desc: 'Borda clássica limpa' },
  { id: 'ouro-real', nome: 'Ouro Nobre', desc: 'Anel metálico dourado' },
  { id: 'neon-pulse', nome: 'Neon Cyber', desc: 'Anel ciano de alta energia' },
  { id: 'orbita-cosmica', nome: 'Orbita Cosmica', desc: 'Halo violeta profundo' },
  { id: 'pixel-retro', nome: 'Pixel Gamer', desc: 'Estética de contorno retrô' },
  { id: 'cristal-arcano', nome: 'Cristal Mistico', desc: 'Borda facetada esmeralda' },
  { id: 'fogo-cyber', nome: 'Chamas Cyber', desc: 'Aura rubi vibrante' },
];

export const PerfilView: React.FC<PerfilViewProps> = ({
  usuarioAtual,
  config,
  livros = [],
  onAtualizarSessao,
}) => {
  const [perfil, setPerfil] = useState<PerfilUsuario>(() => {
    return StorageService.getPerfilUsuario(usuarioAtual?.id);
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCarteirinhaModalOpen, setIsCarteirinhaModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const temaAtivo =
    TEMAS_STEAM_PERFIL.find(t => t.id === perfil.temaPerfil) || TEMAS_STEAM_PERFIL[0];
  const estiloCarteirinha = perfil.carteirinha;

  const atualizarPerfil = (novosCampos: Partial<PerfilUsuario>) => {
    setPerfil(prev => {
      const atualizado: PerfilUsuario = {
        ...prev,
        ...novosCampos,
      };
      StorageService.salvarPerfilUsuario(atualizado);
      return atualizado;
    });
    if (onAtualizarSessao) onAtualizarSessao();
  };

  const atualizarEstiloCarteirinha = (novoEstilo: EstiloCarteirinha) => {
    setPerfil(prev => {
      const atualizado: PerfilUsuario = {
        ...prev,
        carteirinha: novoEstilo,
      };
      StorageService.salvarPerfilUsuario(atualizado);
      return atualizado;
    });
    setFeedback('Carteirinha atualizada com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveAvatar = (url: string, configAvatar: AvatarConfig) => {
    atualizarPerfil({
      avatarUrl: url,
      avatarConfig: configAvatar,
    });
    setFeedback('Avatar atualizado com sucesso!');
    setTimeout(() => setFeedback(null), 3500);
  };

  const toggleGeneroFavorito = (gen: string) => {
    const atuais = perfil.generosFavoritos || [];
    let novos: string[];
    if (atuais.includes(gen)) {
      novos = atuais.filter(g => g !== gen);
    } else {
      if (atuais.length >= 3) {
        novos = [...atuais.slice(1), gen];
      } else {
        novos = [...atuais, gen];
      }
    }
    atualizarPerfil({ generosFavoritos: novos });
  };

  const livroDestaque = livros.find(l => l.id === perfil.livroDestaqueId);

  // Background e cabeçalho dinâmicos (suporta cores livres da roda de cores)
  const perfilStyleInline: React.CSSProperties = {
    backgroundColor:
      perfil.temaPerfil === 'personalizado' && perfil.corPerfilCustom
        ? perfil.corPerfilCustom
        : undefined,
  };

  const headerStyleInline: React.CSSProperties = {
    background:
      perfil.temaPerfil === 'personalizado' && perfil.corDestaqueCustom
        ? `linear-gradient(to bottom, ${perfil.corDestaqueCustom}, ${perfil.corPerfilCustom || '#0f172a'})`
        : undefined,
  };

  return (
    <div
      style={perfilStyleInline}
      className={`min-h-screen ${
        perfil.temaPerfil !== 'personalizado' ? temaAtivo.bg : ''
      } text-white transition-colors duration-500 pb-16 space-y-8`}
    >
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-16 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* HERO BANNER DO PERFIL (ESTILO STEAM SHOWCASE) */}
      <div
        style={headerStyleInline}
        className={`relative bg-gradient-to-b ${
          perfil.temaPerfil !== 'personalizado' ? temaAtivo.headerBg : ''
        } border-b border-white/10 pt-8 pb-10 px-4 sm:px-8 shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar com Moldura Harmonizada (100% Circular, Sem Canto Quadrado) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${
                  perfil.molduraAvatar === 'ouro-real'
                    ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-black shadow-amber-500/50'
                    : perfil.molduraAvatar === 'neon-pulse'
                    ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-black shadow-cyan-500/50'
                    : perfil.molduraAvatar === 'orbita-cosmica'
                    ? 'ring-4 ring-purple-500 ring-offset-4 ring-offset-black shadow-purple-500/50'
                    : perfil.molduraAvatar === 'pixel-retro'
                    ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-black shadow-lg'
                    : perfil.molduraAvatar === 'cristal-arcano'
                    ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-black shadow-emerald-500/40'
                    : perfil.molduraAvatar === 'fogo-cyber'
                    ? 'ring-4 ring-rose-500 ring-offset-4 ring-offset-black shadow-rose-500/50'
                    : 'border-2 border-white/20'
                }`}
              >
                {perfil.avatarUrl ? (
                  <img
                    src={perfil.avatarUrl}
                    alt={perfil.nome}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-14 h-14 text-slate-500" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-xl transition-transform active:scale-90 cursor-pointer flex items-center justify-center border-2 border-black"
                title="Editar avatar ilustrado"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-tight">
                  {perfil.nome}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {perfil.role === 'professor' ? 'Docente / Gestor' : 'Aluno Leitor'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {perfil.email || 'Conta Digital de Leitor'}
                {perfil.matricula && (
                  <span className="font-mono ml-2 opacity-80">
                    • ID: <strong>{perfil.matricula}</strong>
                  </span>
                )}
              </p>

              {perfil.bio && (
                <p className="text-xs text-slate-300 italic max-w-lg leading-relaxed pt-1">
                  "{perfil.bio}"
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs border border-white/15"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mudar Avatar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCarteirinhaModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Personalizar Carteirinha</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTROLE DE PRIVACIDADE DO USUÁRIO */}
          <div className="p-3.5 bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl flex items-center justify-between gap-3 shadow-xl shrink-0">
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                {perfil.perfilPublico ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Perfil {perfil.perfilPublico ? 'Público' : 'Privado'}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {perfil.perfilPublico ? 'Visível aos colegas' : 'Apenas para você'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => atualizarPerfil({ perfilPublico: !perfil.perfilPublico })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                perfil.perfilPublico ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  perfil.perfilPublico ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* CARTEIRINHA DIGITAL DO LEITOR (CLEAN & CLICÁVEL) */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="font-serif font-black text-lg text-white">
                Carteirinha Digital do Leitor
              </h2>
              <p className="text-xs text-slate-400">
                Clique sobre o cartão ou no botão de personalização para abrir o editor completo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-white/15"
                title="Imprimir Carteirinha"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCarteirinhaModalOpen(true)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Personalizar Carteirinha</span>
              </button>
            </div>
          </div>

          {/* O Cartão Renderizado (Sem Lema, Sem Benefícios, 100% Personalizável) */}
          <div className="flex justify-center py-2">
            <CarteirinhaLeitorCard
              perfil={perfil}
              estilo={estiloCarteirinha}
              nomeBiblioteca={config.nome_biblioteca}
              onClick={() => setIsCarteirinhaModalOpen(true)}
            />
          </div>
        </div>

        {/* VITRINE DO PERFIL ESTILO STEAM */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif font-bold text-lg text-white">
                Vitrine do Perfil (Destaques Literários)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Personalização Livre</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vitrine: Livro Favorito */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                LIVRO FAVORITO DA VIDA
              </span>

              {livroDestaque ? (
                <div className="flex gap-3 items-center">
                  {livroDestaque.capa_url ? (
                    <img
                      src={livroDestaque.capa_url}
                      alt={livroDestaque.titulo}
                      className="w-14 h-20 object-cover rounded-lg shadow-md border border-white/20"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-amber-600 rounded-lg flex items-center justify-center font-bold text-xs p-1 text-center">
                      {livroDestaque.titulo.slice(0, 15)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{livroDestaque.titulo}</h4>
                    <p className="text-xs text-slate-400 truncate">{livroDestaque.autor}</p>
                    <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                      {livroDestaque.categoria}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Nenhum livro selecionado ainda. Escolha no seletor abaixo para colocar em destaque na sua vitrine!
                </p>
              )}

              <select
                value={perfil.livroDestaqueId || ''}
                onChange={e => atualizarPerfil({ livroDestaqueId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecione um livro do acervo...</option>
                {livros.map(liv => (
                  <option key={liv.id} value={liv.id}>
                    {liv.titulo} — {liv.autor}
                  </option>
                ))}
              </select>
            </div>

            {/* Vitrine: Meta de Leitura Anual */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                META DE LEITURA ANUAL
              </span>

              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-white">
                  {perfil.metaLeituraAnual || 12}
                </span>
                <span className="text-xs text-slate-400">livros planejados para o ano letivo</span>
              </div>

              <input
                type="range"
                min="1"
                max="60"
                value={perfil.metaLeituraAnual || 12}
                onChange={e => atualizarPerfil({ metaLeituraAnual: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <p className="text-[11px] text-slate-400">
                Acompanhe o seu progresso de leitura e incentive hábitos literários contínuos.
              </p>
            </div>
          </div>
        </div>

        {/* CUSTOMIZAÇÃO DE TEMAS DO PERFIL COM RODA DE CORES COMPLETA */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif font-bold text-lg text-white">
                Aparência do Perfil (Temas & Roda de Cores)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Personalização Completa</span>
          </div>

          <div className="space-y-6">
            {/* 1. Roda de Cores do Perfil */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4" />
                  <span>Roda com Todas as Cores para o Perfil</span>
                </label>
                <span className="text-[10px] text-slate-400">Defina livremente qualquer cor para seu perfil</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cor de Fundo do Perfil */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Cor de Fundo da Página do Perfil
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={perfil.corPerfilCustom || '#0f1622'}
                      onChange={e =>
                        atualizarPerfil({
                          temaPerfil: 'personalizado',
                          corPerfilCustom: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded-2xl cursor-pointer bg-transparent border-0"
                    />
                    <div className="space-y-0.5">
                      <input
                        type="text"
                        value={perfil.corPerfilCustom || '#0f1622'}
                        onChange={e =>
                          atualizarPerfil({
                            temaPerfil: 'personalizado',
                            corPerfilCustom: e.target.value,
                          })
                        }
                        className="w-28 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        placeholder="#0f1622"
                      />
                      <span className="text-[10px] text-slate-400 block">Seletor cromático universal</span>
                    </div>
                  </div>
                </div>

                {/* Cor de Destaque / Cabeçalho */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Cor de Destaque do Topo (Banner)
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={perfil.corDestaqueCustom || '#1e1b4b'}
                      onChange={e =>
                        atualizarPerfil({
                          temaPerfil: 'personalizado',
                          corDestaqueCustom: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded-2xl cursor-pointer bg-transparent border-0"
                    />
                    <div className="space-y-0.5">
                      <input
                        type="text"
                        value={perfil.corDestaqueCustom || '#1e1b4b'}
                        onChange={e =>
                          atualizarPerfil({
                            temaPerfil: 'personalizado',
                            corDestaqueCustom: e.target.value,
                          })
                        }
                        className="w-28 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white"
                        placeholder="#1e1b4b"
                      />
                      <span className="text-[10px] text-slate-400 block">Gradiente do cabeçalho</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Temas Prontos */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Temas prontos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {TEMAS_STEAM_PERFIL.map(tem => (
                  <button
                    key={tem.id}
                    type="button"
                    onClick={() =>
                      atualizarPerfil({
                        temaPerfil: tem.id as any,
                        corPerfilCustom: undefined,
                        corDestaqueCustom: undefined,
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      perfil.temaPerfil === tem.id || (!perfil.temaPerfil && tem.id === 'steam-midnight')
                        ? 'bg-white/15 border-amber-400 ring-2 ring-amber-400/40 font-bold'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs text-white block">{tem.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Molduras do Avatar (Totalmente Circulares e Harmonizadas) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Moldura do Avatar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOLDURAS_AVATAR.map(mol => (
                  <button
                    key={mol.id}
                    type="button"
                    onClick={() => {
                      atualizarPerfil({ molduraAvatar: mol.id as any });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      perfil.molduraAvatar === mol.id || (!perfil.molduraAvatar && mol.id === 'nenhuma')
                        ? 'bg-white/15 border-amber-400 ring-2 ring-amber-400/40 font-bold'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs text-white block">{mol.nome}</span>
                    <span className="text-[10px] text-slate-400 block">{mol.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GÊNEROS LITERÁRIOS FAVORITOS */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif font-black text-lg text-white">
                Gêneros Literários Favoritos
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Escolha até 3 gêneros para exibir</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {GENEROS_LITERARIOS.map(gen => {
              const isSelected = (perfil.generosFavoritos || []).includes(gen);
              return (
                <button
                  key={gen}
                  type="button"
                  onClick={() => toggleGeneroFavorito(gen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-xs scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  {gen}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: Customização Completa da Carteirinha (Tudo em um modal só) */}
      <CarteirinhaEditorModal
        isOpen={isCarteirinhaModalOpen}
        onClose={() => setIsCarteirinhaModalOpen(false)}
        perfil={perfil}
        estiloInicial={estiloCarteirinha}
        nomeBiblioteca={config.nome_biblioteca}
        onSalvar={atualizarEstiloCarteirinha}
      />

      {/* MODAL 2: Customização de Avatar Seguro */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSaveAvatar={handleSaveAvatar}
        currentConfig={perfil.avatarConfig}
        userName={perfil.nome}
      />
    </div>
  );
};
