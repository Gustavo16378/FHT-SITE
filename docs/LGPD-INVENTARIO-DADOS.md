# Inventário de Dados Pessoais — insumo para a Política de Privacidade

> **Como este documento foi feito:** levantado DO CÓDIGO em 02/08/2026, por varredura automatizada
> de 6 frentes + verificação manual dos pontos críticos. A fonte da verdade é o código, não a
> documentação do projeto (que em vários pontos está desatualizada).
>
> ⚠️ **Isto NÃO é a política de privacidade nem parecer jurídico.** É o retrato técnico do que o
> sistema faz, para que o advogado redija a política sem prometer o que o sistema não cumpre.
> A controladora dos dados é a FHT, não o desenvolvedor.

---

## 1. Categorias de dados, por titular

### Atleta (inclui menores de 12 a 17 anos)

**Dados:** Nome completo (Atleta.java:17-18; V3__create_atletas.sql:4); Data de nascimento (Atleta.java:20-21); Sexo (Atleta.java:23-24); CPF, Ãºnico e validado por dÃ­gito verificador (Atleta.java:26-27; V3:7 UNIQUE); NÃºmero do RG e Ã³rgÃ£o emissor (Atleta.java:29-33); Naturalidade â€” cidade e UF (Atleta.java:35-39); Telefone/WhatsApp e e-mail (Atleta.java:41-45); EndereÃ§o: CEP, logradouro, nÃºmero, cidade, UF (Atleta.java:47-60); PosiÃ§Ã£o em quadra e categoria etÃ¡ria (Atleta.java:62-66); SituaÃ§Ã£o de transferÃªncia e nome do clube anterior (Atleta.java:68-72); VÃ­nculo com o clube (clubeId, extraÃ­do do JWT do representante â€” AtletaServiceImpl.java:49-53); Status da filiaÃ§Ã£o e motivo de rejeiÃ§Ã£o em texto livre (Atleta.java:107-111); Taxa de filiaÃ§Ã£o: valor e ano de referÃªncia (Atleta.java:113-123); Datas de cadastro e de Ãºltima alteraÃ§Ã£o (DefaultEntity.java:16-31)

**Finalidade:** FiliaÃ§Ã£o do atleta Ã  federaÃ§Ã£o por meio do clube, verificaÃ§Ã£o de identidade e de unicidade do cadastro (impede o mesmo CPF em dois clubes), enquadramento em categoria etÃ¡ria e sexo para competiÃ§Ãµes, controle da anuidade que habilita a competir no ano e comunicaÃ§Ã£o com o filiado. ATENÃ‡ÃƒO â€” coleta sem uso: Ã³rgÃ£o emissor do RG, naturalidade (cidade/UF), CEP, logradouro e nÃºmero sÃ£o gravados no banco mas NUNCA sÃ£o devolvidos por nenhum endpoint (ausentes do AtletaResponseDTO) e nenhuma tela os exibe.

**Base legal sugerida:** art. 7, V (execuÃ§Ã£o de contrato / relaÃ§Ã£o associativa de filiaÃ§Ã£o esportiva) como base principal, combinado com art. 7, II (cumprimento de obrigaÃ§Ã£o regulatÃ³ria perante o sistema desportivo) para a manutenÃ§Ã£o do registro. Para MENORES, observar adicionalmente o art. 14 e seu Â§1Âº. NÃƒO usar consentimento como base do cadastro esportivo. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** O representante do clube ao qual o atleta estÃ¡ vinculado (escopo aplicado em Escopo.java:24-42, o clube sÃ³ enxerga os prÃ³prios atletas) e a federaÃ§Ã£o (ADMIN_FHT). O prÃ³prio atleta NÃƒO tem acesso â€” nÃ£o existe login de atleta. Todos os endpoints de atleta exigem @RolesAllowed (AtletaResource.java:40,67,87,101,120,135,153,172,190,208).

### Atleta â€” documentos digitalizados

**Dados:** RG digitalizado â€” Ãºnico documento obrigatÃ³rio no cadastro (AtletaServiceImpl.java:73-75,118); Foto 3x4 do rosto (AtletaServiceImpl.java:115-117); Comprovante de residÃªncia â€” pode conter dados de terceiros, ex. conta em nome dos pais (AtletaServiceImpl.java:119-121); Comprovante de pagamento Pix â€” pode conter nome, CPF parcial e instituiÃ§Ã£o do pagador (AtletaServiceImpl.java:122-124)

**Finalidade:** Comprovar identidade civil, endereÃ§o e o pagamento da anuidade. A aprovaÃ§Ã£o da filiaÃ§Ã£o Ã© bloqueada sem o comprovante de pagamento anexado (AtletaServiceImpl.java:363-365).

**Base legal sugerida:** art. 7, V e art. 7, II (mesma base do cadastro â€” o documento Ã© meio de prova da informaÃ§Ã£o declarada). DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Formalmente: representante do clube e federaÃ§Ã£o. NA PRÃTICA HOJE: qualquer pessoa que tenha a URL do arquivo. O endpoint GET /api/files/{path} nÃ£o possui NENHUMA anotaÃ§Ã£o de seguranÃ§a (FileResource.java:23-33, verificado â€” a classe sequer importa RolesAllowed). O Ãºnico controle Ã© o segredo da URL. Os arquivos estÃ£o hoje em disco local (volume Docker /app/uploads); o Cloudflare R2 com bucket privado NÃƒO estÃ¡ ativo (credenciais vazias, fallback silencioso em R2StorageService.java:52-60).

### Atleta â€” imagem

**Dados:** Foto 3x4 enviada no cadastro (nÃ£o Ã© publicada no site: AtletaVitrineDTO nÃ£o tem fotoUrl); Fotos da galeria pÃºblica 'Momentos que ficam' (Foto.java:9-18; GaleriaResource.java:29-35); Imagens de capa e do corpo das notÃ­cias (NoticiaResumoDTO.java:16); Legenda livre e obrigatÃ³ria da foto, ano e categoria (ex.: 2024, Sub-16) â€” Foto.java:12-18; Gallery.tsx:19-24

**Finalidade:** DivulgaÃ§Ã£o institucional das atividades e competiÃ§Ãµes da federaÃ§Ã£o no site pÃºblico.

**Base legal sugerida:** art. 7, I (consentimento) â€” Ã© o Ãºnico item genuinamente opcional. RESSALVA CRÃTICA: existe a finalidade de consentimento IMAGEM_PUBLICA no modelo (Consentimento.java:20; AtletaServiceImpl.java:153-156), mas NENHUM ponto do sistema a consulta antes de publicar â€” marcar ou nÃ£o marcar a caixa nÃ£o muda nada. E fotos da galeria nÃ£o sÃ£o vinculadas a nenhum atleta, entÃ£o nÃ£o hÃ¡ como localizar em quais fotos um menor aparece. DECISÃƒO FINAL DO ADVOGADO sobre como sustentar a base legal enquanto o mecanismo nÃ£o existir.

**Quem acessa:** Qualquer visitante anÃ´nimo â€” GET /api/galeria e GET /api/noticias sÃ£o pÃºblicos.

### ResponsÃ¡vel legal do atleta menor de 18

**Dados:** Nome completo (Atleta.java:75-76; V12:10); CPF, validado por dÃ­gito verificador (Atleta.java:78-79; V12:11); Parentesco: mÃ£e, pai, tutor legal ou outro (Atleta.java:81-82; V12:12); E-mail e/ou telefone â€” pelo menos um dos dois Ã© obrigatÃ³rio (Atleta.java:84-88; AtletaServiceImpl.java:192-195)

**Finalidade:** Cumprir o art. 14, Â§1Âº: identificar quem autoriza a filiaÃ§Ã£o do menor e manter canal de contato com o responsÃ¡vel. Os campos sÃ³ sÃ£o gravados quando o atleta Ã© menor â€” o cadastro de adulto nÃ£o grava nada disso (AtletaServiceImpl.java:105-111).

**Base legal sugerida:** Para os dados do MENOR: art. 14 c/c art. 7, V (relaÃ§Ã£o de filiaÃ§Ã£o). Para os dados DO PRÃ“PRIO RESPONSÃVEL (nome, CPF, contato â€” ele tambÃ©m Ã© titular): art. 7, V ou art. 7, IX. ATENÃ‡ÃƒO: hoje o termo aceito trata apenas dos dados do atleta; nÃ£o hÃ¡ informaÃ§Ã£o nem consentimento sobre o tratamento dos dados do prÃ³prio responsÃ¡vel. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Representante do clube e federaÃ§Ã£o. O responsÃ¡vel NÃƒO tem acesso ao sistema â€” nÃ£o existe login nem portal para ele.

### ResponsÃ¡vel legal â€” registro de consentimento

**Dados:** Finalidade do consentimento: CADASTRO_ATLETA_MENOR ou IMAGEM_PUBLICA (Consentimento.java:17-29); Nome e CPF de quem consentiu (Consentimento.java:34-38); Flag 'titular era menor' no momento do aceite (Consentimento.java:31-32); VersÃ£o do texto do termo â€” constante fixa '1.0' (Consentimento.java:22-23,40-41); Data e hora do aceite (Consentimento.java:43-44); EndereÃ§o IP de origem e user-agent do navegador (Consentimento.java:46-50; OrigemRequisicao.java:13-26)

**Finalidade:** EvidÃªncia da obtenÃ§Ã£o do consentimento (art. 6, X e art. 14, Â§1Âº). Um registro por finalidade.

**Base legal sugerida:** art. 7, II c/c art. 6, X (prestaÃ§Ã£o de contas â€” o registro Ã© obrigaÃ§Ã£o da prÃ³pria LGPD). RESSALVA CRÃTICA PARA O ADVOGADO: o IP e o user-agent gravados como evidÃªncia sÃ£o os do DISPOSITIVO DO REPRESENTANTE DO CLUBE que preencheu o formulÃ¡rio, nÃ£o os do responsÃ¡vel legal (AtletaResource.java:57-59). O responsÃ¡vel nunca toca no sistema â€” juridicamente o registro Ã© uma declaraÃ§Ã£o de terceiro de que houve consentimento. NÃ£o hÃ¡ confirmaÃ§Ã£o por e-mail, link, assinatura ou double opt-in em nenhum ponto do cÃ³digo.

**Quem acessa:** Clube e federaÃ§Ã£o nos painÃ©is. IP e user-agent nunca sÃ£o devolvidos por nenhum endpoint (ausentes do ConsentimentoDTO).

### Representante legal do clube (pessoa natural)

**Dados:** Nome completo (Clube.java:23; V1:10); E-mail (Clube.java:26; V1:11); Telefone/WhatsApp (Clube.java:29; V1:12); Cargo no clube (Clube.java:32; V5:5) â€” gravado mas NUNCA devolvido por nenhuma API (ClubeMapper.java:10-29 nÃ£o o inclui); Ata de fundaÃ§Ã£o e Estatuto social em PDF â€” contÃªm nome, CPF, RG e assinatura de fundadores e diretores, ou seja, dados pessoais de TERCEIROS (Clube.java:35-38); Status da filiaÃ§Ã£o e motivo de rejeiÃ§Ã£o em texto livre escrito pelo admin (Clube.java:41-44); Dados de pessoa jurÃ­dica, nÃ£o pessoais: CNPJ (opcional e nullable), nome, sigla, cidade, UF

**Finalidade:** Analisar e processar a solicitaÃ§Ã£o de filiaÃ§Ã£o do clube, identificar quem responde legalmente pela entidade e manter contato durante a anÃ¡lise. O nome e o e-mail do representante viram, na aprovaÃ§Ã£o, o nome e o login da conta de acesso ADMIN_CLUBE (ClubeServiceImpl.java:128-137).

**Base legal sugerida:** art. 7, V (procedimento preliminar e execuÃ§Ã£o do vÃ­nculo associativo entre clube e federaÃ§Ã£o) e art. 7, IX (legÃ­timo interesse) para o contato institucional. NÃƒO usar consentimento: o checkbox do formulÃ¡rio pÃºblico diz apenas 'declaro que as informaÃ§Ãµes sÃ£o verdadeiras e estou ciente das regras da FHT' (Registration.tsx:325), nÃ£o Ã© consentimento de tratamento, nÃ£o remete a polÃ­tica nenhuma e sequer Ã© enviado ou armazenado. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** FederaÃ§Ã£o (ADMIN_FHT) e o prÃ³prio clube. NÃƒO Ã© exposto publicamente: os DTOs da vitrine nÃ£o trazem CNPJ, documentos nem contato do representante (ClubeVitrineDTO.java:13-21; ClubeVitrineDetalheDTO.java:13-22). Os PDFs, porÃ©m, sÃ£o servidos sem autenticaÃ§Ã£o por /api/files.

### Titular de conta de acesso (representante de clube e administradores da FHT)

**Dados:** Nome do titular da conta (Usuario.java:12); E-mail, que Ã© o identificador Ãºnico de login (Usuario.java:15; V2:4 UNIQUE); Senha, armazenada exclusivamente como hash BCrypt â€” nunca em texto puro e nunca devolvida por nenhum DTO (Usuario.java:18; BcryptUtil em ClubeServiceImpl.java:133, AuthResource.java:119, AdminResource.java:87); Perfil de acesso (ADMIN_FHT ou ADMIN_CLUBE), vÃ­nculo com o clube e flag 'ativo' (Usuario.java:22-28); Token JWT guardado no localStorage do navegador sob a chave fht_token, contendo id, nome completo, e-mail, papel e clubeId (JwtService.java:17-31; AuthContext.tsx:87)

**Finalidade:** Autenticar o usuÃ¡rio, manter a sessÃ£o entre navegaÃ§Ãµes e limitar cada clube aos prÃ³prios dados.

**Base legal sugerida:** art. 7, V (execuÃ§Ã£o do contrato / operacionalizaÃ§Ã£o do acesso) e art. 7, II (seguranÃ§a e registro de acesso). DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** O prÃ³prio usuÃ¡rio e a federaÃ§Ã£o. NÃ£o existe endpoint que liste usuÃ¡rios (nÃ£o hÃ¡ GET /api/usuarios no cÃ³digo).

### Ãrbitro â€” dados publicados no site

**Dados:** Nome completo (Arbitro.java:12-13); Foto do rosto (ArbitroServiceImpl.java:51); Cidade e UF (Arbitro.java:27-30); NÃ­vel de credenciamento: Regional, Estadual B, Estadual A, Nacional (Arbitro.java:40-41); ID do registro (UUID)

**Finalidade:** Divulgar publicamente o corpo arbitral credenciado da federaÃ§Ã£o na home do site.

**Base legal sugerida:** art. 7, V (relaÃ§Ã£o com a federaÃ§Ã£o / execuÃ§Ã£o do credenciamento) ou art. 7, IX (legÃ­timo interesse na transparÃªncia do corpo arbitral). NÃƒO PODE SER CONSENTIMENTO: desde ago/2026 o cadastro Ã© feito por funcionÃ¡rio da FHT (ArbitroResource.java:29-45 exige ADMIN_FHT), o registro jÃ¡ nasce CREDENCIADO (ArbitroServiceImpl.java:54-55) e nÃ£o existe nenhum campo, checkbox ou tabela que capture anuÃªncia do Ã¡rbitro. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Qualquer visitante anÃ´nimo â€” GET /api/arbitros/publico. SÃ£o exatamente 6 campos (ArbitroPublicoDTO.java:12-19). SÃ³ entram na vitrine os Ã¡rbitros com status CREDENCIADO (ArbitroRepository.java:17-20).

### Ãrbitro â€” dados internos

**Dados:** CPF (Arbitro.java:15); Data de nascimento (Arbitro.java:21-22); Telefone e e-mail (Arbitro.java:25-26); NÃºmero de registro na federaÃ§Ã£o (Arbitro.java:42); Ano de inÃ­cio na arbitragem e formaÃ§Ã£o/cursos (Arbitro.java:44-47); Status e motivo de rejeiÃ§Ã£o (Arbitro.java:50-57); RG, Ã³rgÃ£o emissor, sexo e RG digitalizado â€” aceitos pela API (ArbitroForm.java:24-34,67-69) mas NÃƒO coletados pela tela atual do painel

**Finalidade:** GestÃ£o interna do credenciamento arbitral. Nenhum desses campos vai para o site pÃºblico. O campo 'sexo' nÃ£o Ã© usado em nenhuma regra, filtro ou tela â€” coleta sem finalidade declarada.

**Base legal sugerida:** art. 7, V e art. 7, II. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Somente ADMIN_FHT (ArbitroResource.java:92-103). ExceÃ§Ã£o: o RG digitalizado, quando enviado, fica acessÃ­vel por /api/files sem autenticaÃ§Ã£o.

### Membro da diretoria da FHT

**Dados:** Nome e cargo (Diretor.java:9-13); Ãrea de atuaÃ§Ã£o (Diretor.java:15-16); Mandato e 'na diretoria desde' (Diretor.java:18,24-25); E-mail (Diretor.java:20); Telefone (Diretor.java:22); Bio / currÃ­culo em texto livre (Diretor.java:27-28); Foto (Diretor.java:30-31)

**Finalidade:** SeÃ§Ã£o institucional 'Quem somos / Diretoria' e modal de currÃ­culo na home.

**Base legal sugerida:** art. 7, V / art. 7, IX (transparÃªncia institucional e exercÃ­cio de cargo de representaÃ§Ã£o). NÃ£o hÃ¡ registro de consentimento de diretor no sistema. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Qualquer visitante anÃ´nimo. ATENÃ‡ÃƒO â€” exposiÃ§Ã£o maior que a dos Ã¡rbitros: GET /api/diretores Ã© pÃºblico e devolve o objeto COMPLETO, incluindo e-mail, telefone e bio (DiretorResource.java:29-34; DiretorDTO.java:9-22). NÃ£o existe DTO pÃºblico reduzido como o dos Ã¡rbitros. A migration declara que o contato Ã© institucional (V9:2), mas nada no cÃ³digo valida isso â€” um celular pessoal digitado no campo vai ao ar igual.

### FuncionÃ¡rio/dirigente que publica conteÃºdo (autoria)

**Dados:** Nome do autor da notÃ­cia, copiado automaticamente do claim 'name' do JWT (NoticiaServiceImpl.java:66,155-164); Nome de quem publicou o documento institucional (DocumentoServiceImpl.java:44; DocumentoDTO.java:16)

**Finalidade:** Assinatura da matÃ©ria e rastreabilidade da publicaÃ§Ã£o institucional.

**Base legal sugerida:** art. 7, V (exercÃ­cio da funÃ§Ã£o) ou art. 7, IX. ObservaÃ§Ã£o prÃ¡tica: o mÃ©todo de ediÃ§Ã£o de notÃ­cia nÃ£o regrava o autor (NoticiaServiceImpl.java:124-137), entÃ£o um ex-funcionÃ¡rio que peÃ§a a retirada do nome nÃ£o consegue ser atendido pela API â€” sÃ³ por alteraÃ§Ã£o direta no banco. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** Qualquer visitante anÃ´nimo. O autor da notÃ­cia Ã© renderizado no post (NoticiaPost.tsx:128-132); o campo 'publicadoPor' dos documentos trafega no JSON pÃºblico mesmo sem ser renderizado pela tela atual.

### Visitante do site

**Dados:** Chave fht_cookies no localStorage, com o valor 'accepted' â€” apenas marca que o banner foi fechado (CookieBanner.tsx:6,10); Chave fht_token no localStorage, sÃ³ para quem faz login (AuthContext.tsx:87); EndereÃ§o IP e user-agent transmitidos ao Google em toda visita, pelo carregamento das fontes (index.html:13-15); Nome, e-mail, telefone, assunto e mensagem digitados no formulÃ¡rio 'Fale com a FHT' â€” que NÃƒO sÃ£o enviados a lugar nenhum (Contact.tsx:17-20, verificado)

**Finalidade:** NÃ£o reexibir o aviso e manter a sessÃ£o de quem tem login. Nenhuma outra finalidade: nÃ£o hÃ¡ analytics, perfilamento nem publicidade.

**Base legal sugerida:** Armazenamento estritamente necessÃ¡rio ao funcionamento (o token de sessÃ£o), que dispensa consentimento. O Google Fonts Ã© uma transferÃªncia a terceiro sem opÃ§Ã£o de recusa e nÃ£o se sustenta em consentimento no formato atual do banner. RecomendaÃ§Ã£o tÃ©cnica: auto-hospedar as fontes elimina o terceiro e simplifica a polÃ­tica. DECISÃƒO FINAL DO ADVOGADO.

**Quem acessa:** NinguÃ©m na FHT â€” os dois itens ficam no prÃ³prio navegador do visitante. O IP das fontes vai para o Google.

---

## 2. Finalidades e bases legais

- FILIAÃ‡ÃƒO E REGISTRO DE ATLETAS â€” cadastrar o atleta, verificar sua identidade, impedir cadastro duplicado do mesmo CPF em dois clubes e mantÃª-lo vinculado ao clube filiado. Base sugerida: art. 7, V (execuÃ§Ã£o de contrato / relaÃ§Ã£o associativa) + art. 7, II (obrigaÃ§Ã£o regulatÃ³ria do sistema desportivo). Para menores, observar o art. 14.
- ENQUADRAMENTO EM COMPETIÃ‡Ã•ES â€” usar data de nascimento, sexo, categoria e posiÃ§Ã£o para classificar o atleta. Base sugerida: art. 7, V. Ressalva de fato: o mÃ³dulo de competiÃ§Ãµes AINDA NÃƒO trata dados de atleta â€” a migration V13 nÃ£o tem tabela de inscriÃ§Ã£o, escalaÃ§Ã£o ou check-in, e nenhuma coluna referencia atletas. NÃ£o existe hoje vÃ­nculo persistido entre atleta e competiÃ§Ã£o.
- CONTROLE DA ANUIDADE â€” registrar valor e ano da taxa e exigir o comprovante de pagamento para liberar a aprovaÃ§Ã£o. Base sugerida: art. 7, V.
- COMPROVAÃ‡ÃƒO DOCUMENTAL â€” armazenar RG, comprovante de residÃªncia e comprovante de pagamento como meio de prova das informaÃ§Ãµes declaradas. Base sugerida: art. 7, V + art. 7, II.
- FILIAÃ‡ÃƒO DE CLUBES â€” receber e analisar a solicitaÃ§Ã£o de filiaÃ§Ã£o, com ata e estatuto. Base sugerida: art. 7, V (procedimento preliminar de contrato).
- GESTÃƒO DE ACESSO E SEGURANÃ‡A â€” autenticar usuÃ¡rios, manter sessÃ£o e limitar cada clube aos prÃ³prios dados. Base sugerida: art. 7, V + art. 7, II.
- CREDENCIAMENTO E DIVULGAÃ‡ÃƒO DO CORPO ARBITRAL â€” publicar nome, foto, cidade, UF e nÃ­vel dos Ã¡rbitros credenciados. Base sugerida: art. 7, V ou art. 7, IX. NÃƒO pode ser consentimento (nÃ£o existe mecanismo de captura no sistema).
- TRANSPARÃŠNCIA INSTITUCIONAL â€” publicar diretoria (com contato e currÃ­culo), documentos institucionais e autoria das publicaÃ§Ãµes. Base sugerida: art. 7, V / art. 7, IX.
- DIVULGAÃ‡ÃƒO DE IMAGEM EM GALERIA E NOTÃCIAS â€” Ãºnico tratamento genuinamente opcional. Base sugerida: art. 7, I (consentimento), com a ressalva grave de que o consentimento registrado hoje nÃ£o Ã© consultado por nenhum ponto do sistema antes de publicar.
- REGISTRO DE EVIDÃŠNCIA DE CONSENTIMENTO â€” guardar quem consentiu, quando, de qual IP e sob qual versÃ£o do termo. Base sugerida: art. 7, II c/c art. 6, X (prestaÃ§Ã£o de contas â€” obrigaÃ§Ã£o da prÃ³pria lei).
- DESCARTE DE CADASTROS ABANDONADOS â€” apagar automaticamente atletas parados em AGUARDANDO_PAGAMENTO hÃ¡ mais de 90 dias. Base sugerida: art. 15, I e art. 16 (fim do tratamento pelo alcance da finalidade). Ã‰ a Ãºnica rotina de retenÃ§Ã£o que existe.
- OBSERVAÃ‡ÃƒO TRANSVERSAL PARA O ADVOGADO: a recomendaÃ§Ã£o tÃ©cnica do projeto Ã© reservar o consentimento (art. 7, I) EXCLUSIVAMENTE ao que Ã© opcional â€” hoje, apenas o uso de imagem. Todo o cadastro esportivo (atleta, responsÃ¡vel, clube, Ã¡rbitro, diretor) deve se apoiar em contrato/relaÃ§Ã£o associativa e obrigaÃ§Ã£o regulatÃ³ria, porque o titular nÃ£o tem como recusar sem perder a filiaÃ§Ã£o, e porque em vÃ¡rios fluxos nÃ£o existe sequer mecanismo tÃ©cnico para capturar ou revogar consentimento.

## 3. O que é PÚBLICO (visível sem login)

- ATLETAS (INCLUSIVE MENORES): nome completo, posiÃ§Ã£o em quadra e categoria etÃ¡ria de todo atleta ATIVO de clube marcado como visÃ­vel na home â€” no modal do clube (GET /api/clubes/publico/{id}). Sem filtro de idade e sem checagem de consentimento. Ã‰ o item de maior exposiÃ§Ã£o do sistema.
- CLUBES: nome, sigla, cidade, UF, lista de categorias e total de atletas. O identificador (UUID) do clube tambÃ©m trafega publicamente.
- ÃRBITROS CREDENCIADOS: id, nome completo, cidade, UF, nÃ­vel de credenciamento e foto do rosto â€” exatamente 6 campos, sÃ³ para quem estÃ¡ com status CREDENCIADO.
- DIRETORIA: o registro COMPLETO de cada diretor â€” nome, cargo, Ã¡rea de atuaÃ§Ã£o, mandato, 'na diretoria desde', e-mail, telefone, biografia/currÃ­culo e foto. Ã‰ a exposiÃ§Ã£o mais ampla de contato do site, porque nÃ£o existe DTO pÃºblico reduzido.
- NOTÃCIAS publicadas: tÃ­tulo, conteÃºdo, imagens de capa e do corpo, e o NOME do administrador que assinou a matÃ©ria.
- DOCUMENTOS INSTITUCIONAIS: o arquivo e o nome de quem publicou (esse Ãºltimo trafega no JSON pÃºblico mesmo sem ser renderizado pela tela atual).
- GALERIA DE FOTOS: imagem, legenda livre do evento, ano e categoria â€” podendo conter rostos identificÃ¡veis de atletas de categorias de base.
- COMPETIÃ‡Ã•ES: lista e detalhe pÃºblicos (sem dados de atleta vinculados â€” o mÃ³dulo ainda nÃ£o trata dados pessoais).
- NA PRÃTICA, TODOS OS ARQUIVOS ENVIADOS AO SISTEMA: RG digitalizado, foto 3x4, comprovante de residÃªncia e comprovante Pix de atletas; RG digitalizado de Ã¡rbitros; ata e estatuto de clubes. NÃ£o sÃ£o divulgados em nenhuma pÃ¡gina, mas o endpoint que os serve nÃ£o exige autenticaÃ§Ã£o â€” quem tiver a URL acessa.
- O QUE NÃƒO Ã‰ PÃšBLICO (verificado campo a campo nos DTOs): CPF, RG, data de nascimento, endereÃ§o, CEP, telefone e e-mail de atleta; todos os dados do responsÃ¡vel legal; registros de consentimento; CNPJ do clube e nome/e-mail/telefone/cargo do representante; CPF, RG, nascimento, telefone, e-mail, registro e formaÃ§Ã£o de Ã¡rbitro.

## 4. Compartilhamento com terceiros

| Quem | O que recebe | Observação |
|---|---|---|
| ViaCEP (viacep.com.br) | O CEP do atleta e o endereÃ§o IP do navegador do representante do clube | TRANSFERÃŠNCIA REAL E VERIFICADA (ClubeDashboard.tsx:721). A requisiÃ§Ã£o parte do navegador direto para o serviÃ§o, sem passar pelo servidor da FHT, e dispara sozinha assim que 8 dÃ­gitos sÃ£o digitados. O CEP pode ser de um atleta menor de idade. Precisa constar da polÃ­tica, OU a chamada deve ser movida para o backend. |
| Google (Google Fonts â€” fonts.googleapis.com e fonts.gstatic.com) | EndereÃ§o IP e user-agent de TODO visitante, em TODA pÃ¡gina | TRANSFERÃŠNCIA REAL E VERIFICADA (index.html:13-15). Acontece antes e independentemente do aviso de cookies, sem qualquer opÃ§Ã£o de recusa. Ã‰ transferÃªncia internacional. RecomendaÃ§Ã£o tÃ©cnica: auto-hospedar as fontes elimina esse terceiro por completo. |
| Cloudflare R2 (armazenamento de arquivos) | Nada hoje | PREVISTO MAS INATIVO. As trÃªs credenciais estÃ£o vazias e, sem elas, o serviÃ§o nem cria o cliente S3 e cai silenciosamente no armazenamento local (R2StorageService.java:52-60). Nenhum arquivo saiu do servidor da aplicaÃ§Ã£o atÃ© hoje. Se a polÃ­tica mencionar o R2, deve ser como destino futuro, ou aguardar a ativaÃ§Ã£o. |
| Sentry (monitoramento de erros â€” Functional Software Inc., EUA) | Nada hoje | CÃ“DIGO PRONTO, MAS DESLIGADO: o SDK sÃ³ inicializa se SENTRY_DSN estiver preenchido, e o valor estÃ¡ vazio (SentryInitializer.java:24). Quando ligado, captura toda exceÃ§Ã£o nÃ£o tratada com a mensagem original (GlobalExceptionMapper.java:47), sem beforeSend nem mascaramento â€” uma violaÃ§Ã£o de unicidade de banco pode carregar o CPF junto. sendDefaultPii nunca Ã© habilitado. Se for ativado em produÃ§Ã£o, exige previsÃ£o de transferÃªncia internacional na polÃ­tica e contrato de operador. |
| Hospedagem e infraestrutura (Railway / Docker, a confirmar) | Todo o banco de dados e o volume de arquivos | NÃƒO VERIFICÃVEL NO CÃ“DIGO: nÃ£o existe nenhum arquivo de configuraÃ§Ã£o de Railway ou GitHub Actions no repositÃ³rio (sem pasta .github, sem railway.json/toml, sem Procfile). O deploy nessas plataformas consta apenas de documentaÃ§Ã£o. Confirmar com a federaÃ§Ã£o quem Ã© o hospedeiro real antes de nomeÃ¡-lo como operador. |
| CBHb (ConfederaÃ§Ã£o Brasileira de Handebol) ou outra entidade desportiva | Nada | NENHUMA integraÃ§Ã£o existe no cÃ³digo â€” nÃ£o hÃ¡ API, exportaÃ§Ã£o nem envio para confederaÃ§Ã£o alguma. Se houver compartilhamento na prÃ¡tica (planilha, e-mail, sistema da CBHb), ele acontece FORA do sistema e precisa ser declarado assim mesmo. PERGUNTAR Ã€ FEDERAÃ‡ÃƒO. |
| Gateway de pagamento / instituiÃ§Ã£o financeira | Nada | O sistema nÃ£o conversa com nenhum banco ou PSP. O pagamento Ã© Pix feito por fora e o comprovante Ã© anexado manualmente como arquivo. |
| PÃºblico em geral (via endpoints abertos) | Nome, posiÃ§Ã£o e categoria de atletas ativos; nome, foto, cidade, UF e nÃ­vel de Ã¡rbitros credenciados; registro completo de diretores (inclusive e-mail, telefone e currÃ­culo); nome do autor das publicaÃ§Ãµes; fotos da galeria; e, na prÃ¡tica, qualquer arquivo enviado ao sistema para quem tiver a URL | NÃ£o Ã© 'compartilhamento com terceiro' em sentido estrito, mas Ã© divulgaÃ§Ã£o pÃºblica e precisa estar declarada na polÃ­tica com essa clareza. Ver a seÃ§Ã£o de dados pÃºblicos. |

## 5. Retenção e descarte

- ÃšNICA REGRA AUTOMÃTICA QUE EXISTE: cadastros de atleta parados na situaÃ§Ã£o AGUARDANDO_PAGAMENTO sÃ£o apagados definitivamente apÃ³s 90 dias contados da data de cadastro. Ã‰ um job diÃ¡rio (AtletaExpurgoJob.java:33-51) e Ã© a Ãºnica tarefa agendada de todo o sistema. O prazo Ã© configurÃ¡vel por variÃ¡vel de ambiente (ATLETA_EXPURGO_DIAS) â€” se a polÃ­tica citar um nÃºmero fixo, ele pode divergir do que roda em produÃ§Ã£o; sugerimos redigir como 'atÃ© 90 dias'.
- ATENÃ‡ÃƒO â€” a documentaÃ§Ã£o interna do projeto ainda descreve o expurgo rodando de hora em hora com prazo de 24 horas. ISSO ESTÃ DESATUALIZADO. Vale o cÃ³digo: a cada 24 horas, prazo de 90 dias. A coluna prazo_pagamento_ate ainda existe no banco mas nÃ£o Ã© mais o critÃ©rio; cadastros novos nascem sem prazo definido.
- Ao apagar o atleta, os registros de consentimento sÃ£o apagados EM CASCATA (V12:35). Isso significa que a prova de que o consentimento do responsÃ¡vel foi obtido desaparece junto â€” risco de prestaÃ§Ã£o de contas.
- TODO O RESTO Ã‰ RETIDO POR PRAZO INDETERMINADO: atleta ATIVO, SUSPENSO, REJEITADO e AGUARDANDO_APROVACAO; clubes (inclusive rejeitados); contas de acesso; Ã¡rbitros (inclusive os legados PENDENTE e REJEITADO preservados pela migration V14, que ainda guardam CPF, RG, telefone, e-mail e documentos de pessoas que apenas se candidataram); diretores; notÃ­cias; fotos da galeria. Nenhum desses tem prazo definido em cÃ³digo.
- ARQUIVOS NUNCA SÃƒO APAGADOS â€” VERIFICADO NESTA SESSÃƒO. NÃ£o existe nenhum cÃ³digo de exclusÃ£o de arquivo em todo o backend (busca por deleteObject, DeleteObject, Files.delete: zero ocorrÃªncias; o R2StorageService sÃ³ tem mÃ©todos de upload). Apagar um atleta ou um Ã¡rbitro remove apenas a linha do banco: RG digitalizado, foto 3x4, comprovante de residÃªncia e comprovante Pix permanecem no armazenamento e continuam acessÃ­veis pela URL pÃºblica.
- ACÃšMULO POR SUBSTITUIÃ‡ÃƒO: no cadastro os arquivos vÃ£o para atletas/{clubeId}/{UUID aleatÃ³rio}/ e na reanexaÃ§Ã£o vÃ£o para atletas/{clubeId}/{atletaId}/ â€” caminhos diferentes. O arquivo antigo nunca Ã© sobrescrito nem removido, entÃ£o cada correÃ§Ã£o de documento acumula mais uma cÃ³pia do RG do menor no armazenamento.
- A migration V14 removeu a coluna de comprovante escolar de Ã¡rbitros: os arquivos jÃ¡ enviados ficaram no armazenamento sem referÃªncia no banco, impossÃ­veis de localizar pelo sistema e nunca apagados.
- O log da aplicaÃ§Ã£o registra o NOME COMPLETO do atleta apagado pelo expurgo (AtletaExpurgoJob.java:44), em JSON no console da hospedagem. O nome de um menor sobrevive ao prÃ³prio descarte do cadastro, sem prazo de retenÃ§Ã£o definido para os logs.
- Do lado do navegador: o token de sessÃ£o fica no localStorage atÃ© o logout ou atÃ© a API responder 401 â€” nÃ£o hÃ¡ expiraÃ§Ã£o por tempo no frontend. O token de acesso vale 1 dia e o de atualizaÃ§Ã£o 30 dias no servidor (JwtService.java:24,38), mas nÃ£o hÃ¡ revogaÃ§Ã£o: um token vazado vale atÃ© expirar.
- NÃƒO HÃ BACKUP configurado (nenhum script, cron ou pg_dump no repositÃ³rio) e NÃƒO HÃ criptografia de dados em repouso â€” CPF, RG, endereÃ§o e documentos ficam em texto puro no Postgres e no volume. A Ãºnica proteÃ§Ã£o criptogrÃ¡fica verificÃ¡vel Ã© o hash BCrypt da senha de login.

## 6. Menores de idade (LGPD art. 14)

- O sistema trata dados de menores de 12 a 17 anos (categorias Sub-12, Sub-14, Sub-16 e Sub-18). A menoridade Ã© detectada automaticamente pela data de nascimento (Atleta.java:203-206).
- IMPLEMENTADO E FUNCIONANDO: quando o atleta Ã© menor, o cadastro EXIGE uma etapa adicional com nome, CPF (validado), parentesco e ao menos um contato do responsÃ¡vel legal, e Ã© BLOQUEADO sem o aceite do termo (AtletaServiceImpl.java:78-81,179-200).
- IMPLEMENTADO: a aprovaÃ§Ã£o da filiaÃ§Ã£o de um menor Ã© bloqueada se nÃ£o houver consentimento ativo registrado (AtletaServiceImpl.java:359-376).
- IMPLEMENTADO: o consentimento Ã© armazenado em tabela prÃ³pria, com um registro por finalidade, guardando quem consentiu (nome e CPF), se o titular era menor no momento do aceite, a versÃ£o do termo, a data/hora, o IP e o user-agent (V12:33-50).
- PONTO CRÃTICO 1 â€” QUEM MARCA A CAIXA Ã‰ O CLUBE, NÃƒO O RESPONSÃVEL. Todo o cadastro passa pelo painel do representante do clube. O IP e o user-agent gravados como evidÃªncia sÃ£o os do dispositivo DO CLUBE (AtletaResource.java:57-59). NÃ£o existe confirmaÃ§Ã£o por e-mail, link, assinatura ou double opt-in do responsÃ¡vel em nenhum ponto do cÃ³digo. Juridicamente, Ã© uma declaraÃ§Ã£o de terceiro de que houve consentimento.
- PONTO CRÃTICO 2 â€” O SITE PÃšBLICO JÃ PUBLICA NOME DE MENOR. Verificado nesta sessÃ£o: o modal pÃºblico do clube devolve nome completo + posiÃ§Ã£o + CATEGORIA de todos os atletas ATIVOS, sem nenhum filtro de idade e sem consultar consentimento algum (ClubeServiceImpl.java:200-203; renderizado em Clubs.tsx:103-104). Um visitante anÃ´nimo vÃª literalmente 'Nome Completo da CrianÃ§a â€” PivÃ´ Â· Sub-12' junto com o clube e a cidade. A polÃ­tica NÃƒO pode afirmar que dados de menores nÃ£o sÃ£o publicados.
- PONTO CRÃTICO 3 â€” DOCUMENTOS DE MENORES ACESSÃVEIS SEM LOGIN. Verificado nesta sessÃ£o: o endpoint que serve os arquivos nÃ£o tem nenhuma anotaÃ§Ã£o de seguranÃ§a (FileResource.java:23-33). RG digitalizado, comprovante de residÃªncia, comprovante Pix e foto 3x4 de crianÃ§as ficam baixÃ¡veis por qualquer pessoa com a URL. A URL nÃ£o expira, nÃ£o Ã© revogÃ¡vel e nÃ£o verifica quem pede.
- PONTO CRÃTICO 4 â€” FOTOS DE MENORES NA GALERIA SEM VERIFICAÃ‡ÃƒO. Fotos sÃ£o publicadas sem nenhuma checagem de autorizaÃ§Ã£o de imagem, e a legenda Ã© campo livre e obrigatÃ³rio, sempre visÃ­vel sobre a foto, sem validaÃ§Ã£o de conteÃºdo â€” nada impede que o nome de um menor seja escrito ali. Como a foto nÃ£o Ã© vinculada a nenhum atleta, o sistema nÃ£o tem como localizar em quais fotos determinado menor aparece caso a autorizaÃ§Ã£o seja revogada.
- PONTO CRÃTICO 5 â€” O RESPONSÃVEL NÃƒO TEM NENHUM CANAL. NÃ£o existe login, portal ou consulta pÃºblica por CPF para o atleta nem para o responsÃ¡vel (o enum de perfis tem apenas ADMIN_FHT e ADMIN_CLUBE â€” Role.java:3-6). Qualquer pedido de acesso, correÃ§Ã£o, revogaÃ§Ã£o ou exclusÃ£o depende de um administrador agir manualmente, e nÃ£o fica registro de que foi atendido (nÃ£o hÃ¡ log de auditoria).
- PONTO CRÃTICO 6 â€” O TERMO PROMETE O QUE NÃƒO EXISTE. O texto que o responsÃ¡vel aceita afirma 'Posso solicitar acesso, correÃ§Ã£o ou exclusÃ£o dos dados a qualquer momento' (ClubeDashboard.tsx:971-975) e que a autorizaÃ§Ã£o de imagem 'pode ser revogada a qualquer momento' (ClubeDashboard.tsx:981,1004). Nenhum dos mecanismos existe. O termo precisa ser reescrito indicando COMO exercer (e-mail do Encarregado), e esse canal precisa existir e ser monitorado.
- PONTO CRÃTICO 7 â€” CONSENTIMENTO RETROATIVO SEM EVIDÃŠNCIA. Na regularizaÃ§Ã£o de cadastro pela ediÃ§Ã£o do atleta, o consentimento do menor Ã© criado sem IP e sem user-agent reais: o campo recebe o texto 'regularizado por <login do operador>' (AtletaServiceImpl.java:302-306). Ã‰ consentimento declarado pelo operador do painel â€” evidÃªncia fraca para o art. 14, Â§1Âº.
- Atleta MAIOR de idade nÃ£o gera nenhum registro de consentimento de cadastro (AtletaServiceImpl.java:149-152) e nunca vÃª ou assina termo algum â€” o clube preenche tudo. Isso reforÃ§a que a base legal do cadastro esportivo deve ser contrato/obrigaÃ§Ã£o, nÃ£o consentimento.
- O CEP do atleta (possivelmente menor) Ã© enviado do navegador do clube para o serviÃ§o externo ViaCEP a cada cadastro/ediÃ§Ã£o, sem passar pelo servidor da FHT.

## 7. O que o sistema NÃO faz

> Negativas **verificadas no código** — a política pode afirmá-las com segurança.

- NÃƒO existe login, portal ou Ã¡rea de acesso para atleta nem para responsÃ¡vel legal. Verificado: o enum de perfis tem exatamente dois valores, ADMIN_FHT e ADMIN_CLUBE (Role.java:3-6), e todos os endpoints de atleta exigem @RolesAllowed (AtletaResource.java, verificado mÃ©todo a mÃ©todo).
- NÃƒO existe consulta pÃºblica por CPF nem qualquer endpoint pÃºblico que receba CPF como parÃ¢metro. Verificado nos 13 endpoints pÃºblicos do sistema.
- NÃƒO coletamos dados pessoais sensÃ­veis (art. 5, II): nÃ£o hÃ¡ campo de saÃºde, atestado ou laudo mÃ©dico, lesÃ£o, biometria, dado genÃ©tico, origem racial, religiÃ£o, filiaÃ§Ã£o polÃ­tica ou sindical. Verificado campo a campo em Atleta.java, V3 e V12.
- NÃƒO hÃ¡ reconhecimento facial nem qualquer processamento biomÃ©trico. Nenhum cÃ³digo de biometria existe no repositÃ³rio.
- NÃƒO hÃ¡ decisÃ£o automatizada, perfilamento, scoring ou publicidade direcionada sobre nenhum titular.
- NÃƒO hÃ¡ ferramentas de rastreamento, analytics ou publicidade no site. Verificado com busca por Google Analytics, Google Tag Manager, Meta/Facebook Pixel, Hotjar, Clarity, Matomo, Plausible, PostHog, Mixpanel, Segment e reCAPTCHA em todo o frontend: zero ocorrÃªncias.
- NÃƒO utilizamos cookies. Verificado: 'document.cookie' nÃ£o aparece em nenhum arquivo do frontend e o backend nunca emite Set-Cookie (busca por NewCookie/Set-Cookie/@CookieParam no backend: zero ocorrÃªncias). O site usa apenas duas chaves de localStorage: fht_token (sessÃ£o de quem tem login) e fht_cookies (marca que o aviso foi fechado). NÃ£o hÃ¡ sessionStorage nem IndexedDB.
- NÃƒO hÃ¡ widget, mapa, vÃ­deo, feed de rede social ou chat de terceiro incorporado. Os Ã­cones de rede social do rodapÃ© apontam para href='#' â€” sÃ£o placeholders e nÃ£o carregam nada externo. TambÃ©m nÃ£o hÃ¡ Service Worker nem cache offline.
- NÃƒO enviamos e-mail, SMS, WhatsApp ou notificaÃ§Ã£o automÃ¡tica a ninguÃ©m. Verificado: nÃ£o existe mailer, SMTP ou serviÃ§o de mensageria no cÃ³digo nem no pom.xml. Nenhuma aprovaÃ§Ã£o, rejeiÃ§Ã£o ou suspensÃ£o gera aviso automÃ¡tico.
- NÃƒO hÃ¡ integraÃ§Ã£o com gateway de pagamento, banco ou instituiÃ§Ã£o financeira. O Pix Ã© feito por fora e o comprovante Ã© anexado como arquivo.
- NÃƒO hÃ¡ integraÃ§Ã£o, exportaÃ§Ã£o ou envio de dados para a CBHb ou qualquer outra confederaÃ§Ã£o/federaÃ§Ã£o â€” nenhuma API externa desse tipo existe no cÃ³digo.
- NÃƒO vendemos nem cedemos dados a terceiros. Os Ãºnicos destinos externos verificÃ¡veis sÃ£o ViaCEP e Google Fonts (ambos recebendo dados diretamente do navegador do usuÃ¡rio), mais Sentry e Cloudflare R2, que estÃ£o desligados hoje.
- O formulÃ¡rio 'Fale com a FHT' do site NÃƒO envia nem armazena nada. VERIFICADO NESTA SESSÃƒO: a funÃ§Ã£o de envio apenas marca a tela como enviada, nÃ£o existe requisiÃ§Ã£o nem endpoint de contato no backend (Contact.tsx:17-20). Os dados digitados sÃ£o descartados ao recarregar a pÃ¡gina.
- NENHUM endpoint pÃºblico devolve CPF, nÃºmero de RG, data de nascimento, endereÃ§o, CEP, telefone ou e-mail de atleta. O DTO pÃºblico do atleta tem exatamente trÃªs campos: nome, posiÃ§Ã£o e categoria (AtletaVitrineDTO.java:10-14).
- NENHUM endpoint pÃºblico devolve dados do responsÃ¡vel legal do menor, nem os registros de consentimento.
- NENHUM endpoint pÃºblico devolve CNPJ do clube, documentos do clube ou nome, e-mail e telefone do representante legal (verificado em ClubeVitrineDTO.java:13-21 e ClubeVitrineDetalheDTO.java:13-22).
- NENHUM endpoint pÃºblico devolve CPF, RG, data de nascimento, telefone, e-mail, nÃºmero de registro, formaÃ§Ã£o ou documentos de Ã¡rbitro â€” o mapeamento pÃºblico corta tudo isso (ArbitroMapper.java:36-45).
- Atletas que nÃ£o estÃ£o ATIVOS nÃ£o aparecem no site (ClubeServiceImpl.java:227-231). Clubes nÃ£o aprovados ou nÃ£o marcados como visÃ­veis nÃ£o aparecem na vitrine. Ãrbitros nÃ£o credenciados nÃ£o aparecem. NotÃ­cias em rascunho nÃ£o sÃ£o acessÃ­veis publicamente, nem pela URL direta do slug.
- NÃƒO hÃ¡ autocadastro de usuÃ¡rio. Toda conta Ã© criada pelo fluxo de aprovaÃ§Ã£o do clube ou por um administrador da federaÃ§Ã£o.
- NÃƒO existe mais formulÃ¡rio pÃºblico de auto-inscriÃ§Ã£o de Ã¡rbitro â€” foi removido pela migration V14; o cadastro hoje exige ADMIN_FHT.
- A senha NUNCA Ã© armazenada em texto puro e NUNCA Ã© devolvida por nenhum DTO â€” apenas o hash BCrypt Ã© gravado, com salt aleatÃ³rio.
- As mensagens de erro da API nÃ£o vazam dados pessoais nem detalhes internos: erros nÃ£o tratados retornam a string fixa 'Erro interno do servidor' (GlobalExceptionMapper.java:50).
- O sistema tem proteÃ§Ã£o contra path traversal (../) tanto na leitura quanto na gravaÃ§Ã£o de arquivos (FileResource.java:38-40; R2StorageService.java:109-111), verificado nesta sessÃ£o.
- Um clube sÃ³ enxerga os prÃ³prios atletas e o prÃ³prio cadastro â€” a verificaÃ§Ã£o de escopo Ã© lista de permissÃ£o explÃ­cita e retorna 403 caso contrÃ¡rio (Escopo.java:24-42).
- O CPF do atleta e o do responsÃ¡vel NÃƒO sÃ£o usados para consulta a nenhuma base externa (Receita Federal, bureaus de crÃ©dito). A Ãºnica validaÃ§Ã£o Ã© o cÃ¡lculo local do dÃ­gito verificador.
- NÃƒO existem, hoje, dados de atleta vinculados a competiÃ§Ãµes: o mÃ³dulo de competiÃ§Ãµes nÃ£o possui tabela de inscriÃ§Ã£o, escalaÃ§Ã£o ou check-in (migration V13).

---

## 8. ⚠️ LACUNAS — o que a política NÃO pode prometer hoje

> Esta é a seção mais importante do documento. Cada item aqui é algo que o sistema **não faz**,
> e que portanto a política não pode afirmar sem virar declaração enganosa.

### [ALTA] A polÃ­tica NÃƒO pode dizer 'vocÃª pode excluir seus dados pelo painel' nem 'atendemos pedidos de exclusÃ£o pelo sistema'. NÃ£o existe canal de autoatendimento para nenhum titular. O Ãºnico DELETE de atleta Ã© restrito ao ADMIN_FHT, e NÃƒO EXISTE endpoint de exclusÃ£o de clube nem de conta de acesso em toda a API.

**Por quê importa:** Prometer exclusÃ£o sem meio de executÃ¡-la Ã© declaraÃ§Ã£o enganosa. Um clube rejeitado permanece no banco para sempre, com nome, e-mail e telefone do representante e os PDFs. Conflita com o art. 18, IV/VI e com o art. 15, I. Redigir como: pedidos de exclusÃ£o sÃ£o feitos por e-mail ao Encarregado e processados manualmente.

### [ALTA] A polÃ­tica NÃƒO pode dizer 'a exclusÃ£o do cadastro elimina seus documentos'. VERIFICADO NESTA SESSÃƒO: nÃ£o existe nenhum cÃ³digo de exclusÃ£o de arquivo no backend inteiro. Apagar o atleta remove sÃ³ a linha do banco â€” RG, foto, comprovante de residÃªncia e comprovante Pix continuam no armazenamento e continuam acessÃ­veis pela URL pÃºblica.

**Por quê importa:** Um pedido de eliminaÃ§Ã£o (art. 18, VI) NÃƒO Ã© integralmente atendido pelo sistema hoje, nem pela via administrativa. Enquanto nÃ£o houver rotina de exclusÃ£o de arquivos, a promessa Ã© falsa por construÃ§Ã£o.

### [ALTA] A polÃ­tica NÃƒO pode dizer que a autorizaÃ§Ã£o de uso de imagem pode ser revogada a qualquer momento. VERIFICADO NESTA SESSÃƒO: o mÃ©todo setRevogadoEm existe na entidade (Consentimento.java:89) mas NUNCA Ã© chamado por nenhum cÃ³digo â€” nÃ£o hÃ¡ endpoint, rota nem botÃ£o que grave a data de revogaÃ§Ã£o. A interface atÃ© exibe o selo 'revogado', que nunca aparecerÃ¡.

**Por quê importa:** Ã‰ o pior caso porque o termo JÃ MOSTRADO ao responsÃ¡vel promete a revogaÃ§Ã£o por escrito (ClubeDashboard.tsx:981 e 1004). Promessa publicada e nÃ£o cumprida. CorreÃ§Ã£o mÃ­nima sugerida: um PATCH de revogaÃ§Ã£o chamÃ¡vel pelo admin e pelo clube.

### [ALTA] A polÃ­tica NÃƒO pode dizer que a publicaÃ§Ã£o de nome ou imagem depende de autorizaÃ§Ã£o. Verificado: a finalidade de consentimento IMAGEM_PUBLICA Ã© gravada mas NUNCA consultada por nenhum ponto do sistema â€” vitrine, galeria e notÃ­cias publicam independentemente de haver consentimento registrado. Marcar ou nÃ£o marcar a caixa nÃ£o muda absolutamente nada no comportamento do site.

**Por quê importa:** O consentimento coletado Ã© decorativo. Contradiz frontalmente o termo apresentado ao usuÃ¡rio. Se a polÃ­tica afirmar que a publicaÃ§Ã£o Ã© condicionada Ã  autorizaÃ§Ã£o, serÃ¡ falso no dia da publicaÃ§Ã£o.

### [ALTA] A polÃ­tica NÃƒO pode afirmar que dados de menores nÃ£o sÃ£o publicados no site. VERIFICADO NESTA SESSÃƒO: nome completo + posiÃ§Ã£o + categoria (Sub-12 a Sub-18) de todo atleta ATIVO vÃ£o ao ar no modal pÃºblico do clube, sem filtro de idade e sem checagem de consentimento (ClubeServiceImpl.java:200-203).

**Por quê importa:** Nome + faixa etÃ¡ria + clube + cidade de uma crianÃ§a identificada, visÃ­veis a qualquer visitante anÃ´nimo. Ã‰ o item de maior exposiÃ§Ã£o do sistema sob o art. 14. HÃ¡ registro de que a decisÃ£o estÃ¡ pendente de parecer jurÃ­dico â€” mas o cÃ³digo JÃ publica hoje.

### [ALTA] A polÃ­tica NÃƒO pode afirmar que os documentos sÃ³ sÃ£o acessÃ­veis por pessoal autorizado. VERIFICADO NESTA SESSÃƒO: GET /api/files/{path} nÃ£o tem nenhuma anotaÃ§Ã£o de seguranÃ§a (FileResource.java:23-33). A Ãºnica proteÃ§Ã£o Ã© o segredo da URL, que nÃ£o expira, nÃ£o Ã© revogÃ¡vel e nÃ£o verifica quem pede. Na reanexaÃ§Ã£o de documentos o caminho Ã© ainda mais previsÃ­vel (usa o prÃ³prio id do atleta, e o Ãºltimo trecho Ã© o nome original do arquivo, tipicamente 'rg.pdf'); o clubeId, primeiro trecho do caminho, Ã© informaÃ§Ã£o pÃºblica.

**Por quê importa:** AusÃªncia de controle de acesso, nÃ£o 'medida de seguranÃ§a' (art. 46). Vale para RG de menores, RG de Ã¡rbitros e ata/estatuto de clubes. A mitigaÃ§Ã£o planejada (bucket privado R2 com URL assinada) nÃ£o estÃ¡ executada â€” as credenciais estÃ£o vazias e o sistema cai no armazenamento local silenciosamente, sem falhar o deploy.

### [ALTA] A polÃ­tica NÃƒO pode dizer que registramos quem acessou ou alterou dados pessoais. Verificado nas seis frentes: nÃ£o existe tabela, entidade ou serviÃ§o de auditoria em nenhuma das migrations V1 a V14.

**Por quê importa:** NÃ£o Ã© possÃ­vel responder 'quem viu os dados desta crianÃ§a'. Um administrador lÃª e edita qualquer cadastro sem deixar rastro alÃ©m do campo genÃ©rico de Ãºltima atualizaÃ§Ã£o, que nem registra o autor. TambÃ©m impede comprovar que um pedido de titular foi atendido.

### [ALTA] A polÃ­tica NÃƒO pode oferecer o formulÃ¡rio de contato do site como canal do titular. VERIFICADO NESTA SESSÃƒO: ele nÃ£o envia nada e mesmo assim exibe 'MENSAGEM ENVIADA! Nossa equipe retornarÃ¡ em breve'.

**Por quê importa:** Um pedido de exclusÃ£o enviado por ali evapora, enquanto o prazo do art. 18, Â§6Âº corre. AlÃ©m de prÃ¡tica enganosa. Desativar o formulÃ¡rio ou implementar o envio ANTES de publicar a polÃ­tica, e nunca apontar a polÃ­tica para ele.

### [ALTA] NÃƒO EXISTE pÃ¡gina de polÃ­tica de privacidade nem rota para ela. Verificado: a palavra 'privacidade' nÃ£o aparece em nenhum arquivo do frontend, nÃ£o hÃ¡ rota /privacidade e nÃ£o hÃ¡ link no rodapÃ©, no aviso de cookies nem em nenhum formulÃ¡rio. O rodapÃ© exibe apenas a frase solta 'Dados protegidos pela LGPD', sem link â€” e o formulÃ¡rio de filiaÃ§Ã£o repete a mesma frase.

**Por quê importa:** A polÃ­tica precisa de onde morar antes de existir: criar a rota e linkÃ¡-la no rodapÃ©, no aviso de cookies e, principalmente, dentro dos dois formulÃ¡rios que coletam dado pessoal (filiaÃ§Ã£o de clube e cadastro de atleta). As duas frases jÃ¡ publicadas sÃ£o promessas que a polÃ­tica terÃ¡ de sustentar.

### [ALTA] NÃƒO hÃ¡ Encarregado/DPO nomeado em lugar nenhum do sistema, e os canais de contato existentes sÃ£o frÃ¡geis: o link de WhatsApp aponta para um nÃºmero placeholder sÃ³ com zeros (wa.me/556300000000) e os e-mails contato@fht.org.br e imprensa@fht.org.br nÃ£o foram confirmados como caixas reais e monitoradas.

**Por quê importa:** Sem canal real e monitorado, todo direito de titular declarado na polÃ­tica vira promessa vazia. Ã‰ prÃ©-requisito para publicar.

### [MEDIA] A polÃ­tica NÃƒO pode dizer que hÃ¡ exportaÃ§Ã£o ou portabilidade de dados (art. 18, V). Verificado: busca por exportar/portabilidade no backend e no frontend retorna zero ocorrÃªncias.

**Por quê importa:** Descrever o direito na polÃ­tica Ã© obrigatÃ³rio, mas o atendimento tem que ser declarado como manual, por solicitaÃ§Ã£o ao Encarregado.

### [MEDIA] A polÃ­tica NÃƒO pode dizer que o titular pode acessar e corrigir seus dados no sistema â€” salvo uma Ãºnica exceÃ§Ã£o. O ÃšNICO direito de fato implementado Ã© o representante do clube ver e corrigir os prÃ³prios dados cadastrais em /clube > 'Meus Dados' (GET+PUT /api/clubes/{id}). Atleta, responsÃ¡vel, Ã¡rbitro e diretor nÃ£o tÃªm nenhum acesso.

**Por quê importa:** Redigir com precisÃ£o cirÃºrgica quem tem autoatendimento e quem depende de pedido manual, para nÃ£o generalizar.

### [MEDIA] A polÃ­tica NÃƒO pode declarar prazos de retenÃ§Ã£o que o sistema nÃ£o cumpre. SÃ³ existe um prazo em cÃ³digo: 90 dias para cadastro de atleta nunca pago. Todo o resto Ã© retido indefinidamente, inclusive Ã¡rbitros que apenas se candidataram no antigo formulÃ¡rio pÃºblico e nunca terÃ£o relaÃ§Ã£o com a federaÃ§Ã£o.

**Por quê importa:** Se a polÃ­tica listar prazos por categoria, eles precisam ou ser implementados, ou ser declarados como prÃ¡tica administrativa (nÃ£o automÃ¡tica). O nÃºmero 90 ainda Ã© configurÃ¡vel por variÃ¡vel de ambiente â€” sugerir 'atÃ© 90 dias'.

### [MEDIA] A polÃ­tica NÃƒO pode afirmar que a base legal para publicar Ã¡rbitro e diretor Ã© o consentimento. Verificado: nÃ£o existe NENHUM registro de consentimento para Ã¡rbitro, diretor, autor de publicaÃ§Ã£o ou pessoa fotografada â€” a tabela de consentimento Ã© exclusiva de atleta (atleta_id NOT NULL). TambÃ©m nÃ£o existe botÃ£o 'nÃ£o quero aparecer no site': a Ãºnica forma de sair da vitrine Ã© o admin suspender ou apagar o registro.

**Por quê importa:** Se a polÃ­tica declarar consentimento e alguÃ©m pedir a prova, ela nÃ£o existe. Precisa ser outra base legal, escrita expressamente.

### [MEDIA] A polÃ­tica NÃƒO pode chamar o aviso atual de 'gestÃ£o de consentimento de cookies'. Verificado: o banner sÃ³ tem ACEITAR e Fechar â€” nÃ£o hÃ¡ recusa, nÃ£o hÃ¡ categorias e nÃ£o hÃ¡ tela para revisar a escolha depois. Nada Ã© bloqueado antes do aceite (o Google Fonts carrega antes do React montar). 'Fechar' nem persiste. E o banner sÃ³ Ã© renderizado na home â€” quem entra por /noticias, /login, /clube ou /admin nunca o vÃª.

**Por quê importa:** O texto atual ('Este site utiliza cookies') Ã© factualmente errado em dois pontos: nÃ£o hÃ¡ cookies, e hÃ¡ transferÃªncia a terceiro sem opÃ§Ã£o de negar. CorreÃ§Ã£o mais barata e mais segura: auto-hospedar as fontes e trocar o banner por um aviso honesto de armazenamento estritamente necessÃ¡rio.

### [MEDIA] A polÃ­tica NÃƒO pode afirmar que o CPF do representante do clube Ã© coletado â€” mas tambÃ©m nÃ£o pode ignorar o problema. Verificado: o formulÃ¡rio pÃºblico EXIGE o CPF, valida o dÃ­gito verificador, e o campo simplesmente nÃ£o Ã© incluÃ­do no envio ao backend (Registration.tsx:277 vs :87-97). NÃ£o existe coluna no banco.

**Por quê importa:** O site pede na tela um dado pessoal obrigatÃ³rio que joga fora â€” exatamente o que a minimizaÃ§Ã£o proÃ­be (art. 6, III). A correÃ§Ã£o mais simples Ã© remover o campo da tela antes de publicar a polÃ­tica.

### [MEDIA] A polÃ­tica NÃƒO pode afirmar que sÃ³ coletamos o necessÃ¡rio enquanto houver campos coletados sem uso. Verificado: Ã³rgÃ£o emissor do RG, naturalidade (cidade e UF), CEP, logradouro e nÃºmero sÃ£o gravados de atletas â€” inclusive menores â€” e nunca sÃ£o devolvidos por endpoint nenhum. O cargo do representante do clube Ã© gravado e nenhuma API o devolve. O campo 'sexo' do Ã¡rbitro nÃ£o Ã© usado em nenhuma regra, filtro ou tela. E o campo 'Bairro' aparece no formulÃ¡rio mas nem chega ao servidor.

**Por quê importa:** Choque direto com o princÃ­pio da necessidade (art. 6, III). Ou se declara a finalidade, ou se remove a coleta antes de publicar.

### [MEDIA] A polÃ­tica NÃƒO pode afirmar que adotamos criptografia dos dados ou que mantemos backups. Verificado: nÃ£o hÃ¡ criptografia em repouso (CPF, RG e endereÃ§o em texto puro no Postgres e no volume) e nÃ£o existe nenhum script, cron ou serviÃ§o de backup no repositÃ³rio.

**Por quê importa:** A frase 'adotamos medidas tÃ©cnicas de seguranÃ§a' precisa ser redigida com cuidado. As medidas verificÃ¡veis hoje sÃ£o: hash BCrypt da senha, JWT assinado com RSA 2048, escopo por clube nas consultas e proteÃ§Ã£o contra path traversal. Nada alÃ©m disso.

### [MEDIA] A polÃ­tica NÃƒO pode descrever a evidÃªncia de consentimento como sendo do responsÃ¡vel legal. Verificado: o IP e o user-agent gravados sÃ£o os do dispositivo do representante do clube. Na regularizaÃ§Ã£o retroativa via ediÃ§Ã£o, o consentimento Ã© criado sem IP e sem user-agent reais â€” o campo recebe o texto 'regularizado por <login do operador>'.

**Por quê importa:** Enfraquece a evidÃªncia exigida pelo art. 14, Â§1Âº c/c art. 6, X. A polÃ­tica deve ser sincera sobre como o consentimento Ã© coletado (por meio do clube), sob pena de descrever um fluxo que nÃ£o existe.

### [MEDIA] O TEXTO do termo aceito nÃ£o Ã© armazenado â€” sÃ³ o nÃºmero da versÃ£o, uma constante fixa '1.0' no cÃ³digo. Se o texto do formulÃ¡rio mudar sem alguÃ©m trocar a constante, serÃ¡ impossÃ­vel reconstruir o que a pessoa aceitou.

**Por quê importa:** Impede provar o conteÃºdo do consentimento. Recomenda-se versionar o texto em si (tabela ou arquivo imutÃ¡vel) ANTES de publicar a polÃ­tica, jÃ¡ que a polÃ­tica provavelmente vai gerar uma versÃ£o 2.0 do termo.

### [MEDIA] NÃ£o existe recuperaÃ§Ã£o nem troca de senha, nem bloqueio por tentativas, rate limit ou CAPTCHA. Verificado: zero ocorrÃªncias de esqueci/forgot/reset/recuperar em todo o repositÃ³rio; o login aceita tentativas ilimitadas; nÃ£o hÃ¡ revogaÃ§Ã£o de token no servidor. A conta criada na aprovaÃ§Ã£o do clube nasce com senha aleatÃ³ria que nunca Ã© exibida nem enviada a ninguÃ©m â€” Ã© inutilizÃ¡vel.

**Por quê importa:** Relevante para o art. 46. Na prÃ¡tica a senha acaba combinada por WhatsApp ou telefone, fora de canal controlado. TambÃ©m existe um admin de seed com senha '123456' que sÃ³ pode ser trocado por SQL direto â€” precisa estar resolvido antes do lanÃ§amento, Ã© a conta com acesso a todos os dados de menores.

### [MEDIA] O log da aplicaÃ§Ã£o grava o nome completo do atleta apagado pelo expurgo. O nome de um menor sobrevive ao prÃ³prio descarte do cadastro, dentro dos logs da hospedagem, sem prazo de retenÃ§Ã£o definido para esses logs.

**Por quê importa:** Contradiz a finalidade da rotina de descarte. Trocar o nome pelo id no log Ã© correÃ§Ã£o de uma linha.

### [MEDIA] O fluxo de pagamento estÃ¡ inconsistente: o formulÃ¡rio do frontend nÃ£o envia mais o comprovante Pix, mas a aprovaÃ§Ã£o do atleta exige que o comprovante exista. Nenhum atleta cadastrado pela interface atual pode ser aprovado sem chamada direta Ã  API.

**Por quê importa:** NÃ£o Ã© matÃ©ria da polÃ­tica em si, mas significa que o fluxo descrito na polÃ­tica pode nÃ£o corresponder ao que acontece na prÃ¡tica. Verificar antes de descrever o ciclo de filiaÃ§Ã£o.

### [MEDIA] A polÃ­tica nÃ£o deve ser redigida a partir da documentaÃ§Ã£o interna do projeto (CLAUDE.md e docs/). Verificado que hÃ¡ divergÃªncias reais: a documentaÃ§Ã£o afirma que existe um endpoint pÃºblico de solicitaÃ§Ã£o de Ã¡rbitro (nÃ£o existe mais), descreve o expurgo com prazo de 24 horas (o cÃ³digo usa 90 dias), e a documentaÃ§Ã£o da API descreve comportamentos inexistentes, como um erro 409 de CNPJ duplicado que nunca Ã© verificado.

**Por quê importa:** Para um documento jurÃ­dico, a fonte da verdade Ã© o cÃ³digo. Usar a documentaÃ§Ã£o levaria a afirmaÃ§Ãµes falsas na polÃ­tica.

### [MEDIA] Existem credenciais de teste embutidas no cÃ³digo do frontend (dois e-mails com senha 123456) usadas como fallback quando o backend nÃ£o responde. O token falso gerado nesse modo nÃ£o Ã© aceito pelo backend, entÃ£o nÃ£o dÃ¡ acesso a dado real â€” mas as credenciais ficam legÃ­veis no JavaScript publicado.

**Por quê importa:** NÃ£o afeta o texto da polÃ­tica, mas deve ser removido do build de produÃ§Ã£o antes do lanÃ§amento.

### [BAIXA] O Swagger UI e o schema completo da API ficam pÃºblicos inclusive em produÃ§Ã£o (configuraÃ§Ã£o always-include em /swagger).

**Por quê importa:** ExpÃµe o mapa completo da API, incluindo endpoints administrativos, facilitando reconhecimento. NÃ£o Ã© matÃ©ria da polÃ­tica, mas Ã© do art. 46.

### [BAIXA] O token de sessÃ£o fica em localStorage e nÃ£o em cookie httpOnly, contendo nome e e-mail legÃ­veis em base64 (o JWT Ã© assinado, nÃ£o criptografado).

**Por quê importa:** Escolha comum e aceitÃ¡vel, mas a polÃ­tica nÃ£o deve descrevÃª-la como 'armazenamento seguro'. ReforÃ§a a importÃ¢ncia de nunca adicionar scripts de terceiros ao site.

---

## 9. Perguntas que só a FHT responde

- Quem serÃ¡ o Encarregado pelo Tratamento de Dados Pessoais (DPO)? Precisa de nome e qualificaÃ§Ã£o para constar da polÃ­tica (art. 41). Pelo mapa de cargos da diretoria, os candidatos naturais sÃ£o o Presidente ou o diretor responsÃ¡vel pela Ã¡rea administrativa.
- Qual serÃ¡ o e-mail oficial de contato do Encarregado? Ele precisa EXISTIR, ser monitorado e ter alguÃ©m responsÃ¡vel por responder dentro dos prazos do art. 18. Os endereÃ§os contato@fht.org.br e imprensa@fht.org.br jÃ¡ aparecem no site â€” sÃ£o caixas reais e ativas?
- O nÃºmero de WhatsApp exibido no site Ã© placeholder (sÃ³ zeros). Qual Ã© o nÃºmero real, e ele serÃ¡ canal de atendimento de titular ou sÃ³ de contato geral?
- Por quanto tempo a FHT precisa guardar o cadastro de um atleta APÃ“S a desfiliaÃ§Ã£o ou o fim da anuidade? HÃ¡ norma da CBHb, do sistema desportivo ou obrigaÃ§Ã£o contÃ¡bil/fiscal que imponha prazo mÃ­nimo (ex.: 5 anos para comprovantes de pagamento)?
- Por quanto tempo guardar cadastros de clubes REJEITADOS, de contas de acesso desativadas e de Ã¡rbitros que se candidataram e nunca foram credenciados? Hoje ficam para sempre, com CPF, RG e documentos.
- Existe compartilhamento de dados de atletas ou clubes com a CBHb, com o Governo do Estado, com a Secretaria de Esportes ou com patrocinadores â€” mesmo que por planilha, e-mail ou sistema externo, fora deste sistema? Nada disso existe no cÃ³digo, mas se acontece na prÃ¡tica precisa ser declarado.
- A federaÃ§Ã£o exige inscriÃ§Ã£o de atletas em alguma plataforma nacional (ex.: sistema da CBHb) que receba esses dados? Se sim, quais campos sÃ£o enviados?
- Quem Ã© o hospedeiro real do sistema em produÃ§Ã£o (Railway, outro provedor, servidor prÃ³prio)? NÃ£o hÃ¡ nenhuma configuraÃ§Ã£o no repositÃ³rio que comprove isso, e o hospedeiro serÃ¡ nomeado como operador na polÃ­tica.
- A FHT autoriza a publicaÃ§Ã£o de NOME COMPLETO DE ATLETAS MENORES na vitrine pÃºblica do site? Ã‰ a decisÃ£o jurÃ­dica mais urgente â€” o cÃ³digo jÃ¡ publica hoje. Alternativas: exibir sÃ³ o primeiro nome, exibir sÃ³ o total por categoria, ou condicionar Ã  autorizaÃ§Ã£o do responsÃ¡vel (o que exigiria implementar a checagem).
- Qual a polÃ­tica da federaÃ§Ã£o para fotos de menores na galeria e nas notÃ­cias? AutorizaÃ§Ã£o por evento (termo assinado na inscriÃ§Ã£o da competiÃ§Ã£o), autorizaÃ§Ã£o individual no cadastro, ou nÃ£o publicar rostos identificÃ¡veis de categorias de base?
- A federaÃ§Ã£o aceita manter campos que sÃ£o coletados e nunca usados (Ã³rgÃ£o emissor do RG, naturalidade, endereÃ§o completo do atleta, cargo do representante, sexo do Ã¡rbitro, CPF do representante que Ã© descartado), ou autoriza removÃª-los dos formulÃ¡rios antes do lanÃ§amento? RemovÃª-los simplifica a polÃ­tica e resolve a questÃ£o da minimizaÃ§Ã£o.
- O formulÃ¡rio 'Fale com a FHT' deve ser desativado ou implementado antes do lanÃ§amento? Hoje ele afirma ao cidadÃ£o que a mensagem foi enviada e nÃ£o envia nada.
- A federaÃ§Ã£o quer manter o Sentry (monitoramento de erros, servidor nos EUA)? Se sim, a polÃ­tica precisa declarar transferÃªncia internacional, serÃ¡ necessÃ¡rio contrato de operador, e recomenda-se ativar filtro de dados pessoais antes.
- A federaÃ§Ã£o autoriza auto-hospedar as fontes do site, eliminando a transferÃªncia de IP de todo visitante para o Google? Ã‰ a correÃ§Ã£o mais barata para a seÃ§Ã£o de cookies/terceiros.
- Qual serÃ¡ o prazo prometido de resposta a pedidos de titulares? A lei prevÃª resposta imediata em formato simplificado ou atÃ© 15 dias na forma completa (art. 19).
- Como a federaÃ§Ã£o vai receber e processar, na prÃ¡tica, um pedido de exclusÃ£o ou de revogaÃ§Ã£o de imagem, jÃ¡ que nÃ£o hÃ¡ mecanismo no sistema? Definir o procedimento manual, quem executa e como registrar o atendimento, ANTES de a polÃ­tica prometer o direito.
- A federaÃ§Ã£o vai assumir compromisso pÃºblico com algum prazo para corrigir os pontos crÃ­ticos (arquivos sem autenticaÃ§Ã£o, exclusÃ£o incompleta, revogaÃ§Ã£o inexistente)? A frase 'Dados protegidos pela LGPD' jÃ¡ estÃ¡ publicada no site â€” sem prazo definido, ela Ã© declaraÃ§Ã£o enganosa.


