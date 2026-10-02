# Especificação Completa do Projeto — LibreOteca (Project Spec)
**Sistema de Gestão de Bibliotecas Escolares e Comunitárias (SGB)**  
*Versão:* 1.0.0 | *Arquitetura:* Serverless SPA (Single Page Application)  
*Stack Principal:* React 19, TypeScript, Vite 8, Tailwind CSS v4, Firebase Firestore & Auth

---

## 1. Visão Geral e Proposta de Valor

### 1.1. O que é o LibreOteca?
O **LibreOteca** é um Sistema de Gestão de Bibliotecas (SGB) moderno, ágil e visualmente refinado, projetado para digitalizar e automatizar todo o ciclo de vida de uma biblioteca — desde acervos escolares até bibliotecas comunitárias e setoriais.

### 1.2. Principais Diferenciais
- **100% Serverless & Custo Zero:** Executado integralmente no navegador como SPA, consumindo serviços gerenciados gratuitos do Google Firebase (Firestore e Authentication). Não requer manutenção de servidores Linux dedicados.
- **Resiliência Offline & Modo Híbrido:** Continua operando mesmo com oscilações de rede graças a um mecanismo híbrido de sincronização com cache local e persistência em memória.
- **Design Editorial Premium:** Interface responsiva desenhada com foco na experiência do usuário, tipografia editorial balanceada, capas geradas proceduralmente caso o livro não possua foto, e modo tablet/kiosk para autoatendimento.
- **Segurança Fortress (LGPD Compliant):** Arquitetura com *Deny-by-Default*, isolamento de dados de leitores menores de idade, auditoria contínua imutável e transações atômicas para evitar inconsistência de acervo.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Linguagem** | TypeScript 5.8+ | Tipagem estrita de entidades, contratos de dados seguros e menor taxa de bugs em produção. |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Estado reativo eficiente, ecossistema de componentes modular e renderização ultrarrápida. |
| **Bundler & Build Tool** | Vite 8 | Inicialização instantânea em desenvolvimento, HMR veloz e geração de artefatos estáticos otimizados. |
| **Estilização** | Tailwind CSS v4 | Estilização utilitária atômica de altíssima performance, tema editorial escuro/claro e design responsivo. |
| **Animações e Transições** | Motion (`motion`) | Transições fluidas de abas, abertura de capas 3D e modais táteis com excelente performance de 60 FPS. |
| **Ícones** | Lucide React | Biblioteca de ícones moderna, leve e consistente para interfaces web. |
| **Validação de Schemas** | Zod 4 | Validação antecipada de formulários e tipos de dados no cliente antes de submeter ao banco. |
| **Banco de Dados** | Google Cloud Firestore | Banco NoSQL documental em tempo real, alta disponibilidade, escalabilidade automática e segurança a nível de documento. |
| **Autenticação** | Firebase Authentication | Gerenciamento de sessões com segurança corporativa, provedor Google e E-mail/Senha com tokens JWT criptografados. |
| **Metadados de Livros** | Google Books & Open Library | Integração para autopreenchimento de sinopse, capa, autores e ano via código ISBN ou título. |
| **Visão Computacional & OCR** | Tesseract.js (Wasm) | Motor de reconhecimento óptico de caracteres no cliente para leitura instantânea de resumos na contracapa com a câmera. |
| **Avatares Vetoriais** | DiceBear 9.x | Geração procedural de avatares seguros e customizáveis, preservando a imagem real de alunos menores (LGPD). |

---

## 3. Módulos Funcionais do Sistema

```
+-----------------------------------------------------------------------------------+
|                                  LIBREOTECA                                        |
+-----------------------------------------------------------------------------------+
|  1. Acervo & Catálogo     |  2. Circulação & Empréstimos  |  3. Leitores & Patronos   |
|  - Cadastro com ISBN       |  - Empréstimo Transacional    |  - Alunos, Professores,   |
|  - Gerador de Capas        |  - Devolução & Renovação      |    Comunidade e Funcionários|
|  - Busca facetada          |  - Cálculo de Atrasos         |  - Histórico de Leitura   |
|  - Filtros por Categoria   |  - Notificações de Vencimento |  - Isolamento LGPD        |
+----------------------------+-------------------------------+---------------------------+
|  4. Mural & Comunidade    |  5. Relatórios & Auditoria    |  6. Modo Kiosk & Temas    |
|  - Avaliações (1 a 5)      |  - Métricas de Giro do Acervo |  - Autoatendimento Tablet |
|  - Moderação de Resenhas   |  - Livros mais lidos          |  - Customização da Escola |
|  - Filtro antipalavrão     |  - Exportação CSV / PDF       |  - Temas Escuro e Claro   |
|  - Espaço Leitor Estudante |  - Trilha Forense Imutável    |  - Painel de Estatísticas |
+----------------------------+-------------------------------+---------------------------+
|  7. Resumos Inteligentes  |  8. Perfil & Carteirinha VIP  |                           |
|  - Busca na Web com 1 cliq |  - Carteirinha de Benefícios  |                           |
|  - Câmera OCR Contracapa   |  - Customização Total 3D      |                           |
|  - Google Books + Wiki     |  - Controle de Privacidade    |                           |
+----------------------------+-------------------------------+---------------------------+
```

### 3.1. Gestão do Acervo & Resumos Inteligentes
- Cadastro detalhado: Título, Autor, Categoria, ISBN, Editora, Ano, Localização física, Total e Disponíveis.
- **Busca de Resumos na Web com 1 Clique:** Consulta em cascata no Google Books API (pt-BR), Open Library Works, BrasilAPI e Wikipédia para obter a sinopse oficial da obra sem digitação manual.
- **Scanner de Contracapa com Câmera (OCR via Tesseract.js):** Permite apontar a câmera do celular/computador ou carregar uma foto da contracapa física do livro; o aplicativo lê e transcreve o resumo do autor/editora automaticamente, filtrando ruídos fiscais e códigos de barras.
- Capas Editoriais Inteligentes (`EditorialCover.tsx`): Livros sem capa gráfica recebem capas geradas dinamicamente com paletas de cores refinadas e tipografia editorial.
- Visualização em Estante Virtual (`BookshelfView.tsx`) e Grade de Cards (`BookCard.tsx`).

### 3.2. Perfil do Leitor, Avatares e Carteirinha Digital do Clube
- **Controle de Privacidade do Usuário:** Interruptor para definir perfil como *Público* (compartilha resenhas e conquistas no mural comunitário) ou *Privado* (garante confidencialidade de histórico e leituras).
- **Avatares Ilustrados Customizáveis:** Escolha de estilos (Aventureiro, Robô Leitor, Estudante Clássico, Emojis, Minimalista), variação de sementes e cores de fundo seguras, sem expor fotografias pessoais de menores de idade (LGPD).
- **Carteirinha Digital do Leitor (Customização Totalmente Livre):**
  - Customização profunda e irrestrita sem regras de benefícios forçados ou campos desnecessários: 4 layouts de cartão (Padrão, Moderno, Credencial e Minimalista Sleek), mais de 17 opções de backgrounds (gradientes espaciais e cores sólidas), texturas SVG operacionais (Estrelas, Ondas, Pontilhado, Linhas, etc.), molduras e tipografia.
  - **MEGA FILTRO Escolar no Mural de Resenhas:** Validação em tempo real com bloqueio estrito de palavras de baixo calão, xingamentos, disfarces por leetspeak (`@`, `1`, `0`, `3`, `!`, `$`), espaçamentos forçados e links.
  - **Experiência de Perfil Estilo Steam:** Temas de fundo do perfil (*Steam Midnight*, *Cosmic Nebula*, *Cyberpunk Neon*, *Steam Summer Gold*, *Crimson*, etc.), Molduras Colecionáveis de Avatar, Vitrine do Livro Favorito e Metas de Leitura Anuais.
  - Opção de impressão e download em alta resolução.
- Capas Editoriais Inteligentes (`EditorialCover.tsx`): Livros sem capa gráfica recebem capas geradas dinamicamente com paletas de cores refinadas e tipografia editorial.
- Visualização em Estante Virtual (`BookshelfView.tsx`) e Grade de Cards (`BookCard.tsx`).

### 3.2. Circulação e Empréstimos (`EmprestimosView.tsx`, `LoanModal.tsx`)
- Fluxo de empréstimo atômico: Não permite saída se `disponiveis <= 0`.
- Controle automático de prazo (padrão de 14 dias ou configurável).
- Indicadores visuais claros: *Em dia*, *Próximo ao vencimento* (alerta âmbar) e *Em atraso* (alerta vermelho).
- Limite de renovações configurável com extensão imediata de prazo.
- Devolução com reincorporação automática do exemplar ao acervo.

### 3.3. Gestão de Leitores (`LeitoresView.tsx`, `ReaderModal.tsx`)
- Categorização de patronos: Aluno, Professor, Funcionário ou Comunidade.
- Ficha individual do leitor: Histórico completo de livros já lidos, empréstimos ativos, taxa de pontualidade e contatos.
- Proteção total de dados (LGPD): Alunos só conseguem ver seus próprios dados de empréstimo; a listagem completa de telefones e dados de menores é restrita aos professores.

### 3.4. Mural de Comentários e Recomendações (`MuralComentariosView.tsx`)
- Incentivo ao hábito de leitura com notas de 1 a 5 estrelas e resenhas textuais.
- Sistema de moderação: Resenhas ficam com status `pendente` até que um professor aprove a exibição.
- Filtro antipalavrão e sanitização prévia (`commentFilter.ts`).

### 3.5. Relatórios e Indicadores (`RelatoriosView.tsx`)
- Indicadores de gestão: Taxa de ocupação do acervo, porcentagem de pontualidade nas devoluções, total de empréstimos do mês.
- Ranking de livros mais populares e leitores mais assíduos.
- Exportação de dados para planilhas (CSV) para prestação de contas escolar.

### 3.6. Modo Kiosk / Tablet (`TabletKioskView.tsx`)
- Interface simplificada em tela cheia para terminais ou tablets instalados na entrada da biblioteca.
- Permite que alunos consultem disponibilidade de títulos sem necessidade de login administrativo.

---

## 4. Modelo de Dados e Esquema do Firestore

### 4.1. Coleção `/livros/{livroId}`
```typescript
interface Livro {
  id: string;                     // UUID ou ID do documento
  codigo_interno: string;         // Ex: "LO-0042"
  titulo: string;                 // Máx 200 caracteres
  autor: string;                  // Máx 150 caracteres
  categoria: string;              // Ex: "Ficção", "História", "Didático"
  isbn?: string;                  // ISBN-10 ou ISBN-13
  editora?: string;               // Nome da editora
  ano_publicacao?: number;        // Ex: 2024
  total_exemplares: number;       // Inteiro >= 1
  disponiveis: number;            // 0 <= disponiveis <= total_exemplares
  localizacao?: string;           // Ex: "Corredor B, Estante 3"
  capa_url?: string;              // URL de imagem externa
  sinopse?: string;               // Resumo do livro
  criado_em: string;              // Timestamp ISO 8601
  atualizado_em?: string;
}
```

### 4.2. Coleção `/leitores/{leitorId}`
```typescript
interface Leitor {
  id: string;                     // ID do documento (UUID ou Auth UID)
  nome: string;                   // Nome completo
  email?: string;                 // E-mail de contato
  telefone?: string;              // Telefone de contato
  tipo: 'aluno' | 'professor' | 'funcionario' | 'comunidade';
  matricula_turma?: string;       // Ex: "2024-3A" ou "Turma 8B"
  observacoes?: string;
  ativo: boolean;                 // Ativo ou Inativo na biblioteca
  criado_em: string;
}
```

### 4.3. Coleção `/emprestimos/{emprestimoId}`
```typescript
interface Emprestimo {
  id: string;
  livro_id: string;               // FK para /livros
  leitor_id: string;              // FK para /leitores
  usuario_id?: string;            // Espelho do Auth UID para regras de consulta
  emprestado_em: string;          // ISO Date
  devolucao_prevista: string;     // ISO Date
  devolvido_em?: string;          // ISO Date quando concluído
  renovacoes: number;             // Contador de renovações efetuadas
  observacoes?: string;
}
```

### 4.4. Coleção `/comentarios/{comentarioId}`
```typescript
interface Comentario {
  id: string;
  livro_id: string;
  leitor_id: string;              // ID do autor (Auth UID)
  autor_nome: string;
  autor_tipo: 'aluno' | 'professor' | 'comunidade';
  nota: 1 | 2 | 3 | 4 | 5;
  texto: string;                  // Limite de 1.000 caracteres
  status: 'pendente' | 'aprovado' | 'rejeitado';
  criado_em: string;
}
```

### 4.5. Coleção `/auditoria/{logId}`
```typescript
interface RegistroAuditoria {
  id: string;
  usuario_id: string;             // UID do operador
  usuario_nome: string;           // Nome do operador
  acao: string;                   // Ex: "CRIAR_LIVRO", "BAIXA_EMPRESTIMO"
  tabela_afetada: string;         // Ex: "livros", "emprestimos"
  detalhes: string;               // Descrição contextual da ação
  criado_em: string;              // Imutável
}
```

### 4.6. Coleções Administrativas
- `/admins_config/geral`: Armazena o `codigo_mestre_professor` e credenciais protegidas. Leitura restrita a Super Admins.
- `/configuracoes/geral`: Configurações institucionais públicas (nome da biblioteca, regras de dias de empréstimo).
- `/admins/{uid}`: Documentos vazios cujo ID corresponde ao UID com privilégio de Super Administrador.

---

## 5. Estrutura de Diretórios do Código-Fonte

```
/
├── .env.example                  # Variáveis de ambiente de exemplo
├── firestore.rules               # Regras oficiais de segurança do banco
├── firebase-blueprint.json       # Esquema relacional e definições de índices
├── package.json                  # Dependências e scripts de automação
├── vite.config.ts                # Configuração do Vite e Tailwind CSS v4
├── index.html                    # Ponto de entrada HTML e SEO
├── security_spec.md              # Especificação de segurança detalhada
├── project_spec.md               # Este documento de especificação
└── src/
    ├── main.tsx                  # Ponto de entrada React 19
    ├── App.tsx                   # Roteador principal, abas e gestão de estado
    ├── index.css                 # Estilos globais e diretivas do Tailwind
    ├── types/
    │   └── index.ts              # Interfaces TypeScript de todo o domínio
    ├── lib/
    │   ├── firebase.ts           # Inicialização do SDK do Firebase
    │   ├── firebaseAuth.ts       # Funções de login, cadastro e controle de sessão
    │   ├── firebaseFirestore.ts  # Transações e consultas diretas no Firestore
    │   ├── storage.ts            # Mecanismo híbrido de persistência e sincronização
    │   ├── commentFilter.ts      # Sanitização e moderação automática de resenhas
    │   ├── coverFinder.ts        # Busca e tratamento de capas de livros
    │   ├── openlibrary.ts        # Integração externa com Open Library
    │   ├── theme.ts              # Controle de temas (claro/escuro/editorial)
    │   └── validations.ts        # Schemas de validação Zod
    └── components/
        ├── Navbar.tsx            # Barra de navegação com perfil e seletor de tema
        ├── AcervoView.tsx        # Visualização e gestão do catálogo de livros
        ├── EmprestimosView.tsx   # Gestão de circulação e histórico de retiradas
        ├── LeitoresView.tsx      # Gestão de cadastros e patronos físicos
        ├── MuralComentariosView  # Feed de recomendações e moderação de resenhas
        ├── RelatoriosView.tsx    # Dashboard analítico e exportação de dados
        ├── TabletKioskView.tsx   # Interface de consulta para terminais/tablets
        ├── BookCard.tsx          # Card de livro com capa e status de disponibilidade
        ├── BookshelfView.tsx     # Visualização gráfica estilo prateleira
        ├── LoanModal.tsx         # Modal de empréstimo com transação atômica
        ├── ReaderModal.tsx       # Cadastro e edição de patronos
        └── LoginModal.tsx        # Autenticação Google e E-mail com convite
```

---

## 6. Guia de Hospedagem Privada e Gratuita (Sem Expor Código)

Para hospedar o **LibreOteca** de forma **100% gratuita**, preservando todos os arquivos e mantendo o código **completamente privado**:

### Opção Recomendada: GitHub Privado + Cloudflare Pages (ou Firebase Hosting)
1. **Repositório Privado no GitHub:**
   - Crie um repositório como **Private** (Privado) no GitHub (gratuito e ilimitado).
   - O código-fonte, histórico e documentação ficam totalmente invisíveis para terceiros.
2. **Build e Deploy Automático via Cloudflare Pages (ou Vercel):**
   - Conecte o repositório privado ao **Cloudflare Pages** (gratuito, sem limite de largura de banda).
   - O Cloudflare compila a aplicação (`npm run build`) e serve apenas os arquivos estáticos minificados (`dist/`).
   - O código-fonte TypeScript nunca é baixado pelos usuários finais, apenas o JavaScript compilado.
3. **Alternativa Direta: Firebase Hosting:**
   - Como o projeto já usa Firebase, você pode rodar localmente `npm run build` seguido de `firebase deploy --only hosting`.
   - O Firebase hospeda seu app gratuitamente no domínio `.web.app` com certificado SSL automático.
