import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  ESTILOS_AVATAR,
  CORES_FUNDO_AVATAR,
  AvatarConfig,
  buildAvatarUrl,
  gerarConfiguracaoAleatoria,
} from '../lib/avatarService';
import { Check, RefreshCw, Palette, User, ShieldCheck } from 'lucide-react';

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

  const avatarUrlAtual = buildAvatarUrl(config);

  const handleRandomize = () => {
    const novaConfig = gerarConfiguracaoAleatoria(userName.replace(/\s+/g, '_').toLowerCase());
    setConfig(novaConfig);
  };

  const handleSave = () => {
    onSaveAvatar(avatarUrlAtual, config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizador de Avatar do Leitor"
      subtitle="Crie sua identidade visual ilustrada 100% segura, leve e personalizável"
      maxWidth="xl"
      zIndex="z-[85]"
    >
      <div className="space-y-5">
        {/* Preview Central do Avatar (100% Circular, Harmonizado) */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <img
                src={avatarUrlAtual}
                alt="Avatar personalizado"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="absolute -bottom-1 -right-1 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer border-2 border-white dark:border-slate-900"
              title="Gerar avatar aleatório"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>{userName}</span>
              <span title="Avatar seguro (LGPD)">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Identidade visual vetorial — sem fotos reais de menores
            </p>
          </div>
        </div>

        {/* Escolha do Estilo / Coleção */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>Coleção de Estilo Ilustrado</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ESTILOS_AVATAR.map(est => {
              const isSelected = config.estilo === est.id;
              return (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, estilo: est.id }))}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 font-bold'
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

        {/* Escolha da Cor de Fundo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
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
                  className={`w-9 h-9 rounded-full ${cor.bgClass} flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs ${
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
                className="w-9 h-9 rounded-full cursor-pointer bg-transparent border-0"
                title="Roda de cores livre"
              />
              <span className="text-[10px] text-slate-500 font-mono">#{config.corFundo}</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Avatar</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
