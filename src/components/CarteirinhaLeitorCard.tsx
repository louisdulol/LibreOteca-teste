import React from 'react';
import { EstiloCarteirinha, PerfilUsuario } from '../types';
import { BookOpen, Calendar, Shield, Tag, Edit2 } from 'lucide-react';

interface CarteirinhaLeitorCardProps {
  perfil: PerfilUsuario;
  estilo: EstiloCarteirinha;
  nomeBiblioteca: string;
  onClick?: () => void;
  interactiveMode?: boolean;
  onSelectSection?: (section: 'cores' | 'elementos' | 'layout' | 'fontes') => void;
}

export const CarteirinhaLeitorCard: React.FC<CarteirinhaLeitorCardProps> = ({
  perfil,
  estilo,
  nomeBiblioteca,
  onClick,
  interactiveMode = false,
  onSelectSection,
}) => {
  const elementos = estilo?.elementos || {
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

  // Background Handler — suporta cores da roda de cores (hex) e presets
  const getBackgroundInline = (): React.CSSProperties => {
    if (estilo?.background === 'personalizado' || estilo?.corFundoCustom) {
      if (estilo.usarGradienteCustom && estilo.corFundoSecundaria) {
        return {
          background: `linear-gradient(135deg, ${estilo.corFundoCustom || '#0f172a'}, ${estilo.corFundoSecundaria || '#1e1b4b'})`,
          color: estilo.corTextoCustom || '#ffffff',
          borderColor: estilo.corBordaCustom || 'rgba(255,255,255,0.25)',
        };
      }
      return {
        backgroundColor: estilo?.corFundoCustom || '#0f172a',
        color: estilo?.corTextoCustom || '#ffffff',
        borderColor: estilo?.corBordaCustom || 'rgba(255,255,255,0.25)',
      };
    }

    // Presets
    const estilosPresets: Record<string, React.CSSProperties> = {
      'gradiente-aurora': {
        background: 'linear-gradient(135deg, #059669 0%, #0f766e 40%, #1e1b4b 100%)',
        color: '#ffffff',
      },
      'gradiente-sunset': {
        background: 'linear-gradient(135deg, #581c87 0%, #9f1239 50%, #b45309 100%)',
        color: '#ffffff',
      },
      'gradiente-cyber': {
        background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #1d4ed8 100%)',
        color: '#ffffff',
      },
      'gradiente-ouro': {
        background: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #78350f 100%)',
        color: '#ffffff',
      },
      'gradiente-retrowave': {
        background: 'linear-gradient(135deg, #701a75 0%, #581c87 50%, #0e7490 100%)',
        color: '#ffffff',
      },
      'gradiente-deepocean': {
        background: 'linear-gradient(135deg, #082f49 0%, #0e7490 50%, #020617 100%)',
        color: '#ffffff',
      },
      'gradiente-sakura': {
        background: 'linear-gradient(135deg, #831843 0%, #4c0519 50%, #020617 100%)',
        color: '#ffffff',
      },
      'gradiente-bloodmoon': {
        background: 'linear-gradient(135deg, #450a0a 0%, #881337 50%, #0c0a09 100%)',
        color: '#ffffff',
      },
      'gradiente-cosmic': {
        background: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #020617 100%)',
        color: '#ffffff',
      },
      'gradiente-emerald': {
        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #134e4a 100%)',
        color: '#ffffff',
      },
      'solido-navy': { backgroundColor: '#0b172a', color: '#ffffff' },
      'solido-emerald': { backgroundColor: '#062e24', color: '#ffffff' },
      'solido-ruby': { backgroundColor: '#2e0915', color: '#ffffff' },
      'solido-obsidian': { backgroundColor: '#090d16', color: '#ffffff' },
      'solido-purple': { backgroundColor: '#1e1035', color: '#ffffff' },
      'solido-amber': { backgroundColor: '#331c07', color: '#fef3c7' },
      'solido-parchment': {
        backgroundColor: '#f5ebd7',
        color: '#1c1917',
        borderColor: '#d6c7ab',
      },
    };

    return (
      estilosPresets[estilo?.background || 'gradiente-aurora'] || {
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #090d16)',
        color: '#ffffff',
      }
    );
  };

  // Texturas de Fundo Nítidas e Funcionais com SVGs
  const renderTextura = () => {
    const tex = estilo?.textura || 'nenhuma';
    if (tex === 'estrelas') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-stars-leitor" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon
                points="15,4 17,11 24,11 18,15 20,22 15,18 10,22 12,15 6,11 13,11"
                fill="currentColor"
                fillOpacity="0.45"
              />
              <circle cx="45" cy="15" r="2.2" fill="currentColor" fillOpacity="0.5" />
              <polygon
                points="45,35 46.5,40 51,40 47,43 48.5,48 45,45 41.5,48 43,43 39,40 43.5,40"
                fill="currentColor"
                fillOpacity="0.4"
              />
              <circle cx="20" cy="45" r="1.6" fill="currentColor" fillOpacity="0.45" />
              <circle cx="52" cy="52" r="1.8" fill="currentColor" fillOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-stars-leitor)" />
        </svg>
      );
    }

    if (tex === 'ondas') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-waves-leitor" width="80" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M0 20 Q 20 6, 40 20 T 80 20 M0 34 Q 20 20, 40 34 T 80 34 M0 6 Q 20 -8, 40 6 T 80 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-waves-leitor)" />
        </svg>
      );
    }

    if (tex === 'pontilhado') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-dots-leitor" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.8" fill="currentColor" fillOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-dots-leitor)" />
        </svg>
      );
    }

    if (tex === 'linhas') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-lines-leitor" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M0,14 L14,0 M-2,2 L2,-2 M12,16 L16,12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-lines-leitor)" />
        </svg>
      );
    }

    if (tex === 'geometrica') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-geo-leitor" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M12,0 L24,12 L12,24 L0,12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-geo-leitor)" />
        </svg>
      );
    }

    if (tex === 'pixel-grid') {
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pat-grid-leitor" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pat-grid-leitor)" />
        </svg>
      );
    }

    return null;
  };

  const getFonteClass = () => {
    switch (estilo?.fonte) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'display':
        return 'font-sans font-black tracking-tight';
      case 'cursiva':
        return 'font-serif italic';
      case 'retro':
        return 'font-mono uppercase tracking-widest';
      default:
        return 'font-sans';
    }
  };

  const getArredondamentoClass = () => {
    switch (estilo?.arredondamento) {
      case 'nenhum':
        return 'rounded-none';
      case 'pequeno':
        return 'rounded-xl';
      case 'total':
        return 'rounded-3xl';
      default:
        return 'rounded-2xl sm:rounded-3xl';
    }
  };

  const getLarguraClass = () => {
    switch (estilo?.tamanhoCard) {
      case 'compacto':
        return 'max-w-[420px]';
      case 'expandido':
        return 'max-w-[560px]';
      default:
        return 'max-w-[480px] sm:max-w-[500px]';
    }
  };

  const matriculaExibida = perfil.matricula || perfil.id.substring(0, 8).toUpperCase();
  const validadeExibida = estilo?.anoValidade || '2026 / 2027';

  // Renderizador de QR Code vetorial nítido
  const renderQrCodeSvg = () => (
    <div
      onClick={e => {
        if (interactiveMode && onSelectSection) {
          e.stopPropagation();
          onSelectSection('layout');
        }
      }}
      className={`bg-white p-2 rounded-xl shadow-lg shrink-0 flex flex-col items-center border border-slate-200 ${
        interactiveMode ? 'hover:ring-2 hover:ring-amber-400 cursor-pointer transition-all' : ''
      }`}
      title={interactiveMode ? 'Clique para ajustar layout e QR Code' : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-13 h-13 sm:w-16 sm:h-16 text-slate-900 fill-current"
      >
        <path d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
        <path d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
        <path d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
        <path d="M40,10 h10 v10 h-10 z M60,10 h10 v10 h-10 z" />
        <path d="M40,40 h20 v20 h-20 z" />
        <path d="M10,40 h20 v10 h-20 z M70,40 h20 v10 h-20 z" />
        <path d="M40,70 h10 v20 h-10 z M60,80 h20 v10 h-20 z M90,70 h10 v20 h-10 z" />
      </svg>
      <span className="text-[7.5px] font-mono text-slate-800 font-black tracking-widest mt-1 uppercase">
        {matriculaExibida.slice(0, 8)}
      </span>
    </div>
  );

  // Avatar da Carteirinha (Foto com moldura bem definida e arredondada)
  const renderAvatarCarteirinha = () => (
    <div
      onClick={e => {
        if (interactiveMode && onSelectSection) {
          e.stopPropagation();
          onSelectSection('elementos');
        }
      }}
      className={`flex flex-col items-center shrink-0 ${
        interactiveMode ? 'hover:scale-105 cursor-pointer transition-transform' : ''
      }`}
      title={interactiveMode ? 'Clique para editar visibilidade da foto' : undefined}
    >
      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-black/30 border-2 border-white/40 shadow-md flex items-center justify-center">
        {perfil.avatarUrl ? (
          <img
            src={perfil.avatarUrl}
            alt={perfil.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-2xl">
            {perfil.nome.charAt(0)}
          </div>
        )}
      </div>

      {elementos.mostrarMatricula && (
        <span className="mt-1.5 px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-mono font-bold tracking-wider opacity-90 border border-white/10">
          {matriculaExibida}
        </span>
      )}
    </div>
  );

  const layout = estilo?.layout || 'padrao-esquerda';

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (interactiveMode && onSelectSection) {
      onSelectSection('cores');
    }
  };

  return (
    <div
      id="carteirinha-impressao-area"
      onClick={handleCardClick}
      className={`relative ${getLarguraClass()} w-full overflow-hidden border-2 shadow-2xl transition-all duration-300 select-none cursor-pointer group mx-auto ${getArredondamentoClass()} ${getFonteClass()}`}
      style={getBackgroundInline()}
    >
      {/* Brilho Superior Efeito PVC */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10" />

      {/* Textura de Fundo SVG Funcional */}
      {renderTextura()}

      {/* 1. CABEÇALHO DA CARTEIRINHA */}
      {elementos.mostrarBiblioteca && (
        <div
          onClick={e => {
            if (interactiveMode && onSelectSection) {
              e.stopPropagation();
              onSelectSection('elementos');
            }
          }}
          className={`relative z-20 px-4 sm:px-5 py-3 flex items-center justify-between border-b border-white/15 bg-black/20 backdrop-blur-xs ${
            interactiveMode ? 'hover:bg-white/10 cursor-pointer transition-colors' : ''
          }`}
          title={interactiveMode ? 'Clique para ajustar cabeçalho e validade' : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <BookOpen className="w-4 h-4 text-current" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-75 leading-none">
                LibreOteca • Carteira de Leitor
              </span>
              <span className="text-xs sm:text-sm font-black truncate max-w-[260px] block opacity-95 leading-tight mt-0.5">
                {nomeBiblioteca}
              </span>
            </div>
          </div>

          {elementos.mostrarValidade && (
            <div className="flex items-center gap-1.5 opacity-90 text-[10px] font-mono px-2 py-1 rounded-lg bg-white/10 border border-white/10 shrink-0">
              <Calendar className="w-3 h-3" />
              <span className="font-bold">{validadeExibida}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. CORPO DA CARTEIRINHA: MODELO PADRÃO CLÁSSICO */}
      {layout === 'padrao-esquerda' && (
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-4">
          {/* LADO ESQUERDO: FOTO & MATRÍCULA */}
          {elementos.mostrarFoto && renderAvatarCarteirinha()}

          {/* CENTRO: INFORMAÇÕES DO LEITOR */}
          <div
            onClick={e => {
              if (interactiveMode && onSelectSection) {
                e.stopPropagation();
                onSelectSection('fontes');
              }
            }}
            className={`space-y-1.5 flex-1 min-w-0 ${
              interactiveMode ? 'hover:bg-white/5 p-1 rounded-xl cursor-pointer transition-colors' : ''
            }`}
            title={interactiveMode ? 'Clique para alterar tipografia e elementos' : undefined}
          >
            {elementos.mostrarNome && (
              <h3 className="text-base sm:text-xl font-black tracking-tight leading-tight truncate text-white drop-shadow-xs">
                {perfil.nome}
              </h3>
            )}

            {elementos.mostrarCargo && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-current border border-white/15 shadow-xs">
                <Shield className="w-3 h-3 text-current" />
                <span>{perfil.role === 'professor' ? 'Docente / Gestor' : 'Aluno Leitor'}</span>
              </div>
            )}

            {elementos.mostrarTurma && perfil.turma && (
              <p className="text-xs font-semibold opacity-90 truncate">
                Turma: <strong>{perfil.turma}</strong>
              </p>
            )}

            {elementos.mostrarGenero && estilo?.generoFavorito && (
              <p className="text-[11px] font-medium opacity-85 truncate">
                Gênero: <strong>{estilo.generoFavorito}</strong>
              </p>
            )}
          </div>

          {/* LADO DIREITO: QR CODE */}
          {elementos.mostrarQrCode && estilo?.posicaoQrCode !== 'oculto' && (
            <div className="shrink-0">{renderQrCodeSvg()}</div>
          )}
        </div>
      )}

      {/* LAYOUT 2: MODERNO (FOTO À DIREITA) */}
      {layout === 'moderno-direita' && (
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div
            onClick={e => {
              if (interactiveMode && onSelectSection) {
                e.stopPropagation();
                onSelectSection('fontes');
              }
            }}
            className={`space-y-1.5 flex-1 min-w-0 ${
              interactiveMode ? 'hover:bg-white/5 p-1 rounded-xl cursor-pointer transition-colors' : ''
            }`}
          >
            {elementos.mostrarNome && (
              <h3 className="text-base sm:text-xl font-black tracking-tight leading-tight truncate text-white drop-shadow-xs">
                {perfil.nome}
              </h3>
            )}

            {elementos.mostrarCargo && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-current border border-white/15">
                <Tag className="w-3 h-3" />
                <span>{perfil.role === 'professor' ? 'Docente' : 'Leitor'}</span>
              </div>
            )}

            {elementos.mostrarTurma && perfil.turma && (
              <p className="text-xs font-semibold opacity-90">
                Turma: <strong>{perfil.turma}</strong>
              </p>
            )}

            {elementos.mostrarGenero && estilo?.generoFavorito && (
              <p className="text-[11px] font-medium opacity-85">
                Gênero: <strong>{estilo.generoFavorito}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {elementos.mostrarQrCode && estilo?.posicaoQrCode !== 'oculto' && renderQrCodeSvg()}
            {elementos.mostrarFoto && renderAvatarCarteirinha()}
          </div>
        </div>
      )}

      {/* LAYOUT 3: CREDENCIAL CRACHÁ TOPO */}
      {layout === 'credencial-topo' && (
        <div className="relative z-20 p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
          {elementos.mostrarFoto && renderAvatarCarteirinha()}

          <div
            onClick={e => {
              if (interactiveMode && onSelectSection) {
                e.stopPropagation();
                onSelectSection('fontes');
              }
            }}
            className="space-y-1"
          >
            {elementos.mostrarNome && (
              <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight truncate text-white">
                {perfil.nome}
              </h3>
            )}

            {elementos.mostrarCargo && (
              <p className="text-xs font-bold opacity-90">
                {perfil.role === 'professor' ? 'Docente / Gestor' : 'Aluno Leitor'}
                {elementos.mostrarTurma && perfil.turma && ` • ${perfil.turma}`}
              </p>
            )}

            {elementos.mostrarGenero && estilo?.generoFavorito && (
              <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-white/15 mt-0.5">
                {estilo.generoFavorito}
              </span>
            )}
          </div>

          {elementos.mostrarQrCode && estilo?.posicaoQrCode !== 'oculto' && (
            <div className="pt-1">{renderQrCodeSvg()}</div>
          )}
        </div>
      )}

      {/* LAYOUT 4: MINIMALISTA SLEEK */}
      {layout === 'minimalista-sleek' && (
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {elementos.mostrarFoto && renderAvatarCarteirinha()}

            <div className="space-y-0.5 min-w-0">
              {elementos.mostrarNome && (
                <h3 className="text-base sm:text-lg font-black tracking-tight truncate text-white">
                  {perfil.nome}
                </h3>
              )}
              {elementos.mostrarCargo && (
                <p className="text-xs opacity-85 font-medium">
                  {perfil.role === 'professor' ? 'Docente' : 'Estudante'}
                  {elementos.mostrarTurma && perfil.turma && ` • ${perfil.turma}`}
                </p>
              )}
            </div>
          </div>

          {elementos.mostrarQrCode && estilo?.posicaoQrCode !== 'oculto' && (
            <div className="shrink-0">{renderQrCodeSvg()}</div>
          )}
        </div>
      )}

      {/* 3. RODAPÉ DE SEGURANÇA INSTITUCIONAL */}
      <div className="relative z-20 px-4 sm:px-5 py-2 bg-black/30 border-t border-white/10 flex items-center justify-between text-[8px] font-mono tracking-widest uppercase opacity-75">
        <span>DOCUMENTO DE IDENTIFICAÇÃO DO LEITOR</span>
        <span>LIBREOTECA</span>
      </div>

      {/* DICA E BOTÃO DE CLIQUE PARA EDITAR (APENAS QUANDO ONCLICK ESTIVER ATIVO NO PERFIL) */}
      {onClick && (
        <div
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 cursor-pointer z-30"
        >
          <span className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-2xl backdrop-blur-xs transform group-hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
            <span>Clique para editar este cartão</span>
          </span>
        </div>
      )}
    </div>
  );
};
