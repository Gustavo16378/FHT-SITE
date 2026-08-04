# Inventário de Dados Pessoais — insumo para a Política de Privacidade

> **Versão de 04/08/2026. Esta versão SUBSTITUI integralmente a de 02/08/2026** — não use a anterior.
> Nos dois dias entre uma e outra, cinco entregas mudaram o sistema (senha escolhida pelo clube,
> comissão técnica, pagamento em lote, envio de e-mail e remoção das credenciais de teste do site),
> e várias afirmações da versão antiga ficaram **falsas**. As correções estão incorporadas no corpo
> deste documento, sem deixar as duas versões convivendo.
>
> **Como este documento foi feito:** levantado DO CÓDIGO, por varredura de 6 frentes de verificação
> + conferência manual dos pontos críticos, contra o commit `c73e748` (migrations V1 a V16).
> A fonte da verdade é o **código**, nunca a documentação do projeto (`CLAUDE.md` e `docs/`, que em
> vários pontos estão desatualizados — ver §14).
>
> ⚠️ **Isto NÃO é a política de privacidade nem parecer jurídico.** É o retrato técnico do que o
> sistema faz, para que o redator escreva a política sem prometer o que o sistema não cumpre.
> A controladora dos dados é a FHT, não o desenvolvedor.
>
> **Numeração:** as seções foram renumeradas em relação à versão de 02/08, porque entraram quatro
> seções novas (vias de coleta, transferência internacional, comunicações por e-mail, e as seções
> de cookies, segurança e direitos do titular). O conteúdo das seções antigas foi preservado e
> corrigido, não refeito.
>
> **Este sistema muda toda semana.** Se a política demorar a ser publicada, revalide antes.

---

## Índice

1. Categorias de dados, por titular
2. Como os dados chegam ao sistema (vias de coleta)
3. Finalidades e bases legais
4. O que é público (visível sem login)
5. Compartilhamento com terceiros (operadores e destinatários)
6. Transferência internacional de dados (art. 33)
7. Comunicações enviadas pelo sistema (e-mails)
8. Retenção e descarte
9. Menores de idade (art. 14)
10. Cookies e armazenamento no navegador
11. Medidas de segurança — o que existe e o que não existe
12. Direitos do titular — o que o sistema executa hoje
13. O que o sistema NÃO faz (negativas verificadas)
14. ⚠️ Lacunas — o que a política NÃO pode prometer hoje
15. Cobertura: o que este inventário resolve e o que ainda falta
16. Perguntas que só a FHT responde

---

## 1. Categorias de dados, por titular

### Atleta (inclui menores de idade)

**Dados:** Nome completo (`Atleta.java:17-18`; `V3__create_atletas.sql:4`); Data de nascimento (`Atleta.java:20-21`); Sexo (`Atleta.java:23-24`); CPF, único e validado por dígito verificador (`Atleta.java:26-27`; `V3:7 UNIQUE`); Número do RG e órgão emissor (`Atleta.java:29-33`); Naturalidade — cidade e UF (`Atleta.java:35-39`); Telefone/WhatsApp e e-mail (`Atleta.java:41-45`); Endereço: CEP, logradouro, número, cidade, UF (`Atleta.java:47-60`); Posição em quadra e categoria etária (`Atleta.java:62-66`); Situação de transferência e nome do clube anterior (`Atleta.java:68-72`); Vínculo com o clube (extraído do token do representante — `AtletaServiceImpl.java:49-53`); Status da filiação e motivo de rejeição em texto livre (`Atleta.java:107-111`); Taxa de filiação: valor e ano de referência (`Atleta.java:113-123`); Datas de cadastro e de última alteração (`DefaultEntity.java:16-31`).

**⚠️ Correção importante sobre o ENDEREÇO (mudou em 02/08/2026):** o endereço do atleta **deixou de ser coletado pela interface**. A etapa de endereço saiu do formulário do clube, e o código que monta o envio traz a justificativa escrita: "Endereço do atleta = endereço do clube; não é mais coletado no cadastro" (`frontend/src/pages/ClubeDashboard.tsx:946`, e a explicação ao usuário em `:1036-1053`). Duas ressalvas que a política **não pode ignorar**: (a) as colunas continuam existindo no banco (`V3__create_atletas.sql:14-16`) e a interface de programação continua **aceitando** esses campos (`AtletaForm.java:40-53`; gravados em `AtletaServiceImpl.java:100-104`) — os endereços já gravados antes de agosto continuam lá e ninguém os apagou; (b) o **comprovante de residência continua sendo pedido como arquivo** (`ClubeDashboard.tsx:1181-1182`; `AtletaServiceImpl.java:124-126`), ou seja, o endereço de casa do atleta — inclusive de menor — continua entrando no sistema, só que dentro de um PDF ou imagem.

**Finalidade:** Filiação do atleta à federação por meio do clube, verificação de identidade e de unicidade do cadastro (impede o mesmo CPF em dois clubes), enquadramento em categoria etária e sexo para competições, controle da anuidade que habilita a competir no ano e comunicação com o filiado.

**⚠️ ATENÇÃO — coleta sem uso (ainda em aberto):** **órgão emissor do RG** e **naturalidade (cidade e UF)** continuam sendo pedidos na tela (`ClubeDashboard.tsx:941-943`) e gravados (`AtletaServiceImpl.java:95-97`), e **nunca são devolvidos por nenhuma resposta do sistema** — não constam da ficha entregue pela API (`AtletaResponseDTO.java:15-46`) e nenhuma tela os exibe.

**Base legal sugerida:** art. 7, V (execução de contrato / relação associativa de filiação esportiva) como base principal, combinado com art. 7, II (cumprimento de obrigação regulatória perante o sistema desportivo) para a manutenção do registro. Para MENORES, observar adicionalmente o art. 14 e seu §1º. **NÃO usar consentimento** como base do cadastro esportivo. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** O representante do clube ao qual o atleta está vinculado (escopo aplicado em `Escopo.java:24-42` — o clube só enxerga os próprios atletas) e a federação (ADMIN_FHT). O próprio atleta **não** tem acesso — não existe login de atleta. Todos os dez métodos de `AtletaResource.java` exigem papel (linhas 40, 67, 87, 101, 120, 135, 159, 177, 195, 213).

### Atleta — documentos digitalizados

**Dados:** RG digitalizado — único documento obrigatório no cadastro (`AtletaServiceImpl.java:78-80` e `:123`); Foto 3x4 do rosto (`AtletaServiceImpl.java:120-122`); Comprovante de residência — pode conter dados de terceiros, ex.: conta em nome dos pais (`AtletaServiceImpl.java:124-126`); Comprovante de pagamento Pix individual — **hoje é legado**: a API ainda aceita o arquivo (`AtletaForm.java:102-105`; `AtletaServiceImpl.java:127-129`, e na reanexação `:336-343`), mas a tela do clube não o oferece mais, porque o pagamento virou em lote (ver ficha própria adiante).

**Finalidade:** Comprovar identidade civil e endereço.

**⚠️ A REGRA DE APROVAÇÃO MUDOU (V16). Hoje são DOIS PORTÕES independentes** (`AtletaServiceImpl.java:367-400`):
- **PORTÃO DOCUMENTAL — inegociável.** Sem RG digitalizado a aprovação é recusada (`:374-376`). Se o atleta for menor de idade sem consentimento registrado do responsável legal, a aprovação também é recusada, citando expressamente o art. 14 (`:377-380`). **Nenhum administrador pode dispensar este portão** — o comentário no código é explícito.
- **PORTÃO FINANCEIRO — dispensável.** Deixou de ser o comprovante anexado na ficha do atleta e passou a ser a baixa confirmada de um pagamento em lote (`:387`). Este portão **pode** ser dispensado por decisão da federação, bastando o administrador marcar a dispensa; nesse caso o único rastro é uma linha no registro de execução do servidor, com o nome do atleta e o login de quem autorizou (`:388-395`).

Redação segura para a política: *a filiação do atleta só é aprovada com documento de identidade e, para menores, com autorização do responsável legal; a exigência de pagamento pode ser dispensada administrativamente.*

**Base legal sugerida:** art. 7, V e art. 7, II (o documento é meio de prova da informação declarada). DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Formalmente: representante do clube e federação. **NA PRÁTICA HOJE: qualquer pessoa que tenha a URL do arquivo.** O endereço `GET /api/files/{path}` não possui nenhuma exigência de login ou de perfil — o arquivo inteiro tem 55 linhas e não contém uma única anotação de segurança (`FileResource.java:23-54`), e o comentário no topo assume: "Público e sem auth de propósito" (`:16-22`). O único controle é o segredo da URL, que não expira, não é revogável e não verifica quem pede. Os arquivos estão hoje em disco local (volume `/app/uploads`); o Cloudflare R2 com balde privado **não** está ativo (credenciais vazias em `application.properties:63-65`, com queda silenciosa para o disco local em `R2StorageService.java:51-60`).

### Atleta — imagem

**Dados:** Foto 3x4 enviada no cadastro (não é publicada no site: o objeto público do atleta não tem foto); Fotos da galeria pública "Momentos que ficam" (`Foto.java:9-18`; `GaleriaResource.java:29-35`); Imagens de capa e do corpo das notícias; Legenda livre e obrigatória da foto, ano e categoria (ex.: 2024, Sub-16) — `FotoDTO.java:9-17`.

**Finalidade:** Divulgação institucional das atividades e competições da federação no site público.

**Base legal sugerida:** art. 7, I (consentimento) — é o único item genuinamente opcional. **RESSALVA CRÍTICA, reverificada em 04/08 e inalterada:** existe a finalidade de consentimento `IMAGEM_PUBLICA` no modelo (`Consentimento.java:20`), ela é **gravada** no cadastro (`AtletaServiceImpl.java:158-161`) e **nenhum ponto do sistema a consulta antes de publicar**. A busca por esse marcador em todo o código encontra quatro ocorrências, todas de definição, escrita ou exibição — nenhuma de leitura para decidir publicar. Marcar ou não marcar a caixa **não muda absolutamente nada** no comportamento do site. E as fotos da galeria não são vinculadas a nenhum atleta, então não há como localizar em quais fotos um menor aparece. DECISÃO FINAL DO ADVOGADO sobre como sustentar a base legal enquanto o mecanismo não existir.

**Quem acessa:** Qualquer visitante anônimo — `GET /api/galeria` e `GET /api/noticias` são públicos.

### Responsável legal do atleta menor de 18

**Dados:** Nome completo (`Atleta.java:75-76`; `V12:10`); CPF, obrigatório e validado por dígito verificador (`Atleta.java:78-79`; `V12:11`; `AtletaServiceImpl.java:189-192`); Parentesco: mãe, pai, tutor legal ou outro (`Atleta.java:81-82`; `V12:12`); E-mail e/ou telefone — pelo menos um dos dois é obrigatório (`Atleta.java:84-88`; `AtletaServiceImpl.java:197-200`). Gravados em `AtletaServiceImpl.java:110-116`.

**Finalidade:** Cumprir o art. 14, §1º: identificar quem autoriza a filiação do menor e manter canal de contato com o responsável. Os campos só são gravados quando o atleta é menor — o cadastro de adulto não grava nada disso (`AtletaServiceImpl.java:110-116`).

**⚠️ FATO NOVO E DESCONFORTÁVEL:** o e-mail do responsável é coletado, validado como contato obrigatório e gravado — **e nunca é usado como destinatário de nada**. Desde 03/08 o sistema tem serviço de e-mail funcionando e dispara mensagens em seis momentos do fluxo (§7), e **nenhuma delas vai para o responsável legal**. Ele não recebe aviso de que a criança foi cadastrada, ativada ou publicada no site. Até 03/08 isso era limitação técnica; hoje é escolha: a infraestrutura existe e não foi apontada para ele.

**⚠️ E O TERMO NÃO FALA DELE:** o único texto que o responsável supostamente aceita trata **exclusivamente dos dados do atleta** — "autorizo a FHT a tratar os dados pessoais **dele**" (`ClubeDashboard.tsx:1157-1160`). Não há uma palavra dizendo que o nome, o CPF e o contato **do próprio responsável** serão guardados, para qual finalidade, por quanto tempo, nem que o endereço de rede e o navegador do aceite ficam registrados. Ele é um titular por direito próprio que nunca foi informado disso por canal nenhum.

**Base legal sugerida:** Para os dados do MENOR: art. 14 c/c art. 7, V. Para os dados DO PRÓPRIO RESPONSÁVEL (nome, CPF, contato): art. 7, V ou art. 7, IX — **não consentimento**, porque ele nunca foi informado nem consentiu quanto aos próprios dados. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Representante do clube e federação. O responsável **não** tem acesso ao sistema — não existe login nem portal para ele.

### Responsável legal — registro de consentimento

**Dados:** Finalidade do consentimento: `CADASTRO_ATLETA_MENOR` ou `IMAGEM_PUBLICA` (`Consentimento.java:17-20`); Nome e CPF de quem consentiu (`Consentimento.java:34-38`); Marca "titular era menor" no momento do aceite; Versão do texto do termo — constante fixa `'1.0'` (`Consentimento.java:23` e `:41`); Data e hora do aceite; Endereço IP de origem e identificação do navegador (`Consentimento.java:46-50`; `OrigemRequisicao.java:13-26`; gravados em `AtletaServiceImpl.java:167-182`).

**Finalidade:** Evidência da obtenção do consentimento (art. 6, X e art. 14, §1º). Um registro por finalidade.

**Base legal sugerida:** art. 7, II c/c art. 6, X (prestação de contas — o registro é obrigação da própria LGPD). **RESSALVA CRÍTICA, inalterada:** o IP e a identificação do navegador gravados como evidência são os do **dispositivo do representante do clube** que preencheu o formulário, não os do responsável legal (`AtletaResource.java:57-59`, entregues em `AtletaServiceImpl.java:177-180`). O responsável nunca toca no sistema — juridicamente, o registro é a **declaração de um terceiro** de que houve consentimento. Não há confirmação por e-mail, link, assinatura ou dupla confirmação em nenhum ponto do código.

**Quem acessa:** Clube e federação nos painéis. IP e identificação do navegador nunca são devolvidos por nenhum endereço da API.

### Representante legal do clube (pessoa natural)

**Dados:** Nome completo (`Clube.java:23`; `V1:10`); E-mail, que também vira o login (`Clube.java:26`; `V1:11`); Telefone/WhatsApp (`Clube.java:29`; `V1:12`); Cargo no clube (`Clube.java:32`; `V5:5`); **CPF — NOVIDADE**, ver abaixo; **SENHA de acesso escolhida por ele — NOVIDADE**, ver abaixo; Ata de fundação e Estatuto social em PDF — contêm nome, CPF, RG e assinatura de fundadores e diretores, ou seja, dados pessoais de **terceiros** (`Clube.java:35-38`; enviados em `ClubeServiceImpl.java:91-98`); Status da filiação e motivo de rejeição em texto livre escrito pelo administrador (`Clube.java:41-44`); Dados de pessoa jurídica, não pessoais: CNPJ (opcional), nome, sigla, cidade, UF.

**✅ CORREÇÃO — o CPF do representante AGORA é coletado, armazenado e exibido.** A versão de 02/08 dizia que o formulário pedia o CPF e o descartava. **Isso deixou de ser verdade.** A coluna foi criada pela migration `V15__clube_credenciais_e_pessoas.sql:10`, com a justificativa escrita na própria migration ("Coletar sem armazenar nem usar viola a minimização — LGPD art. 6, III"). O formulário público envia o campo (`Registration.tsx:106`), o servidor valida o dígito verificador quando ele vem preenchido (`ClubeServiceImpl.java:69-71`) e o valor é gravado, e é devolvido pela API interna e mostrado no painel (`ClubeResponseDTO.java:20`). **A política PRECISA declarar o CPF do representante legal como dado pessoal coletado.**

**⚠️ O CPF é gravado em DOIS lugares ao mesmo tempo** — na ficha do clube (`ClubeServiceImpl.java:89`) e na ficha da pessoa representante (`:117`) — e as duas cópias podem divergir, porque corrigir a pessoa não atualiza a ficha do clube (`:346-351`) e a ficha do clube **não permite corrigir o CPF de jeito nenhum** (o campo ficou de fora dos editáveis: `ClubeUpdateForm.java:11-20`). Um CPF digitado errado no cadastro público **não pode ser corrigido por ninguém através do sistema** — nem pelo titular, nem pela federação. Só por comando direto no banco. Ver §14.

**✅ CORREÇÃO — o cargo do representante deixou de ser "coleta sem uso".** Ele passou a ser devolvido pela API e exibido no painel (`ClubeResponseDTO.java:19`) e é editável pelo próprio clube (`ClubeUpdateForm.java:20`; `ClubeServiceImpl.java:177`).

**Finalidade:** Analisar e processar a solicitação de filiação do clube, identificar quem responde legalmente pela entidade e manter contato durante a análise e depois dela. O nome e o e-mail do representante viram, **no ato da solicitação**, o nome e o login da conta de acesso ADMIN_CLUBE (`ClubeServiceImpl.java:104-111`).

**Base legal sugerida:** art. 7, V (procedimento preliminar e execução do vínculo associativo entre clube e federação) e art. 7, IX (legítimo interesse) para o contato institucional. **NÃO usar consentimento:** o único aceite do formulário público diz apenas que as informações são verdadeiras e que a pessoa está ciente das regras da FHT — não é consentimento de tratamento, não remete a política nenhuma e sequer é enviado ou armazenado. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Federação (ADMIN_FHT) e o próprio clube. **Não é exposto publicamente:** os objetos da vitrine não trazem CNPJ, documentos nem contato do representante (`ClubeVitrineDTO.java:13-21`; `ClubeVitrineDetalheDTO.java:13-22`). Os PDFs, porém, são servidos sem autenticação por `/api/files`.

### 🆕 Pessoa da comissão técnica do clube (2º representante, técnico e auxiliar)

> **Categoria de titular inteiramente nova, criada em 02/08/2026 (migration V15) e ausente da versão anterior deste inventário.**

**Dados:** Nome completo, obrigatório (`ClubePessoa.java:30-31`; `V15:22`); CPF, opcional, validado por dígito verificador quando informado (`ClubePessoa.java:33-34`; `V15:23`; `ClubeServiceImpl.java:380-382`); Função na equipe — REPRESENTANTE, TECNICO ou AUXILIAR (`ClubePessoa.java:20-25`; `V15:24-25` e `:34`); Cargo em texto livre, por exemplo "Técnico principal" (`ClubePessoa.java:39-40`); E-mail (`V15:27`); Telefone (`V15:28`); Marca de representante "principal", que identifica quem responde oficialmente pela filiação e é dono do único login do clube (`V15:29-30` e `:40`); Vínculo com o clube e datas de cadastro e alteração.

**Finalidade:** Registrar quem responde pelo clube perante a federação e quem é o técnico responsável pela equipe. Segundo a própria migration, o técnico será quem define a escalação quando o módulo de competições existir (`V15:12-18`) — hoje isso é **intenção declarada em comentário**, não existe tabela nem código de escalação. A tela chama a seção de "Comissão técnica".

**Base legal sugerida:** art. 7, V (execução do vínculo associativo — a pessoa exerce função dentro de um clube filiado) ou art. 7, IX (legítimo interesse na identificação dos responsáveis técnicos). **NÃO PODE SER CONSENTIMENTO:** não existe no sistema nenhum registro, caixa de seleção ou tela em que essas pessoas manifestem vontade; a tabela de consentimento é exclusiva de atleta, com vínculo obrigatório ao atleta (`V12:33-50`). DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** O representante do clube (que é quem digita esses dados) e a federação. Leitura e escrita exigem autenticação e escopo de clube (`ClubeResource.java:223-299`; `ClubeServiceImpl.java:399-404`). **NÃO é público** — nenhum endereço aberto devolve essas pessoas e nenhuma tela do site as exibe.

**Fatos que o redator precisa saber, sem suavização:**
1. **Quem preenche é o representante do clube**, num formulário do painel. A pessoa cadastrada **nunca toca no sistema**.
2. **Ninguém pede autorização a ela e nenhum aviso é enviado ao e-mail dela.** O serviço de e-mail só escreve para a caixa da federação e para o e-mail do representante principal (`EmailService.java:34-36`; `PagamentoServiceImpl.java:305-308`). Na prática, um técnico pode ter nome, CPF, e-mail e telefone no banco da federação **sem jamais ser informado**.
3. **Não têm login** e não terão tão cedo — a própria migration registra que "nesta etapa ninguém aqui recebe login próprio" (`V15:16-18`; repetido na documentação da API em `ClubeResource.java:244-246`). Não conseguem acessar, corrigir ou pedir exclusão dos próprios dados por meio nenhum.
4. A primeira pessoa da lista é **criada automaticamente** a partir do formulário público de filiação, copiando nome, CPF, cargo, e-mail e telefone do representante (`ClubeServiceImpl.java:114-123`). Na migração, os representantes que já existiam foram copiados para a tabela nova (`V15:43-47`).
5. **O clube pode APAGAR de verdade** um técnico ou auxiliar (`ClubeResource.java:281-283`; `ClubeServiceImpl.java:356-370`) — é um dos raríssimos mecanismos de eliminação efetiva que existem no sistema. O representante principal, porém, não pode ser removido, por regra explícita (`:365-368`).
6. **Nada impede que um técnico ou auxiliar seja menor de idade** — não há verificação de idade nessa tabela, e portanto nenhuma verificação do art. 14 se aplicaria a eles.

### Titular de conta de acesso (representante de clube e administradores da FHT)

**Dados:** Nome do titular da conta (`Usuario.java:12`); E-mail, que é o identificador único de login (`Usuario.java:15`; `V2:4 UNIQUE`); **Senha, armazenada exclusivamente como hash BCrypt** — nunca em texto puro e nunca devolvida por nenhuma resposta (`Usuario.java:18`; `ClubeServiceImpl.java:107`, `AuthResource.java:119`, `AdminResource.java:87`); Perfil de acesso (ADMIN_FHT ou ADMIN_CLUBE), vínculo com o clube e marca "ativo" (`Usuario.java:22-28`); Token de sessão guardado no navegador sob a chave `fht_token`, contendo identificador, nome completo, e-mail, papel e clube (`JwtService.java:17-31`; `AuthContext.tsx:73`).

**✅ MUDANÇA ESTRUTURAL — a senha virou dado coletado no site público.** Até 02/08, nenhuma conta nascia por iniciativa do titular, e a conta criada na aprovação recebia uma senha aleatória que nunca era exibida a ninguém — ou seja, nascia inutilizável. **Isso acabou.** Hoje:
- O endereço que recebe o formulário público de filiação **não exige autenticação nenhuma** (`ClubeResource.java:34-49`).
- O formulário pede **senha e confirmação de senha, mínimo de 8 caracteres**, numa seção intitulada "3. Acesso ao Sistema" (`Registration.tsx:40-41` e `:319-351`), e envia a senha ao servidor junto com o resto (`:107`).
- O servidor valida o tamanho (`ClubeServiceImpl.java:65-68`), confere se aquele e-mail já não está em uso (`:73-77`) e **cria a conta imediatamente**, com a senha convertida em hash, vinculada ao clube e ao perfil de administrador de clube (`:104-111`). A conta nasce **desativada**.
- **Aprovar a filiação passou a significar apenas ligar o acesso** (`ClubeServiceImpl.java:198`); rejeitar e suspender desligam (`:212` e `:229`), sempre pelo mesmo método (`definirAcesso`, `:233-236`).

**Três consequências que a política precisa refletir:**
1. **Existe autocadastro.** O titular cria a própria credencial no site público, no mesmo ato em que pede a filiação. A federação não cria a conta, apenas autoriza o uso dela. (A frase antiga "não há autocadastro" só continua valendo para as contas de **administrador da federação**, que essas sim só nascem por ação de outro administrador — `AuthResource.java:99-111`, protegido por ADMIN_FHT.)
2. **O sistema guarda nome, e-mail e hash de senha de pessoas cujo clube JAMAIS foi aceito**, sem prazo e sem nenhum endereço da API capaz de apagá-las.
3. **O formulário público responde "Este e-mail já está cadastrado no sistema"** (`ClubeServiceImpl.java:75-77`), o que permite a qualquer visitante anônimo descobrir se um determinado e-mail tem conta no sistema.

**⚠️ Efeito colateral verificado no controle de acesso (NÃO VERIFICADO em execução, mas é o que o código determina):** o bloqueio e o desbloqueio da conta são feitos procurando o usuário **pelo e-mail gravado no cadastro do clube** (`ClubeServiceImpl.java:233-236`). Mas o clube pode editar esse e-mail livremente (`ClubeUpdateForm.java:18`; `ClubeServiceImpl.java:175`) e a conta de login não é atualizada junto. Depois de uma troca de e-mail, suspender ou rejeitar o clube **não encontra mais a conta** — e o acesso continua aberto.

**Finalidade:** Autenticar o usuário, manter a sessão entre navegações e limitar cada clube aos próprios dados.

**Base legal sugerida:** art. 7, V (execução do contrato / operacionalização do acesso) e art. 7, II. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** O próprio usuário e a federação. Não existe endereço que liste usuários, nem endereço que edite ou apague uma conta em toda a API.

### 🆕 Pagamento da anuidade em lote — registro financeiro do clube

> **Categoria nova, criada em 02/08/2026 (migration V16) e ausente da versão anterior.**

**Como funciona:** o atleta não paga no cadastro; todo cadastro nasce "aguardando pagamento", sem prazo (`AtletaServiceImpl.java:131-134`). O clube cadastra quantos atletas quiser e, quando puder, usa um botão que soma os pendentes e envia **um pagamento único cobrindo vários atletas, com um comprovante só** (`PagamentoServiceImpl.java:85-152`). O lote recebe um protocolo legível, no formato `FHT-2026-A3F91C` (`:154-157`). A federação confere manualmente e dá baixa (`:202-246`). **Não há gateway de pagamento nem qualquer integração bancária** — a migration registra a decisão por escrito: "não há gateway de pagamento (sem orçamento), a conferência é manual" (`V16:1-8`).

**Dados guardados em cada lote** (`V16:10-31`; `PagamentoLote.java`): clube pagador e ano de referência; protocolo público; valor total; quantidade de atletas; **arquivo do comprovante bancário**; situação (AGUARDANDO_BAIXA / CONFIRMADO / REJEITADO); **observação em texto livre digitada pelo clube**, sem qualquer validação de conteúdo; **motivo da recusa, também em texto livre escrito pelo administrador**; data de envio, data da baixa e **a identificação do administrador que deu a baixa ou recusou**.

**O comprovante bancário é uma categoria de arquivo nova e sensível.** É o recibo de um Pix, que tipicamente traz nome do pagador, CPF parcialmente mascarado, instituição financeira, chave e data/hora da transação. O sistema **não lê, não valida, não extrai e não mascara nada disso**: recebe o arquivo como veio e o armazena em `pagamentos/{id do clube}/{referência aleatória}/{nome do arquivo}` (`PagamentoServiceImpl.java:129-131`). Ele é servido pelo **mesmo endereço de arquivos que não exige autenticação** (`FileResource.java:23-54`) e é aberto em nova aba pelo painel da federação (`FinanceiroPage.tsx:265-266`). *Alívio parcial:* diferente do caminho dos documentos de atleta, o caminho do comprovante usa uma referência aleatória, o que o torna bem menos adivinhável — mas continua sem verificar quem pede.

**Finalidade:** Comprovar o pagamento da anuidade que habilita os atletas a competir no ano, permitir a conferência manual pela federação e manter o histórico financeiro do clube.

**Base legal sugerida:** art. 7, V (execução do vínculo associativo) combinado com art. 7, II (guarda de documento de comprovação financeira). **Verificar com a federação se há prazo contábil ou fiscal mínimo aplicável** — hoje não existe prazo nenhum, nem em código nem em decisão registrada. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** A federação vê todos os lotes de todos os clubes, com comprovante e lista nominal (`PagamentoResource.java:79-91`). O clube vê apenas os próprios (`:67-77`; escopo em `PagamentoServiceImpl.java:292-299`). **Nenhum endereço público devolve qualquer dado de pagamento** — todos os endereços do módulo exigem perfil (`PagamentoResource.java:37,50,69,80,95,109,132`).

### 🆕 Atleta coberto por um pagamento — a cópia nominal que sobrevive ao cadastro

> **Este é o achado de retenção mais delicado do documento, e é uma decisão consciente de projeto, não um descuido.**

**Dados:** **Nome completo do atleta, gravado em cópia congelada** no momento do pagamento, em coluna obrigatória (`V16:43`; `PagamentoServiceImpl.java:139`); Ano e valor da anuidade paga por aquele atleta; Ligação com o cadastro do atleta, **que pode ficar vazia**; Marca de item ativo, desligada quando o pagamento é recusado, devolvendo o atleta à fila de pendentes (`V16:46-47`; `PagamentoServiceImpl.java:280-283`).

**O FATO DE RETENÇÃO:** a cópia do nome foi feita **de propósito para sobreviver à exclusão do atleta**. A ligação com o cadastro foi configurada com `ON DELETE SET NULL`, e não com exclusão em cascata, e a coluna do nome é obrigatória (`V16:36-43`). O comentário na própria migration explica a intenção: *"o comprovante é prova de pagamento e precisa continuar legível mesmo que o atleta seja removido depois (por isso o ON DELETE SET NULL, e não CASCADE — a linha fiscal não pode sumir)"*.

**O efeito prático, em português claro:** quando a federação apaga um atleta a pedido (`AtletaServiceImpl.java:447-451`), ou quando a rotina automática apaga um cadastro sem pagamento confirmado (`AtletaExpurgoJob.java:39-51`), a linha do atleta some — mas **o nome completo daquela pessoa, que pode ser uma criança, permanece indefinidamente no registro financeiro**, visível para a federação e para o clube na tela de pagamentos. Some a ligação, permanece o nome. Não há prazo, não há rotina de limpeza e não há como o sistema apagar isso.

**O contraste que a política precisa enfrentar:** quando um atleta é apagado, o registro do **consentimento** do responsável desaparece por cascata (`V12:35`), mas o **nome da criança permanece** no registro financeiro. O sistema descarta exatamente a prova que protege a federação e preserva o dado que expõe o titular.

**Finalidade:** Provar quais atletas cada pagamento cobriu — é o que a federação confere para dar baixa — e impedir que o mesmo atleta seja cobrado duas vezes no mesmo ano (`V16:54-58`).

**Quem acessa:** Federação (todos os lotes) e o clube que enviou o pagamento (apenas os seus). Não é público.

### 🆕 Terceiro pagador identificado no comprovante do Pix

**Dados:** O que quer que conste na imagem ou no PDF enviado pelo clube — tipicamente nome completo e CPF parcialmente mascarado do pagador, instituição financeira, agência ou chave Pix e data/hora da transação. O sistema não lê nem trata esse conteúdo; apenas armazena o arquivo (`PagamentoLoteForm.java:23-25`; `PagamentoServiceImpl.java:94-96` e `:129-131`).

**Finalidade:** Comprovar à federação que o Pix da anuidade foi feito.

**Base legal sugerida:** art. 7, V ou art. 7, II (o documento é meio de prova do pagamento), **com a ressalva de que o pagador pode ser uma pessoa sem relação nenhuma com a federação** — o tesoureiro do clube, o pai de um atleta, um patrocinador. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Formalmente, a federação e o clube que enviou. Na prática, **qualquer pessoa que tenha a URL do arquivo**, porque o endereço que serve os arquivos não verifica identidade (`FileResource.java:23-54`). O arquivo nunca é apagado.

**Observação para o redator:** este titular é **invisível para o sistema**. A federação não sabe quem ele é, não tem o nome dele em campo nenhum e não teria como localizá-lo se ele pedisse a exclusão dos próprios dados — a única forma seria abrir imagem por imagem.

### Árbitro — dados publicados no site

**Dados:** Nome completo (`Arbitro.java:12-13`); Foto do rosto (`ArbitroServiceImpl.java:51`); Cidade e UF (`Arbitro.java:27-30`); Nível de credenciamento: Regional, Estadual B, Estadual A, Nacional (`Arbitro.java:40-41`); Identificador do registro.

**Finalidade:** Divulgar publicamente o corpo arbitral credenciado da federação na home do site.

**Base legal sugerida:** art. 7, V (execução do credenciamento) ou art. 7, IX (legítimo interesse na transparência do corpo arbitral). **NÃO PODE SER CONSENTIMENTO:** desde ago/2026 o cadastro é feito por funcionário da FHT (`ArbitroResource.java:30`, `:49`, `:68` exigem ADMIN_FHT), o registro já nasce CREDENCIADO (`ArbitroServiceImpl.java:54-55`) e não existe nenhum campo, caixa ou tabela que capture anuência do árbitro. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Qualquer visitante anônimo — `GET /api/arbitros/publico` (`ArbitroResource.java:83-84`). São exatamente 6 campos (`ArbitroMapper.java:36-45`). Só entram na vitrine os árbitros com status CREDENCIADO (`ArbitroRepository.java:19`).

### Árbitro — dados internos

**Dados:** CPF (`Arbitro.java:15`); Data de nascimento (`:21-22`); Telefone e e-mail (`:25-26`); Número de registro na federação (`:42`); Ano de início na arbitragem e formação/cursos (`:44-47`); Status e motivo de rejeição (`:50-57`); RG, órgão emissor, sexo e RG digitalizado — aceitos pela API (`ArbitroForm.java:24-34`, `:67-69`) mas não coletados pela tela atual do painel.

**Finalidade:** Gestão interna do credenciamento arbitral. Nenhum desses campos vai para o site público. O campo "sexo" não é usado em nenhuma regra, filtro ou tela — coleta sem finalidade declarada.

**Base legal sugerida:** art. 7, V e art. 7, II. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Somente ADMIN_FHT. Exceção: o RG digitalizado, quando enviado, fica acessível por `/api/files` sem autenticação.

### Membro da diretoria da FHT

**Dados:** Nome e cargo (`Diretor.java:9-13`); Área de atuação (`:15-16`); Mandato e "na diretoria desde" (`:18`, `:24-25`); E-mail (`:20`); Telefone (`:22`); Bio / currículo em texto livre (`:27-28`); Foto (`:30-31`).

**Finalidade:** Seção institucional "Quem somos / Diretoria" e modal de currículo na home.

**Base legal sugerida:** art. 7, V / art. 7, IX (transparência institucional e exercício de cargo de representação). Não há registro de consentimento de diretor no sistema. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Qualquer visitante anônimo. **ATENÇÃO — exposição maior que a dos árbitros:** `GET /api/diretores` é público e devolve o objeto **completo**, incluindo e-mail, telefone e biografia (`DiretorResource.java:29-34`; `DiretorDTO.java:9-22`). Não existe objeto público reduzido como o dos árbitros. A migration declara que o contato é institucional (`V9:2`), mas nada no código valida isso — um celular pessoal digitado no campo vai ao ar igual.

### Funcionário / dirigente da federação (autoria e operação)

**Dados de autoria de publicação:** Nome do autor da notícia, copiado do token (`NoticiaServiceImpl.java:66`, `:155-164`); Nome de quem publicou o documento institucional (`DocumentoServiceImpl.java:44`; `DocumentoDTO.java:16`).

**🆕 Dados de operação interna — dois acréscimos novos:**

1. **Quem confere o dinheiro fica gravado no banco.** Ao dar baixa ou recusar um pagamento, o sistema grava a identificação do administrador, com data e hora (`V16:25-26`; `PagamentoServiceImpl.java:214` e `:278`). **O valor gravado é o e-mail de login do administrador** — o código usa `jwt.getName()`, e o token identifica o usuário pelo e-mail (`JwtService.java:20`, que define o e-mail como identificador principal do token). É o **único campo de autoria persistido em todo o banco de dados**. E ele **não fica só com a federação**: viaja no pacote devolvido também ao **clube**, no detalhe e no histórico de pagamentos (`PagamentoLoteDTO.java`, campo `baixadoPor`, montado em `PagamentoServiceImpl.java:310-318` e servido por `PagamentoResource.java:67-77`, acessível a ADMIN_CLUBE). Hoje a tela do clube não o exibe, mas o dado é entregue ao clube.
2. **Quem libera um atleta sem pagamento fica gravado no registro de execução.** O sistema escreve o identificador e o **nome completo do atleta**, o ano e o login de quem autorizou (`AtletaServiceImpl.java:392-394`). O próprio comentário do código admite que, na ausência de tabela de auditoria, esse registro é o único rastro da decisão.

**Finalidade:** Assinatura da matéria, rastreabilidade da publicação institucional e, no caso financeiro, "quem deu a baixa, para a federação saber a quem perguntar" (`V16:25`).

**Base legal sugerida:** art. 7, V (exercício da função) ou art. 7, IX. **Observação prática:** o método de edição de notícia não regrava o autor (`NoticiaServiceImpl.java:124-137`), então um ex-funcionário que peça a retirada do nome não consegue ser atendido pela API — só por alteração direta no banco. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Autoria de publicação: qualquer visitante anônimo. E-mail do administrador que deu baixa: a federação e **o clube**.

### Visitante do site

**Dados:** Chave `fht_cookies` no armazenamento local do navegador, com o valor `accepted` — apenas marca que o aviso foi fechado (`CookieBanner.tsx:6` e `:10`); Chave `fht_token`, só para quem faz login (`AuthContext.tsx:57,62,73,102`; `services/api.ts:20,42`); **Endereço IP e identificação do navegador transmitidos ao Google em toda visita**, pelo carregamento das fontes (`index.html:13-15`); Nome, e-mail, telefone, assunto e mensagem digitados no formulário "Fale com a FHT" — que **não são enviados a lugar nenhum** (`Contact.tsx:17-20`, reverificado em 04/08).

**Finalidade:** Não reexibir o aviso e manter a sessão de quem tem login. Nenhuma outra: não há medição de audiência, perfilamento nem publicidade.

**Base legal sugerida:** Armazenamento estritamente necessário ao funcionamento (o token de sessão), que dispensa consentimento. O Google Fonts é uma transferência a terceiro **sem opção de recusa** e não se sustenta em consentimento no formato atual do aviso. Recomendação técnica: auto-hospedar as fontes elimina o terceiro e simplifica a política. DECISÃO FINAL DO ADVOGADO.

**Quem acessa:** Ninguém na FHT — os dois itens ficam no próprio navegador do visitante. O IP das fontes vai para o Google.

---

## 2. Como os dados chegam ao sistema (vias de coleta)

> A política precisa dizer **como** os dados são obtidos, não só quais. E aqui há um fato central que
> muda a redação de tudo: **quase nenhum dado pessoal é coletado do próprio titular.**

São cinco vias:

1. **Formulário público na página inicial, sem qualquer autenticação** — filiação de clube (`Registration.tsx`; endereço `POST /api/clubes/solicitar`, `ClubeResource.java:34-49`). Coleta nome, cidade, UF, sigla e CNPJ do clube; nome, CPF, cargo, e-mail e telefone do representante; **a senha de acesso escolhida por ele**; e os PDFs de ata e estatuto, que costumam conter nome, CPF, RG e assinatura de terceiros.
2. **Painel do clube, por usuário autenticado** — cadastro de atletas (`ClubeDashboard.tsx:931-965`), cadastro da comissão técnica (`ClubeResource.java:239-259`) e envio do pagamento em lote com o comprovante (`PagamentoResource.java`).
3. **Painel da federação, por administrador autenticado** — árbitros, diretores, notícias, fotos da galeria, documentos institucionais e competições.
4. **Coleta automática, nunca declarada ao titular** — no momento em que um atleta é cadastrado, o sistema captura o **endereço IP e a identificação do navegador** de quem preencheu, e os grava como evidência do consentimento (`OrigemRequisicao.java:14-26`, invocada em `AtletaResource.java:57-59`). O código lê inclusive o cabeçalho `X-Forwarded-For` para obter o IP real por trás de proxy.
5. **Geração automática de mensagens de e-mail a partir dos dados cadastrados** (`EmailService.java`) — ver §7.

**O ponto que precisa aparecer com destaque na política:** o atleta — inclusive o menor — **nunca toca no sistema**; quem digita tudo é o representante do clube, e é do dispositivo dele que saem o IP e o navegador gravados como prova. O responsável legal também não toca: seu nome, CPF e contato são digitados por terceiro. Os membros da comissão técnica, idem. Os árbitros são cadastrados por funcionário da federação e nascem já credenciados. Os diretores são cadastrados por administrador. **Descrever o sistema como se o titular preenchesse o próprio cadastro seria uma descrição falsa do fluxo real** — e enfraqueceria justamente a evidência de consentimento do art. 14, §1º.

Quando os dados **não vêm do titular**, o dever de transparência do art. 9º é ainda mais forte, porque o titular pode nem saber que está no banco. Hoje ele não sabe: não há aviso, e-mail ou termo para o responsável legal quanto aos dados dele, nem para as pessoas da comissão técnica.

---

## 3. Finalidades e bases legais

- **FILIAÇÃO E REGISTRO DE ATLETAS** — cadastrar o atleta, verificar sua identidade, impedir cadastro duplicado do mesmo CPF em dois clubes e mantê-lo vinculado ao clube filiado. Base sugerida: art. 7, V + art. 7, II. Para menores, observar o art. 14.
- **ENQUADRAMENTO EM COMPETIÇÕES** — usar data de nascimento, sexo, categoria e posição para classificar o atleta. Base sugerida: art. 7, V. **Ressalva de fato, reverificada em 04/08:** o módulo de competições **ainda não trata dados de atleta** — não existe tabela de inscrição, escalação ou check-in, e nenhuma migration posterior (V15, V16) criou vínculo entre atleta e competição. A menção da V15 ao técnico "que define a escalação" é intenção futura em comentário (`V15:14`), não código existente.
- **CONTROLE E COMPROVAÇÃO DA ANUIDADE (reescrita — V16)** — registrar o pagamento anual que habilita o atleta a competir, receber e guardar o comprovante bancário enviado pelo clube, e registrar nominalmente quais atletas cada pagamento cobre. Base sugerida: art. 7, V + art. 7, II (guarda de documento de comprovação financeira). **A retenção desses registros sobrevive à exclusão do cadastro do atleta, por decisão de projeto** — ver §8.
- **COMPROVAÇÃO DOCUMENTAL** — armazenar RG e comprovante de residência como meio de prova das informações declaradas. Base sugerida: art. 7, V + art. 7, II.
- **FILIAÇÃO DE CLUBES** — receber e analisar a solicitação, com ata e estatuto. Base sugerida: art. 7, V (procedimento preliminar de contrato).
- **GESTÃO DE ACESSO E SEGURANÇA** — criar a credencial escolhida pelo próprio interessado, autenticar, manter sessão e limitar cada clube aos próprios dados. Base sugerida: art. 7, V + art. 7, II.
- **🆕 IDENTIFICAÇÃO DA COMISSÃO TÉCNICA DO CLUBE** — registrar quem responde tecnicamente pelo clube perante a federação (2º representante, técnico e auxiliares). Base sugerida: art. 7, V ou art. 7, IX. **Não pode ser consentimento** — não existe mecanismo de captura, e essas pessoas nunca tocam no sistema.
- **🆕 COMUNICAÇÃO OPERACIONAL POR E-MAIL** — avisar a federação de novas solicitações e de pagamentos recebidos, e avisar o representante do clube sobre o andamento da filiação e do pagamento. Base sugerida: art. 7, V (execução do vínculo) — ver §7 para o que cada mensagem carrega.
- **CREDENCIAMENTO E DIVULGAÇÃO DO CORPO ARBITRAL** — publicar nome, foto, cidade, UF e nível dos árbitros credenciados. Base sugerida: art. 7, V ou art. 7, IX. **Não pode ser consentimento.**
- **TRANSPARÊNCIA INSTITUCIONAL** — publicar diretoria (com contato e currículo), documentos institucionais e autoria das publicações. Base sugerida: art. 7, V / art. 7, IX.
- **DIVULGAÇÃO DE IMAGEM EM GALERIA E NOTÍCIAS** — único tratamento genuinamente opcional. Base sugerida: art. 7, I (consentimento), **com a ressalva grave de que o consentimento registrado hoje não é consultado por ponto nenhum do sistema antes de publicar**.
- **REGISTRO DE EVIDÊNCIA DE CONSENTIMENTO** — guardar quem consentiu, quando, de qual IP e sob qual versão do termo. Base sugerida: art. 7, II c/c art. 6, X.
- **DESCARTE DE CADASTROS SEM ANUIDADE CONFIRMADA** — apagar automaticamente atletas parados em "aguardando pagamento" há mais de 90 dias. Base sugerida: art. 15, I e art. 16. É a única rotina de retenção que existe. **Cuidado com a redação — ver §8.**
- **OBSERVAÇÃO TRANSVERSAL:** a recomendação técnica do projeto é reservar o consentimento (art. 7, I) **exclusivamente** ao que é opcional — hoje, apenas o uso de imagem. Todo o cadastro esportivo (atleta, responsável, clube, comissão técnica, árbitro, diretor) deve se apoiar em contrato/relação associativa e obrigação regulatória, porque o titular não tem como recusar sem perder a filiação, e porque em vários fluxos **não existe sequer mecanismo técnico para capturar ou revogar consentimento**.

---

## 4. O que é PÚBLICO (visível sem login)

- **ATLETAS (INCLUSIVE MENORES):** nome completo, posição em quadra e categoria etária de todo atleta ATIVO de clube marcado como visível na home — no modal do clube (`GET /api/clubes/publico/{id}`, `ClubeResource.java:74-85`, sem exigência de perfil). Sem filtro de idade e sem checagem de consentimento (`ClubeServiceImpl.java:271-291`; objeto em `AtletaVitrineDTO.java:10-14`). **É o item de maior exposição do sistema.**
- **CLUBES:** nome, sigla, cidade, UF, lista de categorias e total de atletas. O identificador do clube também trafega publicamente.
- **ÁRBITROS CREDENCIADOS:** identificador, nome completo, cidade, UF, nível de credenciamento e foto do rosto — exatamente 6 campos, só para quem está com status CREDENCIADO.
- **DIRETORIA:** o registro **completo** de cada diretor — nome, cargo, área de atuação, mandato, "na diretoria desde", e-mail, telefone, biografia/currículo e foto. É a exposição mais ampla de contato do site, porque não existe objeto público reduzido.
- **NOTÍCIAS publicadas:** título, conteúdo, imagens de capa e do corpo, e o **nome do administrador** que assinou a matéria.
- **DOCUMENTOS INSTITUCIONAIS:** o arquivo e o nome de quem publicou (esse último trafega no pacote público mesmo sem ser exibido pela tela atual).
- **GALERIA DE FOTOS:** imagem, legenda livre do evento, ano e categoria — podendo conter rostos identificáveis de atletas de categorias de base.
- **COMPETIÇÕES:** lista e detalhe públicos (sem dados de atleta vinculados — o módulo ainda não trata dados pessoais).
- **NA PRÁTICA, TODOS OS ARQUIVOS ENVIADOS AO SISTEMA:** RG digitalizado, foto 3x4, comprovante de residência e comprovante Pix legado de atletas; RG digitalizado de árbitros; ata e estatuto de clubes; **e agora também os comprovantes bancários dos pagamentos em lote**. Não são divulgados em nenhuma página, mas o endereço que os serve não exige autenticação — quem tiver a URL acessa.
- **O QUE NÃO É PÚBLICO (verificado campo a campo):** CPF, RG, data de nascimento, endereço, CEP, telefone e e-mail de atleta; todos os dados do responsável legal; registros de consentimento; CNPJ do clube e nome/e-mail/telefone/cargo/CPF do representante; **todos os dados da comissão técnica**; **todos os dados de pagamento**; CPF, RG, nascimento, telefone, e-mail, registro e formação de árbitro.
- **Filtros de visibilidade, reverificados um a um:** clubes só entram na vitrine se estiverem ATIVOS **e** marcados como visíveis (`ClubeRepository.java:22-24`; repetido em `ClubeServiceImpl.java:273`); só atletas ATIVOS entram no elenco público (`ClubeServiceImpl.java:276-279`); só árbitros CREDENCIADOS aparecem (`ArbitroRepository.java:19`); só notícias PUBLICADAS são acessíveis (`NoticiaRepository.java:17` e `:21`).

---

## 5. Compartilhamento com terceiros (operadores e destinatários)

> **Mudou desde 02/08:** o ViaCEP **saiu** da lista (não existe mais no código) e entrou o **servidor
> de e-mail**, com as duas caixas postais de destino.

| Quem | O que recebe | Observação |
|---|---|---|
| **Google (Google Fonts — fonts.googleapis.com e fonts.gstatic.com)** | Endereço IP e identificação do navegador de **todo visitante, em toda página** | **TRANSFERÊNCIA REAL E VERIFICADA** (`frontend/index.html:13-15`). Acontece **antes e independentemente** do aviso de cookies, sem qualquer opção de recusa. É transferência internacional. Hoje é o **único** terceiro que recebe dados automaticamente do navegador de todo visitante — antes eram dois. Recomendação técnica: auto-hospedar as fontes elimina esse terceiro por completo. |
| **🆕 Provedor do servidor de e-mail de saída** | Nada hoje; quando ligado: nome do clube, cidade, nome e e-mail do representante, motivo de recusa em texto livre e **a lista nominal completa dos atletas de cada pagamento, inclusive menores** | **PRONTO E DESLIGADO POR CONFIGURAÇÃO.** O envio está em modo simulado por padrão (`application.properties:41`, `SMTP_MOCK` com valor padrão `true`; nem o `.env` nem o `docker-compose.yml` do repositório alteram isso). Basta trocar uma variável de ambiente para ligar, **sem mudar uma linha de código**, e o plano é ligar no lançamento. **Armadilha:** se alguém apenas desligar o modo simulado sem informar qual servidor usar, o padrão é o do **Gmail** (`application.properties:43`, porta 587), o que coloca o Google como operador, com servidores fora do Brasil. A conexão exige TLS (`:47`) — a mensagem viaja cifrada e chega em claro na caixa de destino. Ver §6 e §7. |
| **🆕 Caixas postais de destino** | A caixa institucional da federação (padrão `contato@fht.org.br`, `application.properties:49`) recebe os avisos de nova filiação e **a lista nominal de atletas de cada pagamento**. O e-mail do representante de cada clube (buscado na ficha do clube — `PagamentoServiceImpl.java:305-308`) recebe os avisos de andamento | Quem hospeda essas caixas é **operador de tratamento**. Se forem Gmail/Workspace, Microsoft 365 ou Zoho, o provedor passa a **armazenar** (não só transportar) nomes de atletas menores, indefinidamente, fora do controle do sistema. **Alerta:** o e-mail do representante é editável pelo próprio clube (`ClubeUpdateForm.java:18`; `ClubeServiceImpl.java:175`) — o clube pode redirecionar a qualquer momento os avisos para outro endereço, sem que a federação seja notificada. |
| **Cloudflare R2 (armazenamento de arquivos)** | Nada hoje | **PREVISTO MAS INATIVO.** As três credenciais continuam vazias (`application.properties:63-65`; `.env` e `.env.example` em branco; `docker-compose.yml:28-44` repassa variáveis vazias) e, sem elas, o serviço nem cria o cliente e cai **silenciosamente** no disco local do próprio servidor, apenas registrando um aviso (`R2StorageService.java:51-60`). Nenhum arquivo saiu do servidor da aplicação até hoje. O volume guardado localmente cresceu: agora inclui também os comprovantes de pagamento. |
| **Sentry (monitoramento de erros — Functional Software Inc., EUA)** | Nada hoje | **CÓDIGO PRONTO, MAS DESLIGADO:** só inicializa se o identificador estiver preenchido, e o valor está vazio (`application.properties:70`; `SentryInitializer.java:23-32`). Quando ligado, captura toda exceção não tratada com a mensagem original (`GlobalExceptionMapper.java:46-47`), sem filtro nem mascaramento — uma violação de unicidade de banco pode carregar um CPF junto. Detalhe verificado agora: quando ligado, também coleta amostra de desempenho de 20% das requisições (`SentryInitializer.java:29`), enviando aos EUA as rotas acessadas, não só os erros. |
| **Hospedagem e infraestrutura** | Todo o banco de dados, o volume de arquivos e os registros de execução | **CORREÇÃO em relação a 02/08:** existe, sim, configuração de publicação no repositório — ela só não estava na pasta procurada. O arquivo é **`backend/.github/workflows/deploy.yml`**, e descreve a esteira completa: compilação em runner do GitHub (`:10`), publicação da imagem em um registro Docker (`:27-40`) e **disparo de deploy no Railway** (`:42-46`, usando um segredo `RAILWAY_WEBHOOK_URL`). **Ressalva honesta:** por estar dentro de `backend/` e não na raiz do repositório, esse arquivo **não é executado pelo GitHub** — ele é prova documental da **intenção** de hospedar no Railway (EUA), não prova de que a produção já esteja lá. **O hospedeiro real continua tendo de ser confirmado com a federação** antes de ser nomeado operador. |
| **CBHb ou outra entidade desportiva** | Nada | **NENHUMA integração existe no código.** A única menção à Confederação Brasileira de Handebol no sistema inteiro é um link de cortesia no rodapé (`Footer.tsx:16`). Não há envio, exportação nem sincronização. Se houver compartilhamento na prática (planilha, e-mail, sistema da CBHb), acontece **fora** do sistema e precisa ser declarado assim mesmo. **PERGUNTAR À FEDERAÇÃO.** |
| **Gateway de pagamento / instituição financeira** | Nada | **Confirmado depois da V16.** Não existe nenhuma biblioteca de meio de pagamento no projeto (busca por Stripe, Mercado Pago, PagSeguro, Asaas, Gerencianet, Pagar.me, PayPal e OpenPix: zero ocorrências). O pagamento é Pix feito **por fora e em lote**: o clube seleciona vários atletas, faz um único Pix e anexa um único comprovante, que cobre nominalmente todos os selecionados (`PagamentoServiceImpl.java:85-152`). A federação confere a olho e dá baixa (`:202-246`). **Nenhum dado bancário, número de conta, chave Pix ou dado de cartão é digitado no sistema** — o que existe é a imagem do comprovante enviada pelo clube. |
| **Público em geral (via endereços abertos)** | Nome, posição e categoria de atletas ativos; nome, foto, cidade, UF e nível de árbitros credenciados; registro completo de diretores (inclusive e-mail, telefone e currículo); nome do autor das publicações; fotos da galeria; **e, na prática, qualquer arquivo enviado ao sistema para quem tiver a URL — incluindo agora os comprovantes bancários** | Não é "compartilhamento com terceiro" em sentido estrito, mas é divulgação pública e precisa estar declarada na política com essa clareza. Ver §4. |
| ~~ViaCEP~~ | — | **REMOVIDO DA LISTA.** A busca pela palavra "viacep" em todo o repositório retorna **zero ocorrências** em código. A consulta foi apagada junto com a coleta do endereço do atleta (`ClubeDashboard.tsx:946`). Não há mais transferência de dado de atleta para esse serviço, e ele era brasileiro de qualquer modo. |

**Varredura exaustiva de chamadas externas (feita em 04/08):**
- **No servidor:** existem exatamente **duas** saídas possíveis para fora — o Cloudflare R2 (desligado) e o servidor de e-mail (simulado). Nada mais. Nenhuma consulta a Receita Federal, bureau de crédito, confederação, sistema de governo ou qualquer serviço de terceiro. O único outro endereço externo no código do servidor é decorativo: a documentação da API cita `https://fht.org.br` e `https://api.fht.org.br` como endereços do próprio projeto.
- **No site:** a única transferência automática é o Google Fonts. Todas as chamadas de dados vão para a própria API da federação (`services/api.ts:50-98`; `AuthContext.tsx:80`; `Registration.tsx:113`). Os dois quadros que exibem PDF apontam para o próprio servidor da federação. **Não há CDN, biblioteca carregada de fora, mapa, vídeo, chat ou feed de rede social.**
- **Ligações que só agem se o visitante clicar** (não são transferência automática, mas convém saber): três links externos no rodapé — Confederação Brasileira de Handebol, Comitê Olímpico do Brasil e Governo do Tocantins (`Footer.tsx:16-18`) — e um link de WhatsApp na seção de contato (`Contact.tsx:34`), que aponta para um número de exemplo, só zeros. Ao clicar, o visitante sai do site e o destino recebe o IP dele.
- **Ponto de atenção operacional:** o arquivo de dados fictícios de demonstração (`scripts/seed_teste.sql:13-25`) preenche fotos de atleta com endereços de `i.pravatar.cc` e documentos com um PDF de exemplo em `africau.edu`. Se esse arquivo for carregado no ambiente que for ao ar, o navegador de quem abrir o painel passa a buscar imagens nesses dois sites estrangeiros. Não é comportamento do sistema, é contaminação de dado de teste — mas convém garantir que esse arquivo **nunca** rode em produção. O mesmo arquivo, versionado no GitHub, contém nomes, CPFs e contatos **fictícios**, incluindo menores fictícios; se alguém um dia colocar dados reais ali, eles vão para o repositório.

---

## 6. 🆕 Transferência internacional de dados (art. 33)

> **Seção nova.** A versão de 02/08 tratava o assunto em observações soltas dentro da tabela de
> terceiros. O art. 33 exige tratamento próprio e informação específica ao titular — e **há uma
> transferência acontecendo hoje, em toda visita ao site**.

**1. ATIVA HOJE, sem nenhuma alternativa de recusa — GOOGLE (fontes tipográficas).**
Toda visita a qualquer página do site carrega fontes de `fonts.googleapis.com` e `fonts.gstatic.com` (`frontend/index.html:13-15`). Isso transmite ao Google o endereço IP do visitante, a identificação do navegador e a página de origem, **em toda visita**, inclusive antes de qualquer interação e **antes de o aviso de cookies aparecer** — o aviso é montado pelo React, que só executa depois. Não há como recusar. É a **única transferência internacional efetivamente em curso**, e alcança todo visitante anônimo, inclusive crianças que entrem no site.

**2. PREVISTA E LATENTE — GOOGLE (servidor de saída de e-mail).**
O servidor de saída configurado por padrão no projeto é `smtp.gmail.com` (`application.properties:43`). O envio está desligado hoje (modo simulado, `:41`), mas basta preencher usuário e senha e virar a chave: **se ninguém trocar esse valor, toda mensagem — inclusive a que carrega a lista nominal de atletas menores — trafegará por infraestrutura do Google nos Estados Unidos.** Isso é transferência internacional e precisa ser declarada, com contrato de operador.

**3. PREVISTA, INATIVA — CLOUDFLARE R2.**
É o destino planejado de **todos** os arquivos: RG digitalizado, foto 3x4, comprovante de residência e comprovante de Pix de atletas, RG de árbitros, ata e estatuto de clubes, comprovantes bancários de pagamento. Inativo de fato: sem as três credenciais o serviço nem cria o cliente e cai no disco local (`R2StorageService.java:51-60`). Quando ativado, o destino é um endereço no domínio `r2.cloudflarestorage.com` e o cliente é construído declarando a região `US_EAST_1` (`R2StorageService.java`, método de inicialização).

**4. PREVISTA, INATIVA — SENTRY (Functional Software Inc., EUA).**
Só inicializa se o identificador estiver preenchido, e ele está vazio (`application.properties:70`). Se ligado, captura toda exceção não tratada com a mensagem original, sem filtro — uma violação de unicidade de banco pode carregar um CPF junto.

**5. DOCUMENTADA NO CÓDIGO, A CONFIRMAR — RAILWAY (EUA), como hospedeiro.**
Existe uma esteira de publicação que compila no GitHub, envia a imagem a um registro Docker e dispara deploy no Railway (`backend/.github/workflows/deploy.yml:42-46`). **Ressalva:** por estar em `backend/` e não na raiz, essa esteira **não é executada** pelo GitHub — é prova de intenção, não de ambiente ativo. O hospedeiro real precisa ser confirmado, mas **hospedagem é o operador que recebe absolutamente tudo**: banco, arquivos e registros de execução — e os registros incluem o nome completo de atletas apagados pela rotina de descarte (`AtletaExpurgoJob.java:44-46`).

**6. A CONFIRMAR — PROVEDOR DAS CAIXAS POSTAIS DA FEDERAÇÃO.**
Os endereços `contato@fht.org.br` e `imprensa@fht.org.br`. Se estiverem em Google Workspace, Microsoft 365, Zoho ou similar, **todo aviso operacional com nome de atleta menor fica hospedado fora do Brasil**, independentemente de qual servidor de saída for usado. **Isso não é verificável no código.**

**NÃO SÃO TRANSFERÊNCIA:** o GitHub, onde fica o código-fonte (`github.com/Gustavo16378/FHT-SITE`) — não há dado de titular ali, ressalvado o arquivo de dados fictícios já mencionado; e os links de rodapé para CBHb, COB e Governo do Tocantins, que são apenas hiperlinks e não enviam dado nenhum sozinhos.

**SAIU DA LISTA:** ViaCEP, removido do código.

**A lista é exaustiva:** verificado que não há nenhum outro recurso externo no site — nenhuma outra fonte, biblioteca de CDN, mapa, vídeo incorporado, feed de rede social, chat, ferramenta de medição de audiência ou verificação anti-robô.

> **Recomendação de melhor custo-benefício de todo o levantamento:** auto-hospedar as fontes.
> Isso elimina a única transferência internacional em curso hoje, e deixa a seção inteira de
> cookies e terceiros dramaticamente mais simples e mais defensável.

---

## 7. 🆕 Comunicações enviadas pelo sistema (e-mails)

> **Seção nova, e a correção mais perigosa deste documento.** A versão de 02/08 afirmava
> categoricamente: *"NÃO enviamos e-mail, SMS, WhatsApp ou notificação automática a ninguém.
> Não existe mailer, SMTP ou serviço de mensageria no código nem no pom.xml."*
> **ISSO É FALSO HOJE E NÃO PODE ENTRAR NA POLÍTICA.**

O sistema passou a enviar e-mail automático em 03/08/2026 (commit `8650a6c`). A biblioteca de envio está declarada em `backend/pom.xml:110` (`quarkus-mailer`), o servidor de saída está configurado em `application.properties:41-50` e toda a redação das mensagens está em `backend/src/main/java/br/org/fht/service/EmailService.java`.

### Estado atual: SIMULADO por padrão

Hoje o envio está em **modo simulado** (`application.properties:41`, `SMTP_MOCK` com valor padrão `true`; nem o `.env` nem o `docker-compose.yml` do repositório o alteram). Em modo simulado a mensagem **não sai para a internet** — segundo o comentário do próprio projeto, "o e-mail aparece no log" (`application.properties:38`; `EmailService.java:16-17`). **Trocar uma única variável de ambiente para `false` liga o envio real, sem mudar uma linha de código, e a expectativa é que isso aconteça no lançamento.**

> **NÃO VERIFICADO:** não foi possível confirmar, dentro deste repositório, se o modo simulado grava
> o **corpo** da mensagem (com a lista de nomes) nos registros do servidor ou apenas o cabeçalho —
> isso é comportamento da biblioteca, não do código da federação. O código próprio da federação
> registra apenas destinatário e assunto (`EmailService.java:159`). O comentário do projeto, porém,
> afirma que "o e-mail aparece no log".

**A política precisa descrever esse tratamento como existente**, porque ele está pronto e será ligado.

### Os dois destinatários possíveis

1. **A caixa institucional da federação** — endereço padrão `contato@fht.org.br` (`application.properties:49`; `EmailService.java:34-36`).
2. **O e-mail pessoal ou profissional que o representante do clube digitou** no formulário de filiação; o sistema o busca na ficha do clube na hora de enviar (`PagamentoServiceImpl.java:305-308`; `ClubeServiceImpl.java:200-201` e `:214`).

**Nenhuma mensagem vai para o responsável legal do menor, nem para o próprio atleta, nem para as pessoas da comissão técnica.**

### As sete mensagens, por evento, com o dado pessoal que cada uma carrega

| # | Evento | Vai para | O que o corpo carrega |
|---|---|---|---|
| 1 | Clube preenche o formulário público de filiação (`ClubeServiceImpl.java:125`) | Caixa da federação | Nome do clube, cidade, **nome completo do representante legal e e-mail dele** (`EmailService.java:43-57`) |
| 2 | Mesmo evento, disparo simultâneo (`ClubeServiceImpl.java:127`) | Representante do clube | Nome dele, nome do clube, e o aviso de que o login será aquele e-mail e a senha escolhida no cadastro (`EmailService.java:59-70`) |
| 3 | Federação **aprova** o clube (`ClubeServiceImpl.java:200`) | Representante | Nome dele e nome do clube. Inclui a frase **"Se esqueceu a senha, fale com a federação"** (`EmailService.java:72-85`, especificamente `:80-81`) |
| 4 | Federação **rejeita** o clube (`ClubeServiceImpl.java:214`) | Representante | Nome do clube e **o motivo da rejeição, texto livre escrito pelo administrador** — pode conter qualquer coisa que ele digite (`EmailService.java:87-97`) |
| 5 | Clube **envia o pagamento** da anuidade em lote (`PagamentoServiceImpl.java:148`) | **Caixa da federação** | Nome do clube, protocolo, valor, quantidade **e A LISTA NOMINAL COMPLETA, UM POR LINHA, DE TODOS OS ATLETAS COBERTOS** (`EmailService.java:102-120`). Como o pagamento cobre qualquer atleta pendente, **essa lista inclui menores de idade, sem nenhuma distinção**. É o disparo que leva mais dado pessoal de terceiros. |
| 6 | Federação **confirma** o pagamento (`PagamentoServiceImpl.java:242`) | Representante | Protocolo, nome do clube e **quantidades** de atletas ativados e retidos — sem nomes (`EmailService.java:122-135`) |
| 7 | Federação **rejeita** o pagamento (`PagamentoServiceImpl.java:286`) | Representante | Protocolo, nome do clube e **motivo em texto livre** (`EmailService.java:137-147`) |

Todas as mensagens terminam com a assinatura "Federação de Handebol do Tocantins — mensagem automática, não responda a este e-mail" (`EmailService.java:166-176`), e o remetente configurado é `nao-responda@fht.org.br` (`application.properties:42`).

### Fatos adicionais que a política precisa refletir

- **O código tentou conter o problema e conseguiu em parte.** O comentário no topo do serviço registra que "estes e-mails saem do sistema levando dado pessoal para uma caixa postal externa" e que por isso o corpo carrega o mínimo, **nunca CPF, RG ou documento** (`EmailService.java:23-25`). **Isso foi verificado e é verdade** — nenhum e-mail carrega CPF, documento ou anexo. Mas carrega **nome completo de menor**, e isso basta para ser tratamento de dado pessoal de criança saindo do ambiente controlado.
- **O envio nunca interrompe uma operação:** se o servidor de e-mail falhar, o erro é apenas registrado e o processo segue (`EmailService.java:157-163`).
- **Não existe qualquer opção de descadastro ou recusa** dessas mensagens.
- **Não há SMS, WhatsApp automático nem notificação push** — essa parte da negativa antiga continua verdadeira.
- **Cada envio grava no registro de execução o endereço do destinatário e o assunto** (`EmailService.java:159`), e cada falha grava o mesmo com o erro (`:162`). Como os assuntos incluem o nome do clube e o protocolo, o registro passa a conter uma trilha de quem recebeu o quê — sem prazo de retenção definido e sem servir a finalidade declarada nenhuma.
- **Se um titular responder** a um desses e-mails pedindo exclusão de dados, a resposta cai num endereço `nao-responda@` que provavelmente não existe. **A política não pode, em hipótese alguma, apontar esse endereço como canal do titular.**
- **Contraste que vale registrar:** o sistema agora **tem** capacidade de enviar e-mail, e mesmo assim o formulário "Fale com a FHT" do site continua não enviando nada (§13). Implementá-lo deixou de ser trabalho do zero.

---

## 8. Retenção e descarte

- **ÚNICA REGRA AUTOMÁTICA QUE EXISTE:** cadastros de atleta parados na situação `AGUARDANDO_PAGAMENTO` são apagados após 90 dias contados da **data de cadastro**. É uma rotina diária (`AtletaExpurgoJob.java:33`, `:37`, `:40-41`) e é a **única tarefa agendada de todo o sistema** (uma única ocorrência de agendamento em todo o backend). O critério exato é: situação igual a `AGUARDANDO_PAGAMENTO` e data de cadastro anterior ao limite (`AtletaRepository.java:36-38`). O prazo é configurável por variável de ambiente (`application.properties:60`) — sugerimos redigir como "até 90 dias".

- **⚠️ NÃO CHAME ESSES CADASTROS DE "ABANDONADOS".** Com o pagamento em lote, o atleta cujo clube **já pagou** continua marcado como `AGUARDANDO_PAGAMENTO` enquanto a federação não dá baixa no comprovante: o envio do lote **não altera a situação de nenhum atleta** (`PagamentoServiceImpl.java:85-152`; o comentário em `:67-71` confirma que "quem já mandou um lote e espera a baixa" permanece nessa situação). E a rotina de descarte **não exclui da varredura** quem já está dentro de um lote pago. **Cenário concreto:** clube cadastra o atleta em fevereiro, paga em abril, a federação demora a conferir, e em maio a rotina apaga o cadastro — com o Pix já feito e o comprovante já anexado, levando junto, em cascata, o consentimento do responsável legal. Há um segundo caminho para o mesmo destino: quando a federação **recusa** um pagamento, os atletas voltam à fila de pendentes (`PagamentoServiceImpl.java:280-283`) mantendo a data de cadastro original — o relógio dos 90 dias nunca reinicia e pode já estar vencido.
  **Redação segura:** *"cadastros de atleta cuja anuidade não seja confirmada em até 90 dias são descartados"* — e não "cadastros abandonados", que descreve uma intenção que o código não implementa. **Do lado técnico, isto é correção urgente antes do lançamento:** apagar o cadastro de um atleta já pago é dano ao titular e ao clube, não só problema de redação.

- **ATENÇÃO — documentação interna desatualizada, agora em outro arquivo.** O `CLAUDE.md` foi corrigido e já fala em 90 dias. Quem ainda carrega o texto antigo (expurgo de hora em hora, prazo de 24 horas) é o `docs/MODULO-ATLETA-FLUXO.md`, em oito trechos do corpo (linhas 26, 27, 31, 36, 56, 75, 80, 84 e 122), corrigindo só no final, na linha 178. **Um redator que ler aquele documento de cima para baixo vai escrever 24 horas na política.** A coluna `prazo_pagamento_ate` continua existindo no banco (`V12:15`), mas não é mais critério de nada.

- **Ao apagar o atleta, os registros de consentimento são apagados EM CASCATA** (`V12:35`, comentado explicitamente em `AtletaExpurgoJob.java:48`). A prova de que o consentimento do responsável foi obtido **desaparece junto** — risco de prestação de contas.

- **🆕 MAS O NOME DO ATLETA NÃO DESAPARECE.** Ver a ficha própria em §1. Resumo: a tabela de itens de pagamento guarda uma cópia congelada do nome completo, em coluna obrigatória, e a ligação com o cadastro foi deliberadamente configurada para se romper sem levar a linha junto (`V16:36-43`, `ON DELETE SET NULL`, com o comentário "a linha fiscal não pode sumir"). **Apagar o cadastro de um atleta — inclusive um menor, inclusive pela rotina automática — não apaga o nome dele do sistema.** Ele continua no registro financeiro, sem prazo de descarte nenhum, aparecendo na tela de Financeiro da federação e no histórico de pagamentos do clube (`PagamentoServiceImpl.java:310-318`).
  **Sugestão de redação:** *"Os registros de pagamento de anuidade, incluindo o nome do atleta a que se referem e o comprovante enviado, são conservados como documentação financeira mesmo após a exclusão do cadastro do atleta, pelo prazo exigido pela legislação contábil e fiscal aplicável."* — e a federação precisa **decidir qual é esse prazo**, porque hoje não há nenhum.

- **TODO O RESTO É RETIDO POR PRAZO INDETERMINADO.** A lista, atualizada:
  - atleta ATIVO, SUSPENSO, REJEITADO e AGUARDANDO_APROVACAO;
  - clubes, **inclusive rejeitados**;
  - contas de acesso, **inclusive as de clubes rejeitados ou nunca analisados** — categoria que antes nem existia, porque a conta só nascia na aprovação (`ClubeServiceImpl.java:104-111` cria inativa; `:212` e `:233-236` apenas desligam a chave `ativo`);
  - **🆕 a tabela de pessoas do clube**, com nome, CPF, cargo, e-mail e telefone (`V15:19-40`);
  - **🆕 o CPF do representante do clube**, que agora É armazenado (`V15:10`);
  - **🆕 os registros de pagamento** — cada lote com protocolo, valor, comprovante, datas e autor da baixa; cada item com o **nome do atleta** e o valor (`V16:10-50`);
  - árbitros, inclusive os legados PENDENTE e REJEITADO preservados pela migration V14, que ainda guardam CPF, RG, telefone, e-mail e documentos de pessoas que apenas se candidataram;
  - diretores, notícias e fotos da galeria.

  **Um clube que pediu filiação e foi recusado deixa hoje, permanentemente e sem nenhum meio de exclusão pela API:** o cadastro do clube, o PDF da ata, o PDF do estatuto, o CPF e os contatos do representante **em duas tabelas**, e uma conta de login com o resumo criptográfico da senha que ele escolheu.

- **ARQUIVOS NUNCA SÃO APAGADOS — RECONFIRMADO EM 04/08.** Busca no backend inteiro por `deleteObject`, `DeleteObject`, `Files.delete`, `deleteIfExists` e qualquer chamada de exclusão de arquivo: **zero ocorrências**. O serviço de armazenamento tem apenas dois métodos, os dois de gravação (`R2StorageService.java:75` e `:103`). Apagar um atleta remove só a linha do banco (`AtletaServiceImpl.java:447-451`). O mesmo vale para árbitro, diretor, documento institucional, foto da galeria e notícia — todos têm exclusão na API, **nenhum apaga o arquivo correspondente**. E entrou uma **quinta categoria de arquivo**: o comprovante bancário do pagamento em lote (`PagamentoServiceImpl.java:129-131`), que também nunca é apagado — nem sequer existe endereço que apague um lote.

- **ACÚMULO POR SUBSTITUIÇÃO — com uma precisão que faltava.** No cadastro, os arquivos vão para `atletas/{clube}/{identificador aleatório}/` (`AtletaServiceImpl.java:118`) e, na reanexação, para `atletas/{clube}/{id do atleta}/` (`:325`) — caminhos diferentes. **O arquivo enviado no cadastro fica órfão para sempre:** a pasta com identificador aleatório nunca mais é alcançada por nenhuma operação, então toda primeira versão do RG, da foto e do comprovante de residência permanece no armazenamento indefinidamente, sem nenhuma referência no banco depois que o documento é corrigido. Já **entre uma reanexação e outra**, se o clube subir um arquivo com exatamente o mesmo nome, o anterior **é sobrescrito** (`R2StorageService.java:113`, gravação com substituição); se o nome for diferente, acumula mais uma cópia. Os nomes recebem prefixos previsíveis (`foto_`, `rg_`, `res_`, `pix_` — `AtletaServiceImpl.java:327-337`), o que torna as URLs de reanexação ainda mais fáceis de adivinhar, agravando o problema do endereço sem autenticação.

- **A migration V14 removeu a coluna de comprovante escolar de árbitros** (`V14:10-18`): os arquivos já enviados ficaram no armazenamento sem referência no banco, impossíveis de localizar pelo sistema e nunca apagados. Nenhuma migration posterior criou situação parecida.

- **DOIS REPOSITÓRIOS PARALELOS QUE NINGUÉM ESTÁ CONTANDO:**
  1. **Os registros de execução (logs) da hospedagem.** A rotina de descarte grava o identificador **e o nome completo** do atleta apagado (`AtletaExpurgoJob.java:44-46`), em formato JSON no console (`application.properties:74-75`). A ativação de atleta sem baixa de pagamento grava o identificador, **o nome completo** do atleta e o login de quem autorizou (`AtletaServiceImpl.java:392-394`). E cada e-mail enviado grava destinatário e assunto (`EmailService.java:159`). **O nome de uma criança sobrevive ao próprio descarte do cadastro que a rotina existe para cumprir**, dentro dos logs, sob o prazo de retenção do provedor de hospedagem — que ninguém definiu. *(Trocar o nome pelo identificador é correção de uma linha, nos dois pontos.)*
  2. **A caixa postal da federação**, que passará a receber automaticamente listas nominais de atletas (§7). Uma vez entregue, a mensagem **escapa completamente de qualquer controle do sistema** — é um local de tratamento tão real quanto o banco de dados, e é o único que ninguém consegue apagar pelo sistema.

- **Do lado do navegador:** o token de sessão fica no armazenamento local até o logout ou até a API recusar — não há expiração por tempo no site. O token de acesso vale **1 dia** e o de renovação **30 dias** no servidor (`JwtService.java:24` e `:38`), **mas não há revogação**: um token vazado vale até expirar. *Detalhe que suaviza o quadro:* o token de renovação de 30 dias é devolvido pela API no login (`AuthResource.java:63-66`) mas o site **nunca o guarda** — o navegador só grava o de um dia (`AuthContext.tsx:73`). Na prática, a sessão que existe no navegador dura no máximo um dia.

- **NÃO HÁ BACKUP configurado** (nenhum script, agendamento ou `pg_dump` em lugar nenhum do repositório — a única pasta de scripts contém apenas o arquivo de dados fictícios) **e NÃO HÁ criptografia de dados em repouso**: CPF, RG, dados do responsável legal e todos os documentos ficam em texto puro no banco e no volume de arquivos. A extensão `pgcrypto` está habilitada (`V1:1`), mas apenas para gerar identificadores aleatórios — nenhuma coluna é cifrada. **Única ressalva, e só para dados em trânsito:** quando o envio de e-mail for ligado, a conexão com o servidor exige TLS (`application.properties:47`), então a mensagem viaja cifrada até o provedor — e lá chega em claro, como qualquer e-mail.

---

## 9. Menores de idade (LGPD art. 14)

- **Faixa etária — correção de precisão.** A detecção de menoridade é exata e automática: o sistema considera menor quem tem menos de 18 anos na data de referência (`Atleta.java:203-206`), regra chamada no cadastro (`AtletaServiceImpl.java:83`) e na aprovação (`:377`). **Mas a política deve dizer apenas "menores de 18 anos", sem prometer piso de idade.** A lista de categorias oferecida ao clube (Sub-12, Sub-14, Sub-16, Sub-18 e Adulto — `ClubeDashboard.tsx:78`) é um **rótulo esportivo escolhido a mão**, sem nenhuma amarração com a idade real. A única validação de data de nascimento no servidor é que ela não pode estar no futuro (`AtletaServiceImpl.java:217-219`). **Não existe idade mínima em lugar nenhum do sistema:** uma criança de 6 anos pode ser cadastrada hoje.

- **✅ IMPLEMENTADO E FUNCIONANDO:** quando o atleta é menor, o cadastro **exige** uma etapa adicional com nome, CPF (validado por dígito verificador), parentesco e ao menos um contato do responsável legal, e é **bloqueado sem o aceite do termo** (`AtletaServiceImpl.java:83-86` e `:184-205`). A tela correspondente é a etapa "Responsável (LGPD)" do cadastro, que só aparece quando a data de nascimento indica menor (`ClubeDashboard.tsx:81-86` e `:1106-1172`). **Nada disso foi afrouxado nas mudanças de agosto.**

- **✅ IMPLEMENTADO, E AGORA EM TRÊS CAMINHOS.** A ativação de um menor sem consentimento registrado é bloqueada:
  1. **Aprovação manual pela federação** (`AtletaServiceImpl.java:367-400`, bloqueio em `:377-380`);
  2. **Baixa do pagamento em lote** — caminho novo de agosto: ao dar baixa, o sistema ativa em bloco os atletas cobertos, **mas repete a mesma trava**, conferindo RG e, se menor, consentimento; quem não passa fica retido em "aguardando aprovação" com o motivo escrito (`PagamentoServiceImpl.java:222-239` e `:249-263`);
  3. **Aprovação com dispensa de pagamento** — a dispensa alcança só o portão financeiro; o código é explícito em que ela **não** alcança o consentimento do menor (`AtletaServiceImpl.java:371-380` vs `:382-395`).
  **Conclusão que a política pode afirmar com segurança:** *o sistema impede a ativação de um menor sem o registro de autorização do responsável legal.* Pagar não ativa menor sem autorização.

- **✅ IMPLEMENTADO:** o consentimento é armazenado em tabela própria, com um registro por finalidade, guardando quem consentiu (nome e CPF), se o titular era menor no momento do aceite, a versão do termo, a data/hora, o IP e a identificação do navegador (`V12:33-50`; entidade `Consentimento.java`). Não foi tocada pelas migrations V13 a V16.

### PONTO CRÍTICO 1 — quem marca a caixa é o CLUBE, não o responsável

Todo o cadastro passa pelo painel do representante do clube. O IP e a identificação do navegador gravados como evidência são os do **dispositivo do clube** (`AtletaResource.java:57-59` → `AtletaServiceImpl.java:177-180`). Não existe confirmação por e-mail, link, assinatura ou dupla confirmação do responsável em nenhum ponto do código. Juridicamente, é a **declaração de um terceiro** de que houve consentimento.

**⚠️ E ficou mais grave em agosto:** o sistema agora **tem** serviço de e-mail funcionando e dispara mensagens em seis momentos do fluxo — **e nenhuma vai para o responsável legal**. O e-mail dele é coletado, validado como contato obrigatório e gravado (`AtletaServiceImpl.java:114`, `:197-200`), e **nunca é usado como destinatário em lugar nenhum do backend**. A ausência de confirmação com o responsável deixou de ser limitação técnica e passou a ser uma **escolha**.

### PONTO CRÍTICO 2 — o site público JÁ publica nome de menor

Reverificado campo a campo em 04/08. O endereço público é `GET /api/clubes/publico/{id}` e **não tem nenhuma exigência de login** (`ClubeResource.java:74-85` — compare com os métodos vizinhos, que trazem a marcação de perfil exigido; este não tem). O método que monta a resposta é `ClubeServiceImpl.java:271-291`. O único filtro aplicado é o do **clube** (precisa estar ativo e marcado como visível — `:273`); o elenco entra **sem filtro de idade e sem qualquer consulta a consentimento**, pegando todo atleta ATIVO (`:276-279`).

Para **cada atleta, incluindo os menores**, o visitante anônimo recebe exatamente três campos (`AtletaVitrineDTO.java:10-14`):
1. **Nome completo**, sem abreviação;
2. **Posição em quadra** — pode vir mais de uma, porque o cadastro junta as posições escolhidas numa única frase, do tipo "Ponta direita, Ponta esquerda" (`ClubeDashboard.tsx:947`);
3. **Categoria**, que é literalmente "Sub-12", "Sub-14", "Sub-16", "Sub-18" ou "Adulto" — **ou seja, a faixa etária da criança**.

No mesmo pacote vão os dados de contexto: nome do clube, cidade, UF, sigla, categorias e total de atletas (`ClubeVitrineDetalheDTO.java:13-22`). Na tela, aparece como uma lista com o nome à esquerda e "posição · categoria" à direita (`Clubs.tsx:101-106`).

**Traduzindo: um visitante sem login lê "Nome Completo da Criança — Pivô · Sub-12", junto com o clube e a cidade dela.**

**O que NÃO sai por esse endereço:** CPF, RG, data de nascimento, telefone, e-mail, foto, documentos, dados do responsável legal e registros de consentimento. **Mas a foto e os documentos dessa mesma criança continuam acessíveis por outro caminho, sem login** — ver o Ponto Crítico 3.

**A política NÃO pode afirmar que dados de menores não são publicados.** A decisão jurídica continua pendente e o código continua publicando.

### PONTO CRÍTICO 3 — documentos de menores acessíveis sem login

O endereço que serve os arquivos segue sem qualquer exigência de login ou perfil: `FileResource.java:30-54` — o arquivo inteiro tem 55 linhas e não contém nenhuma anotação de segurança; o comentário do próprio código assume que é "público e sem auth de propósito" (`:16-22`). **Qualquer pessoa com o endereço baixa o RG digitalizado, a foto 3x4 e o comprovante de residência de uma criança.** O endereço não expira, não pode ser cancelado e não verifica quem pede.

**Novidade de agosto:** entrou nesse mesmo armazenamento aberto o **comprovante de pagamento Pix do lote** (`PagamentoServiceImpl.java:129-131`) — um comprovante bancário que costuma trazer nome, banco, chave Pix e valor de quem pagou.

A proteção prometida (armazenamento privado na Cloudflare, com endereço assinado e prazo) **continua não executada**: as credenciais estão vazias e, sem elas, o sistema cai em silêncio no armazenamento local, sem falhar (`R2StorageService.java:51-60` e `:103-119`).

### PONTO CRÍTICO 4 — fotos de menores na galeria sem verificação

Inalterado. A galeria é servida sem login (`GaleriaResource.java:29-35`), a legenda é texto livre exibido sobre a foto (`FotoDTO.java:9-17`) e **não existe vínculo entre foto e atleta em lugar nenhum**, então o sistema não tem como localizar em quais fotos determinado menor aparece caso a autorização seja revogada.

**E a autorização de imagem não é consultada em ponto nenhum do sistema antes de publicar.** A finalidade `IMAGEM_PUBLICA` aparece em exatamente três lugares no backend: a definição do nome (`Consentimento.java:20`), a **gravação** do registro quando a caixa é marcada (`AtletaServiceImpl.java:158-161`) e a exibição nos painéis internos. **Nenhuma leitura condiciona nada.** Todos os pontos que leem consentimento leem apenas a outra finalidade, a do cadastro de menor (`AtletaServiceImpl.java:402-406`; `PagamentoServiceImpl.java:249-263`). **Marcar ou não marcar a caixa não muda absolutamente nada:** o nome vai para a vitrine igual, a galeria publica igual, as notícias publicam igual.

### PONTO CRÍTICO 5 — o responsável não tem nenhum canal

São exatamente dois perfis de acesso no sistema inteiro (`Role.java:3-6`): administrador da federação e administrador de clube. Não há portal do atleta, não há portal do responsável, e **não existe consulta pública por CPF**. Todo pedido de acesso, correção, revogação ou exclusão depende de um administrador agir a mão, e **não fica registro de que foi atendido** — não há trilha de auditoria em nenhuma das dezesseis migrations. **Agravante:** o sistema hoje sabe mandar e-mail e sabe o e-mail do responsável, e não lhe manda nada — nem sequer um aviso de que a criança foi cadastrada, ativada ou publicada no site.

### PONTO CRÍTICO 6 — o termo promete o que não existe

Transcrição literal, do código, do que o responsável aceita hoje. A etapa se chama "Responsável (LGPD)" (`ClubeDashboard.tsx:86`).

**Abertura da etapa** (`ClubeDashboard.tsx:1110-1113`):
> "O atleta é menor de 18 anos. Pela LGPD (Lei 13.709/2018, art. 14), a filiação depende dos dados e do aceite de um dos pais ou do responsável legal."

**Primeira caixa, OBRIGATÓRIA** — título "Autorização do responsável para a filiação *" (`:1156`), texto (`:1157-1160`):
> "Declaro ser o responsável legal pelo atleta e autorizo a FHT a tratar os dados pessoais dele (identificação, contato, endereço e documentos) para a finalidade de filiação, participação em competições e cumprimento das obrigações da federação. **Posso solicitar acesso, correção ou exclusão dos dados a qualquer momento.**"

**Segunda caixa, OPCIONAL** — título "Autorização de uso de imagem (opcional)" (`:1165`), texto (`:1166-1168`):
> "Autorizo a publicação da foto e do nome do atleta no site da FHT, na galeria e em notícias. É opcional e **pode ser revogada a qualquer momento** — a filiação continua válida sem esta autorização."

**Versão para atleta adulto** da segunda caixa, exibida na etapa de documentos (`:1188-1190`):
> "O atleta autoriza a publicação da foto e do nome no site da FHT, na galeria e em notícias. É opcional e **pode ser revogada a qualquer momento** — a filiação continua válida sem ela."

A versão do termo gravada em cada registro é a `'1.0'` (`Consentimento.java:23`).

**As três promessas, e o que o código faz:**
- **"Posso solicitar acesso"** — não há canal. O responsável não tem login e o formulário de contato do site não envia nada (`Contact.tsx:17-20`).
- **"Correção ou exclusão a qualquer momento"** — só um administrador consegue, a mão, e apagar o cadastro **não apaga os arquivos** já enviados nem o nome no registro financeiro.
- **"Pode ser revogada a qualquer momento"** — **NÃO EXISTE NENHUM CAMINHO DE REVOGAÇÃO NO SISTEMA.** O comando que grava a data de revogação existe como capacidade da entidade (`Consentimento.java:89`) e **nunca é chamado por nenhuma linha de código** — a busca em todo o repositório retorna uma única ocorrência, que é a própria definição do método. Não há endereço de API, tela, botão nem rotina administrativa. As duas telas internas até exibem um selo "revogado" (`ClubeDashboard.tsx:816-818`; `AdminDashboard.tsx:409-411`), **que nunca poderá aparecer**.

**Dois problemas adicionais do termo:** (a) ele não traz nenhum link para política de privacidade nem indica a quem recorrer — e a palavra "privacidade" não aparece em nenhum arquivo do site; (b) **ele declara a mais**: diz autorizar o tratamento de "identificação, contato, **endereço** e documentos", mas o endereço do atleta deixou de ser coletado em 02/08 — embora o comprovante de residência, que traz o endereço de casa da criança dentro do arquivo, continue sendo pedido. **O termo precisa ser reescrito antes de a política ser publicada.**

### PONTO CRÍTICO 7 — consentimento retroativo sem evidência

Na regularização de cadastro pela edição do atleta, o consentimento do menor é criado **sem IP e sem identificação de navegador reais**: o campo recebe o texto "regularizado por " seguido do login de quem operou o painel (`AtletaServiceImpl.java:297-313`, especificamente `:311-312`). Esse consentimento retroativo tem **exatamente o mesmo peso** dos demais para liberar a aprovação do menor (`:377-380` não distingue um do outro). Ou seja, um menor pode ser ativado com base num consentimento declarado por um operador do sistema, sem nenhuma evidência de que o responsável esteve presente.

### Atleta MAIOR de idade — correção de precisão

A afirmação antiga ("não gera nenhum registro de consentimento") era imprecisa. O que o código faz (`AtletaServiceImpl.java:146-165`): o atleta adulto **não** gera registro de consentimento de **cadastro** e nunca vê nem assina termo algum — quem preenche tudo é o clube. **Mas**, se a caixa de uso de imagem for marcada, o sistema **grava sim** um registro de consentimento de imagem, colocando o **nome e o CPF do próprio atleta** como "quem consentiu" (`:149-150` e `:158-161`) — mesmo que quem marcou a caixa tenha sido o representante do clube, na tela do clube, no computador do clube. É o mesmo defeito do Ponto Crítico 1, sem nem a formalidade da etapa dedicada. **A conclusão prática não muda:** a base legal do cadastro esportivo tem que ser contrato/obrigação, não consentimento.

### ✅ Resolvido desde 02/08: o CEP do menor não vai mais para serviço externo

O endereço do atleta deixou de ser coletado e, junto com ele, saiu a consulta ao ViaCEP (commit `cf5b726`). Busca por "viacep" em todo o repositório: **zero ocorrências**. **Ressalva:** o comprovante de residência continua sendo pedido como arquivo — o endereço de casa do menor segue entrando no sistema, dentro de um documento digitalizado, e esse documento fica acessível sem login (Ponto Crítico 3).

### 🆕 O nome do menor agora vive numa segunda tabela, que sobrevive ao apagamento do cadastro

Ver §1 e §8. Em resumo: cada pagamento em lote grava uma cópia congelada do nome completo de cada atleta coberto, desenhada de propósito para não desaparecer quando o cadastro for apagado (`V16:36-43`). **Se a federação apagar o cadastro de uma criança — por pedido do responsável ou pelo descarte automático — o nome completo dela permanece por tempo indeterminado no histórico financeiro**, visível na tela do Financeiro e no histórico do clube. A política não pode dizer que a exclusão do cadastro elimina os dados do menor.

### 🆕 Um e-mail leva a lista nominal de crianças para fora do sistema

Ver §7, mensagem nº 5. Quando o clube envia o pagamento em lote, o sistema manda para a caixa da federação um e-mail com **a lista nominal completa de todos os atletas cobertos** (`EmailService.java:102-120`, acionado em `PagamentoServiceImpl.java:147-149`). Como o clube paga a anuidade das crianças junto com a dos adultos, essa lista inclui nomes completos de menores, sem qualquer distinção. Vai para uma **única caixa postal** cuja existência e monitoramento **ninguém confirmou**. Hoje o envio está simulado; ligar é trocar uma variável.

---

## 10. Cookies e armazenamento no navegador

> Inventário técnico factual, para a política publicar. **O site NÃO usa cookies, no sentido técnico:**
> a expressão `document.cookie` não aparece em nenhum arquivo do site e o servidor nunca emite
> cabeçalho de cookie (busca por `NewCookie`, `Set-Cookie` e `@CookieParam` no backend: zero ocorrências).

| Item | O que guarda | Finalidade | Prazo |
|---|---|---|---|
| `fht_cookies` (armazenamento local) | O valor `accepted`, gravado quando o visitante clica em ACEITAR (`CookieBanner.tsx:6` e `:10`) | Única: não reexibir o aviso | Não expira; não é sincronizado com nenhum servidor |
| `fht_token` (armazenamento local) | O token de sessão de quem faz login (`AuthContext.tsx:73`) | Manter a sessão | Fica até o logout ou até a API recusar. O token é **assinado, não criptografado**: nome completo, e-mail, papel e vínculo com o clube são legíveis por quem abrir o conteúdo. Vale 1 dia no servidor. |

**Não há** armazenamento de sessão, banco local no navegador, trabalhador de segundo plano nem cache offline. **Não há** nenhuma ferramenta de medição de audiência, pixel publicitário, mapa de calor ou verificação anti-robô — verificado por busca nominal por Google Analytics, Google Tag Manager, Pixel da Meta, Hotjar, Clarity, Matomo, Plausible, PostHog, Mixpanel, Segment e reCAPTCHA: **zero ocorrências**.

**Três defeitos do aviso atual que a política não pode contornar:**
1. O aviso só tem **ACEITAR** e **Fechar** — não há recusa, não há categorias e não há tela para revisar a escolha depois. "Fechar" não persiste nada.
2. Ele **só é renderizado na página inicial** (`App.tsx:41`) — quem entra por `/noticias`, `/login`, `/clube` ou `/admin` nunca o vê.
3. Ele **não bloqueia nada**: as fontes do Google já foram carregadas antes de o aviso existir na tela.

O texto atual, "Este site utiliza cookies", é **factualmente errado em dois pontos**: não há cookies, e há transferência a terceiro sem opção de negar. **Correção mais barata e mais segura:** auto-hospedar as fontes e trocar o aviso por um informe honesto de armazenamento estritamente necessário — feito isso, não sobra nenhuma transferência a terceiro pelo navegador.

---

## 11. Medidas de segurança — o que existe e o que não existe

> A política é **obrigada** a descrever medidas (art. 46) e a poder demonstrá-las (art. 6, X).
> A lista afirmativa é **curta** e precisa ser escrita com essas palavras exatas, sem inflar.

**O QUE EXISTE E É VERIFICÁVEL:**
1. **Senha armazenada apenas como hash BCrypt com sal aleatório**, nunca em texto puro e nunca devolvida por nenhuma resposta da API — inclusive a senha escolhida pelo clube no cadastro público (`ClubeServiceImpl.java:107`; `AuthResource.java:119`).
2. **Token de sessão assinado com chave RSA de 2048 bits**, validade de 1 dia (acesso) e 30 dias (renovação) — `JwtService.java:24` e `:38`.
3. **Autorização verificada no servidor em todos os endereços com dado pessoal**, com lista de permissão explícita e restrição de cada clube aos próprios dados (`Escopo.java:24-42`), aplicada também aos módulos novos: pagamento em lote (`PagamentoServiceImpl.java:292-299`) e pessoas do clube (`ClubeServiceImpl.java:399-404`).
4. **Proteção contra manipulação de caminho de arquivo (`../`)**, na leitura e na gravação (`FileResource.java:37-40`; `R2StorageService.java:107-111`). *Lembrete: é proteção contra um ataque específico e não substitui controle de acesso.*
5. **Mensagens de erro que não vazam dados pessoais:** erros não tratados devolvem a string fixa "Erro interno do servidor" (`GlobalExceptionMapper.java:49-53`). *Observação: a exceção original, que pode conter dado pessoal, é gravada no log e enviada ao Sentry (`:46-47`) — inofensivo hoje porque o Sentry está desligado, relevante no dia em que for ligado.*
6. **Validação de CPF por dígito verificador, feita apenas localmente** (`common/CPFValidator.java`), sem consulta a nenhuma base externa — aplicada ao atleta, ao responsável legal, ao representante do clube e às pessoas da comissão técnica. **Com a saída do ViaCEP, o sistema não consulta absolutamente nenhuma base externa com dado de titular.**

**Nada foi acrescentado a esta lista desde 02/08.**

**O QUE NÃO EXISTE — e impede qualquer frase genérica sobre "proteção adequada":**
- **Não há criptografia de dados em repouso** — CPF, RG, dados do responsável e documentos em texto puro no banco e no volume.
- **Não há backup** configurado.
- **Não há controle de acesso aos arquivos** — o endereço que os serve não verifica quem pede.
- **Não há troca nem recuperação de senha** — zero ocorrências de "esqueci", "forgot", "reset", "recuperar" em todo o repositório.
- **Não há bloqueio por tentativas, limite de requisições nem verificação anti-robô** — o login aceita tentativas ilimitadas (`AuthResource.java:51-69`), e o formulário público de filiação também não tem proteção.
- **Não há revogação de token no servidor** — um token vazado vale até expirar.
- **Não há registro de auditoria de acesso** (ver §14).
- **O mapa completo da API fica público inclusive em produção** (`application.properties:22`, configuração de sempre incluir a documentação, servida em `/swagger`).
- **A senha escolhida no formulário público exige apenas 8 caracteres**, sem nenhuma regra de complexidade (`ClubeServiceImpl.java:65-68`).
- **A imagem de execução do site roda o servidor de desenvolvimento**, não uma versão compilada para produção (`frontend/Dockerfile`, comando `npm run dev`).
- **O administrador inicial continua com a senha `123456`** gravada no próprio arquivo de instalação do banco (`V4__seed_admin.sql:1-8`), só trocável por comando direto no banco — e é a conta com acesso a **todos** os dados de menores. *(Nota: a senha `123456` também aparece como exemplo na documentação da API, em `LoginRequest.java:14` — é só exemplo de documentação, mas convém trocar.)*

**✅ RESOLVIDO desde 02/08:** as credenciais de teste embutidas no código do site foram removidas em 03/08 (commit `d410a51`). A busca por `123456` em todo o código do frontend retorna **zero ocorrências**, e o próprio código registra o motivo da remoção (`AuthContext.tsx:95`). Uma falha de rede agora devolve erro claro, sem conceder acesso simulado.

---

## 12. Direitos do titular — o que o sistema executa hoje

**O que o sistema executa sozinho:**
- **O representante do clube** vê e corrige os próprios dados cadastrais em `/clube > Meus Dados`: nome do clube, cidade, UF, sigla, CNPJ e o próprio nome, e-mail, telefone e cargo (`ClubeResource.java:104-106`; `ClubeServiceImpl.java:169-179`). **⚠️ Exceção nova e importante: ele NÃO consegue corrigir o próprio CPF** — o campo ficou de fora dos editáveis (`ClubeUpdateForm.java:11-20`); ele apenas o **vê** (`ClubeResponseDTO.java:20`). Um CPF errado não pode ser corrigido por ninguém pelo sistema, nem pelo titular nem pela federação. Isso colide com o art. 18, III e com o art. 6, V.
- **O representante do clube pode APAGAR** o registro de uma pessoa da comissão técnica — nome, CPF, e-mail e telefone de um técnico ou auxiliar (`ClubeResource.java:281-283`; `ClubeServiceImpl.java:356-370`). **É a única exclusão de dado pessoal que alguém fora da federação consegue executar.** Ainda assim **não é autoatendimento do titular**: quem apaga é o clube, e a pessoa apagada nunca teve acesso ao sistema.
- **O clube pode inserir e corrigir** os dados das pessoas da comissão técnica (`ClubeResource.java:239-279`).

**O que NÃO existe:**
- **Atleta, responsável legal, árbitro, diretor e membro da comissão técnica não têm nenhum acesso próprio ao sistema.** Só existem dois perfis (`Role.java:3-6`).
- **Não existe endereço de exclusão de clube nem de conta de acesso em toda a API** — reverificado varrendo todos os arquivos de endpoints do backend. O único DELETE de atleta é restrito ao ADMIN_FHT.
- **Não existe exportação nem portabilidade** (art. 18, V) — busca por "exportar"/"portabilidade" no backend e no frontend: zero ocorrências.
- **Não existe revogação de consentimento** (§9, Ponto Crítico 6).
- **Não existe registro de que um pedido foi atendido** — não há trilha de auditoria.
- **Apagar não apaga tudo:** os arquivos permanecem no armazenamento, o nome permanece no registro financeiro, e o nome permanece nos registros de execução.

**O que a federação precisa DEFINIR e ESCREVER antes de a política ir ao ar** (nada disso pode sair do código, porque não existe mecanismo):
1. Por qual canal o pedido chega, quem o recebe e quem o executa.
2. Como se confirma que quem pede é mesmo o titular (ou o responsável legal do menor), **sem que a verificação de identidade vire ela própria uma coleta excessiva**.
3. Qual prazo será prometido — a lei admite resposta imediata em formato simplificado ou até 15 dias na forma completa (art. 19); como agente de pequeno porte a federação teria prazo em dobro, **se esse enquadramento for confirmado**.
4. Onde fica registrado que o pedido foi recebido e atendido, já que não há auditoria e, portanto, não há como comprovar o atendimento depois.
5. O que se faz nos casos em que o sistema **não consegue executar** — em particular a eliminação.
6. **Se aceita pedido intermediado pelo clube**, ou se exige contato direto do titular. Como o atleta e o responsável não têm acesso ao sistema e toda a relação passa pelo clube, o pedido tende a chegar pelo clube.

**Problema imediato:** o termo que o responsável legal **já aceita hoje** promete três direitos que o sistema não entrega (§9, Ponto Crítico 6). O texto do termo terá de ser reescrito **junto com** a política, apontando o canal real.

---

## 13. O que o sistema NÃO faz

> Negativas **verificadas no código em 04/08/2026** — a política pode afirmá-las com segurança.
> Três negativas da versão de 02/08 foram **removidas desta lista porque viraram falsas**: a de que
> o sistema não envia e-mail, a de que não há autocadastro de usuário, e a lista de destinos externos.

- **NÃO existe login, portal ou área de acesso para atleta nem para responsável legal.** O enum de perfis tem exatamente dois valores, ADMIN_FHT e ADMIN_CLUBE (`Role.java:3-6`), e todos os dez métodos de `AtletaResource.java` exigem papel. **Reforço:** as pessoas cadastradas como comissão técnica do clube (técnico, auxiliar, segundo representante) **também** não ganharam login — a própria documentação da API diz que "nesta etapa ninguém aqui recebe login próprio" (`ClubeResource.java:244-246`; `V15:16-18`).
- **NÃO existe consulta pública por CPF.** Não há nenhuma tela, rota ou endereço que permita a alguém digitar um CPF e receber dados de volta. **⚠️ Precisão necessária:** hoje **existe endereço público que RECEBE um CPF** — o cadastro público de clube (`ClubeResource.java:34-49`, sem autenticação) passou a receber e gravar o CPF do representante legal (`ClubeForm.java:46-47`; `ClubeServiceImpl.java:89` e `:117`). **Redação correta:** *o sistema recebe CPF por formulário público, mas nunca o devolve nem permite pesquisar por ele.* Os endereços públicos hoje são **14**, não 13: login, renovação de token, solicitação de filiação de clube, vitrine de clubes, detalhe público de clube, árbitros públicos, competições públicas (lista e detalhe), diretores, documentos, galeria, notícias (lista e por slug) e o servidor de arquivos.
- **NÃO coletamos dados pessoais sensíveis (art. 5, II):** não há campo de saúde, atestado ou laudo médico, lesão, biometria, dado genético, origem racial, religião, filiação política ou sindical. **Reverificado incluindo V15 e V16 e as entidades novas** (`ClubePessoa.java`, `PagamentoLote.java`, `PagamentoLoteItem.java`): busca por saúde, atestado, médico, laudo, lesão, biometria, racial, religião, sindical e deficiência em todo o código do servidor e em todas as dezesseis migrations — **zero ocorrências**.
- **NÃO há reconhecimento facial nem qualquer processamento biométrico.** As fotos enviadas (foto 3x4 do atleta, foto do árbitro, foto do diretor, fotos da galeria) são apenas armazenadas e exibidas; não há processamento de imagem, comparação ou extração de características.
- **NÃO há perfilamento, scoring ou publicidade direcionada** sobre nenhum titular. **⚠️ Mas "decisão automatizada" merece cuidado:** há **duas rotinas que decidem sozinhas sobre a situação de uma pessoa**. (a) A rotina diária que apaga definitivamente o cadastro de atletas sem anuidade confirmada há 90 dias, sem intervenção humana (`AtletaExpurgoJob.java:37-51`). (b) Quando a federação dá baixa em um pagamento, o sistema percorre a lista e decide sozinho, atleta por atleta, quem passa a ATIVO e quem fica retido por falta de documentação (`PagamentoServiceImpl.java:222-239` e `:249-263`). **Redação sugerida:** manter a negativa de perfilamento, scoring e publicidade, e descrever essas duas rotinas com honestidade como regras automáticas de conferência e de descarte, informando que o titular pode pedir revisão ao Encarregado.
- **NÃO há ferramentas de rastreamento, analytics ou publicidade no site.** Busca refeita por Google Analytics, Google Tag Manager, Pixel da Meta, Hotjar, Clarity, Matomo, Plausible, PostHog, Mixpanel, Segment e reCAPTCHA: zero ocorrências reais.
- **NÃO utilizamos cookies.** O servidor não emite nenhum cookie e o site não lê nem escreve `document.cookie`. São exatamente duas chaves de armazenamento local (§10). Não há armazenamento de sessão nem banco local no navegador.
- **NÃO há widget, mapa, vídeo, feed de rede social ou chat de terceiro incorporado.** Os três ícones de rede social do rodapé continuam sendo marcadores sem destino (`Footer.tsx:45-47`). Não há trabalhador de segundo plano nem cache offline. Existem apenas **links de saída clicáveis**, que não carregam nada sozinhos: o WhatsApp da federação (`Contact.tsx:34`, número ainda de exemplo) e três links institucionais no rodapé (`Footer.tsx:16-18`).
- **NÃO há SMS, WhatsApp automático nem notificação push.** *(A parte "não enviamos e-mail" desta negativa antiga foi removida — ver §7.)*
- **NÃO há integração com gateway de pagamento, banco ou instituição financeira.** Reconfirmado depois da V16 — ver §5.
- **NÃO há integração, exportação ou envio de dados para a CBHb ou qualquer outra confederação/federação.** A única menção à CBHb no sistema é um link de cortesia no rodapé. **Ressalva:** se houver compartilhamento por planilha ou e-mail **fora** do sistema, isso precisa ser perguntado à federação.
- **NÃO vendemos nem cedemos dados a terceiros.** Não há venda nem cessão comercial em lugar nenhum do código. **Os destinos externos verificáveis hoje são:** (1) o **Google**, que recebe o IP e o navegador de todo visitante por causa das fontes; (2) o **provedor de servidor de e-mail**, quando o envio for ligado, que passará a transportar avisos com nome de clube, nome e e-mail do representante e a lista nominal dos atletas de cada pagamento; (3) o **Cloudflare R2** e o **Sentry**, previstos no código e desligados hoje. *(O ViaCEP saiu da lista.)*
- **O formulário "Fale com a FHT" do site NÃO envia nem armazena nada.** Reverificado em 04/08 e **vale insistir, porque agora o sistema TEM capacidade de enviar e-mail e mesmo assim este formulário não a usa.** A função de envio segue com três linhas, que apenas marcam a tela como enviada (`Contact.tsx:17-20`). Não existe requisição ao servidor e não existe endereço de contato no backend. **O cidadão continua vendo a confirmação de envio sem que nada tenha sido enviado.** A política **não pode** apontar esse formulário como canal do titular.
- **NENHUM endereço público devolve CPF, número de RG, data de nascimento, endereço, CEP, telefone ou e-mail de atleta.** O objeto público do atleta tem exatamente três campos: nome, posição e categoria (`AtletaVitrineDTO.java:10-14`).
- **NENHUM endereço público devolve dados do responsável legal do menor, nem os registros de consentimento.**
- **NENHUM endereço público devolve CNPJ do clube, documentos do clube, ou nome, e-mail, telefone e CPF do representante legal** (`ClubeVitrineDTO.java:13-21`; `ClubeVitrineDetalheDTO.java:13-22`). **Continua valendo mesmo com a chegada da comissão técnica:** as pessoas do clube (nome, CPF, e-mail, telefone) só são acessíveis por endereço autenticado (`ClubeResource.java:223-237`) e não entram em nenhum objeto público.
- **NENHUM endereço público devolve qualquer dado de pagamento** — todos os endereços do módulo financeiro exigem perfil (`PagamentoResource.java:37,50,69,80,95,109,132`).
- **NENHUM endereço público devolve CPF, RG, data de nascimento, telefone, e-mail, número de registro, formação ou documentos de árbitro** — o mapeamento público devolve apenas seis campos (`ArbitroMapper.java:36-45`).
- **Atletas que não estão ATIVOS não aparecem no site. Clubes não aprovados ou não marcados como visíveis não aparecem na vitrine. Árbitros não credenciados não aparecem. Notícias em rascunho não são acessíveis publicamente** — os quatro filtros reverificados um a um em §4.
- **NÃO existe mais formulário público de auto-inscrição de árbitro** — foi removido pela migration V14; criação, alteração e exclusão exigem ADMIN_FHT (`ArbitroResource.java:30`, `:49`, `:68`).
- **A senha NUNCA é armazenada em texto puro e NUNCA é devolvida por nenhuma resposta** — apenas o hash BCrypt, com sal aleatório. **⚠️ Mas o contexto mudou:** a senha **agora é coletada do público**, digitada no formulário de filiação do site e trafegando pela internet até o servidor (`Registration.tsx:107`; `ClubeForm.java:53-56`). Isso torna **obrigatório** que o site rode sob conexão segura em produção e coloca a credencial na lista de dados pessoais coletados.
- **As mensagens de erro da API não vazam dados pessoais nem detalhes internos** (`GlobalExceptionMapper.java:49-53`).
- **O sistema tem proteção contra manipulação de caminho de arquivo (`../`)** na leitura e na gravação. *Não substitui controle de acesso — o servidor de arquivos continua sem exigir autenticação.*
- **Um clube só enxerga os próprios atletas, o próprio cadastro, as próprias pessoas e os próprios pagamentos** — verificação de escopo por lista de permissão explícita, com recusa em vez de acesso amplo (`Escopo.java:24-42`, aplicada também em `PagamentoServiceImpl.java:292-299` e `ClubeServiceImpl.java:399-404`).
- **O CPF do atleta, o do responsável e o do representante NÃO são usados para consulta a nenhuma base externa** (Receita Federal, bureaus de crédito). A única validação é o cálculo local do dígito verificador. **Com a saída do ViaCEP, o sistema não consulta nenhuma base externa com dado de titular.**
- **NÃO existem, hoje, dados de atleta vinculados a competições:** o módulo não possui tabela de inscrição, escalação ou check-in, e nenhuma migration nova (V15, V16) criou esse vínculo. *(A menção da V15 ao técnico "que define a escalação" é intenção futura em comentário — `V15:14`.)*

---

## 14. ⚠️ LACUNAS — o que a política NÃO pode prometer hoje

> Esta é a seção mais importante do documento. Cada item aqui é algo que o sistema **não faz**,
> e que portanto a política não pode afirmar sem virar declaração enganosa.
>
> **O que foi RESOLVIDO desde 02/08 saiu desta lista** e virou afirmação positiva no corpo do
> documento: o CPF do representante (agora coletado e armazenado — §1), o fluxo de pagamento
> inconsistente (agora coerente ponta a ponta — §1 e §3), a conta de clube com senha aleatória
> inutilizável (agora a senha é escolhida pelo titular — §1), as credenciais de teste no código do
> site (removidas — §11) e a coleta de CEP/logradouro/número de atletas (não é mais feita — §1).

### [ALTA] A política NÃO pode dizer "você pode excluir seus dados pelo painel" nem "atendemos pedidos de exclusão pelo sistema".

Não existe canal de autoatendimento para nenhum titular. O único DELETE de atleta é restrito ao ADMIN_FHT, e **não existe endereço de exclusão de clube nem de conta de acesso em toda a API** — reverificado varrendo todos os arquivos de endpoints. A única exclusão executável por alguém fora da federação é a remoção de uma pessoa da comissão técnica pelo próprio clube (§12), e mesmo essa **não é autoatendimento do titular**.

**Por que importa:** e o quadro **PIOROU**. Antes, a conta de acesso só nascia na aprovação; hoje ela é criada já na solicitação pública, com o hash da senha escolhida. Rejeitar apenas desativa esse login. **Um clube que teve a filiação NEGADA permanece no banco para sempre com nome, CPF, e-mail e telefone do representante, os PDFs de ata e estatuto, um registro na tabela de pessoas e uma conta de usuário com hash de senha — nada disso é apagado por nenhum código.** Conflita com o art. 18, IV/VI e com o art. 15, I. Redigir como: *pedidos de exclusão são feitos por e-mail ao Encarregado e processados manualmente.*

### [ALTA] A política NÃO pode dizer "a exclusão do cadastro elimina seus documentos".

Não existe nenhum código de exclusão de arquivo no backend inteiro — reconfirmado em 04/08, zero ocorrências. O serviço de armazenamento tem apenas dois métodos, os dois de gravação (`R2StorageService.java:75` e `:103`). Apagar o atleta remove só a linha do banco (`AtletaServiceImpl.java:447-451`).

**Por que importa:** e há **duas agravantes novas**. (1) Surgiu uma **quinta categoria de arquivo** — o comprovante bancário do pagamento em lote (`PagamentoServiceImpl.java:129-131`) —, que também nunca é apagado, e nem sequer existe endereço que apague um lote. (2) **Mesmo apagando o atleta, o nome completo dele permanece no livro de pagamentos**, por decisão de projeto (`V16:36-43`). Um pedido de eliminação (art. 18, VI) **não é integralmente atendido pelo sistema, nem pela via administrativa** — sobram pelo menos três cópias do nome: a tabela financeira, os registros de execução e os arquivos no armazenamento. **Ou a federação assume isso na política como retenção por obrigação fiscal, com prazo declarado, ou o sistema precisa ganhar uma rotina de anonimização antes do lançamento.**

### [ALTA] A política NÃO pode dizer que a autorização de uso de imagem pode ser revogada a qualquer momento.

Reverificado em 04/08, **sem uma vírgula de mudança**: o comando que gravaria a data de revogação existe na entidade (`Consentimento.java:89`) e **nunca é chamado por nenhuma linha de código** — a única referência a ele em todo o repositório é a própria definição. Não há endereço de API, rota, botão ou rotina administrativa. As telas até exibem o selo "revogado" (`ClubeDashboard.tsx:816-818`; `AdminDashboard.tsx:409-411`), que nunca aparecerá.

**Por que importa:** é o pior caso, porque o termo **já mostrado** ao responsável promete a revogação por escrito, com estas palavras: "É opcional e pode ser revogada a qualquer momento" (`ClubeDashboard.tsx:1167` e `:1190`). **Promessa publicada e não cumprida.** Correção mínima sugerida: um comando de revogação chamável pelo administrador e pelo clube.

### [ALTA] A política NÃO pode dizer que a publicação de nome ou imagem depende de autorização.

A finalidade `IMAGEM_PUBLICA` é gravada (`AtletaServiceImpl.java:158-161`) e **nunca consultada** por nenhum ponto do sistema — vitrine, galeria e notícias publicam independentemente de haver consentimento registrado. **Marcar ou não marcar a caixa não muda absolutamente nada.**

**Por que importa:** o consentimento coletado é **decorativo**, e contradiz frontalmente o termo apresentado ao usuário. Se a política afirmar que a publicação é condicionada à autorização, será falso no dia da publicação.

### [ALTA] A política NÃO pode afirmar que dados de menores não são publicados no site.

Nome completo + posição + categoria (Sub-12 a Sub-18) de todo atleta ATIVO vão ao ar no modal público do clube, sem filtro de idade e sem checagem de consentimento (`ClubeServiceImpl.java:271-291`; objeto em `ClubeVitrineDetalheDTO.java:21`).

**Por que importa:** nome + faixa etária + clube + cidade de uma criança identificada, visíveis a qualquer visitante anônimo. **É o item de maior exposição do sistema sob o art. 14.** A decisão jurídica continua pendente e **o código continua publicando hoje**.

### [ALTA] A política NÃO pode afirmar que os documentos só são acessíveis por pessoal autorizado.

`GET /api/files/{path}` não tem nenhuma anotação de segurança — o arquivo inteiro tem 55 linhas e o comentário no topo admite: "Público e sem auth de propósito" (`FileResource.java:16-54`). A única proteção é o segredo da URL, que não expira, não é revogável e não verifica quem pede.

**Por que importa:** **a superfície exposta AUMENTOU.** Além de RG de atletas (inclusive menores), RG de árbitros e ata/estatuto de clubes, agora passa pelo mesmo endereço aberto o **comprovante bancário** do pagamento da anuidade. É ausência de controle de acesso, não "medida de segurança" (art. 46). A mitigação planejada (balde privado no R2 com URL assinada) **continua não executada**: as credenciais seguem vazias e o sistema cai silenciosamente no armazenamento local, apenas registrando um aviso (`R2StorageService.java:57-59`).

### [ALTA] A política NÃO pode dizer que registramos quem acessou ou alterou dados pessoais — mas pode citar UMA exceção, com precisão.

**A afirmação central continua verdadeira, com o alcance corrigido:** não existe tabela, entidade nem serviço de auditoria em nenhuma das **dezesseis** migrations (não catorze, como dizia a versão anterior). A busca por "auditoria" em todo o backend retorna **uma única ocorrência, e é um comentário admitindo a ausência** (`AtletaServiceImpl.java:392`).

**A exceção, que a política pode e deve citar:** a migration V16 criou o **primeiro campo do sistema inteiro que grava QUEM praticou um ato**. A tabela de pagamentos tem a coluna `baixado_por` (`V16:25-26`), preenchida com o **e-mail do administrador** que confirmou ou recusou o pagamento (`PagamentoServiceImpl.java:214` e `:278`), junto com data e hora. Cobre **exclusivamente** a conferência de pagamentos.

**Por que importa:** muda a redação de uma frase que a política provavelmente vai conter. Em vez de "não registramos acessos" (impreciso) ou "registramos todas as operações" (falso e perigoso), a redação correta é: *o sistema não mantém trilha de auditoria; apenas a conferência de pagamentos registra o autor e a data do ato.* Tudo o mais permanece sem rastro: aprovar um clube, aprovar ou rejeitar um atleta, editar o cadastro de um menor, consultar a ficha completa de qualquer pessoa, baixar o RG de uma criança — **nada disso registra o autor**. Continua impossível responder "quem viu os dados desta criança", e impossível comprovar que um pedido de titular foi atendido.

### [ALTA] A política NÃO pode oferecer o formulário de contato do site como canal do titular.

Ele não envia nada e mesmo assim exibe "MENSAGEM ENVIADA! Nossa equipe retornará em breve" (`Contact.tsx:17-20`).

**Por que importa:** um pedido de exclusão enviado por ali **evapora**, enquanto o prazo do art. 18, §6º corre. Além de prática enganosa. **O que mudou é só o custo da correção:** o sistema agora possui infraestrutura de e-mail funcionando, usada para os avisos de filiação e pagamento — implementar o envio deixou de ser trabalho do zero. A recomendação permanece: **desativar o formulário ou implementá-lo ANTES de publicar a política, e nunca apontar a política para ele.**

### [ALTA] NÃO EXISTE página de política de privacidade nem rota para ela.

A busca pela palavra "privacidade" (e por "privacy") em todo o frontend e em todo o backend retorna **zero ocorrências**. A lista de rotas do site tem exatamente cinco endereços — página inicial, notícias, post de notícia, login e os dois painéis (`App.tsx:51-64`) — e nenhuma rota de política.

**Por que importa:** a política precisa de onde morar antes de existir. E **três promessas já publicadas** terão de ser sustentadas por ela: no rodapé, "Dados protegidos pela LGPD" (`Footer.tsx:105-107`); no formulário de filiação, "Cadastro gratuito · Dados protegidos pela LGPD — Lei Geral de Proteção de Dados" (`Registration.tsx:195-198`); e o aviso de cookies, que repete a mesma promessa (`CookieBanner.tsx:22`). Criar a rota e vinculá-la no rodapé, no aviso de cookies e, principalmente, **dentro dos dois formulários que coletam dado pessoal** (filiação de clube e cadastro de atleta).

### [ALTA] NÃO há Encarregado/DPO nomeado em lugar nenhum do sistema, e os canais existentes são frágeis.

O link de WhatsApp segue apontando para `wa.me/556300000000` — um número que é só zeros (`Contact.tsx:34`). As caixas `contato@fht.org.br` e `imprensa@fht.org.br` não foram confirmadas como reais e monitoradas.

**Por que importa:** e ficou **mais urgente**. O endereço `contato@fht.org.br` deixou de ser apenas um texto no site e virou **destinatário técnico do sistema** (`application.properties:49`; `EmailService.java:34-36`). Toda nova solicitação de filiação e todo pagamento enviado disparam mensagem para lá — e a mensagem de pagamento leva **a lista nominal dos atletas cobertos**, inclusive menores. Se essa caixa não existir, não for monitorada, ou for um encaminhamento para o e-mail pessoal de alguém, **isso precisa ser resolvido e declarado antes de publicar a política**. Sem canal real e monitorado, todo direito declarado vira promessa vazia.

### [MEDIA] A política NÃO pode dizer que há exportação ou portabilidade de dados (art. 18, V).

Busca por "exportar"/"portabilidade" no backend e no frontend: zero ocorrências. **Por que importa:** descrever o direito é obrigatório, mas o atendimento tem que ser declarado como **manual**, por solicitação ao Encarregado.

### [MEDIA] A política NÃO pode dizer que o titular pode acessar e corrigir seus dados no sistema — e a exceção ficou mais estreita.

O único autoatendimento é o representante do clube em `/clube > Meus Dados` — **e ele não consegue corrigir o próprio CPF**, porque o campo ficou de fora dos editáveis (`ClubeUpdateForm.java:11-20`; `ClubeServiceImpl.java:169-177`). Ele apenas o vê (`ClubeResponseDTO.java:20`). **Um CPF digitado errado no cadastro público não pode ser corrigido por ninguém através do sistema — nem pelo titular, nem pela federação, nem pelo administrador. Só por comando direto no banco.**

**Por que importa:** colide com o art. 18, III (correção de dados incompletos, inexatos ou desatualizados) e com o art. 6, V (exatidão). **É alteração de poucas linhas — preferível corrigir o sistema antes de publicar.**

### [MEDIA] Os dados do mesmo representante estão em TRÊS lugares que não se sincronizam.

Nome, e-mail, telefone e CPF do representante existem em triplicata: no cadastro do clube (`Clube.java:22-35`), na ficha de pessoa do clube criada junto com a filiação (`ClubeServiceImpl.java:114-123`) e na conta de acesso (`Usuario.java:11-18`; `ClubeServiceImpl.java:104-111`). **Nenhuma das três é atualizada quando outra muda:** editar o clube altera só o clube (`:169-179`); editar a pessoa altera só a pessoa (`:346-351`); e **não existe em toda a API nenhum endereço que edite uma conta de acesso** — só há criação (`AuthResource.java:99-127`; `AdminResource.java:69-95`).

**Por que importa:** um representante que peça a correção do próprio e-mail terá o dado corrigido em um lugar e desatualizado em outros dois, **e o e-mail de login continuará sendo o antigo**. O art. 18, III e o art. 6, V pressupõem que corrigir uma vez corrija em todo lugar. Se a política prometer correção, o procedimento manual precisa incluir **expressamente as três cópias** — ou o sistema precisa passar a propagar a alteração.

### [MEDIA] A política NÃO pode declarar prazos de retenção que o sistema não cumpre, nem descrever o descarte como era antes.

Só existe **um** prazo em código: 90 dias, contados da data de cadastro, para atleta em "aguardando pagamento" (`application.properties:60`; `AtletaExpurgoJob.java:33`; `AtletaRepository.java:36-38`). **Mas o critério mudou:** hoje esse status inclui quem **já pagou e espera a conferência** — ver §8. A política **não deve** prometer que o descarte atinge apenas "cadastros abandonados".

**Por que importa:** e a categoria de dado criada em agosto — os registros de pagamento, com nome do atleta, valor e comprovante bancário — **não tem prazo de retenção nenhum**, nem automático nem declarado, e foi desenhada expressamente para sobreviver à exclusão do atleta. Todo o resto continua retido indefinidamente, inclusive árbitros que apenas se candidataram no antigo formulário público e nunca terão relação com a federação.

### [MEDIA] A política NÃO pode afirmar que a base legal para publicar árbitro e diretor é o consentimento — e a lista de titulares sem consentimento cresceu.

Não existe **nenhum** registro de consentimento para árbitro, diretor, autor de publicação ou pessoa fotografada — a tabela de consentimento é exclusiva de atleta, com vínculo obrigatório (`V12:35`). Não existe botão "não quero aparecer no site": a única forma de sair da vitrine é o administrador suspender ou apagar o registro.

**Por que importa:** surgiu em agosto **mais uma categoria de pessoa sem qualquer registro de consentimento** e, diferente de árbitros e diretores, essa nem sequer é pública — **as pessoas da comissão técnica do clube** (`V15:19-35`). Segundo representante, técnico e auxiliares passaram a ter cadastro com nome, CPF, cargo, e-mail e telefone, preenchido pelo representante do clube. **Não têm login, não recebem aviso nenhum, não consentem e não conseguem acessar nem corrigir os próprios dados.** A lista de titulares da política precisa incluí-las, e a base legal precisa ser escrita expressamente — **não pode ser consentimento, porque não existe**.

### [MEDIA] A política NÃO pode chamar o aviso atual de "gestão de consentimento de cookies".

Tudo o que diz respeito ao aviso continua verdadeiro e sem qualquer mudança: só há ACEITAR e Fechar, não há recusa, não há categorias, não há tela para revisar a escolha depois, "Fechar" não persiste nada, e o aviso só é renderizado na página inicial (`CookieBanner.tsx`, arquivo inteiro; `App.tsx:41`). O texto "Este site utiliza cookies" segue factualmente errado.

**Por que importa:** **melhora relevante a registrar:** o serviço externo de busca de endereço por CEP (ViaCEP) **foi removido**, e o endereço do atleta nem é mais coletado. Portanto, hoje o **único** terceiro que recebe dados do navegador do visitante é o Google, pelas fontes (`index.html:13-15`). A correção mais barata continua sendo auto-hospedar as fontes e trocar o aviso por um informe honesto de armazenamento estritamente necessário — com a vantagem de que, feito isso, **não sobra nenhuma transferência a terceiro pelo navegador**.

### [MEDIA] A política NÃO pode afirmar que só coletamos o necessário enquanto houver campos coletados sem uso.

**Metade foi resolvida:** CEP, logradouro, número e bairro **não são mais coletados** de atletas (`ClubeDashboard.tsx:946`). *Atenção: os campos continuam existindo na API (`AtletaForm.java:40-53`) e no banco, então cadastros feitos antes de agosto ainda guardam esses endereços, e ninguém os apagou.*

**Continua valendo:** **órgão emissor do RG** e **naturalidade (cidade e UF)** seguem sendo pedidos e enviados no cadastro de atleta, inclusive de menores (`ClubeDashboard.tsx:941-943`), e seguem sem aparecer em nenhuma resposta do sistema (`AtletaResponseDTO.java:15-46`). São coletados e nunca usados. O campo "sexo" do árbitro continua na mesma situação. *(O cargo do representante do clube saiu desta lista — passou a ser devolvido e editável.)*

**Por que importa:** choque direto com o princípio da necessidade (art. 6, III). Ou se declara a finalidade, ou se remove a coleta antes de publicar.

### [MEDIA] A política NÃO pode afirmar que adotamos criptografia dos dados ou que mantemos backups.

Continua valendo integralmente — ver §11 para a lista afirmativa completa e a lista de ausências. **Nada foi acrescentado desde 02/08.**

### [MEDIA] A política NÃO pode descrever a evidência de consentimento como sendo do responsável legal.

O endereço de rede e a identificação do navegador gravados vêm da requisição feita pelo **representante do clube** (`AtletaServiceImpl.java:176-180`). Na regularização retroativa por edição, não há evidência técnica nenhuma: o campo recebe o texto "regularizado por" seguido do login do operador (`:311-312`).

**Por que importa:** enfraquece a evidência exigida pelo art. 14, §1º c/c art. 6, X. **A política precisa ser sincera:** o consentimento do responsável legal é coletado **por intermédio do clube**, e a evidência registrada é a do dispositivo do clube — não a do responsável.

### [MEDIA] O TEXTO do termo aceito não é armazenado — só o número da versão.

A versão é uma constante fixa `'1.0'` escrita no código (`Consentimento.java:23`, aplicada em `:41`). O texto em si mora apenas dentro da tela (`ClubeDashboard.tsx:1157-1168` e `:1188-1190`) e não é guardado em lugar nenhum.

**Por que importa:** se alguém alterar a redação da tela sem trocar a constante, **será impossível reconstruir o que a pessoa aceitou**. E a publicação da política vai, com quase certeza, gerar uma **versão 2.0** do termo — porque o termo atual promete direitos que não existem e não menciona política nenhuma. **O momento de resolver o versionamento do texto é ANTES, não depois:** guardar o texto integral aceito, ou pelo menos congelá-lo em arquivo imutável associado ao número da versão.

### [MEDIA] Não existe recuperação nem troca de senha, nem bloqueio por tentativas, limite de requisições ou verificação anti-robô.

Zero ocorrências de "esqueci"/"forgot"/"reset"/"recuperar" em todo o repositório; o login aceita tentativas ilimitadas (`AuthResource.java:51-69`); não há revogação de token no servidor.

**Por que importa:** e **ficou pior**. Agora que a senha é escolhida pelo clube e é o único meio de acesso, a ausência de recuperação tem consequência prática imediata. **O próprio e-mail automático de aprovação já instrui: "Se esqueceu a senha, fale com a federação"** (`EmailService.java:80-81`). Ou seja, o sistema **assume por escrito** que a redefinição de senha acontece por canal informal, fora de qualquer controle. Na prática, será por WhatsApp ou telefone, sem registro. **A política NÃO pode prometer "você pode alterar sua senha a qualquer momento" nem descrever um procedimento de recuperação, porque não existem** — e a federação precisa definir, antes do lançamento, como vai redefinir a senha de um clube sem virar canal informal. Continua existindo também o administrador de instalação com senha `123456`, só trocável por comando direto no banco.

### [MEDIA] O registro de execução (log) grava o nome completo de atletas — agora em DOIS pontos.

(1) Ao apagar um cadastro sem pagamento confirmado, o sistema escreve o identificador **e o nome completo** do atleta (`AtletaExpurgoJob.java:44-46`). (2) Quando a federação ativa um atleta dispensando a baixa, escreve o identificador, **o nome completo** e o login de quem autorizou (`AtletaServiceImpl.java:392-394`) — o comentário no código admite que isso é substituto improvisado da auditoria inexistente.

**Por que importa:** o nome de um menor **sobrevive ao próprio descarte do cadastro**, dentro dos logs da hospedagem, sem prazo de retenção definido. Contradiz a finalidade da rotina de descarte. **Trocar o nome pelo identificador é correção de uma linha, nos dois pontos.** Some-se a isso que o log também recebe o endereço de cada destinatário de e-mail e o assunto (`EmailService.java:159`).

### [MEDIA] O e-mail do administrador da federação circula para fora da federação.

O campo que registra quem deu baixa num pagamento guarda o **e-mail de login do administrador** (`PagamentoServiceImpl.java:214` e `:278`; `JwtService.java:20` define o e-mail como identificador do token) e **é devolvido também ao clube**, no detalhe e no histórico de pagamentos (`PagamentoLoteDTO.java`, campo `baixadoPor`; `PagamentoResource.java:67-77`, acessível a ADMIN_CLUBE). Hoje a tela do clube não o exibe, mas o dado é entregue.

**Por que importa:** é dado pessoal de funcionário/dirigente circulando para fora da federação sem finalidade declarada. Não é grave, mas a política trata a federação como controladora e precisa cobrir também os dados dos próprios dirigentes. **A correção técnica é trivial** (gravar o nome ou o identificador interno em vez do e-mail) e vale fazer antes de publicar.

### [MEDIA] Campos de texto livre cujo conteúdo ninguém controla, e que saem por e-mail.

O lote de pagamento tem **dois**: uma observação escrita pelo clube ao enviar e um motivo de recusa escrito pela federação (`V16:21-22`). O motivo de recusa **é enviado por e-mail ao representante do clube** (`EmailService.java:137-147`). O mesmo vale para o motivo de rejeição de clube (`EmailService.java:87-97`) e de atleta. **Campo aberto significa que qualquer coisa pode ser digitada ali, inclusive dado pessoal de terceiro, sem validação** — e sai do sistema.

### [MEDIA] Efeito colateral de controle de acesso: trocar o e-mail do clube pode deixar o acesso aberto.

O bloqueio e o desbloqueio da conta procuram o usuário **pelo e-mail gravado no cadastro do clube** (`ClubeServiceImpl.java:233-236`), mas o clube pode editar esse e-mail livremente (`ClubeUpdateForm.java:18`; `:175`) e a conta de login não é atualizada junto. **Depois de uma troca de e-mail, suspender ou rejeitar o clube não encontra mais a conta — e o acesso continua aberto.** **NÃO VERIFICADO em execução**, mas é o que o código determina.

**Por que importa:** a política **não pode prometer que a suspensão do clube encerra o acesso**.

### [MEDIA] A política não deve ser redigida a partir da documentação interna do projeto.

Há divergências reais: o `docs/MODULO-ATLETA-FLUXO.md` ainda descreve o expurgo com prazo de 24 horas em oito trechos do corpo, corrigindo só na linha 178; a documentação da API descreve comportamentos inexistentes, como um erro de CNPJ duplicado que nunca é verificado (`ClubeResource.java:42`).

**Por que importa:** e agora com um exemplo a mais — **o próprio inventário envelheceu em dois dias**. Foi gerado em 02/08 e, nos dois dias seguintes, cinco entregas mudaram o sistema. **Para um documento jurídico, a fonte da verdade é o código, e a data da verificação precisa constar do documento.** Recomenda-se registrar na política (ou no dossiê que a fundamenta) a data e o ponto exato do código verificado, porque **este sistema muda semanalmente**.

### [BAIXA] O Swagger UI e o mapa completo da API ficam públicos inclusive em produção.

Configuração de sempre incluir a documentação, servida em `/swagger` (`application.properties:22`). Expõe o mapa completo, incluindo endereços administrativos. Não é matéria da política, mas é do art. 46.

### [BAIXA] O token de sessão fica no armazenamento local e não em cookie httpOnly.

Contém nome e e-mail legíveis (o token é assinado, não criptografado). Escolha comum e aceitável, mas a política **não deve descrevê-la como "armazenamento seguro"**. Reforça a importância de nunca adicionar scripts de terceiros ao site.

---

## 15. Cobertura: o que este inventário resolve e o que ainda falta

Avaliando este documento contra a estrutura mínima de uma política de privacidade brasileira:

**COBERTOS, prontos para uso:**
- **(c) Quais dados são coletados e de quem** — §1, organizada por titular, com referência a arquivo e linha.
- **(c-bis) Como são coletados** — §2, com o fato central de que quase nada vem do próprio titular.
- **(d) Finalidade e base legal de cada tratamento** — §3, com a ressalva correta de que a decisão é do advogado.
- **(e) Compartilhamento e operadores** — §5, atualizada e exaustiva.
- **(f) Transferência internacional** — §6, seção própria, com a lista completa e o status de cada destino.
- **(g) Prazo de retenção** — §8, honesta ao dizer que só existe um prazo e que todo o resto é indeterminado.
- **(i) Medidas de segurança** — §11, com a lista afirmativa curta e a lista de ausências.
- **(j) Cookies e armazenamento** — §10, com o inventário técnico factual.
- **(k) Crianças e adolescentes** — §9, a parte mais desenvolvida do documento.

**PARCIALMENTE COBERTOS — dependem de decisão da federação:**
- **(h) Direitos do titular** — §12 cobre bem o lado negativo (o que não se pode prometer) e lista as seis decisões de procedimento que só a federação toma.

**AUSENTES POR COMPLETO, e nenhum deles é obtenível do código:**
- **(a) Identificação do controlador.** Nenhum arquivo do repositório contém razão social, CNPJ ou endereço completo da federação. O que o site publica é preenchimento: "FHT — Federação de Handebol do Tocantins", "Palmas, Tocantins — Brasil" e "CEP: 77000-000" (`Contact.tsx:149-153`) — **esse CEP é genérico, não corresponde a endereço nenhum**. No rodapé, apenas "FHT — Federação de Handebol do Tocantins © 2025 · Palmas, TO" (`Footer.tsx:103`). Não há número, logradouro, bairro nem CNPJ em lugar algum.
- **(b) Encarregado e canal do titular.** Nenhum Encarregado nomeado. Os três canais anunciados têm problemas verificados: o formulário não envia nada, o WhatsApp é um número de zeros, e as duas caixas de e-mail não foram confirmadas.
- **(l) Vigência, política de alterações e data da última atualização.** Não existe página, rota, link nem qualquer controle de versão de texto jurídico. **Agravante com prazo:** o sistema já registra consentimentos hoje gravando apenas o **número** da versão do termo — se o texto mudar sem alguém trocar a constante, será impossível reconstruir o que cada responsável aceitou (§14).

**A leitura prática:** este inventário é um retrato técnico completo do sistema, **e é insuficiente como insumo único de redação**, porque três dos doze pontos obrigatórios dependem inteiramente de informações que só a federação possui. **Sem razão social, CNPJ, endereço, Encarregado e hospedeiro definidos, não existe política possível — existe apenas um rascunho com lacunas.** E publicar uma política com endereço fictício e telefone de zeros é **pior do que não publicar**: transforma um documento de conformidade em prova de descuido.

---

## 16. Perguntas que só a FHT responde

### Sobre o controlador (todas indispensáveis, todas ausentes)
- Qual a **razão social exata** da entidade, conforme o estatuto?
- Qual o número do **CNPJ**?
- Qual o **endereço completo da sede** — logradouro, número, bairro, cidade, estado e CEP real? Hoje o site publica "Palmas, Tocantins" e um CEP genérico de zeros.
- Qual o **telefone institucional verdadeiro**?
- Quem, com **nome e cargo**, assina a política em nome da federação?
- A federação é associação sem fins lucrativos e pretende se declarar **agente de tratamento de pequeno porte**? Isso muda prazos e obrigações.

### Sobre o Encarregado e os canais
- Quem será o **Encarregado pelo Tratamento de Dados Pessoais (DPO)**? Precisa de nome e qualificação para constar da política (art. 41). Pelo mapa de cargos da diretoria, os candidatos naturais são o Presidente ou o diretor da área administrativa.
- Qual será o **e-mail oficial do Encarregado**? Ele precisa **existir**, ser monitorado e ter alguém responsável por responder dentro dos prazos do art. 18. Quem responde na ausência dele?
- As caixas **`contato@fht.org.br`** e **`imprensa@fht.org.br`** existem de fato, estão ativas e são monitoradas? **Em qual provedor estão hospedadas** (Google, Microsoft, Zoho, servidor próprio)? Essa resposta define uma linha inteira da seção de transferência internacional.
- A caixa `contato@fht.org.br`, que passará a receber automaticamente **listas nominais de atletas menores**, será a mesma do Encarregado ou outra? **Quantas pessoas têm acesso a ela?**
- O **número de WhatsApp** exibido no site é preenchimento (só zeros). Qual é o número real, e ele será canal de atendimento de titular ou só de contato geral?
- Qual será o **prazo prometido de resposta** a pedidos de titulares (art. 19)?
- **Como a federação vai receber e processar, na prática**, um pedido de exclusão ou de revogação de imagem, já que não há mecanismo no sistema? Quem executa, e **como se registra o atendimento**, se não há auditoria? **Aceita-se pedido intermediado pelo clube**, ou exige-se contato direto do titular?

### Sobre o envio de e-mail (decisão prévia obrigatória)
- A federação quer **ligar o envio automático antes do lançamento**, ou manter o modo simulado?
- Se ligar, **qual servidor de saída será usado**? O valor padrão configurado no projeto é o do **Google**, e mantê-lo cria transferência internacional de dado de menor, exigindo contrato de operador e declaração expressa na política.
- **A lista nominal de atletas menores realmente deve sair do sistema por e-mail**, ou basta o aviso remeter ao painel autenticado? *(Esta é a pergunta de maior impacto de todo o levantamento.)*

### Sobre a hospedagem
- **Onde o sistema vai efetivamente rodar em produção, e onde ficará o banco de dados?** A esteira de publicação que está no repositório aponta para **Railway** (EUA), mas está numa pasta em que o GitHub não a executa. O provedor será nomeado como operador na política e determina se há ou não transferência internacional da base inteira.

### Sobre menores (as mais urgentes)
- A FHT **autoriza a publicação de NOME COMPLETO DE ATLETAS MENORES** na vitrine pública do site? **É a decisão jurídica mais urgente — o código já publica hoje.** Alternativas: exibir só o primeiro nome, exibir só o total por categoria, ou condicionar à autorização do responsável (o que exigiria implementar a checagem, que hoje não existe).
- Qual a política da federação para **fotos de menores** na galeria e nas notícias? Autorização por evento (termo assinado na inscrição da competição), autorização individual no cadastro, ou não publicar rostos identificáveis de categorias de base?
- Há **idade mínima** para cadastro de atleta? Hoje não existe nenhuma no sistema.

### Sobre a comissão técnica (categoria nova)
- Os **técnicos e auxiliares** cadastrados pelos clubes **serão informados** de que seus dados estão no sistema? De quem é esse dever — provavelmente do próprio clube, o que deveria virar **obrigação contratual da filiação**.
- Existe algum **termo, ficha ou autorização assinada por eles fora do sistema**?
- **Pode haver menor de idade** exercendo essas funções?

### Sobre o financeiro (categoria nova)
- Existe **prazo legal, contábil ou fiscal** que obrigue a federação a guardar os comprovantes de pagamento e a lista nominal dos atletas pagos? **Por quantos anos?** Essa resposta é o que permite justificar a retenção que hoje sobrevive à exclusão do cadastro.
- Qual é a **chave Pix oficial** da federação, já que o sistema exige o comprovante de um pagamento que hoje não tem para onde ser feito?
- A federação orienta os clubes a **enviar comprovantes com o mínimo de informação possível**? O comprovante pode conter dados de um terceiro pagador (um pai, um patrocinador) que a federação não tem como localizar depois.

### Sobre retenção
- Por quanto tempo guardar o **cadastro de um atleta APÓS a desfiliação** ou o fim da anuidade? Há norma da CBHb, do sistema desportivo ou obrigação contábil/fiscal que imponha prazo mínimo?
- Por quanto tempo guardar **cadastros de clubes REJEITADOS**, que hoje ficam para sempre com nome, CPF, e-mail e telefone do representante e os PDFs de ata e estatuto — **mais uma conta de acesso com hash de senha**?
- Por quanto tempo guardar **contas de acesso desativadas** e **árbitros que se candidataram e nunca foram credenciados** (CPF, RG e documentos preservados pela migration V14)?
- Qual será o **prazo de retenção dos registros de execução (logs)** da hospedagem, que contêm nome completo de atletas apagados?

### Sobre práticas FORA do sistema (o código nunca revelará)
- A federação **envia listas de atletas por planilha ou por e-mail** para a CBHb, para a Secretaria de Esportes, para o Governo do Estado, para patrocinadores ou para organizadores de competição?
- A federação exige inscrição de atletas em **alguma plataforma nacional** (ex.: sistema da CBHb) que receba esses dados? Se sim, quais campos são enviados?
- Usa algum **grupo de mensagem instantânea** com dados de atletas? **Guarda fichas em papel?**

*Tudo isso é tratamento de dado pessoal que a política precisa cobrir, mesmo acontecendo fora do sistema.*

### Sobre correções antes do lançamento
- A federação **autoriza auto-hospedar as fontes** do site, eliminando a transferência de IP de todo visitante para o Google? **É a correção de melhor custo-benefício de todo o levantamento** — elimina a única transferência internacional em curso.
- O formulário **"Fale com a FHT"** deve ser **desativado ou implementado** antes do lançamento? Hoje ele afirma ao cidadão que a mensagem foi enviada e não envia nada.
- A federação aceita manter os **campos coletados e nunca usados** (órgão emissor do RG, naturalidade, sexo do árbitro), ou autoriza removê-los dos formulários antes do lançamento? Removê-los simplifica a política e resolve a questão da minimização.
- A federação quer manter o **Sentry** (monitoramento de erros, servidores nos EUA)? Se sim, a política precisa declarar transferência internacional, será necessário contrato de operador, e recomenda-se ativar filtro de dados pessoais antes.
- A federação vai assumir **compromisso público com algum prazo** para corrigir os pontos críticos (arquivos sem autenticação, exclusão incompleta, revogação inexistente, descarte que apaga atleta já pago)? **A frase "Dados protegidos pela LGPD" já está publicada no site — sem prazo definido, ela é declaração enganosa.**
