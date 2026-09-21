import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="LibreOteca Logo"
    >
      {/* 1º Livro / Bloco Esquerdo (Azul Marinho com topo inclinado e recorte curvo de página) */}
      <path
        d="M 36 126 L 36 40 C 36 33 40 28 46 25 L 70 12 C 75 9 80 13 80 18 L 80 110 C 80 120 86 128 96 136 C 88 131 76 122 71 112 C 67 104 67 90 67 70 L 67 36 L 50 44 L 50 124 Z"
        fill="#0D1E38"
      />
      <path
        d="M 36 38 L 36 126 C 45 122 58 119 72 119 L 72 40 C 72 26 66 18 56 18 C 45 18 36 28 36 38 Z"
        fill="#0D1E38"
      />

      {/* Recorte fluido que une a lombada central à curva do livro */}
      <path
        d="M 72 114 C 72 98 76 86 86 86 L 86 126 C 92 133 97 138 100 142 C 94 136 86 126 80 118 C 76 112 72 112 72 114 Z"
        fill="#FFFFFF"
      />

      {/* 2º Livro (Azul Royal Vibrante com etiqueta superior) */}
      <rect x="86" y="24" width="34" height="110" rx="6" fill="#1C6FF2" />
      <rect x="94" y="42" width="18" height="6" rx="1.5" fill="#FFFFFF" />

      {/* 3º Livro (Azul Cobalto / Celeste) */}
      <rect x="126" y="55" width="22" height="79" rx="5" fill="#0084FF" />

      {/* 4º Livro (Azul Marinho com etiqueta superior) */}
      <rect x="154" y="52" width="25" height="82" rx="5" fill="#0D1E38" />
      <rect x="160" y="68" width="13" height="5" rx="1.5" fill="#FFFFFF" />

      {/* Faixa Superior das Páginas Abertas (Azul Marinho) */}
      <path
        d="M 10 127 C 32 114 66 113 100 148 C 134 113 168 114 190 127 C 172 120 136 118 100 156 C 64 118 28 120 10 127 Z"
        fill="#0D1E38"
      />

      {/* Faixa Inferior das Páginas Abertas (Azul Royal Vibrante) */}
      <path
        d="M 10 150 C 32 137 66 135 100 170 C 134 135 168 137 190 150 C 172 143 136 141 100 178 C 64 141 28 143 10 150 Z"
        fill="#1C6FF2"
      />
    </svg>
  );
};
