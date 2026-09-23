# Security Specification — LibreOteca (Firestore Fortress Model)

## 1. Architecture & Entity Boundaries
- **Contas de Acesso (`/users`)**: Entidades de autenticação digital no sistema (Google / Firebase Auth). Possuem papéis RBAC `aluno` e `professor`.
- **Patronos da Biblioteca (`/leitores`)**: Entidades cadastrais físicas de frequentadores da biblioteca sujeitas à LGPD (`aluno`, `professor`, `comunidade`, `funcionario`). Leitores físicos não são a mesma entidade que contas de login, garantindo desacoplamento entre cadastro de biblioteca e credenciais de acesso.
- **Super Administradores (`/admins`)**: Privilégios elevados controlados exclusivamente por documentos na coleção `/admins/{uid}`, sem e-mails pessoais ou segredos hardcoded nas regras de segurança.

## 2. Data Invariants & Zero-Trust Policies
- **Invariant 1 (Catch-All Deny)**: Any unmatched path or unauthorized action is denied by default (`match /{document=**} { allow read, write: if false; }`).
- **Invariant 2 (LGPD PII Isolation)**: Personal Identifiable Information in `/leitores` (phone, email, registration) and `/emprestimos` can never be read publicly. Only authenticated staff (`isProfessor()`) or the verified record owner can read their own data.
- **Invariant 3 (Circulation Integrity)**: Readers/Students can NEVER create, alter, or delete loans (`/emprestimos`) or reader records (`/leitores`). Only library staff (`isProfessor()`) can perform these mutations. Atomic decrement/increment of book stock is enforced via transactional writes (`runTransaction`).
- **Invariant 4 (Role Escalation Prevention)**: Users registering in `/users/{userId}` can only register as `aluno` by default. Assigning `professor` requires providing a valid `codigo_convite` matching the institutional `codigo_mestre_professor` in `/configuracoes/geral` or being verified via `/admins`. Self-updates cannot mutate `role`.
- **Invariant 5 (Immutable Audit Logs Restraint)**: Documents in `/auditoria` can only be created by verified staff (`isProfessor()`) recording their own actions (`usuario_id == request.auth.uid`). Normal students cannot create, tamper with, or pollute the audit trail. Once created, updates and deletions are strictly forbidden (`allow update, delete: if false;`).
- **Invariant 6 (Catalog Protection)**: Books in `/livros` can be publicly read for search and kiosk usage, but only authenticated staff (`isProfessor()`) can create, edit, or delete titles.
- **Invariant 7 (Moderated Social Interaction)**: Reviews in `/comentarios` must have ratings strictly between 1 and 5, max 1000 characters, author ID matching `request.auth.uid`, and only approved reviews (`status == 'aprovado'`) are publicly readable. Non-professors query using explicit `where('status', '==', 'aprovado')` filters.
- **Invariant 8 (Strict Key Enforcement)**: All writes must conform to strict key whitelisting using `.keys().hasOnly(...)` and type bounds on every field to prevent shadow fields and resource exhaustion.

---

## 3. The "Dirty Dozen" Payloads (Penetration Test Vectors)

### Payload 1: Unauthenticated Loan Creation (Bypass Attempt)
- **Target**: `POST /emprestimos/emp_malicious_1`
- **Auth**: `null` (Unauthenticated)
- **Payload**: `{"livro_id": "b1", "leitor_id": "lei_1", "emprestado_em": "2026-03-01", "devolucao_prevista": "2026-03-15", "renovacoes": 0}`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 2: Reader Self-Approval of Return
- **Target**: `PATCH /emprestimos/emp_valid_1`
- **Auth**: `uid: "student_user_123" (role: "aluno")`
- **Payload**: `{"devolvido_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Only staff can update loans)

### Payload 3: Public PII Scraping of Readers Directory
- **Target**: `GET /leitores`
- **Auth**: `null` (Unauthenticated) or `uid: "student_user_123"`
- **Expected Outcome**: `PERMISSION_DENIED` (LGPD protection prevents bulk scraping of students/readers)

### Payload 4: Self-Assigned Professor Privilege Escalation (Missing or Invalid Invite Code)
- **Target**: `POST /users/attacker_uid`
- **Auth**: `uid: "attacker_uid"`
- **Payload**: `{"id": "attacker_uid", "nome": "Hacker", "email": "hacker@domain.com", "role": "professor", "criado_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Cannot self-assign `professor` role without matching institutional `codigo_mestre_professor`)

### Payload 5: Role Mutation on Existing User Profile
- **Target**: `PATCH /users/student_uid`
- **Auth**: `uid: "student_uid"`
- **Payload**: `{"role": "professor"}`
- **Expected Outcome**: `PERMISSION_DENIED` (User cannot alter `role` field on update)

### Payload 6: Audit Log Deletion / Tampering
- **Target**: `DELETE /auditoria/aud_entry_999`
- **Auth**: `uid: "professor_uid"`
- **Expected Outcome**: `PERMISSION_DENIED` (Audit logs are strictly write-once, delete-forbidden)

### Payload 7: Student Pollution / Forgery of Audit Log
- **Target**: `POST /auditoria/aud_student_inject`
- **Auth**: `uid: "student_uid" (role: "aluno")`
- **Payload**: `{"id": "aud_student_inject", "usuario_id": "student_uid", "usuario_nome": "Aluno", "acao": "FALSIFICACAO", "tabela_afetada": "configuracoes", "detalhes": "x", "criado_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Audit write access restricted strictly to verified staff `isProfessor()`)

### Payload 8: Resource Exhaustion / Denial of Wallet (1MB Payload in Review)
- **Target**: `POST /comentarios/com_flood`
- **Auth**: `uid: "student_uid"`
- **Payload**: `{"id": "com_flood", "livro_id": "b1", "leitor_id": "student_uid", "autor_nome": "A", "autor_tipo": "aluno", "nota": 5, "texto": "A".repeat(100000), "status": "aprovado", "criado_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (String size exceeds 1000 limit)

### Payload 9: Invalid Review Rating Out of Bounds
- **Target**: `POST /comentarios/com_bad_rating`
- **Auth**: `uid: "student_uid"`
- **Payload**: `{"id": "com_bad_rating", "livro_id": "b1", "leitor_id": "student_uid", "autor_nome": "A", "autor_tipo": "aluno", "nota": 10, "texto": "Bom", "status": "aprovado", "criado_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Rating must be an integer between 1 and 5)

### Payload 10: Unauthorized Book Deletion by Anonymous Visitor
- **Target**: `DELETE /livros/b1111111-1111-4111-8111-111111111111`
- **Auth**: `null`
- **Expected Outcome**: `PERMISSION_DENIED` (Only staff can delete catalog items)

### Payload 11: Shadow Field Injection in Book Document
- **Target**: `POST /livros/book_shadow`
- **Auth**: `uid: "professor_uid"`
- **Payload**: `{"id": "book_shadow", "codigo_interno": "LO-9999", "titulo": "Book", "autor": "Author", "categoria": "Geral", "total_exemplares": 1, "disponiveis": 1, "criado_em": "2026-03-01", "shadowAdminToken": "secret"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Strict key check rejects unknown keys)

### Payload 12: Negative Book Stock State Injection
- **Target**: `POST /livros/book_negative`
- **Auth**: `uid: "professor_uid"`
- **Payload**: `{"id": "book_negative", "codigo_interno": "LO-8888", "titulo": "Book", "autor": "Author", "categoria": "Geral", "total_exemplares": 5, "disponiveis": -2, "criado_em": "2026-03-01"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Availability constraint `disponiveis >= 0`)

---

## 4. Test Runner Specification
Tests verify rule evaluation against Firestore emulator or rules unit testing suite (`@firebase/rules-unit-testing`). Every operation above MUST resolve to rejection (`assertFails`).
