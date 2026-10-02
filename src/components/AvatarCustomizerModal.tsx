import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  ESTILOS_AVATAR,
  CORES_FUNDO_AVATAR,
  SUGESTOES_SEEDS_MAGICAS,
  AvatarConfig,
  buildAvatarUrl,
  gerarConfiguracaoAleatoria,
} from '../lib/avatarService';
import { Check, RefreshCw, Palette, User, ShieldCheck, KeyRound, Sparkles, Shuffle, Copy } from 'lucide-react';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (avatarUrl: string, config: AvatarConfig) => void;
  currentConfig?: AvatarConfig;
  userName: string;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSaveAvatar,
  currentConfig,
  userName,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(() => {
    if (currentConfig && currentConfig.estilo) {
      return currentConfig;
    }
    return {
      estilo: 'adventurer',
      seed: userName.replace(/\s+/g, '_').toLowerCase() || 'leitor',
      corFundo: 'f59e0b',
    };
  });

  const [copiado, setCopiado] = useState(false);

  // Sincroniza se currentConfig mudar
  React.useEffect(() => {
    if (isOpen && currentConfig) {
      setConfig({
        estilo: currentConfig.estilo || 'adventurer',
        seed: currentConfig.seed || userName.replace(/\s+/g, '_').toLowerCase() || 'leitor',
        corFundo: currentConfig.corFundo || 'f59e0b',
      });
    }
  }, [isOpen, currentConfig, userName]);

  const avatarUrlAtual = buildAvatarUrl(config);

  const handleRandomizeSeed = () => {
    const seedAleatoria =
      SUGESTOES_SEEDS_MAGICAS[Math.floor(Math.random() * SUGESTOES_SEEDS_MAGICAS.length)] +
      '_' +
      Math.random().toString(36).substring(2, 6);
    setConfig(prev => ({ ...prev, seed: seedAleatoria }));
  };

  const handleRandomizeTudo = () => {
    const novaConfig = gerarConfiguracaoAleatoria(userName.replace(/\s+/g, '_').toLowerCase());
    setConfig(novaConfig);
  };

  const handleCopiarSeed = () => {
    navigator.clipboard.writeText(config.seed);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSave = () => {
    onSaveAvatar(avatarUrlAtual, config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizador de Foto de Perfil & Semente (Seed)"
      subtitle="Digite qualquer palavra, apelido ou frase para gerar um avatar 100% único no mundo"
      maxWidth="2xl"
      zIndex="z-[85]"
    >
      <div className="space-y-6">
        {/* Preview Central do Avatar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl gap-5 shadow-inner">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                <img
                  src={avatarUrlAtual}
                  alt="Avatar personalizado"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                type="button"
                onClick={handleRandomizeTudo}
                className="absolute -bottom-1 -right-1 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer border-2 border-white dark:border-slate-900"
                title="Sortear tudo aleatoriamente"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {userName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Avatar Seguro</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Semente atual: <strong className="font-mono text-amber-500 dark:text-amber-400">{config.seed}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Modifique a semente abaixo para ver novas combinações de traços, olhos e cabelos!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRandomizeTudo}
            className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-500" />
            <span>Sortear Aleatório</span>
          </button>
        </div>

        {/* 1. SEED / SEMENTE PERSONALIZADA (DESTAQUE MÁXIMO) */}
        <div className="p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Semente Personalizada (Seed)</span>
            </label>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Digite qualquer texto para transformar a imagem
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={config.seed}
                onChange={e => setConfig(prev => ({ ...prev, seed: e.target.value }))}
                placeholder="Digite palavras, números ou frases (ex: leitor_curioso, harry_potter...)"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRandomizeSeed}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Sortear nova palavra de semente"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Sortear Semente</span>
              </button>

              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, seed: userName.replace(/\s+/g, '_').toLowerCase() }))}
                className="px-2.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Usar meu próprio nome como semente"
              >
                Usar Meu Nome
              </button>

              <button
                type="button"
                onClick={handleCopiarSeed}
                className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                title="Copiar semente"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Atalhos Rápidos de Sementes Mágicas */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-semibold">Exemplos populares:</span>
            {['mestre_dos_livros', 'explorador_estelar', 'dragao_azul', 'cyber_leitor', 'alquimista_das_sombras'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, seed: s }))}
                className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-amber-400 cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ESCOLHA DO ESTILO / COLEÇÃO ILUSTRADA */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>Coleção de Estilo Ilustrado ({ESTILOS_AVATAR.length} estilos disponíveis)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ESTILOS_AVATAR.map(est => {
              const isSelected = config.estilo === est.id;
              return (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, estilo: est.id }))}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {est.nome}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {est.descricao}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ESCOLHA DA COR DE FUNDO (PALETA + RODA DE CORES) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Cor de Fundo do Avatar</span>
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {CORES_FUNDO_AVATAR.map(cor => {
              const isSelected = config.corFundo === cor.id;
              return (
                <button
                  key={cor.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, corFundo: cor.id }))}
                  className={`w-8 h-8 rounded-full ${cor.bgClass} flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                    isSelected ? 'ring-3 ring-amber-400 ring-offset-2 dark:ring-offset-slate-950 scale-105' : ''
                  }`}
                  title={cor.nome}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              );
            })}

            {/* Seletor Livre de Cor */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-700">
              <input
                type="color"
                value={`#${config.corFundo}`}
                onChange={e =>
                  setConfig(prev => ({ ...prev, corFundo: e.target.value.replace('#', '') }))
                }
                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
                title="Roda de cores livre"
              />
              <span className="text-xs text-slate-500 font-mono">#{config.corFundo}</span>
            </div>
          </div>
        </div>

        {/* BOTÕES DO RODAPÉ */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Foto de Perfil</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
