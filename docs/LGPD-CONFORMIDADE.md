# Conformidade LGPD — FHT-SITE

> ⚠️ **Isto é orientação TÉCNICA de conformidade, escrita pra guiar decisões de arquitetura e código — NÃO é parecer jurídico.**
> Antes de colocar o sistema no ar de verdade (e antes de publicar a Política de Privacidade), **valide o texto e o mapeamento de bases legais com um advogado** especializado em proteção de dados. Este documento resume a Lei nº 13.709/2018 (LGPD) e as normas da ANPD aplicáveis, mas a responsabilização (art. 6, X) é da federação — não dá pra terceirizar a decisão final pro dev.
>
> Base normativa: **LGPD (Lei 13.709/2018)** + regulamentos da **ANPD**. Última revisão desta pesquisa: jul/2026. Ver [[CLAUDE.md]], [[MODULO-ADMINS-PERMISSOES.md]].

---

## 0. Resumo executivo — os 6 pontos mais críticos

1. **🔴 CRIANÇAS E ADOLESCENTES SÃO O PONTO Nº 1 (art. 14).** As categorias MINI/MIRIM/INFANTIL/INFANTO (Sub-12 a Sub-18) são **menores de idade**. O tratamento dos dados deles tem que ser feito **sempre em seu melhor interesse** e, quando a base for consentimento, exige **consentimento específico e em destaque dado por PELO MENOS UM DOS PAIS ou pelo responsável legal** — não é o atleta menor que consente. O `AtletaForm` **hoje não coleta nada de responsável nem consentimento** → é a maior lacuna de conformidade do sistema.

2. **A base legal NÃO é "consentimento pra tudo".** Pra maioria do cadastro (atleta adulto e clube), a base mais adequada é **execução de contrato / relação associativa (art. 7, V)** + **obrigação regulatória (art. 7, II)**, não consentimento. Consentimento fica reservado pro que é realmente opcional: **publicar foto/nome no site e na galeria**. Misturar tudo em "consentimento" é um erro comum e frágil (consentimento pode ser revogado a qualquer momento — art. 8, §5).

3. **Minimização entre público e privado.** O site público exibe clubes, atletas (parcialmente), galeria de fotos. Publicar **nome completo + foto + data de nascimento + clube de uma criança** é exposição desnecessária e arriscada. O que é público tem que ser o mínimo, e **foto/nome de menor só com consentimento do responsável pra essa finalidade específica**.

4. **Controle de acesso e log de auditoria.** Tem nível **DEV/DONO com acesso irrestrito a TUDO de todos** (inclusive nome/e-mail de outros admins) pra dar suporte. Isso é aceitável **se** houver finalidade definida (suporte), **minimização** e, principalmente, **log de auditoria de quem acessou/alterou o quê** (art. 6, VI e X; art. 37). "God mode" sem rastro é problema.

5. **Documentos sensíveis no R2.** RG digitalizado, comprovante de residência, comprovante Pix e foto vão pro Cloudflare R2. O bucket tem que ser **privado** (sem ACL pública), com **URLs assinadas de curta duração** e criptografia. Um bucket público com RG de criança dentro é incidente grave esperando pra acontecer.

6. **Obrigações organizacionais que dependem da federação, não do código:** indicar **Encarregado (DPO)** e publicar canal de contato, publicar **Política de Privacidade**, manter **registro das operações de tratamento** (art. 37) e ter **plano de resposta a incidentes** (comunicar à ANPD em **3 dias úteis** — Resolução CD/ANPD nº 15/2024). Como se tratam dados de menores, esses itens deixam de ser "nice to have".

> A FHT provavelmente se enquadra como **Agente de Tratamento de Pequeno Porte (ATPP)** — associação sem fins lucrativos (Resolução CD/ANPD nº 2/2022), o que dá algumas flexibilizações. **MAS** tratar dados de crianças/adolescentes é um "critério específico" de alto risco: se o tratamento também for considerado de larga escala, a FHT **perde** as flexibilizações. Ver §7.

---

## 1. Bases legais aplicáveis (arts. 7 e 11)

A LGPD exige que **toda** operação de tratamento se apoie em pelo menos uma das **bases legais** do art. 7 (dados pessoais comuns) ou do art. 11 (dados sensíveis). A regra de ouro: **mapeie CADA finalidade a UMA base**, não jogue tudo em "consentimento".

### 1.1 As 10 bases do art. 7 (dados comuns) — as que interessam aqui

| Base (art. 7) | Aplica no sistema? | Uso típico na FHT |
|---|---|---|
| **I — Consentimento** | Sim, mas **restrito** | Publicar foto/nome no site e na galeria; comunicações não essenciais (newsletter). Menor: consentimento é do **responsável** (art. 14, §1). |
| **II — Obrigação legal/regulatória** | Sim | Regras da federação/confederação de handebol, obrigações fiscais (guardar comprovante de pagamento), Estatuto do Torcedor etc. |
| **V — Execução de contrato / procedimentos preliminares a pedido do titular** | **Sim — base principal** | Filiação do atleta e do clube, inscrição em competições, gestão da relação associativa. É o "coração" do cadastro. |
| **VI — Exercício regular de direitos** | Eventual | Defesa em processo (ex.: recurso desportivo, disputa de transferência). |
| **VII — Proteção da vida / incolumidade física** | Eventual | Dado de emergência no dia do jogo (contato de responsável). |
| **IX — Legítimo interesse** | Sim, com cautela | Gestão esportiva interna, prevenção a fraude no cadastro, estatísticas. **Exige LIA** (teste de legítimo interesse documentado) e **não vale pra dado sensível**. Pra menor, ver §2. |

> **Recomendação prática:** o cadastro de atleta e de clube deve rodar principalmente sobre **art. 7, V (contrato/relação associativa)** + **art. 7, II (obrigação regulatória)**. Reserve **consentimento (art. 7, I)** só pro que é genuinamente opcional (imagem pública, galeria, comunicações de marketing). Assim, se o titular revoga o consentimento da foto, você tira a foto do site — mas não perde o direito de manter o cadastro esportivo, porque ele se sustenta em outra base.

### 1.2 Dados sensíveis (art. 11) — o que é e o que NÃO é

**Dado pessoal sensível** (art. 5, II) é uma categoria fechada: origem racial/étnica, convicção religiosa, opinião política, filiação sindical, dado referente à saúde ou à vida sexual, **dado genético ou biométrico**.

No cadastro da FHT:

- **CPF, RG, endereço, telefone, e-mail, data de nascimento → são dados pessoais COMUNS, NÃO sensíveis.** São muito usados pra fraude/identificação, então merecem cuidado, mas **não** entram no regime mais rígido do art. 11. (Erro comum: achar que CPF é "sensível". Não é — é dado pessoal comum, porém de alto valor.)
- **Foto 3x4 → dado pessoal COMUM, enquanto for usada só pra identificação visual** (crachá, carteirinha, ficha). ⚠️ **Vira dado biométrico SENSÍVEL (art. 11) no momento em que for submetida a processamento técnico de reconhecimento facial** que permita identificação única. Isso é **diretamente relevante pro futuro módulo de check-in**: se o check-in do dia do jogo usar reconhecimento facial pra confirmar o atleta, aí sim vira tratamento de dado sensível, exige **consentimento específico e destacado** (do responsável, se menor) e **não pode** se apoiar em legítimo interesse. Se o check-in for por CPF/QR code/lista, continua sendo dado comum. **Recomendação: no check-in, prefira CPF/QR a reconhecimento facial** — evita puxar o tratamento pro regime sensível. → ✅ **CONFIRMADO pelo Gustavo (jul/2026): o check-in NÃO usa facial** — a foto aparece só pra **conferência visual humana** no dia (o fiscal olha a foto e compara com a pessoa presente). Logo a foto continua **dado comum** e o check-in fica fora do art. 11.
- **Sexo (M/F)** informado no cadastro é dado comum (categoria esportiva). Não confundir com dado sobre vida sexual.

### 1.3 Clubes

CNPJ do clube **não é dado pessoal** (é pessoa jurídica). **Mas** os dados do **representante legal** (nome, e-mail, telefone) **são dados pessoais** e caem na LGPD normalmente — base: **art. 7, V (contrato)** + **II (obrigação regulatória)**. Documentos do clube (ata, estatuto) podem conter dados pessoais de dirigentes → tratar como confidenciais no R2.

---

## 2. ⚠️ Menores de idade (art. 14) — a seção mais importante

As categorias de base da FHT são **crianças (até 12 anos incompletos) e adolescentes (12 a 18)**, nos termos do ECA. O art. 14 da LGPD dá a eles tratamento especial. **Leia esta seção com atenção — é aqui que o sistema mais precisa mudar.**

### 2.1 O que a lei exige (texto do art. 14, confirmado no Planalto)

- **Caput:** "O tratamento de dados pessoais de crianças e de adolescentes deverá ser realizado em seu **melhor interesse**." → é o princípio que rege tudo. Toda decisão de tratamento (o que coletar, o que publicar, por quanto tempo guardar) tem que passar pelo filtro "isso é do melhor interesse da criança?".
- **§1º — consentimento:** o tratamento de dados de **crianças** deve ser feito com **consentimento específico e em destaque, dado por PELO MENOS UM DOS PAIS ou pelo responsável legal.** Ou seja: quem consente **não é o atleta menor**, é o responsável.
- **§2º — transparência:** o controlador deve **tornar pública** a informação sobre os tipos de dados coletados, a forma de utilização e os procedimentos para exercício dos direitos do art. 18.
- **§3º — coleta mínima sem consentimento:** só é permitido coletar dado de criança **sem** o consentimento do §1 quando for **necessário para contatar os pais/responsável**, usado **uma única vez, sem armazenamento**, ou pra **proteção da criança** — e **nunca** repassado a terceiro.
- **§4º — não condicionar:** **não se pode condicionar** a participação em jogo/aplicação/atividade ao fornecimento de dados pessoais **além do estritamente necessário** (reforça a minimização).
- **§5º — verificação:** o controlador deve fazer **"todos os esforços razoáveis para verificar que o consentimento foi dado pelo responsável"**, considerando as tecnologias disponíveis.
- **§6º — linguagem:** informações sobre o tratamento devem ser em **linguagem simples, clara e acessível**, adequada ao entendimento da criança (recursos audiovisuais quando apropriado).

### 2.2 Nuance importante da ANPD: consentimento NÃO é a única base pra menor

O **Enunciado CD/ANPD nº 1, de 22/05/2023** uniformizou o entendimento: **o consentimento do §1 NÃO é a única base legal** para tratar dados de crianças e adolescentes. O tratamento pode se apoiar em **qualquer das hipóteses dos arts. 7 e 11** (ex.: execução de contrato, obrigação legal, proteção da vida, legítimo interesse), **desde que o MELHOR INTERESSE do menor seja preponderante**, avaliado no caso concreto.

**Tradução prática pra FHT:** a filiação esportiva de um atleta menor pode se sustentar em **execução de contrato/relação associativa (art. 7, V)** — assim como a de um adulto — **sem** depender exclusivamente de consentimento revogável. **PORÉM:**

- A relação contratual de um menor é firmada/autorizada pelo **responsável legal** (Código Civil) → na prática você **ainda precisa da anuência do responsável** pra inscrever o menor, mesmo que a base LGPD seja "contrato".
- Pra tudo que é **opcional e expõe o menor** (publicar foto/nome no site, na galeria, em notícias), a base é **consentimento específico e destacado do responsável** (art. 14, §1) — e aí é revogável.
- O **melhor interesse** funciona como trava: mesmo tendo base legal, se publicar a foto da criança não for do interesse dela, **não publique**.

> ⚠️ **Não afirmo com certeza qual enquadramento seu advogado vai preferir** (contrato vs. consentimento como base primária pro cadastro do menor). Ambos têm defensores. O que é **inegociável**: (a) anuência/consentimento do responsável no fluxo, (b) melhor interesse, (c) minimização, (d) transparência. Leve os dois cenários pro jurídico decidir.

### 2.3 O que isso muda no fluxo de cadastro de atleta (o que codar)

O `AtletaForm` atual (`backend/.../dto/atleta/AtletaForm.java`) coleta nome, nascimento, CPF, RG, endereço, contato, foto e documentos — **mas não tem NADA de responsável nem de consentimento**. Precisa:

1. **Detectar menoridade pela `dataNascimento`.** Se `idade < 18` na data do cadastro → ativar o fluxo de responsável. (Cuidado: a maioridade pode mudar durante a vida do cadastro — reavaliar.)
2. **Coletar dados do responsável legal** (novos campos): `responsavelNome`, `responsavelCpf`, `responsavelParentesco` (mãe/pai/tutor), `responsavelEmail`, `responsavelTelefone`.
3. **Registrar o consentimento do responsável de forma comprovável** — criar uma tabela `consentimento` (via migration Flyway — próxima livre é a **`V6`**, porque a `V5` já foi usada nesta sessão pra `representante_cargo`) com no mínimo:
   - `id`, `atleta_id` (ou `titular_id`), `responsavel_cpf`, `finalidade` (ex.: `CADASTRO_ATLETA`, `IMAGEM_PUBLICA`, `GALERIA`), `texto_versao` (qual versão do termo foi aceita), `concedido_em` (timestamp), `ip_origem`, `user_agent`, `revogado_em` (nullable).
   - Um consentimento **por finalidade** — não um "aceito tudo" genérico (art. 14, §1 pede "específico e em destaque").
4. **Termo de consentimento destacado**, não um checkbox escondido no meio de um textão. Ideal: um passo próprio no formulário, com o texto do que será tratado e publicado, e aceite explícito do responsável.
5. **"Esforços razoáveis" de verificação (§5).** Não precisa de solução cara. Opções razoáveis pro porte da FHT: confirmação por e-mail do responsável (double opt-in), coleta do CPF do responsável, e — no ato presencial de filiação no clube — assinatura física/digital de um termo. Documente qual método foi usado.
6. **Minimização (§4).** Não peça da criança dado que não é necessário pra atividade esportiva. Reveja se todos os campos são mesmo necessários pra um Sub-12.
7. **Linguagem acessível (§6).** O aviso de privacidade voltado ao atleta menor deve ser simples.

### 2.4 O que NÃO pode

- ❌ Publicar foto/nome/dados de criança **sem** consentimento do responsável pra aquela finalidade.
- ❌ Condicionar a inscrição no handebol à entrega de dados além do necessário (art. 14, §4).
- ❌ Repassar dado de menor a terceiro fora das hipóteses legais (art. 14, §3).
- ❌ Tratar o consentimento do próprio atleta menor como válido — quem consente é o responsável.
- ❌ Usar reconhecimento facial de menor no check-in sem consentimento específico do responsável (viraria dado biométrico sensível — art. 11 + art. 14).

---

## 3. Direitos dos titulares (art. 18) e como o sistema atende

O titular (ou o responsável, no caso de menor) pode exercer, **a qualquer momento e gratuitamente**, os direitos do art. 18. O sistema precisa oferecer meios concretos de exercer cada um:

| Direito (art. 18) | O que significa | Como o sistema atende (telas/endpoints) |
|---|---|---|
| **I — Confirmação** | "Vocês tratam dados meus?" | Endpoint/tela "Meus dados" na área logada; canal do Encarregado pra quem não tem login. |
| **II — Acesso** | Ver todos os dados tratados | Tela "Meus dados" (atleta/clube vê o próprio cadastro). Responsável acessa os do menor. |
| **III — Correção** | Corrigir dado errado/desatualizado | Edição do próprio cadastro; ou solicitação ao admin. Já existe fluxo de edição — garantir que o titular consiga pedir. |
| **IV — Anonimização / bloqueio / eliminação** | Apagar/anonimizar dado desnecessário, excessivo ou tratado em desconformidade | Endpoint `DELETE`/`anonimizar` que **não faz DELETE físico cru** — ver §5 sobre retenção fiscal. Anonimizar = descaracterizar mantendo histórico esportivo agregado. |
| **V — Portabilidade** | Levar os dados a outro serviço | Exportação estruturada (JSON/CSV) do cadastro — endpoint "Exportar meus dados". |
| **VI — Eliminação de dados tratados com consentimento** | Apagar o que foi coletado só com base em consentimento | Ao revogar consentimento da foto → remover foto do site/galeria e do storage. |
| **VII — Info sobre compartilhamento** | Com quem os dados foram compartilhados | Documentar (ex.: confederação, ANPD, operadores como Cloudflare/hospedagem) e informar quando pedido. |
| **VIII — Info sobre não consentir** | Consequências de negar consentimento | Deixar claro no termo o que acontece se não autorizar a imagem (ex.: "seu cadastro continua, mas você não aparece na galeria"). |
| **IX — Revogação do consentimento** | Voltar atrás no consentimento | Tela "Minhas autorizações" com toggle por finalidade; grava `revogado_em` na tabela de consentimento e dispara a remoção correspondente. |

**Endpoints sugeridos (novo `TitularResource` ou dentro do Atleta/Clube):**
- `GET /api/me/dados` → acesso/confirmação (art. 18, I e II)
- `GET /api/me/exportar` → portabilidade (art. 18, V), retorna JSON estruturado
- `PATCH /api/me/dados` → correção (art. 18, III)
- `POST /api/me/consentimentos/{finalidade}/revogar` → revogação (art. 18, IX + VI)
- `POST /api/me/exclusao` → solicitação de eliminação/anonimização (art. 18, IV), com fluxo que respeita retenção legal
- Todos autenticados; pra menor, acessível pelo responsável. Prazo de resposta: em regra imediato pra confirmação simplificada; ANPD admite prazos — como ATPP a FHT tem **prazo em dobro** (Resolução 2/2022).

---

## 4. Princípios do art. 6 (checklist mental pra cada decisão)

Toda funcionalidade que mexe com dado pessoal deve respeitar os **10 princípios**. Use como checklist ao projetar telas/endpoints:

1. **Finalidade** — propósitos legítimos, específicos e informados; nada de "porque pode ser útil depois".
2. **Adequação** — o tratamento tem que ser compatível com a finalidade informada.
3. **Necessidade / minimização** — só o mínimo de dados necessário. (Revisar os campos do `AtletaForm`, principalmente pra menores — art. 14, §4.)
4. **Livre acesso** — o titular consulta seus dados facilmente (§3).
5. **Qualidade dos dados** — exatidão e atualização (fluxo de correção).
6. **Transparência** — Política de Privacidade clara + aviso no cadastro.
7. **Segurança** — medidas técnicas e administrativas (art. 46, ver §5).
8. **Prevenção** — prevenir danos (bucket privado, controle de acesso).
9. **Não discriminação** — não usar dados pra discriminar.
10. **Responsabilização e prestação de contas** — **conseguir DEMONSTRAR** conformidade (logs, registro de operações, RIPD). É o princípio que transforma tudo isso em obrigação de ter evidência, não só de "fazer certo".

---

## 5. Checklist de implementação TÉCNICA (o que codar)

### 5.1 Consentimento e menores
- [ ] Tabela `consentimento` (migration `V6` — a `V5` já existe) com finalidade, versão do texto, timestamp, IP/user-agent, `revogado_em`. Um registro **por finalidade**.
- [ ] Campos de **responsável legal** no `AtletaForm` + entidade `Atleta`, ativados quando `dataNascimento` indica menor de 18.
- [ ] Passo de **termo de consentimento destacado** no formulário (não checkbox escondido).
- [ ] **Verificação do responsável** (§5): double opt-in por e-mail e/ou CPF do responsável; registrar o método.
- [ ] Bloquear no back a inscrição de menor sem os dados/consentimento do responsável (validação server-side, não só no front).

### 5.2 Política de Privacidade, avisos e cookies
- [ ] Página **Política de Privacidade** (rota `/privacidade`) + link no `Footer` e no formulário de cadastro.
- [ ] **Aviso de privacidade** curto no ato do cadastro (o que é coletado, base legal, finalidade, contato do Encarregado).
- [ ] **CookieBanner** (`frontend/src/components/CookieBanner.tsx`) já existe — hoje só grava `fht_cookies=accepted` no localStorage e diz "protegidos pela LGPD". Melhorar:
  - Se o site usa **só cookies essenciais** (é o caso hoje: só um `localStorage` de aceite), o banner pode ser **informativo** — mas deve **linkar a Política de Privacidade**.
  - ⚠️ **Se um dia entrar analytics/pixel/marketing**, o banner precisa virar **consentimento granular** (aceitar/recusar por categoria), com opção de recusar tão fácil quanto aceitar. Não ligar analytics antes disso.

### 5.3 Minimização público × privado
- [ ] Definir **explicitamente** quais campos são públicos (site/galeria) e quais são internos. Default: **quase tudo é privado**.
- [ ] **Menores:** não expor publicamente nome completo + foto + nascimento + clube junto. Se publicar, **só com consentimento do responsável** e no mínimo necessário (ex.: primeiro nome + categoria).
- [ ] Galeria de fotos: garantir consentimento de imagem pra fotos com menores identificáveis.
- [ ] Separar no back o "DTO público" do "DTO administrativo" (o público **nunca** serializa CPF, RG, endereço, documentos).

### 5.4 Controle de acesso por papel (RBAC) — ver [[MODULO-ADMINS-PERMISSOES.md]]
- [ ] Escopos por papel: `ADMIN_CLUBE` vê **só o próprio clube**; admins do comitê veem por área (financeiro, competições etc.); `ADMIN_FHT`/`DEV` mais amplo.
- [ ] **DEV/DONO com acesso irrestrito**: aceitável pra suporte, **mas** com finalidade documentada, minimização e **log obrigatório** de todo acesso a dado de terceiro. Nada de navegar em dados de filiados sem deixar rastro.
- [ ] Autorização **server-side** em todo endpoint (nunca confiar no front pra esconder dado).
- [ ] Princípio do menor privilégio: cada admin só enxerga o necessário pro cargo.

### 5.5 Log de auditoria (art. 6, VI/X e art. 37)
- [ ] Tabela `auditoria_acesso` / `auditoria_alteracao`: **quem** (usuário), **quando**, **qual registro**, **qual ação** (view/create/update/delete/export), e diff em alterações.
- [ ] **Logar principalmente:** acesso e alteração a dados de atletas/clubes por admins e pelo DEV; downloads de documentos do R2; exercício de direitos do titular.
- [ ] Logs protegidos (não editáveis por quem é auditado) e com retenção definida.

### 5.6 Segurança (art. 46) e storage
- [ ] **Bucket R2 PRIVADO** — sem ACL pública. Documentos (RG, comprovante, foto de menor) **nunca** com URL pública fixa.
- [ ] Acesso aos objetos via **URLs assinadas de curta duração** (presigned), geradas só pra quem tem permissão.
- [ ] **Criptografia**: TLS em trânsito (HTTPS obrigatório); criptografia at-rest no R2 e no PostgreSQL. Considerar cifrar em coluna os campos mais sensíveis (CPF/RG) ou ao menos restringir fortemente o acesso.
- [ ] **Senhas**: hash forte (bcrypt/argon2) — nunca texto puro. JWT já é RSA (bom); proteger a chave privada (fora do repo — usar env/secret).
- [ ] Rate limiting e proteção contra enumeração no login e nos endpoints de dados.
- [ ] Backups criptografados e testados.
- [ ] `.env`/segredos fora do git (já há `.gitignore` — conferir que chaves JWT e credenciais R2 não vazam).

### 5.7 Retenção e descarte
- [ ] Definir **prazo de retenção por tipo de dado** (ex.: cadastro ativo enquanto filiado; comprovante Pix/fiscal por prazo legal fiscal; documentos após saída → prazo definido e então descarte/anonimização).
- [ ] Rotina de **descarte/anonimização** ao fim do prazo ou na eliminação a pedido (art. 18, IV/VI).
- [ ] **Anonimizar em vez de deletar** quando houver necessidade de manter histórico esportivo/estatístico — remover a ligação com a pessoa natural.
- [ ] Cuidado: eliminação a pedido **não** apaga o que a lei obriga a guardar (art. 16) — nesses casos, bloquear/segregar em vez de apagar.

### 5.8 Endpoints de direitos do titular
- [ ] Implementar os endpoints do §3 (acesso, exportação, correção, revogação, exclusão).
- [ ] Acessíveis ao responsável no caso de menor.

---

## 6. Checklist ORGANIZACIONAL (o que a federação precisa além do código)

Isto **não é código** — é a FHT que resolve, mas o dev precisa cobrar/lembrar:

- [ ] **Indicar um Encarregado (DPO) — art. 41.** Como ATPP, a FHT pode ser **dispensada** de nomear formalmente (Resolução 2/2022), **mas mesmo dispensada tem que disponibilizar um canal de comunicação com o titular**. Dado que se tratam dados de **menores**, a recomendação forte é **nomear um Encarregado assim mesmo** (boa prática de governança reconhecida pela ANPD) e publicar o contato (ex.: `encarregado@fht.org.br` ou `dpo@fht.org.br`) na Política de Privacidade e no rodapé.
- [ ] **Publicar a Política de Privacidade** (validada por advogado) antes do lançamento.
- [ ] **Registro das operações de tratamento — art. 37.** Como ATPP, a FHT pode usar o **modelo simplificado da ANPD** (8 campos essenciais). Mapear: dados coletados, finalidades, bases legais, compartilhamentos (Cloudflare, hospedagem, confederação), medidas de segurança, prazo de retenção.
- [ ] **RIPD — Relatório de Impacto à Proteção de Dados (art. 38).** A ANPD pode exigir. Como se tratam dados de **crianças/adolescentes** (grupo vulnerável), **fazer um RIPD é boa prática forte** mesmo sem exigência formal — documenta os riscos e as salvaguardas do tratamento de menores.
- [ ] **Plano de resposta a incidentes.** Definir quem faz o quê se vazar dado. **Comunicar à ANPD e aos titulares** incidente que possa gerar risco relevante — prazo de **3 dias úteis** (Resolução CD/ANPD nº 15/2024). ⚠️ Incidente envolvendo **dados de menores** é expressamente citado como **risco relevante** → provavelmente comunicável.
- [ ] **Contratos com operadores** (Cloudflare/R2, hospedagem) com cláusulas de proteção de dados.
- [ ] **Treinar os admins/diretoria** — quem tem acesso precisa saber o básico de LGPD.

---

## 7. Regime de Pequeno Porte (ATPP) — a FHT provavelmente se enquadra, com uma pegadinha

A **Resolução CD/ANPD nº 2/2022** criou o regime de **Agentes de Tratamento de Pequeno Porte (ATPP)**, que inclui **pessoas jurídicas de direito privado, inclusive sem fins lucrativos**. Uma federação esportiva estadual (associação sem fins lucrativos) **tende a se enquadrar**.

**Flexibilizações do ATPP:**
- Dispensa de nomear Encarregado formal (mas mantém o **canal de comunicação** obrigatório).
- **Política de segurança simplificada**.
- **Registro de operações simplificado** (modelo de 8 campos da ANPD).
- **Prazos em dobro** pra atender titulares e a ANPD.

⚠️ **A pegadinha:** as flexibilizações **NÃO valem** pra ATPP que faça **tratamento de ALTO RISCO**. "Alto risco" (definição da ANPD) exige, **cumulativamente**, pelo menos **um critério geral** (tratamento em **larga escala** OU que possa **afetar significativamente interesses/direitos fundamentais**) **+ um critério específico** (ex.: **dados de crianças/adolescentes**, dados sensíveis, uso de tecnologias emergentes, vigilância).

- A FHT trata **dados de crianças/adolescentes** → **critério específico já cravado**.
- Falta saber se atinge um **critério geral**. Uma federação estadual **provavelmente não é "larga escala"** (número limitado de atletas), então **tende a manter** os benefícios de ATPP.
- **Mas isso precisa de avaliação no caso concreto** (e pode mudar se a base crescer muito). **Não afirmo com certeza** que a FHT é ou não "alto risco" — depende do volume e do jurídico.

> **Conclusão prática:** planeje o sistema com o **rigor completo pro tratamento de menores** (consentimento do responsável, RIPD, Encarregado, log) **independentemente** de a FHT poder usar o regime simplificado nos outros aspectos. As facilidades de ATPP ajudam na burocracia, mas **não** reduzem as exigências do art. 14.

---

## 8. Penalidades (art. 52) — por que levar a sério

O descumprimento sujeita a FHT às sanções da ANPD (art. 52), aplicadas segundo o **Regulamento de Dosimetria — Resolução CD/ANPD nº 4/2023**:

- **I — Advertência**, com prazo pra correção.
- **II — Multa simples**: até **2% do faturamento** da entidade no Brasil no último exercício (excluídos tributos), **limitada a R$ 50.000.000,00 (cinquenta milhões) por infração**.
- **III — Multa diária** (respeitado o mesmo teto).
- **IV — Publicização da infração** (dano reputacional — sério pra uma federação).
- **V — Bloqueio** dos dados objeto da infração até regularização.
- **VI — Eliminação** dos dados objeto da infração.
- **X — Suspensão parcial do funcionamento do banco de dados** por até 6 meses (prorrogável).
- **XI — Suspensão da atividade de tratamento**.
- **XII — Proibição parcial ou total** do exercício de atividades de tratamento.

Além da esfera administrativa, há **responsabilidade civil** (reparação de danos aos titulares, inclusive dano moral coletivo). Tratando-se de **dados de crianças**, o peso reputacional e a atenção do Ministério Público são maiores — este é o cenário que a FHT mais quer evitar.

---

## 9. Fontes consultadas

**Lei (texto oficial — Planalto):**
- **LGPD — Lei nº 13.709/2018** — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
  - Art. 5 (definições: dado pessoal, dado sensível, titular, controlador, operador, encarregado, consentimento)
  - Art. 6 (princípios, incisos I a X)
  - Art. 7 (bases legais de dados pessoais)
  - Art. 11 (bases legais de dados sensíveis)
  - **Art. 14 (crianças e adolescentes — caput e §§ 1º a 6º)** ← núcleo desta análise
  - Art. 16 (retenção obrigatória / exceções à eliminação)
  - Art. 18 (direitos do titular, incisos I a IX)
  - Art. 37 (registro das operações de tratamento)
  - Art. 38 (RIPD — relatório de impacto)
  - Art. 41 (Encarregado / DPO)
  - Art. 46 (medidas de segurança)
  - Art. 48 (comunicação de incidente à ANPD e ao titular)
  - Art. 52 (sanções administrativas)

**Normas e orientações da ANPD (gov.br/anpd):**
- **Enunciado CD/ANPD nº 1, de 22/05/2023** — tratamento de dados de crianças e adolescentes; melhor interesse; consentimento não é a única base legal. https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes
- **Resolução CD/ANPD nº 2, de 27/01/2022** — Regulamento de aplicação da LGPD para Agentes de Tratamento de Pequeno Porte (ATPP); definição, flexibilizações, exceção de alto risco. https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/regulamentacoes-da-anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022
- **Resolução CD/ANPD nº 4, de 24/02/2023** — Regulamento de Dosimetria e Aplicação de Sanções Administrativas. https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-regulamento-de-dosimetria
- **Resolução CD/ANPD nº 15, de 24/04/2024** — Regulamento de Comunicação de Incidente de Segurança (prazo de 3 dias úteis; menores/sensíveis como risco relevante). https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca
- **Guia Orientativo sobre Legítimo Interesse (ANPD)** — parâmetros do melhor interesse de crianças. https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes
- **ANPD — Comunicação de Incidente de Segurança (canal oficial).** https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis

> Nota metodológica: o texto literal dos artigos foi conferido no Planalto e em espelhos que reproduzem a lei; as normas da ANPD foram conferidas nas páginas oficiais gov.br/anpd. Onde há margem de interpretação (base legal primária do cadastro de menor; enquadramento como "alto risco"), o documento sinaliza a incerteza — **decidir com o jurídico**.

---

## 10. Ordem sugerida de ataque (pro roadmap)

1. **Consentimento + responsável no cadastro de atleta** (tabela `consentimento`, campos de responsável, termo destacado) — resolve a maior lacuna (art. 14).
2. **Bucket R2 privado + URLs assinadas** — fecha o buraco de segurança de documentos de menores.
3. **DTOs público × privado** — parar de vazar CPF/RG/endereço no que é público.
4. **Log de auditoria** — principalmente acessos do DEV/admins a dados de filiados.
5. **Endpoints de direitos do titular** (acesso, exportação, revogação, exclusão/anonimização).
6. **Política de Privacidade + Aviso + melhorar CookieBanner** (com link).
7. **Retenção/descarte** e rotina de anonimização.
8. **Organizacional:** nomear Encarregado, registro de operações (modelo ATPP), RIPD de menores, plano de incidentes.
