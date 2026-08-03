# Requisitos pendentes — o que falta pro FHT-SITE ir ao ar

> Levantado em **03/08/2026** por varredura completa do repositório em 6 frentes: mocks
> restantes, fluxos incompletos, lacunas de backend, produção/deploy, promessas que a
> interface faz e não cumpre, e consistência de dados sob uso real.
> **53 pontas soltas** encontradas, classificadas por impacto — não por dificuldade.

**Como ler.** O critério de "bloqueia" não é "está feio", é: **alguém toma uma decisão errada**
(o clube acha que se inscreveu, o admin acha que criou um login, a federação acha que avisou
alguém) **ou o sistema perde dado**. Esforço: `P` = até meio dia · `M` = 1 a 3 dias · `G` = mais
que isso.

---

## Resumo em uma tela

| Bloco | Itens | O que é |
|---|---|---|
| **Bloqueia o lançamento** | 15 | Sem isso não dá pra abrir pra clube de verdade |
| **Importante** | 24 | O sistema opera, mas a primeira temporada cobra |
| **Polimento** | 14 | Detalhe que a diretoria repara |
| **Fora do escopo** | 8 | Fica pra depois, de propósito |
| **Decisão da federação** | 14 | Não é código — é resposta que a gente precisa |

Dos 15 bloqueantes: **6 são infraestrutura** (build de produção, chaves JWT, storage,
backup, SMTP, HTTPS/CORS) e boa parte só começa depois que a federação decidir domínio e
hospedagem. **7 são código** — e 4 desses levam menos de uma hora cada; o peso está em
senha/reset. **2 são conteúdo** (chave Pix, política de privacidade) e dependem de gente de fora.

---

## O QUE A FEDERAÇÃO PRECISA RESPONDER

Levar esta lista na próxima conversa. Cada uma trava alguma coisa do lado técnico.


1. Chave Pix oficial da federação (e se querem QR estático ou copia-e-cola). Sem isso o fluxo de cobrança em lote não fecha — o sistema hoje exige comprovante de um pagamento que não tem destino.

2. Valor da anuidade de 2026 e a regra de renovação: a virada é automática em 1º de janeiro? Quem já era ATIVO volta a dever no dia 1º ou tem prazo? Isso define o job de renovação.

3. Regra oficial de corte das categorias (Sub-12/14/16/18): é por ano civil de nascimento ou por idade na data do evento? Sem isso a categoria continua sendo texto digitado à mão, que envelhece errado.

4. Dados de contato reais: WhatsApp oficial, endereço e CEP da sede, e se contato@fht.org.br e imprensa@fht.org.br existem de fato (o e-mail do sistema vai sair desse domínio).

5. Perfis reais de Instagram/Facebook/YouTube — se não existirem, os ícones saem do site em vez de ficar com link morto.

6. Texto da política de privacidade e quem é o Encarregado/DPO, com o advogado. Inclui a decisão pendente sobre exibir nome de atleta menor na vitrine pública.

7. Domínio definitivo (fht.org.br com e sem www?), quem contrata e quem paga a hospedagem, o banco e o storage. Isso destrava metade do bloco de infraestrutura.

8. Conta de e-mail para envio transacional (SMTP próprio ou serviço tipo Resend/Brevo) e acesso ao DNS pra configurar SPF e DKIM.

9. Ata e estatuto são obrigatórios pra aprovar uma filiação, ou o clube pode ser aprovado e entregar depois? Hoje o sistema aprova sem conferir documento.

10. O que acontece com clube rejeitado: pode se recandidatar corrigindo os documentos? A federação pode voltar atrás? Isso define se o botão é 'reconsiderar' ou 'novo cadastro'.

11. Transferência de atleta entre clubes: quem autoriza — só a federação, ou o clube de origem precisa liberar? É o caso que mais vai bater na porta na primeira temporada.

12. Quem serão os admins no dia 1 (nomes e e-mails) e quem é o master. Pro lançamento basta a lista; o modelo de permissões por área vem depois.

13. Prazo real de resposta a uma solicitação de filiação — o site promete 5 dias úteis hoje.

14. Quantos clubes entram no piloto de agosto. Recomendo abrir com 2 ou 3 conhecidos antes de anunciar pra todos.

---

## BLOQUEIA O LANÇAMENTO

### 1. Frontend não tem build de produção e a URL da API está congelada em localhost

`M` | `frontend/Dockerfile:11 e frontend/.env:1`

O frontend/Dockerfile roda `npm run dev` (servidor de desenvolvimento do Vite) e o frontend/.env — que está commitado no git — diz VITE_API_URL=http://localhost:8080. No Vite essa variável é substituída em tempo de BUILD: no primeiro build de verdade, o navegador de cada visitante vai tentar falar com o localhost dele mesmo e nenhuma tela carrega dado. Junto vem o segundo problema: sem servidor estático com fallback de SPA, dar F5 em /admin, /clube ou abrir um link de notícia compartilhado no WhatsApp devolve 404.

### 2. Chaves JWT morrem no primeiro build feito fora da sua máquina

`M` | `backend/Dockerfile:8 e setup.sh:9`

As chaves RSA são geradas pelo setup.sh, estão no .gitignore e são embutidas na imagem pelo `COPY src/ src/` do backend/Dockerfile:8. Hoje funciona só porque os arquivos .pem existem no disco do seu PC desde junho. Qualquer build a partir de um clone limpo (Railway, GitHub Actions, notebook novo) gera imagem sem as chaves e o backend não assina nem valida token: ninguém loga. E se rodar o setup.sh no servidor, cada rebuild gera par novo e derruba todo mundo que estava logado.

### 3. Arquivos enviados vivem no disco do container, e documento pessoal é servido sem login

`G` | `backend/src/main/java/br/org/fht/storage/R2StorageService.java:46 e resource/FileResource.java:30`

Duas metades do mesmo problema. (1) O R2 nunca foi configurado, então o storage cai no fallback local em /app/uploads: em PaaS de disco efêmero, cada deploy apaga ata e estatuto de todo clube filiado, RG, foto 3x4, comprovante de residência e comprovante Pix de todo atleta, além dos comprovantes de lote. O banco guarda só a URL — a recuperação é impossível e o link vira 404 na cara do usuário. (2) GET /api/files não tem @RolesAllowed, ou seja, é público; é exatamente por ali que sai o RG digitalizado de atleta menor. A única proteção é o UUID aleatório na chave — uma URL num print ou num e-mail encaminhado abre o documento sem login.

### 4. Não existe backup do banco

`M` | `docker-compose.yml:65`

A pasta scripts/ tem só o seed de teste. Não há pg_dump agendado, política de retenção nem restore testado, e o compose usa volume local — um `docker compose down -v` distraído apaga clubes, atletas, registros de consentimento LGPD e o histórico de pagamentos. Não dá pra pedir a 20 clubes que cadastrem seus atletas num sistema que não tem cópia de nada.

### 5. E-mail está em modo simulado: nenhuma mensagem sai de verdade

`M` | `backend/src/main/resources/application.properties:41`

quarkus.mailer.mock tem default true (application.properties:41) e SMTP_USER/SMTP_PASS estão vazios. Os 6 disparos ligados só escrevem no log do container. Na prática: o clube manda a filiação e nunca é avisado de que foi aprovado (fica tentando entrar e tomando 'Usuário inativo'), e a federação nunca fica sabendo que chegou solicitação — o fluxo inteiro passa a depender de alguém lembrar de abrir o painel. Precisa também de SPF/DKIM no domínio, senão o e-mail sai e cai em spam, o que dá quase no mesmo.

### 6. Ninguém consegue trocar senha — nem o clube, nem a federação, nem você

`G` | `backend/src/main/java/br/org/fht/resource/AuthResource.java:39 e db/migration/V4__seed_admin.sql:6`

Varri o backend: senhaHash só é escrito em 3 pontos, todos de CRIAÇÃO de usuário (ClubeServiceImpl:107, AdminResource:87, AuthResource:119). Não existe rota de trocar senha, de reset pelo admin nem de 'esqueci minha senha' — e o AuthResource tem exatamente /login, /refresh e /usuarios. O próprio e-mail de aprovação que o sistema envia diz 'Se esqueceu a senha, fale com a federação' (EmailService.java:81), e a federação não tem botão nenhum: a saída é UPDATE no Postgres com bcrypt gerado à mão. Some a isso que o admin do seed é admin@fht.org.br / 123456, publicado no git, na conta mais poderosa do sistema. O primeiro clube que esquecer a senha em agosto vira chamado de suporte pra você, no SQL.

### 7. Login é sensível a maiúscula no e-mail

`P` | `backend/src/main/java/br/org/fht/resource/AuthResource.java:52`

O cadastro normaliza (ClubeServiceImpl:73 faz trim+toLowerCase), o login não: AuthResource:52 usa req.email() cru e findByEmail é comparação exata. O clube se cadastra digitando 'Contato@Clube.com.br' no celular (teclado capitaliza a primeira letra por padrão), o banco guarda minúsculo, e quando ele tenta entrar com exatamente o mesmo texto recebe 401 'Credenciais inválidas'. Ele vai jurar que a senha está certa — e está. Isso vai acontecer, não é hipótese.

### 8. Clube edita o próprio e-mail em Meus Dados e a suspensão vira enfeite

`P` | `backend/src/main/java/br/org/fht/service/ClubeServiceImpl.java:233`

O PUT grava clubes.representante_email (ClubeServiceImpl:175) e não toca em usuarios.email. Duas consequências. Primeira: o login continua sendo o e-mail antigo e ninguém avisa o clube — ele fica trancado do lado de fora. Segunda, pior: definirAcesso() procura a conta pelo e-mail do representante com .ifPresent() (linha 233), então depois da edição a busca não acha ninguém e falha calado. A federação clica suspender, o painel responde 200 e mostra SUSPENSO, e o representante continua entrando e cadastrando atleta normalmente — exatamente o que o comentário da linha 228 diz querer impedir. Vale igual para rejeitar e reativar. Conserto certo: definirAcesso achar a conta por clubeId, que já existe em Usuario.

### 9. Atleta com 3 posições derruba o cadastro com erro 500 no último passo

`P` | `frontend/src/pages/ClubeDashboard.tsx:947`

O passo esportivo é um multi-select sem limite e o envio concatena tudo numa string (ClubeDashboard.tsx:947), mas a coluna é posicao VARCHAR(50) NOT NULL (V3:19) e ninguém valida tamanho. Duas posições longas ainda cabem; três estouram ('Ponta Direita, Armador Lateral Direito, Armador Lateral Esquerdo' = 64 caracteres). O Postgres devolve erro, cai no fallback do GlobalExceptionMapper e o clube lê 'Erro interno do servidor' DEPOIS de preencher quatro passos e subir o RG — perdendo tudo. Ironia: CompeticaoServiceImpl já tem um validarTamanho() feito justamente pra isso, só não foi aplicado ao atleta.

### 10. Rejeitou clube ou atleta, acabou: não tem caminho de volta

`M` | `backend/src/main/java/br/org/fht/service/ClubeServiceImpl.java:206`

Clube rejeitado tem as três saídas fechadas: recadastrar dá 409 'e-mail já cadastrado' (ClubeServiceImpl:75), entrar dá 403 'Usuário inativo', e o admin não tem botão — o rodapé do ClubeDetailPanel só trata PENDENTE, ATIVO e SUSPENSO (AdminDashboard.tsx:655), então em REJEITADO só aparece FECHAR; reativar() recusa qualquer status que não seja SUSPENSO. O atleta é o mesmo beco com um agravante: o motivo da rejeição é gravado e mostrado só no painel do admin — a string motivoRejeicao não aparece uma vez em ClubeDashboard.tsx, então o clube vê um badge vermelho 'Rejeitado' e nenhuma explicação, sem nada que possa fazer. Uma rejeição por engano na primeira semana, ou um clube que corrigiu a documentação, só se resolve no banco.

### 11. Formulário 'Fale com a FHT' engole a mensagem e diz que enviou

`M` | `frontend/src/components/Contact.tsx:17`

handleSubmit faz literalmente `e.preventDefault(); setSent(true)` — zero chamadas de rede, e não existe endpoint de contato entre os 13 resources do backend. A tela então exibe 'MENSAGEM ENVIADA! Nossa equipe retornará em breve pelo e-mail ou telefone informado'. É o destino de três caminhos do site: o CTA 'OUTROS ASSUNTOS', o rodapé de Competições e o botão 'FALE COM A ARBITRAGEM' — hoje a ÚNICA porta de entrada de quem quer virar árbitro. A federação vai perder contato de clube, de imprensa e de árbitro sem nunca saber que existiu.

### 12. O modal de pagamento exige comprovante de um Pix que não tem para onde ser feito

`M` | `frontend/src/pages/ClubeDashboard.tsx:423`

O modal mostra uma caixa branca escrita 'QR Code PIX FHT' (placeholder) e logo abaixo bloqueia o envio sem anexo: 'Anexe o comprovante do Pix'. Não existe chave Pix, código copia-e-cola nem QR em lugar nenhum do repositório — nem no front, nem em application.properties, nem no PagamentoServiceImpl. O fluxo de cobrança em lote, que é a peça que traz dinheiro pra federação, termina numa parede.

### 13. Esconder as telas de demonstração antes de abrir pra clube real

`P` | `frontend/src/pages/admin/UsuariosPage.tsx:307, ClubeDashboard.tsx:1789, admin/CompeticoesPage.tsx:1103, data/referees.ts:13`

São quatro, e o risco não é estético — é alguém acreditar que fez algo que não fez. (1) Usuários & Admins não importa services/api: o admin escolhe o clube, digita e-mail e senha inicial, clica, a linha aparece na tabela e NADA foi criado — a senha é descartada em setLcSenha(''). O clube nunca entra e o admin não tem como saber. (2) A aba Inscrições do painel do clube lista 4 campeonatos inventados (que nem batem com os reais que o admin cadastrou), deixa escalar atletas REAIS vindos da API e devolve selo verde 'Inscrito · N atletas escalados' que some no F5 — um clube pode chegar no dia do jogo achando que estava inscrito. (3) As abas Chaveamento/Equipes/Check-in/Jogos do admin dizem 'Nenhum clube inscrito nesta competição ainda' e 'a tabela de jogos aparece quando a competição começa', ou seja, afirmam que a funcionalidade existe e só falta dado — o admin vai esperar por sempre. (4) A home anuncia 'PRÓXIMOS CURSOS' de arbitragem datados de 14/06/2025 e 19/07/2025, vencidos há mais de um ano, sem selo nenhum. Os selos 'demonstração' que existem são 10px cinza a 60% de opacidade ao lado de títulos de 24px.

### 14. LGPD citada em quatro lugares e nenhuma política de privacidade existe

`M` | `frontend/src/components/CookieBanner.tsx:20 e Footer.tsx:106`

Busca por 'privacidade', 'política' e 'termos' em todo o frontend/src: zero. Não há página, rota nem link. Enquanto isso o rodapé afirma 'Dados protegidos pela LGPD', o banner de cookies repete a frase (e só oferece ACEITAR e Fechar, sem recusar), e o checkbox obrigatório da filiação diz 'estou ciente das regras da FHT' sem link para regra nenhuma. O sistema coleta CPF, RG e comprovante de residência de menores de 12 a 18 anos com consentimento de responsável — e o consentimento não tem documento por trás. É o item que mais expõe a federação se alguém questionar, e é o único da lista cujo conteúdo não é código.

### 15. Sem HTTPS e com CORS fixo no código, sem www

`P` | `backend/src/main/resources/application.properties:30`

Não há nenhuma configuração de TLS no projeto e nenhum proxy no compose — a senha que o clube escolhe no cadastro e o token JWT trafegam em texto claro. E quarkus.http.cors.origins está hardcoded como 'https://fht.org.br,http://localhost:5173': se o site atender em www.fht.org.br ou numa URL de piloto (Vercel/Netlify), TODA chamada é bloqueada pelo navegador sem mensagem de erro visível — o site abre bonito e nenhuma tela carrega. Mudar o domínio hoje exige rebuild da imagem, e o localhost segue liberado em produção.

---

## IMPORTANTE - o sistema opera, mas a primeira temporada cobra

### 1. A anuidade nunca renova — em 01/01/2027 ninguém deve nada

`G` | `backend/src/main/java/br/org/fht/service/PagamentoServiceImpl.java:72`

atletasPendentes() só considera pendente quem está com status AGUARDANDO_PAGAMENTO. Atleta que virou ATIVO em 2026 nunca mais volta pra fila: na virada do ano a barra 'ANUIDADE PENDENTE' do clube some, a federação fatura R$ 0 e o elenco inteiro segue ATIVO e elegível sem ter pago o ano novo. O campo taxaAno é gravado uma vez no onCreate e não é lido por nenhuma regra de negócio. A regra central do produto — 'pagar a anuidade do ano habilita competir naquele ano' — só passa a existir de verdade com isso. Não bloqueia agosto porque só dói em janeiro, mas é a maior dívida funcional aberta e precisa estar pronta antes de dezembro.

### 2. Sessão expirada não desloga: o painel trava num 'tentar novamente' eterno

`M` | `frontend/src/services/api.ts:42 e context/AuthContext.tsx:90`

O JWT vale 24h. No 401 o cliente HTTP apaga o token do localStorage, mas o ProtectedRoute lê o token do state do AuthContext — e mexer no localStorage não dispara re-render nenhum. Resultado: no dia seguinte o usuário abre o painel, o shell monta normal, todas as chamadas falham e o botão TENTAR NOVAMENTE repete o mesmo erro pra sempre; a única saída é adivinhar que precisa clicar 'Sair'. O backend já emite refreshToken e já expõe POST /api/auth/refresh, e o tipo do front já declara o campo — o front simplesmente joga fora. Se isso pegar no meio do cadastro multi-step de atleta, o clube perde o formulário e os arquivos.

### 3. Suspender clube não derruba quem já está logado, e os atletas dele continuam ativos

`M` | `backend/src/main/java/br/org/fht/service/JwtService.java:24 e ClubeServiceImpl.java:219`

Nenhum request revalida usuarios.ativo depois do login — não há /api/auth/me nem revogação, e o token dura 24h. Quem já estava dentro quando foi suspenso segue operando o dia inteiro: cadastrar atleta trava (essa rota confere o clube ATIVO), mas listar/editar atleta, mandar lote de pagamento e editar dados do clube não conferem nada. E suspender() não toca em atleta nenhum: o clube some da vitrine pública, mas os atletas continuam ATIVOS no banco, contando no dashboard da federação e elegíveis pela regra de negócio. A suspensão hoje é cosmética.

### 4. Nenhum upload valida tipo ou tamanho, e o 413 chega como 'Erro 413'

`M` | `backend/src/main/java/br/org/fht/storage/R2StorageService.java:75`

R2StorageService.upload aceita qualquer arquivo sem olhar contentType nem size, e nenhum service confere antes — o `accept` do formulário é só dica de UI. Dá pra subir .exe, .html ou .svg pelo endpoint PÚBLICO de filiação, e o FileResource devolve o arquivo com o content-type adivinhado, sem Content-Disposition, na mesma origem da API (isso é XSS armazenado). Do lado prático: max-body-size=10M vale pro request INTEIRO, e o cadastro de atleta manda 4 arquivos juntos — duas fotos de celular moderno já estouram o limite; o front não checa tamanho antes de enviar nem trata o 413, então o clube preenche tudo e recebe uma mensagem que não explica nada.

### 5. Arquivo nunca é apagado — inclusive no expurgo que existe pra cumprir a LGPD

`M` | `backend/src/main/java/br/org/fht/service/AtletaExpurgoJob.java:49 e AtletaServiceImpl.java:120`

O R2StorageService só tem upload(); não existe delete de arquivo em canto nenhum do backend. Então deletar atleta, árbitro, notícia, foto ou documento apaga só a linha do banco e o arquivo continua servindo pela URL. O caso feio é o AtletaExpurgoJob, que apaga o cadastro abandonado justamente 'pra não guardar dado pessoal para sempre' e deixa o RG digitalizado do menor intacto no disco. Somando: cadastro que falha no meio também deixa órfão, porque o upload acontece ANTES do persist e o rollback não desfaz arquivo.

### 6. Consentimento LGPD não pode ser revogado por nenhuma rota

`M` | `backend/src/main/java/br/org/fht/repository/ConsentimentoRepository.java:12`

A coluna revogado_em existe desde a V12 e é LIDA em dois pontos que decidem aprovação, mas nada no sistema escreve nela: não há endpoint, não há método de service, não há tela. O consentimento de uso de imagem é declarado no próprio formulário como 'sempre opcional e revogável'. Quando o primeiro pai ligar pedindo pra tirar a foto do filho do site, a única forma de atender é UPDATE no Postgres.

### 7. Transferência de atleta entre clubes não existe

`M` | `backend/src/main/java/br/org/fht/dto/atleta/AtletaUpdateForm.java:11`

O domínio inteiro fala de transferência (coluna is_transferencia, clube_anterior, o formulário pergunta, o DTO devolve) mas isso é só rótulo do cadastro inicial: o AtletaUpdateForm não tem clubeId e nenhuma rota move um atleta de clube. Quando o Palmas perder um atleta pro Araguaína, o Araguaína tenta cadastrar e toma 409 de CPF duplicado; a única saída hoje é a federação DELETAR o atleta — o que apaga histórico e os consentimentos LGPD por cascata — pro outro clube recadastrar do zero. Isso vai acontecer na primeira temporada.

### 8. Nenhuma lista tem paginação, e a de atletas manda CPF de menor inteiro pro navegador

`G` | `backend/src/main/java/br/org/fht/resource/AtletaResource.java:94 e service/AtletaServiceImpl.java:251`

Não existe paginação em ponto nenhum: zero LIKE no backend, todo filtro é client-side sobre a lista completa. GET /api/atletas devolve TODOS os atletas da federação de uma vez, e o DTO inclui cpf, rg, responsavelCpf, responsavelEmail, responsavelTelefone e as URLs dos documentos. Com 20 clubes x 50 atletas são 1000 registros com dado pessoal de menor num único JSON, recarregado a cada aprovar/suspender. Junto vem um N+1: a listagem chama temPagamentoConfirmado dentro do .map(), uma subquery por atleta — duas linhas acima o mesmo arquivo já resolve os consentimentos numa query só, dá pra copiar o padrão.

### 9. A lista de atletas do painel do CLUBE não tem busca, filtro nem ordenação

`M` | `frontend/src/pages/ClubeDashboard.tsx:480`

É um .map() cru da lista: sem campo de busca, sem filtro por status, sem ordenação, sem paginação — o painel do admin ao menos tem busca, o do clube não tem nada. Com 50 atletas o representante rola a tabela procurando um nome no olho e não consegue perguntar 'quais dos meus estão aguardando aprovação?'. O modal de pagamento também lista todos os pendentes num scroll pequeno, todos marcados por padrão, sem busca — é onde ele decide quanto vai pagar.

### 10. Busca não ignora acento: procurar 'jose' não acha 'José'

`P` | `frontend/src/pages/AdminDashboard.tsx:1021`

Todas as buscas do sistema são includes(toLowerCase) e `normalize(` não aparece uma única vez em frontend/src. Maiúscula funciona, acento não: 'jose' não encontra 'José Antônio' e 'araguaina' não encontra 'Araguaína'. Num cadastro de nomes brasileiros e cidades do Tocantins isso é o caso comum, não a exceção — quem usar vai concluir que a busca está quebrada.

### 11. URL desconhecida renderiza tela branca

`P` | `frontend/src/App.tsx:50`

O bloco Routes declara seis caminhos e nenhum path="*". Um link antigo compartilhado no WhatsApp, um slug de notícia removida, um erro de digitação ou alguém tentando /sobre por analogia com o menu resulta em página em branco: sem navbar, sem rodapé, sem caminho de volta.

### 12. O botão FILIAR MEU CLUBE leva pro formulário que não envia

`P` | `frontend/src/components/Clubs.tsx:213`

O CTA principal da vitrine de clubes aponta para #contato, enquanto o formulário de filiação que funciona ponta a ponta e cria a conta do clube está em #cadastro. O único caminho de conversão do site joga o clube interessado justamente no formulário morto. É uma linha.

### 13. WhatsApp, CEP e redes sociais são preenchimento

`P` | `frontend/src/components/Contact.tsx:34 e Footer.tsx:45`

O CTA 'SOU ATLETA OU CLUBE' aponta pra https://wa.me/556300000000 — número inexistente, abre conversa inválida. O bloco 'Onde estamos' traz 'CEP: 77000-000' e endereço só como 'Palmas, Tocantins'. E os seis ícones de rede social (três no rodapé, três no contato) têm href="#" com target="_blank": clicar abre uma aba nova recarregando a própria home. Tudo isso nas duas áreas mais visíveis do site institucional.

### 14. CNPJ do clube não é validado nem é único — e a API documenta um 409 que nunca acontece

`P` | `backend/src/main/java/br/org/fht/service/ClubeServiceImpl.java:84`

solicitar() valida nome, representante, e-mail, senha e CPF, e passa o CNPJ direto pro setter. Não há UNIQUE na coluna nem existsByCnpj, mas o Swagger anuncia '409 CNPJ já cadastrado'. O front valida o dígito verificador, a API não: chamada direta cadastra CNPJ inválido, e duas filiações com o mesmo CNPJ entram sem reclamação (basta outro e-mail). A federação acaba com dois cadastros da mesma entidade, cada um com seus atletas e sua anuidade.

### 15. Campos NOT NULL no banco sem validação no service devolvem 500 em vez de mensagem

`M` | `backend/src/main/java/br/org/fht/service/ClubeServiceImpl.java:55 e AtletaServiceImpl.java:262`

ClubeForm marca cidade, uf, cnpj, telefone, ata e estatuto como obrigatórios no Swagger, mas solicitar() só exige quatro campos — e como cidade e telefone são NOT NULL, uma chamada sem eles estoura no INSERT e vira 'Erro interno do servidor'. Mesmo padrão no atleta (nomeCompleto, sexo, rg, posicao, categoria). Efeito colateral que importa mais: dá pra filiar um clube sem ata e sem estatuto, e aprovar assim mesmo — aprovar() não confere documento nenhum. Some a isso que editar atleta faz LocalDate.parse cru (o cadastro já tem um parseNascimento() com tratamento a duas telas de distância), então data malformada na edição também vira 500 e um evento no Sentry.

### 16. Valor da anuidade só muda por variável de ambiente, e a ficha do atleta mostra outro valor

`M` | `backend/src/main/java/br/org/fht/model/Atleta.java:114`

O preço vem de fht.anuidade.valor e não há endpoint pra alterar: se a federação reajustar em assembleia, alguém mexe no ambiente e reinicia o backend. Pior, existem duas fontes de verdade: Atleta.taxaValor nasce hardcoded como 35.00, nunca é atualizado e é exibido na ficha. No dia em que a anuidade virar R$ 50, o clube vê 'R$ 50,00' na cobrança e 'Taxa: R$ 35,00' na ficha do atleta, na mesma sessão.

### 17. Status manual de competição congela para sempre

`M` | `backend/src/main/java/br/org/fht/model/Competicao.java:96`

getStatusEfetivo() devolve o statusOverride de cara, sem olhar data nenhuma. E INSCRICOES_ABERTAS só existe como override — pra anunciar inscrições abertas o admin é OBRIGADO a fixar na mão, e a partir daí a competição nunca mais avança sozinha. Uma competição de setembro/2026 deixada assim continua anunciando inscrições abertas em 2027, e o Hero prioriza justamente INSCRICOES_ABERTAS: a competição velha vira a manchete permanente do site. O botão de voltar ao automático existe, mas nada lembra ninguém de apertá-lo.

### 18. Categoria do atleta é texto congelado e não acompanha a idade

`M` | `frontend/src/pages/ClubeDashboard.tsx:78`

A categoria é escolhida à mão num select e gravada como string, nunca recalculada a partir da data de nascimento. O atleta cadastrado como Sub-14 em 2026 continua Sub-14 no sistema em 2028, quando já é Sub-16. Isso alimenta as categorias exibidas na vitrine pública dos clubes e o gráfico de elenco do painel — ou seja, o site anuncia categoria errada, e a correção depende de cada clube lembrar de editar 50 fichas na virada do ano. Precisa da regra oficial de corte da federação antes de codar.

### 19. Data de nascimento aparece um dia antes nos dois painéis

`P` | `frontend/src/pages/ClubeDashboard.tsx:22 e backend/model/Atleta.java:122`

O fmtDate dos painéis faz new Date(iso) com uma string só-data, que o JS lê como meia-noite UTC — em UTC-3 vira o dia anterior. '2010-05-15' é exibido como 14/05/2010 na ficha do atleta, no painel do clube e no do admin. A prova de que é descuido: no mesmo arquivo o isMenorDeIdade já faz certo (concatena T00:00:00) e os componentes públicos também. Só os painéis ficaram de fora. Junto: Atleta.onCreate usa LocalDate.now() sem fuso — o único ponto de regra de negócio que escapou da classe Fuso — então atleta cadastrado depois das 21h de 31/12 nasce com taxaAno do ano seguinte.

### 20. Zero rate limit no login e no cadastro público de clube

`M` | `backend/src/main/java/br/org/fht/resource/AuthResource.java:39`

Não há nenhuma biblioteca ou filtro de rate limit no projeto. POST /api/clubes/solicitar é público (correto) e cada chamada cria três linhas e grava arquivos em disco — um script simples enche a fila de aprovação da federação, enche o disco e ainda ocupa e-mails no índice único, impedindo o clube legítimo de usar o próprio e-mail depois. E POST /api/auth/login não tem contador de tentativas nem bloqueio: força bruta ilimitada contra a senha do admin, que hoje é 123456 e está publicada no repositório. O caminho mais barato é ligar no Cloudflare, sem tocar em código.

### 21. Endurecimento do servidor: Swagger aberto, senha do banco no compose, sem healthcheck e sem restart

`P` | `backend/src/main/resources/application.properties:22 e docker-compose.yml:9`

Quatro coisas pequenas que só doem em produção. quarkus.swagger-ui.always-include=true entrega o mapa completo da API (todos os endpoints de admin, todos os campos, exemplos de senha) pra quem abrir /swagger. O compose tem POSTGRES_PASSWORD=fht_pass em texto puro e publica a porta 5433 no host — se ele virar base pro VPS, o banco fica exposto com senha que está no GitHub. Não existe quarkus-smallrye-health, então nenhum provedor consegue saber se o backend está vivo; e nenhum serviço tem restart policy: se o processo morrer, nada levanta e nada avisa. Fechando: o Sentry está no código mas sem DSN preenchido — erro em produção acontece com o clube e a federação nunca fica sabendo.

### 22. Gráfico 'Novas afiliações — 2026' com 12 números inventados

`M` | `frontend/src/pages/AdminDashboard.tsx:790`

A série é literal no código ([2,4,3,6,5,8,7,10,9,12,11,14]) — uma curva de crescimento bonita e falsa, no gráfico mais visível do dashboard do admin, justamente o que vai aparecer na apresentação. Tem selo de demonstração ao lado do título, mas a curva conta uma história que não aconteceu. Dá pra calcular de verdade agrupando clube/atleta por mês do createdAt.

### 23. Falta um documento de deploy com a lista completa de variáveis de ambiente

`P` | `.env.example:1 e docker-compose.yml:29`

Não há README na raiz e nenhum dos 12 docs trata de infraestrutura. O .env.example lista 6 variáveis (R2 e Sentry) e não menciona DB_*, SMTP_*, FHT_EMAIL_*, FHT_ANUIDADE_VALOR, ATLETA_EXPURGO_DIAS nem TZ. O TZ é o mais traiçoeiro: só existe no docker-compose (America/Araguaina), e sem ele o container roda em UTC — a partir das 21h de Palmas o 'hoje' vira o dia seguinte, bagunçando status de competição, prazo de pagamento e o cálculo de idade que decide se o atleta é menor e exige consentimento. Num deploy fora do compose isso não vai junto, e hoje só você sabe o que precisa ser preenchido.

### 24. O workflow do GitHub Actions está na pasta errada e nunca rodou

`P` | `backend/.github/workflows/deploy.yml:25`

O deploy.yml existe, mas em backend/.github/workflows/ — o Actions só lê .github/workflows/ na RAIZ, e confirmei que não existe .github na raiz. Ou seja, esse pipeline nunca executou uma única vez; a impressão é de que existe CI/CD quando não existe. E se fosse movido, falharia: usa ./mvnw e só existe mvnw.cmd no repo, e não injeta as chaves JWT. Pro prazo, o mais simples é deixar o Railway buildar direto do repo e apagar o workflow pra não confundir.

---

## POLIMENTO

### 1. Rodapé com copyright de 2025

`P` | ``

O ano está fixo no código: 'FHT © 2025 · Palmas, TO'. O site lança em agosto/2026 e já nasce com data errada — é o tipo de detalhe que a diretoria repara na hora. Trocar por new Date().getFullYear().

### 2. Subtítulos e textos que prometem mais do que a tela faz

`P` | ``

O cabeçalho de Competições diz 'Gerencie campeonatos, chaveamento, escalações, check-in e placares ao vivo' quando só o CRUD existe. O Financeiro diz que os atletas do lote 'são ativados automaticamente' quando, na verdade, quem estiver sem RG ou sem consentimento vai pra AGUARDANDO_APROVACAO. E o erro que o clube vê ao tentar entrar antes da aprovação é 'Usuário inativo' — mensagem de sistema onde deveria estar 'sua filiação ainda está em análise'.

### 3. Número de equipes é digitado à mão e vira fato no site público

`P` | ``

O admin digita 'Número de equipes' e o próprio campo avisa que é provisório — mas esse aviso só existe no painel. No card público a competição anuncia '16 equipes' como se fosse contagem real. Enquanto não houver inscrição, rotular como 'vagas previstas' ou omitir do card quando for 0.

### 4. Lista de anos da galeria fixa até 2026

`P` | ``

O select de ano ao cadastrar foto usa um array fixo terminando em 2026. Em janeiro de 2027 o admin não consegue marcar o ano corrente — bug silencioso na virada do ano. Gerar a lista a partir do ano atual.

### 5. Dois endpoints duplicados de criar usuário, um sem validação nenhuma

`P` | ``

POST /api/admin/usuarios e POST /api/auth/usuarios fazem a mesma coisa, com o mesmo record declarado duas vezes, e nenhum dos dois é chamado pelo front. O do AuthResource não tem @Valid nem @NotBlank: com campos nulos passa a checagem e estoura no INSERT (500), e clubeId inventado dá violação de FK (500 também). Apagar o do AuthResource.

### 6. Campos que o clube digita e nunca mais ninguém vê

`P` | ``

rgOrgaoEmissor, naturalidadeCidade e naturalidadeUf são pedidos no formulário, enviados e gravados — mas não estão no DTO de resposta nem no mapper, e o form de edição não permite corrigi-los. Do outro lado, cidade/ufResidencia são marcados como obrigatórios no Swagger, aparecem na ficha do admin ('Cidade / UF') e nunca são enviados pelo cadastro, então todo atleta novo mostra ' / '. E cep/logradouro/numero são colunas totalmente mortas. Coletar dado pessoal que nunca é usado é o contrário da minimização da LGPD — decidir campo a campo: devolver ou parar de coletar.

### 7. CPF é gravado com máscara, então a unicidade é frágil e a busca não acha

`P` | ``

O validador normaliza só pra conferir o dígito; o que vai pro banco é a string formatada. No fluxo normal fica consistente, mas existsByCpf e o UNIQUE comparam texto: qualquer chamada sem máscara (Swagger, importação, script) cria um segundo atleta com o mesmo CPF. E digitar '12345678900' na busca do admin não encontra '123.456.789-00'. Guardar só dígitos e formatar na exibição resolve os dois.

### 8. CPF de árbitro sem validação nem checagem de duplicidade

`P` | ``

O cadastro de árbitro valida só o nome e joga o CPF direto no setter — não passa pelo CPFValidator que já existe e é usado no atleta e no clube, e a coluna não é única. Dá pra cadastrar o mesmo árbitro duas vezes e ele aparecer duplicado na vitrine pública. O campo 'nível' também é texto livre, apesar do Swagger declarar a lista fechada.

### 9. CPF do representante do clube não é editável

`P` | ``

A coluna foi criada justamente porque o formulário coletava e jogava fora, mas o ClubeUpdateForm não tem o campo — erro de digitação no CPF do representante só se corrige por SQL.

### 10. Anotações @Schema divergem da validação real

`P` | ``

O Swagger marca CNPJ, ata e estatuto como obrigatórios enquanto o formulário público diz 'CNPJ (opcional)' e permite entregar documento depois; marca cidade/ufResidencia do atleta como obrigatórios enquanto o cadastro nem coleta. Nada quebra em execução — confunde quem ler o Swagger pra testar ou integrar depois.

### 11. Hero decide a competição em destaque usando data UTC

`P` | ``

Usa toISOString() pra montar o 'hoje', que é sempre UTC. Das 21h às 23h59 de Palmas o site já acha que é o dia seguinte, e uma competição que começa amanhã some do destaque três horas antes da hora. É a mesma armadilha que o backend resolveu criando a classe Fuso — o front não tem equivalente.

### 12. Sem .dockerignore: o node_modules do Windows entra na imagem Alpine

`P` | ``

O Dockerfile do front instala as dependências e DEPOIS faz COPY . ., copiando o node_modules do seu Windows por cima do que acabou de instalar (inclusive binários -win32-x64-msvc), e leva o .env junto. Hoje pode estar mascarado por cache de camada, mas é bomba-relógio pra qualquer build em CI ou em outra máquina, além de inchar a imagem.

### 13. Backend sem nenhum teste automatizado

`G` | ``

Não existe backend/src/test. Zero cobertura justamente nas regras onde errar custa dinheiro ou dado de menor: os dois portões de aprovação do atleta, a baixa em lote que ativa uns e bloqueia outros, a trava de cobrança dupla e as checagens de escopo clube x federação. Não bloqueia agosto, mas a partir do lançamento cada mudança é feita no escuro.

### 14. 'A FHT entrará em contato em até 5 dias úteis' sem nada que sustente o prazo

`P` | ``

A promessa está na tela de sucesso da filiação e repetida na resposta do backend, mas não há fila com prazo, lembrete nem destaque de solicitação parada no painel. Ou tira o prazo do texto, ou combina o SLA com a federação e mostra 'aguardando há X dias' na lista de pendentes.

---

## FORA DO ESCOPO DESTE LANÇAMENTO

Está aqui pra ficar registrado que **foi decisão**, não esquecimento.

- Competições fatias 2 a 6: equipes inscritas, chaveamento/sorteio, tabela de jogos, placares ao vivo, escalação e check-in no dia do jogo. É o próximo grande módulo — a Fatia 1 (CRUD + vitrine pública) está pronta e é o que vai ao ar em agosto.

- Módulo de admins, hierarquia e permissões por área (DEV/dono, master/Presidente, comitê com scopes por cargo). Hoje o backend só tem os roles ADMIN_FHT e ADMIN_CLUBE, sem coluna de scope. O que precisa existir pro lançamento é bem menor: criar/desativar login de admin e de clube pelo painel, mais reset de senha.

- Relatórios financeiros: balanço, exportação em PDF/Excel, comparativos por período e fechamento anual. O que existe hoje é cobrança em lote e baixa, que é o suficiente pra operar.

- Portal/login do atleta — descartado por decisão (jul/2026). Alternativa futura, se pedirem: consulta pública por CPF, sem login.

- CRUD de cursos de arbitragem (hoje os cursos são os únicos dados estáticos do site público — a decisão de curto prazo é escondê-los, não construir o módulo).

- Self-edit do diretor: cada membro da diretoria editar o próprio perfil. Depende do módulo de permissões acima; hoje é CRUD por ADMIN_FHT e funciona.

- Editor de texto rico (WYSIWYG) no corpo da notícia — hoje é textarea, que publica normal.

- Log de auditoria completo e painel de atendimento aos direitos do titular (LGPD art. 18) — o mínimo pro lançamento é a política de privacidade e a revogação de consentimento, que estão listadas acima.

---

## LEITURA DE PRAZO

Sendo franco: o bloco bloqueante são 15 itens e não cabe em uma semana. Separando por natureza — INFRA (build de produção do front, chaves JWT, storage/R2, backup, SMTP, HTTPS/CORS): 5 a 7 dias de trabalho concentrado, e boa parte só começa depois que a federação decidir domínio, quem paga a hospedagem e liberar o DNS. CÓDIGO (senha/reset, e-mail case-sensitive, sincronizar login com o e-mail do representante, VARCHAR(50) da posição, caminho de volta do rejeitado, endpoint de contato, esconder as 4 telas de demonstração): 5 a 6 dias, sendo que 4 desses itens são correções de menos de uma hora cada — o peso está em senha/reset (2 a 3 dias sozinho). CONTEÚDO (política de privacidade + banner, chave Pix): pouco código, mas depende de texto de advogado e de resposta da federação, e é o que costuma travar mais tempo do que o previsto.

Somando com folga pra retrabalho e teste de verdade: 3 a 4 semanas de uma pessoa. Hoje é 03/08 — dá pra chegar em agosto, mas só se as decisões da federação (domínio, Pix, política de privacidade, e-mails reais) saírem na PRIMEIRA semana. Se a reunião empurrar isso pra segunda quinzena, o realista é começo de setembro.

Recomendação prática pra não estourar: leve o documento na reunião com dois pedidos objetivos — as decisões da lista e um piloto com 2 ou 3 clubes conhecidos em vez de abertura geral. Com piloto, dá pra ir ao ar com os 15 bloqueantes resolvidos e ir empilhando o bloco 'importante' em setembro, com uso real apontando o que dói primeiro. Sem piloto, o primeiro fim de semana com 20 clubes cadastrando atleta encontra os itens de paginação, upload e sessão expirada todos de uma vez.

Um alerta de calendário separado: a anuidade que nunca renova não bloqueia agosto, mas tem data marcada — precisa estar pronta antes de 31/12, senão a federação simplesmente não fatura 2027.

