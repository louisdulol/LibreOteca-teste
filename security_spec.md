# Especificação de Segurança — LibreOteca (Security Spec)
**Documento Oficial de Arquitetura de Segurança, Defesa em Profundidade e Regras de Integridade**  
*Versão:* 2.0 (Fortress Model) | *Status:* Aprovado / Implementado

---

## 1. Visão Geral da Arquitetura de Segurança

O **LibreOteca** implementa um modelo de **Defesa em Profundidade (*Defense in Depth*)** e **Confiança Zero (*Zero-Trust*)**. Como uma aplicação *serverless* baseada em React (Vite) e Firebase (Firestore + Authentication), o cliente web é considerado um ambiente de execução não confiável. Todas as garantias de autorização, validação de tipos, limites de tamanho e integridade relacional residem estritamente nas **Firestore Security Rules** e em operações transacionais no servidor.

```
+-------------------------------------------------------------+
|                      Camada 1: Client Web                    |
|    - Validação de entrada antecipada (Zod Schemas)          |
|    - Sanitização de texto e prevenção a XSS                 |
|    - Transações atômicas com `runTransaction()`             |
+-------------------------------------------------------------+
                              | HTTPS + Auth Token (JWT)
+-------------------------------------------------------------+
|                 Camada 2: Firebase Authentication           |
|    - Contas com identificação única (UID)                   |
|    - Provedor Google OAuth e E-mail/Senha com 8+ dígitos    |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                Camada 3: Firestore Security Rules           |
|    - Deny-by-default global (`match /{document=**}`)        |
|    - RBAC: Aluno vs. Professor (Staff) vs. Super Admin      |
|    - Verificação estrita de Schema (hasOnly, tipos, tamanhos)|
|    - Isolamento de segredos em `/admins_config/geral`       |
|    - Imutabilidade e não-rejeição de `/auditoria`           |
|    - Conformidade LGPD em `/leitores` e `/emprestimos`      |
+-------------------------------------------------------------+
```

---

## 2. Separação de Entidades e Papéis (RBAC)

Para evitar vazamento de credenciais e garantir conformidade com a LGPD (Lei Geral de Proteção de Dados), o sistema adota estrita separação entre identidade de autenticação e registro cadastral:

| Entidade | Coleção | Finalidade | Regra de Criação | Quem pode Ler? |
|---|---|---|---|---|
| **Conta de Acesso** | `/users/{uid}` | Identidade digital no app. Possui `role: 'aluno' \| 'professor'`. | Auto-registro como `aluno`. Promoção a `professor` exige código válido contra `/admins_config/geral`. | Próprio usuário (`auth.uid == userId`) e Professores. |
| **Patrono Físico** | `/leitores/{leitorId}` | Registro cadastral da biblioteca física (telefone, série, turma, matrícula). | Apenas `isProfessor()` pode criar e editar. | Apenas `isProfessor()` ou o leitor logado (quando vinculado). Bloqueado para scraping público. |
| **Super Administrador** | `/admins/{uid}` | Operadores com autoridade máxima. | Escrita desabilitada via regras (`write: if false;`), provisionado apenas via Console GCP/Firebase. | Verificado via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`. |
| **Configurações Sensíveis** | `/admins_config/geral` | Armazena o `codigo_mestre_professor` e segredos institucionais. | Somente Super Admin lê e escreve. Usuários comuns e não-autenticados recebem `PERMISSION_DENIED`. | Somente `isSuperAdmin()`. |
| **Configurações Públicas** | `/configuracoes/geral` | Nome da biblioteca, tipo institucional (`escola` / `publica`), dias de empréstimo. | Leitura pública para personalização do cabeçalho; escrita restrita a `isProfessor()`. | Leitura pública. |

---

## 3. Matriz de Permissões das Coleções Firestore

### 3.1. Livros (`/livros/{livroId}`)
- **Leitura (`get`, `list`):** Pública (`allow read: if true;`), permitindo busca no catálogo e terminal kiosk de consulta.
- **Criação / Atualização / Exclusão:** Exclusiva para `isProfessor()`.
- **Validação de Schema:**
  - Chaves permitidas estritas: `id`, `codigo_interno`, `titulo`, `autor`, `categoria`, `isbn`, `editora`, `ano_publicacao`, `total_exemplares`, `disponiveis`, `localizacao`, `capa_url`, `sinopse`, `criado_em`, `atualizado_em`.
  - Invariante de estoque: `disponiveis >= 0` e `disponiveis <= total_exemplares`.
  - Limite de caracteres em strings para mitigar esgotamento de quota.

### 3.2. Leitores (`/leitores/{leitorId}`) — Proteção LGPD
- **Leitura (`get`, `list`):**
  - Professores: acesso irrestrito para gestão da biblioteca.
  - Alunos/Usuários: leitura permitida apenas do seu próprio registro (quando `usuario_id == request.auth.uid`).
  - Bloqueio total a acessos anônimos para mitigar vazamento de dados de menores de idade.
- **Escrita:** Apenas `isProfessor()`. Alunos não podem forjar registros ou alterar seus próprios status/turma.

### 3.3. Empréstimos (`/emprestimos/{emprestimoId}`)
- **Leitura (`get`, `list`):**
  - Professores têm visão global do acervo emprestado.
  - Alunos autenticados só podem ler empréstimos vinculados ao seu `leitor_id` ou `usuario_id` (`where('leitor_id', '==', uid)` ou `where('usuario_id', '==', uid)`).
- **Criação e Devolução:** Apenas `isProfessor()`. Alunos não podem dar baixa em empréstimos nem criar retiradas por conta própria.
- **Validação de Integridade Relacional:**
  - `exists(/databases/$(database)/documents/livros/$(incoming().livro_id))`
  - `exists(/databases/$(database)/documents/leitores/$(incoming().leitor_id))`
- **Atomicidade Transacional:** O client é forçado a utilizar `runTransaction()` na função `realizarEmprestimoTransacionalFirestore()` para garantir que a saída do exemplar e a criação do empréstimo ocorram em uma única operação indivisível.

### 3.4. Comentários e Resenhas (`/comentarios/{comentarioId}`)
- **Leitura:** Apenas resenhas com `status == 'aprovado'` são públicas. Comentários pendentes só são visíveis pelo autor ou por professores.
- **Criação:** Usuários logados (`request.auth != null`).
  - Nota obrigatória entre 1 e 5 estrelas.
  - Texto limitado a 1.000 caracteres (mitigação de ataque *Denial of Wallet* / buffer exhaustion).
  - **MEGA FILTRO Escolar (Anti-Evasão):** Motor rigoroso que analisa raízes de baixo calão, xingamentos, preconceito, leetspeak (`@`, `1`, `0`, `3`, `!`, `$`), espaçamento forçado (`p u t a`), normalização diacrítica e bloqueio de links externos/phishing antes de submeter ao banco.
- **Moderação:** Somente `isProfessor()` pode alterar o campo `status` para `aprovado` ou `rejeitado`. Tentativas bloqueadas geram registros forenses na auditoria.

### 3.5. Auditoria (`/auditoria/{logId}`) — Trilha Forense Imutável
- **Criação:** Apenas `isProfessor()` registrando sua própria identidade (`usuario_id == request.auth.uid`).
- **Imutabilidade Total:** `allow update, delete: if false;` — logs nunca podem ser alterados ou apagados, nem mesmo por administradores.
- Alunos e usuários anônimos recebem `PERMISSION_DENIED` imediato ao tentar injetar logs falsos.

---

## 4. Resolução das Falhas Críticas de Segurança

| Falha Identificada | Gravidade | Diagnóstico Anterior | Solução Implementada |
|---|---|---|---|
| **A. Auto-escalação de cargo** | 🔴 Crítica | Usuário enviava `{ role: 'professor' }` livremente. | Regra exige `codigo_convite` conferido contra banco seguro ou conta prévia em `/admins`. |
| **B. E-mail de admin hardcoded** | 🔴 Crítica | `request.auth.token.email == 'admin@escola.com'` no código das regras. | Removido. Autenticação de admin baseia-se em `exists(/admins/$(request.auth.uid))`. |
| **C. Poluição de Auditoria** | 🟡 Alta | Aluno podia criar registros em `/auditoria`. | Restringido a `isProfessor()` com matching de `request.auth.uid`. |
| **D. Condição de Corrida (Estoque)** | 🔴 Crítica | Dois alunos emprestando o último exemplar simultaneamente. | Implementado `runTransaction()` atômico que lê, bloqueia, valida `disponiveis > 0`, decrementa e salva o empréstimo. |
| **H. Chave Mestra Pública** | 🔴 Crítica | `codigo_mestre_professor` estava em `/configuracoes/geral` (leitura pública sem login). | Segredo movido para coleção protegida `/admins_config/geral`, inacessível a clientes públicos. |
| **I. Dessincronia de IDs de Leitores** | 🟡 Média | `leitor_id` não correspondia ao `uid` do Firebase Auth em leitores cadastrados pelo professor. | Adicionado campo de espelhamento relacional `usuario_id` em `/emprestimos` e indexação segura no `subscribeEmprestimos()`. |

---

## 5. Vetores de Ataque e Testes de Penetração ("Dirty Dozen")

Todos os seguintes vetores foram testados e resultam em **`PERMISSION_DENIED`**:

1. **Empréstimo Não Autenticado:** Requisição anônima tentando criar documento em `/emprestimos`.
2. **Auto-Baixa de Empréstimo por Aluno:** Aluno tentando enviar `PATCH` com `devolvido_em` em `/emprestimos/{id}`.
3. **Scraping em Massa de Dados de Menores:** Requisição anônima executando `GET /leitores`.
4. **Auto-Elevação para Professor:** Criação de usuário com `role: 'professor'` sem convite válido.
5. **Mutação de Papel Pós-Cadastro:** Aluno enviando `PATCH /users/{uid}` tentando alterar `role: 'professor'`.
6. **Destruição de Trilha de Auditoria:** Chamada `DELETE /auditoria/{logId}` feita por qualquer usuário.
7. **Injeção de Log Falso:** Usuário comum tentando simular ações administrativas em `/auditoria`.
8. **Denial of Wallet via Resenhas:** Payload com comentário de 100.000 caracteres rejeitado pela restrição `size() <= 1000`.
9. **Nota Fora de Faixa:** Envio de comentário com `nota: 10` ou `nota: -1` rejeitado pela restrição `nota in [1, 2, 3, 4, 5]`.
10. **Exclusão de Livros por Visitante:** Tentativa anônima de `DELETE /livros/{id}`.
11. **Injeção de Campos Fantasma (*Shadow Fields*):** Envio de propriedades adicionais não mapeadas barrado por `.hasOnly()`.
12. **Estoque Negativo:** Atualização direta de exemplar com `disponiveis: -1` barrada por `disponiveis >= 0`.

---

## 6. Conformidade com a LGPD (Lei Geral de Proteção de Dados)

1. **Minimização de Dados:** Apenas nome, e-mail e identificador escolar (matrícula/turma) são coletados. Telefones e endereços são opcionais.
2. **Anonimização e Exclusão:** O sistema possui rotinas para expurgo e anonimização de leitores inativos com empréstimos já encerrados.
3. **Logs de Acesso:** Toda alteração cadastral ou movimentação de acervo gera registro indelével em `/auditoria`.
4. **Isolamento de Contas:** Nenhum estudante tem visibilidade sobre a lista de leitura ou situação de empréstimos de outro estudante.
