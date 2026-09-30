# Política de Privacidade da FHT — MINUTA PARA REVISÃO JURÍDICA

> ## ⚠️ VERSÃO PARA REVISÃO DO CONTROLADOR, NÃO PUBLICADA
> Este documento é de trabalho. Não deve ser publicado no site, nem enviado a titulares, antes da revisão jurídica e da aprovação formal da FHT.

> **Versão da minuta:** 1.2 (ajustada à versão MVP do sistema) · **Data:** 30/09/2026
> **Verificação técnica que a fundamenta:** código do sistema no commit `c73e748` (estruturas de banco V1 a V16), varrido em 04/08/2026.
> **Atualização 1.2 (30/09/2026):** ajustada à versão MVP do sistema (branch `mvp-free-tier`). Saíram os módulos que não fazem parte do MVP, a ficha de pessoas do clube (o clube tem agora um único representante legal) e o monitoramento de erros por terceiro; entraram a hospedagem decidida (Render e Neon, nos EUA), o armazenamento de arquivos no Cloudflare R2 e o backup diário do banco. Os demais fatos continuam referidos à varredura de 04/08/2026 e precisam ser revalidados antes da publicação.

---

## LEIA ANTES: nota ao advogado da federação

**Isto não é o texto final da política.** É uma **minuta técnica**, escrita já em formato de política, para que você tenha o retrato completo e honesto de tudo o que o sistema da FHT faz com dados pessoais — inclusive do que ele faz errado — antes de redigir a versão que será publicada.

**Como ela foi feita.** Não foi escrita a partir da documentação do projeto. Foi escrita a partir do **código-fonte**, verificado arquivo por arquivo. Onde a documentação interna da FHT divergia do código, valeu o código.

**Os três selos.** O sistema **ainda não está pronto**. Várias coisas que uma política normalmente afirma **não existem hoje**. A decisão do projeto foi: **esta política vira a especificação** — o que estiver escrito aqui será implementado antes de a política ir ao ar. Para você distinguir fato de compromisso, cada afirmação carrega um selo:

| Selo | Significa |
|---|---|
| **[JÁ EXISTE]** | Está implementado e verificado no código em 04/08/2026. É fato. |
| **[A IMPLEMENTAR]** | É um **compromisso**. Não existe hoje. Precisa ser construído antes da publicação. |
| **[A CONFIRMAR]** | Depende de informação ou decisão que só a federação tem. Não foi possível verificar. |

**Nenhuma promessa aparece sem selo.** Onde você encontrar uma frase que soa como garantia e não tem selo, é erro de redação — aponte.

**Os colchetes.** Tudo em `[COLCHETES MAIÚSCULOS]` é lacuna que **a federação preenche**: razão social, CNPJ, endereço, nome do Encarregado, prazos internos, domínio. O **Anexo II** reúne todos.

**Os dois anexos.** O **Anexo I** é a tabela de tudo o que está marcado **[A IMPLEMENTAR]** — é o backlog do desenvolvedor. O **Anexo II** é a lista do que a federação precisa preencher ou decidir.

**Duas versões, não uma.** Esta minuta fala com você, revisor. O texto que vai ao ar precisa falar com **pais, mães e responsáveis** — a lei exige linguagem simples e acessível justamente quando há dados de crianças e adolescentes (art. 6º, VI e art. 14, §6º). Recomenda-se, portanto, que a publicação seja dividida em duas peças: (a) a **política publicada**, sem os blocos "⚠️ Aviso ao revisor jurídico", sem os selos e sem as citações de artigo no corpo do texto; e (b) o **dossiê técnico interno**, que preserva tudo isso e fundamenta as escolhas, guardado como prova de diligência (art. 6º, X). Nenhum fato deve sair — o que muda é a forma.

---

### As cinco decisões jurídicas que o projeto precisa que você tome

**1. Qual é a base legal do cadastro do atleta MENOR de 18 anos: contrato/relação associativa ou consentimento?**
A proposta técnica desta minuta é **execução da relação associativa (art. 7º, V) + cumprimento das obrigações da federação (art. 7º, II)**, com a **anuência do responsável legal** exigida pelo art. 14, §1º e pela lei civil, reservando o **consentimento (art. 7º, I) exclusivamente ao uso de imagem**, que é o único tratamento genuinamente opcional. O Enunciado CD/ANPD nº 1/2023 admite esse caminho. Três razões técnicas sustentam a proposta: (a) o titular não pode recusar os dados do cadastro sem perder a filiação; (b) o sistema **não tem mecanismo de revogação de consentimento** — nenhum; (c) o consentimento hoje registrado é **declarado pelo clube**, não pelo responsável (ver a questão 4). **A decisão é sua.**

**2. A FHT vai se declarar Agente de Tratamento de Pequeno Porte (ATPP), na forma da Resolução CD/ANPD nº 2/2022?**
Isso muda o **prazo de resposta ao titular** (dobra), a **dispensa formal de Encarregado** (mantido o canal obrigatório) e permite **registro de operações simplificado**. A pegadinha: as flexibilizações **não valem** para ATPP que faça tratamento de **alto risco**, e alto risco exige, cumulativamente, um critério geral (larga escala **ou** afetação significativa de direitos) **+** um critério específico. A FHT **já crava o critério específico**: trata dados de crianças e adolescentes. Falta avaliar o critério geral. Esta resposta define o prazo que a política vai prometer na cláusula 11.1.

**3. O nome completo de um atleta MENOR pode aparecer no site aberto?**
Hoje **aparece**. A vitrine pública de clubes devolve, a qualquer visitante sem login, para cada atleta ativo: **nome completo sem abreviação + posição + categoria** — e a categoria é literalmente a faixa etária ("Sub-12"). No mesmo pacote vão clube, cidade e UF. Não há filtro de idade e não há consulta a autorização nenhuma. É o item de maior exposição do sistema e a decisão jurídica mais urgente desta minuta. Ver a cláusula 12.4.

**4. O consentimento do responsável legal, coletado por intermédio do clube, é válido? E o que fazer com os já registrados?**
Quem marca a caixa de autorização é o **representante do clube**, no computador do clube. O endereço de rede e o navegador gravados como prova são **os dele**. Não existe confirmação por e-mail, link ou assinatura com o responsável. Existe ainda um caminho retroativo em que o consentimento é gravado com a evidência preenchida com o texto *"regularizado por [login do operador]"* — e ele tem o mesmo peso dos demais para liberar a ativação de um menor. Ver a seção 13, que é dedicada a este ponto.

**5. Qual é o papel jurídico do clube filiado: operador da FHT, controlador conjunto ou controlador independente?**
Esta pergunta está amarrada à de número 4 e nenhuma das duas se resolve sozinha. Quase todo dado pessoal do sistema é inserido por um clube: ele digita nome, CPF, RG e nascimento do atleta (inclusive de criança), digita os dados do responsável legal, envia os documentos, marca a caixa de autorização do responsável no computador dele, e é hoje o único canal entre o titular e a federação. Sem definir o papel do clube não é possível responder de quem é o dever de informar do art. 9º (hoje descumprido para o responsável legal), quem responde por um consentimento colhido sem o responsável presente, quem responde por um dado errado que o sistema não permite corrigir, nem se a FHT precisa de contrato de tratamento com cada clube (art. 39). Ver a cláusula 6.1.

> **Recomendação de método.** Este sistema muda toda semana. Revalide os fatos desta minuta contra o código imediatamente antes de publicar, e registre a data da verificação no documento publicado.

---
---

# POLÍTICA DE PRIVACIDADE — FHT

*(minuta — texto proposto)*

---

## 0. Resumo em uma página

Se você só puder ler uma parte deste documento, leia esta.

- **Quem guarda os dados:** a FHT — Federação de Handebol do Tocantins.
- **De quem:** de atletas (inclusive crianças e adolescentes), de pais e responsáveis, de representantes de clubes, de diretores e de quem visita o site.
- **Quem preenche:** na maior parte dos casos, **o clube** — não você. Por isso é possível que os seus dados estejam aqui sem que você soubesse.
- **O que a FHT guarda de um atleta:** nome, nascimento, CPF, RG, contato, posição, categoria, o RG digitalizado e, se enviados, a foto e o comprovante de residência.
- **O que aparece no site aberto:** hoje, o nome completo, a posição e a categoria de todo atleta ativo de clube visível — **inclusive de menores de 18 anos**. A FHT vai mudar isso (cláusula 12.4).
- **O que a FHT nunca coleta:** dados de saúde, atestado médico, biometria, reconhecimento facial, religião, origem racial ou opinião política. Nem dados bancários.
- **A FHT não vende e não aluga seus dados.**
- **Se você é pai, mãe ou responsável:** você decide sobre os dados do seu filho, e os **seus** dados também são guardados. Como pedir qualquer coisa está na cláusula 11.6.
- **Para falar sobre seus dados:** escreva para [E-MAIL DO ENCARREGADO]. É gratuito, você não precisa explicar o motivo e não precisa de advogado.

---

## 1. Quem somos e como falar conosco

### 1.1 Quem é responsável pelos seus dados

A **FHT — Federação de Handebol do Tocantins** é a **controladora** dos dados pessoais tratados neste site e no sistema de gestão de filiação. Isso quer dizer que é a FHT quem decide quais dados são coletados e para que servem — e é a ela que você recorre para exercer seus direitos.

| | |
|---|---|
| **Razão social** | [RAZÃO SOCIAL COMPLETA DA FHT, CONFORME O ESTATUTO] |
| **Natureza jurídica** | Associação desportiva estadual sem fins lucrativos |
| **CNPJ** | [CNPJ DA FHT] |
| **Endereço da sede** | [LOGRADOURO, NÚMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, CEP REAL] |
| **Telefone institucional** | [TELEFONE INSTITUCIONAL REAL] |
| **Site** | [DOMÍNIO OFICIAL DO SITE] |
| **Responsável pela aprovação desta política** | [NOME E CARGO DE QUEM ASSINA A POLÍTICA EM NOME DA FHT] |

> **[A IMPLEMENTAR]** Hoje o site não publica razão social, CNPJ nem endereço completo. O que aparece é apenas "FHT — Federação de Handebol do Tocantins · Palmas, TO" e um CEP genérico (77000-000), que não corresponde a endereço nenhum. Esses dados precisam ser preenchidos pela federação antes da publicação.

### 1.2 Encarregado pelo Tratamento de Dados Pessoais (DPO)

O Encarregado é a pessoa que recebe as suas dúvidas, os seus pedidos e as comunicações da Autoridade Nacional de Proteção de Dados (ANPD).

| | |
|---|---|
| **Nome** | [NOME COMPLETO DO ENCARREGADO] |
| **Cargo na FHT** | [CARGO DO ENCARREGADO] |
| **E-mail para assuntos de privacidade** | [E-MAIL DO ENCARREGADO] |
| **Endereço para pedidos por carta** | [ENDEREÇO POSTAL PARA PEDIDOS ESCRITOS] |
| **Substituto na ausência** | [NOME DO SUBSTITUTO] |

**[A IMPLEMENTAR]** Não existe hoje nenhum Encarregado nomeado, e nenhum dos canais anunciados no site serve para receber um pedido seu. A federação precisa nomear a pessoa, criar a caixa de e-mail, garantir que alguém a leia e definir quem responde na ausência dela — **antes** de esta política ir ao ar.

### 1.3 Como falar conosco sobre seus dados

Para pedir acesso, correção, exclusão ou qualquer outra coisa relacionada aos seus dados pessoais, escreva para **[E-MAIL DO ENCARREGADO]**. Descreva o pedido e informe seu nome completo. Se o pedido for sobre os dados de uma criança ou adolescente, diga qual é o seu vínculo com ele (mãe, pai, tutor).

**Prazo de resposta:** a FHT responde em até **[PRAZO DE RESPOSTA EM DIAS]** dias. A lei permite resposta imediata em formato simplificado ou resposta completa em até 15 dias (art. 19 da LGPD). **[A CONFIRMAR]** — se a FHT se enquadrar como **agente de tratamento de pequeno porte** (uma categoria criada pela autoridade nacional para entidades pequenas, como associações sem fins lucrativos, com prazos e obrigações reduzidos), esse prazo dobra, e isso precisa ser declarado aqui.

**Canais que NÃO servem para pedidos sobre dados pessoais:**

- O formulário **"Fale com a FHT"** da página inicial. **[A IMPLEMENTAR]** Hoje ele **não envia nada**: a tela mostra "MENSAGEM ENVIADA!" e a mensagem é descartada. Ele será corrigido ou removido antes da publicação desta política; até lá, não o utilize.
- As mensagens automáticas do sistema, enviadas de um endereço do tipo **não-responda** (`nao-responda@[DOMÍNIO OFICIAL]`), com o rodapé "mensagem automática, não responda". **[JÁ EXISTE — é o remetente configurado no sistema]** **[A CONFIRMAR]** — a federação precisa informar se essa caixa existe de fato, se alguém a lê e para onde as respostas vão; enquanto isso não for confirmado, presuma que uma resposta a esses e-mails **não** será atendida e use sempre o canal do Encarregado.
- O número de WhatsApp exibido no site. **[A IMPLEMENTAR]** O número publicado hoje é um exemplo formado só por zeros. **[A CONFIRMAR]** — se a federação quiser oferecer WhatsApp como canal de titular, precisa informar o número real e quem o atende.

---

## 2. A quem esta política se aplica

Esta política vale para **todas** as pessoas cujos dados a FHT trata — inclusive para quem nunca acessou o site, nunca criou uma senha e talvez nem saiba que está no nosso sistema. Isso acontece porque, na maior parte dos casos, quem preenche o cadastro é o clube, não a própria pessoa (veja a seção 4).

As categorias de titular são:

1. **Atletas filiados por meio de clubes**, incluindo **crianças e adolescentes menores de 18 anos**. **[JÁ EXISTE]** — o sistema não define idade mínima; hoje é possível cadastrar uma criança de qualquer idade.
2. **Pais, mães e responsáveis legais** de atletas menores de 18 anos. Eles são titulares por direito próprio: o nome, o CPF e o contato **deles** ficam guardados, não só os da criança. **[JÁ EXISTE]**
3. **Representantes legais dos clubes** — a pessoa que preenche o pedido de filiação, escolhe a senha e passa a administrar o clube no sistema. Cada clube tem um único representante cadastrado. **[JÁ EXISTE]**
4. **Pessoas identificadas nos documentos enviados pelos clubes** — a ata de fundação e o estatuto social costumam trazer nome, CPF, RG e assinatura de fundadores e dirigentes. A FHT recebe e guarda esses arquivos como vieram. **[JÁ EXISTE]**
5. **A pessoa que paga a anuidade e aparece no comprovante de Pix** — pode ser o tesoureiro do clube, o pai ou a mãe de um atleta, um patrocinador. O comprovante normalmente mostra nome, parte do CPF, instituição financeira e valor. A FHT não digita nem lê esses dados em campo nenhum: guarda a imagem do comprovante. **[JÁ EXISTE]** — a FHT **não tem como localizar essa pessoa** no sistema se ela pedir a exclusão dos próprios dados, porque o nome dela não está em nenhum campo pesquisável.
6. **Pessoas que aparecem em fotos publicadas** na galeria e nas notícias do site, inclusive atletas de categorias de base. **[JÁ EXISTE]** — as fotos não são ligadas a nenhum cadastro, então a FHT não consegue localizar em quais fotos determinada pessoa aparece.
7. **Membros da diretoria da FHT**, cujos dados (inclusive contato e currículo) são publicados na seção institucional. **[JÁ EXISTE]**
8. **Dirigentes e funcionários da FHT que operam o sistema** — o nome de quem assina uma notícia ou publica um documento aparece no site; a identificação de quem confere um pagamento fica gravada e é devolvida também ao clube. **[JÁ EXISTE]**
9. **Visitantes do site**, mesmo sem login e mesmo que só estejam lendo uma notícia. **[JÁ EXISTE]**

> **Observação importante e desconfortável:** as categorias 2, 4, 5 e 6 são formadas por pessoas que, na prática, **nunca foram informadas** de que a FHT tem dados delas. Esta política é, para elas, o primeiro aviso. A FHT assume o compromisso de exigir dos clubes filiados que informem as pessoas cujos dados eles inserem no sistema. **[A IMPLEMENTAR]** — de quem é esse dever, juridicamente, depende do papel do clube, que ainda não foi definido: ver a cláusula 6.1.

---

## 3. Que dados coletamos

Abaixo, o que a FHT trata de cada grupo de pessoas. Onde o dado é **obrigatório**, dizemos; onde é **opcional**, também.

### 3.1 Atleta (inclusive menor de 18 anos) — **[JÁ EXISTE]**

**Obrigatórios:** nome completo, data de nascimento, sexo, CPF, número do RG, telefone e e-mail de contato, posição em quadra e categoria esportiva (Sub-12, Sub-14, Sub-16, Sub-18 ou Adulto).

**Também guardamos, por consequência do cadastro:** o clube ao qual você está vinculado, a situação da sua filiação (aguardando pagamento, aguardando aprovação, ativo, suspenso ou rejeitado), o motivo de uma eventual recusa — escrito livremente por um administrador —, o valor e o ano da anuidade, se houve transferência e de qual clube, e as datas de cadastro e de última alteração.

**Opcionais ou complementares:** órgão emissor do RG e naturalidade (cidade e UF). **[A IMPLEMENTAR]** — esses dois dados são pedidos no formulário, gravados e **nunca usados para nada**: não aparecem em nenhuma tela nem em nenhuma resposta do sistema. Ou a FHT declara para que servem, ou eles devem sair do formulário antes da publicação, por exigência do princípio da necessidade (art. 6º, III).

**Endereço residencial:** **não é mais pedido** no cadastro de atleta — o endereço considerado é o do clube. **[JÁ EXISTE]** Três ressalvas honestas: (a) endereços coletados antes de agosto de 2026 **continuam guardados** e ninguém os apagou **[A IMPLEMENTAR]**; (b) os campos de endereço continuam existindo do lado técnico do sistema — a tela não os oferece mais, mas um programa que converse diretamente com o servidor ainda conseguiria gravá-los **[A IMPLEMENTAR]**; e (c) o **comprovante de residência** continua sendo aceito como arquivo, ou seja, o endereço de casa continua entrando no sistema dentro de um documento digitalizado.

**Documentos digitalizados:**

- **RG digitalizado — obrigatório.** Sem ele a filiação não é aprovada, em nenhuma hipótese. **[JÁ EXISTE]**
- **Foto 3x4 — opcional**, pode ser enviada depois. Ela **não é exibida em nenhuma página do site** e não entra em nenhuma resposta pública. **[JÁ EXISTE]** Mas, como todo arquivo enviado ao sistema, o **arquivo em si** continua alcançável por quem tiver o endereço dele, sem login — ver a cláusula 10.2. **[A IMPLEMENTAR]**
- **Comprovante de residência — opcional**, pode ser enviado depois. Ele frequentemente traz o nome de um terceiro (por exemplo, a conta de luz no nome do pai ou da mãe). **[JÁ EXISTE]**
- **Comprovante de pagamento individual — legado.** A tela do clube não o oferece mais; o sistema ainda aceita o arquivo por outros caminhos. **[A IMPLEMENTAR]** — deve ser desativado.

### 3.2 Responsável legal de atleta menor de 18 anos — **[JÁ EXISTE]**

Esses dados só são coletados quando a data de nascimento indica que o atleta é menor de 18 anos. O cadastro de um atleta adulto não grava nada disso.

**Obrigatórios:** nome completo, CPF, grau de parentesco (mãe, pai, tutor legal ou outro) e **pelo menos um** contato — e-mail ou telefone.

**Registro da autorização:** para cada autorização dada, a FHT guarda a finalidade, o nome e o CPF de quem autorizou, a indicação de que o atleta era menor no momento, a versão do termo aceito, a data e a hora, o endereço de rede (IP) e a identificação do navegador usado.

> **Aviso de honestidade — leia com atenção. [A IMPLEMENTAR]** O endereço de rede e o navegador registrados são os **do computador do clube**, porque é o representante do clube quem preenche a tela e marca a caixa. Não existe hoje nenhuma confirmação enviada a você, responsável: nem e-mail, nem link, nem assinatura. Juridicamente, o que existe é a **declaração de um terceiro** de que você autorizou. Além disso, o **texto** do termo aceito não é guardado — só o número da versão. A FHT vai passar a guardar o texto integral e a confirmar a autorização diretamente com o responsável. Ver a seção 13.

> **Segunda ressalva. [A IMPLEMENTAR]** O termo que você assina hoje fala apenas dos dados **do atleta**. Ele não informa que o **seu** nome, o **seu** CPF e o **seu** contato também ficam guardados. O termo será reescrito para informar isso.

### 3.3 Representante legal do clube — **[JÁ EXISTE]**

**Obrigatórios:** nome completo, CPF (conferido pelo dígito verificador), cargo no clube, e-mail (que passa a ser o seu login) e telefone.

**Senha de acesso — obrigatória.** Você escolhe a senha no próprio formulário público de filiação. O sistema hoje exige apenas 8 caracteres, sem outras regras — o que é o mínimo, não uma proteção forte, e será reforçado (cláusula 10.2). **[A IMPLEMENTAR]** Ela é guardada **apenas como código embaralhado**, nunca em texto legível, e nunca é devolvida por nenhuma tela ou resposta do sistema. **[JÁ EXISTE]** Sua senha é transformada num código do qual não é possível voltar à senha original (a técnica chama-se *hash* BCrypt, com um valor aleatório somado a cada senha). É esse código, e não a sua senha, que fica guardado. Nem a federação consegue descobrir qual é a sua senha.

**Documentos do clube:** ata de fundação e estatuto social, em PDF. Esses arquivos costumam conter dados pessoais de **outras pessoas** — fundadores e dirigentes, com nome, CPF, RG e assinatura.

**Dados do clube (pessoa jurídica, não pessoais):** nome, sigla, cidade, UF e CNPJ (opcional).

> **Ressalva sobre correção. [A IMPLEMENTAR]** Seu CPF fica gravado no cadastro do clube, e hoje **não existe nenhuma forma de corrigi-lo pelo sistema** — nem por você, nem pela federação. Seu nome e seu e-mail existem em **duas** cópias que não se atualizam entre si (cadastro do clube e conta de acesso). Corrigir um dado hoje corrige uma cópia e pode deixar a outra desatualizada. Isso será corrigido antes da publicação.

> **Ressalva sobre encerramento de acesso. [JÁ EXISTE — defeito confirmado no código]** Se você trocar o seu e-mail no painel, a sua **conta de acesso não é atualizada junto**. Como o bloqueio da conta é feito procurando o usuário pelo e-mail gravado no cadastro do clube, e essa busca falha em silêncio quando não encontra ninguém, uma suspensão ou rejeição do clube pode **não fechar o acesso**, que permanece aberto. **[A IMPLEMENTAR]** — será corrigido antes da publicação.

### 3.4 Pagamento da anuidade — **[JÁ EXISTE]**

Quando o clube paga a anuidade, guardamos: um número de protocolo, o ano, o valor total, a quantidade de atletas, uma **observação escrita livremente pelo clube**, a situação do pagamento, o **motivo de recusa escrito livremente pela federação**, as datas de envio e de conferência, e a **identificação do administrador** que conferiu.

Guardamos ainda, para cada atleta coberto pelo pagamento, uma **cópia do nome completo dele**, o ano e o valor.

Guardamos também o **arquivo do comprovante de Pix** enviado pelo clube. Ele normalmente mostra nome do pagador, parte do CPF, instituição financeira, data, valor e chave Pix. A FHT não extrai nem valida nada disso: guarda o arquivo como veio.

> **Aviso de honestidade. [JÁ EXISTE]** A cópia do nome do atleta no registro de pagamento foi feita **de propósito para não desaparecer**: se o cadastro do atleta for apagado — inclusive a pedido do responsável —, o nome permanece no registro financeiro. Os campos de observação e de motivo de recusa são de escrita livre: qualquer informação pode ser digitada ali, sem validação, e o motivo de recusa é enviado por e-mail ao clube. Ver as cláusulas 9.3 e 11.3.

### 3.5 Membros da diretoria da FHT — **[JÁ EXISTE]**

Nome, cargo, área de atuação, período do mandato, data de entrada na diretoria, **e-mail**, **telefone**, biografia/currículo e foto. **Tudo isso é público.** É a exposição de contato mais ampla do site: qualquer visitante vê o registro completo. A intenção é que o contato seja institucional, mas **nada no sistema impede que um telefone pessoal digitado ali vá ao ar**. **[A IMPLEMENTAR]**

### 3.6 Dirigentes e funcionários que operam o sistema — **[JÁ EXISTE]**

Nome e e-mail de login (o e-mail é o identificador da conta), senha guardada apenas como resumo criptográfico, e perfil de acesso.

Além disso: o **nome de quem assina** cada notícia e de quem publica cada documento institucional aparece no site; e a **identificação de quem confere um pagamento** fica gravada com data e hora, e é entregue também ao clube no histórico de pagamentos dele. O valor gravado é o **e-mail de login do administrador**, porque é o e-mail que identifica a conta na sessão. **[JÁ EXISTE — verificado no código; não conferido com o sistema em execução]**

**[A IMPLEMENTAR]** A FHT vai passar a gravar um identificador interno, e não o e-mail, e a devolver ao clube apenas a informação de que a conferência foi feita pela federação — sem identificar nominalmente o funcionário. É correção de poucas linhas.

### 3.7 Visitantes do site — **[JÁ EXISTE]**

- **`fht_cookies`** — guardada no seu navegador quando você clica em ACEITAR no aviso. Serve só para o aviso não reaparecer. Não vai para servidor nenhum e não expira.
- **`fht_token`** — guardada apenas se você fizer login. É a sua sessão. É um **crachá digital**: ele é **selado** contra falsificação, mas **não é embaralhado**. Quem abrir o conteúdo dele consegue ler o seu nome, o seu e-mail, o seu perfil de acesso e o seu clube. Vale um dia.
- **Endereço IP e informações do seu dispositivo** são transmitidos ao **Google** em toda visita, porque as fontes tipográficas do site são carregadas dos servidores dele. Isso acontece **antes** de o aviso aparecer e **sem opção de recusa**. **[A IMPLEMENTAR]** — a FHT vai hospedar as fontes no próprio servidor, eliminando essa transferência. Ver as seções 8 e 14.

O site **não usa cookies** no sentido técnico, **não** tem ferramentas de medição de audiência, **não** tem pixel de publicidade, mapa, vídeo, chat ou feed de rede social incorporados. **[JÁ EXISTE — verificado]**

### 3.8 Dados que a FHT NÃO coleta — **[JÁ EXISTE — verificado campo a campo]**

- **Nenhum dado pessoal sensível** (art. 5º, II): não há campo de saúde, atestado ou laudo médico, lesão, biometria, dado genético, origem racial, religião, opinião política ou filiação sindical.
- **Nenhum reconhecimento facial** ou processamento biométrico. As fotos são apenas guardadas e exibidas.
- **Nenhum dado bancário**: a FHT não recebe número de conta, cartão nem chave Pix digitados. O que existe é a imagem do comprovante enviada pelo clube.
- **Nenhuma consulta a base externa** com o seu CPF. A conferência do CPF é um cálculo matemático feito no próprio servidor da FHT.
- **Nenhum perfilamento, pontuação (score) ou publicidade direcionada.**

---

## 4. Como coletamos os seus dados

Esta é a seção mais importante para você entender como exercer seus direitos, porque **a maior parte dos dados não é fornecida pela própria pessoa**.

### 4.1 Quem preenche o quê — **[JÁ EXISTE]**

- **O atleta nunca preenche nada.** Quem digita o nome, o CPF, o RG, a data de nascimento e os contatos do atleta — **inclusive de uma criança** — é o **representante do clube**, pelo painel dele. Não existe login de atleta e não existe portal do atleta.
- **O responsável legal também não preenche nada.** O nome, o CPF, o parentesco e o contato do responsável são digitados pelo representante do clube. A caixa de autorização é marcada na tela do clube, no computador do clube.
- **Os membros da diretoria não preenchem nada.** São cadastrados por um administrador da federação.
- **O único titular que preenche o próprio cadastro é o representante do clube**, no formulário público de filiação — onde ele também escolhe a própria senha.

> **Por que isso importa para você:** se os seus dados foram inseridos por outra pessoa, você pode nem saber que está no nosso sistema. Por isso a FHT informa aqui, de forma expressa, que trata dados obtidos de terceiros — e por isso o canal do Encarregado (cláusula 1.3) existe para **qualquer pessoa**, tenha ela acesso ao sistema ou não.

### 4.2 As vias de coleta — **[JÁ EXISTE]**

1. **Formulário público de filiação de clube**, na página inicial, sem necessidade de login. Coleta os dados do clube, os dados e a senha do representante, e os PDFs de ata e estatuto.
2. **Painel do clube**, por usuário autenticado. Coleta os dados dos atletas, os dados do responsável legal, os documentos digitalizados e os pagamentos de anuidade com o comprovante.
3. **Painel da federação**, por administrador autenticado. Cadastra diretores, notícias, fotos da galeria e documentos institucionais.
4. **Coleta automática, sem digitação.** No momento em que um atleta é cadastrado, o sistema captura o **endereço de rede (IP)** e a **identificação do navegador** de quem está preenchendo, e os guarda como evidência da autorização. Como quem preenche é o clube, **esses dados são do dispositivo do clube**, não do responsável legal.
5. **Geração automática de mensagens de e-mail** a partir dos dados já cadastrados (veja a seção 7).

### 4.3 Decisões tomadas automaticamente pelo sistema — **[JÁ EXISTE]**

O sistema não faz perfilamento nem pontuação de ninguém, mas duas rotinas decidem sozinhas sobre a situação de um cadastro:

- **Descarte automático:** uma vez por dia, o sistema apaga definitivamente os cadastros de atleta que estejam há mais de 90 dias sem a anuidade confirmada. Ver a cláusula 9.2.
- **Ativação em bloco:** quando a federação confirma um pagamento, o sistema percorre a lista de atletas e decide, um a um, quem passa a ativo e quem fica retido — a regra confere se há RG digitalizado e, no caso de menor, se há autorização do responsável registrada.

Você pode pedir revisão dessas decisões ao Encarregado. **[A IMPLEMENTAR]** — hoje não há registro de que um pedido desses foi recebido ou atendido.

---

## 5. Para que usamos seus dados e com que fundamento

A LGPD exige que **cada finalidade** se apoie em **uma base legal**. A FHT **não usa consentimento como base geral**: o consentimento fica reservado ao que é genuinamente opcional (a publicação de imagem). O cadastro esportivo se apoia na **execução do contrato / relação associativa (art. 7º, V)** — ou seja, no próprio vínculo de filiação entre você e a federação — e no **cumprimento de obrigação regulatória (art. 7º, II)**, porque você não teria como recusar esses dados sem perder a filiação, e porque o sistema, em vários pontos, sequer tem como capturar ou revogar um consentimento.

### 5.1 Em linguagem direta: para que a FHT usa os seus dados

1. **Para filiar o clube** e saber quem responde legalmente por ele.
2. **Para filiar o atleta**, conferir que ele é quem diz ser e impedir que a mesma pessoa seja filiada por dois clubes ao mesmo tempo.
3. **Para pedir e guardar a autorização do responsável**, quando o atleta tem menos de 18 anos.
4. **Para conferir o pagamento da anuidade**, que é o que habilita o atleta a competir no ano.
5. **Para avisar o clube** sobre a filiação e sobre o pagamento, por e-mail.
6. **Para enquadrar o atleta** na categoria e no naipe da filiação.
7. **Para divulgar** a diretoria, as notícias e as fotos da federação.
8. **Para dar acesso ao painel** e garantir que cada clube veja apenas os próprios dados.
9. **Para descartar** cadastros cuja anuidade nunca foi confirmada.

**A base de tudo isso é a sua relação com a federação — o vínculo de filiação — e as obrigações que a FHT tem como entidade desportiva.** Nada disso depende da sua autorização, porque sem esses dados a filiação simplesmente não existe. **A única coisa que depende da sua autorização, e que você pode recusar sem perder nada, é a publicação de foto e nome na galeria e nas notícias** (cláusula 12.5).

A tabela detalhada, com a base legal de cada finalidade, está na cláusula 5.2 — ela interessa principalmente a quem for analisar juridicamente esta política.

### 5.2 A tabela detalhada, finalidade por finalidade

> **Nota ao jurídico:** o enquadramento abaixo é uma **proposta técnica** construída a partir do que o sistema efetivamente faz. A decisão final sobre cada base legal é do advogado da federação.

| # | Para que usamos (finalidade) | Quais dados | De quem | Base legal proposta | Situação hoje |
|---|---|---|---|---|---|
| 1 | Analisar e processar o **pedido de filiação de um clube** | Dados do clube; nome, CPF, cargo, e-mail e telefone do representante; ata e estatuto | Representante do clube; terceiros citados na ata e no estatuto | **Art. 7º, V** (procedimentos preliminares e execução do vínculo associativo) | **[JÁ EXISTE]** |
| 2 | **Criar e manter a conta de acesso** do clube, autenticar você e limitar cada clube aos próprios dados | Nome, e-mail (login), senha guardada como hash, perfil e vínculo com o clube | Representante do clube; administradores da FHT | **Art. 7º, V** + **art. 7º, II** (segurança do tratamento) | **[JÁ EXISTE]** — não há recuperação nem troca de senha **[A IMPLEMENTAR]** |
| 3 | **Filiar e registrar o atleta**, verificar a identidade e impedir que o mesmo CPF seja filiado por dois clubes | Nome, nascimento, sexo, CPF, RG, contato, posição, categoria, situação de transferência | Atleta (inclusive menor) | **Art. 7º, V** + **art. 7º, II**. Para menores, observado o **art. 14** e o melhor interesse (Enunciado CD/ANPD nº 1/2023) | **[JÁ EXISTE]** |
| 4 | **Obter e comprovar a autorização do responsável legal** para a filiação de menor de 18 anos | Nome, CPF, parentesco e contato do responsável; registro da autorização com data, versão do termo, IP e navegador | Responsável legal | **Art. 14, §1º** (autorização) c/c **art. 7º, II** e **art. 6º, X** (prestação de contas) para guardar a evidência | **[JÁ EXISTE]** — a evidência registrada é a do dispositivo do clube **[A IMPLEMENTAR]** |
| 5 | **Comprovar documentalmente** o que foi declarado no cadastro | RG digitalizado (obrigatório), foto 3x4, comprovante de residência | Atleta; terceiros que apareçam no comprovante | **Art. 7º, V** + **art. 7º, II** | **[JÁ EXISTE]** — os arquivos hoje são servidos **sem verificação de quem pede** **[A IMPLEMENTAR]** |
| 6 | **Controlar e conferir o pagamento da anuidade** que habilita a competir no ano | Protocolo, ano, valor, quantidade, nome de cada atleta coberto, comprovante de Pix, observações, identificação de quem deu baixa | Clube; atletas; pagador que aparece no comprovante; administrador da FHT | **Art. 7º, V** + **art. 7º, II** (guarda de documentação financeira) | **[JÁ EXISTE]** — prazo de guarda **[A CONFIRMAR]** com a federação |
| 7 | **Comunicar decisões** sobre a filiação e o pagamento, por e-mail | Nome do clube e do representante, e-mail do representante, protocolo, valor, motivo de recusa e, nos avisos internos, a **relação nominal dos atletas cobertos pelo pagamento** | Representante do clube; atletas (inclusive menores) | **Art. 7º, V** (execução do contrato — são avisos essenciais, não marketing) | **[JÁ EXISTE — construído e em modo simulado]** O sistema monta e dispara as sete mensagens em seis pontos do fluxo; hoje nada sai, por configuração. **[A IMPLEMENTAR]** — ligar o envio real de forma controlada, definido antes o servidor de saída e o provedor da caixa de destino (ver as seções 7 e 8) |
| 8 | **Enquadrar o atleta** na categoria e no naipe da filiação | Data de nascimento, sexo, categoria, posição | Atleta | **Art. 7º, V** | **[JÁ EXISTE]** — a categoria é informada pelo clube, sem conferência automática com a data de nascimento (ver a cláusula 12.1) |
| 9 | **Transparência institucional** — publicar a diretoria, os documentos da federação e a autoria das publicações | Nome, cargo, área, mandato, e-mail, telefone, currículo e foto do diretor; nome do autor da notícia e de quem publicou o documento | Diretores; dirigentes e funcionários da FHT | **Art. 7º, V** (exercício da função) ou **art. 7º, IX** | **[JÁ EXISTE]** — a edição de uma notícia não regrava o autor, então retirar o nome de um ex-funcionário exige intervenção direta no banco **[A IMPLEMENTAR]** |
| 10 | **Divulgar imagens** em galeria e notícias | Fotografias, legenda, ano e categoria do evento | Pessoas fotografadas, inclusive menores | **Art. 7º, I — consentimento** (do responsável, se menor). É o **único** tratamento genuinamente opcional | **[A IMPLEMENTAR]** — hoje a autorização é coletada mas **nunca consultada**: marcar ou não marcar a caixa não muda nada, e **não existe forma de revogá-la** |
| 11 | **Divulgar o elenco dos clubes filiados** na vitrine pública | Nome completo, posição e categoria de todo atleta ativo | Atletas, **inclusive menores** | Base a definir pelo jurídico. Hoje não há consentimento nem filtro de idade, e o art. 14 (melhor interesse) precisa ser aplicado | **[A IMPLEMENTAR]** — é a decisão jurídica mais urgente; o site **já publica hoje** "Nome Completo da Criança — Pivô · Sub-12", com clube e cidade |
| 12 | **Descartar cadastros sem anuidade confirmada** | Cadastro do atleta e as autorizações vinculadas a ele | Atleta; responsável legal | **Art. 15, I** e **art. 16** (fim do tratamento pelo alcance da finalidade) | **[JÁ EXISTE]** — 90 dias. Ver a ressalva em 5.3 e a cláusula 9.2; o cadastro descartado ainda sobrevive nas cópias de segurança por até 30 dias (cláusula 9.5) |
| 13 | **Conservar o registro financeiro** mesmo após a exclusão do cadastro | Nome do atleta, ano, valor e comprovante | Atleta (inclusive menor); pagador | **Art. 16, I** (guarda para cumprimento de obrigação legal ou regulatória) e/ou **art. 16, III** (exercício regular de direitos) | **[JÁ EXISTE]** — por decisão de projeto. Prazo **[A CONFIRMAR]** |
| 14 | **Segurança do tratamento** — autenticar, registrar quem confere pagamentos e limitar o acesso de cada clube | Credenciais, token de sessão, identificação do administrador que confere pagamentos | Titulares de conta; administradores da FHT | **Art. 7º, II** c/c **art. 46** | **[JÁ EXISTE]**, de forma parcial: só a conferência de pagamento registra o autor; nenhuma outra operação deixa rastro **[A IMPLEMENTAR]** |

### 5.3 Três ressalvas honestas sobre esta tabela

**Sobre a finalidade 10 (imagem).** O termo que a FHT apresenta hoje diz que a autorização de imagem "é opcional e pode ser revogada a qualquer momento". **Isso ainda não é verdade no sistema**: não existe nenhum caminho de revogação, e a autorização não é consultada antes de publicar. A FHT vai implementar a revogação e a checagem antes de publicar esta política. **[A IMPLEMENTAR]**

**Sobre a finalidade 12 (descarte).** A regra real é: **cadastros cuja anuidade não seja confirmada em até 90 dias são apagados**. Isso não é o mesmo que "cadastros abandonados": um atleta cujo clube já pagou continua marcado como aguardando pagamento até a federação conferir o comprovante — e a rotina não abre exceção para ele. **[A IMPLEMENTAR]** — a FHT vai corrigir a regra para que nenhum cadastro já pago seja descartado.

**Sobre a finalidade 13 (retenção financeira).** Quando um cadastro de atleta é apagado, a **prova da autorização do responsável desaparece junto**, mas o **nome do atleta permanece** no registro financeiro. É o inverso do desejável. A FHT vai avaliar a anonimização do nome no registro de pagamento e a preservação da evidência da autorização. **[A IMPLEMENTAR]**

---

## 6. Com quem compartilhamos seus dados

**A FHT não vende, não aluga e não cede seus dados pessoais a ninguém para fins comerciais.** **[JÁ EXISTE — verificado em todo o código]**

### 6.1 O papel dos clubes filiados — **[A CONFIRMAR — decisão do advogado]**

Quase todo dado pessoal deste sistema é inserido por um **clube filiado** — não pela FHT e não pela própria pessoa. É o clube que digita o nome, o CPF, o RG e a data de nascimento do atleta, inclusive de uma criança; que digita o nome, o CPF e o contato do responsável legal; que envia os documentos digitalizados; que marca a caixa de autorização do responsável, no computador dele; e que, na prática, é hoje o único caminho entre o titular e a federação.

A lei distingue **quem decide** sobre o tratamento (controlador) de **quem apenas trata por conta de outro** (operador). Esta minuta **não define** o papel do clube, porque a decisão é jurídica e muda respostas importantes: de quem é o dever de informar previamente as pessoas cadastradas (art. 9º), quem responde quando uma autorização é registrada sem o responsável estar presente (seção 13), quem responde por um dado errado que o sistema não deixa corrigir (cláusula 3.3), e se a FHT precisa firmar com cada clube um contrato com cláusulas de proteção de dados (art. 39).

**Compromisso da FHT. [A IMPLEMENTAR]** Definido o enquadramento, as obrigações de proteção de dados passarão a constar do próprio termo de filiação do clube, em especial: (a) o dever do clube de informar previamente cada pessoa cujos dados ele insere no sistema — atleta e responsável legal; (b) o dever de obter a autorização do responsável legal na presença dele, e não por declaração do clube; (c) o dever de repassar à FHT, sem demora, qualquer pedido de titular que chegue pelo clube; e (d) o dever de enviar comprovantes de pagamento com o mínimo de informação pessoal possível.

### 6.2 Quem, dentro da FHT, alcança os seus dados — **[JÁ EXISTE]**

O sistema tem apenas **dois tipos de acesso**: o do representante do clube, que alcança somente os dados do próprio clube; e o de **administrador da federação, que alcança tudo**. Hoje **não há separação por área** dentro da FHT: qualquer conta de administrador vê e edita o cadastro completo de qualquer atleta — inclusive de criança —, abre qualquer documento digitalizado, lê os dados de qualquer responsável legal e consulta qualquer pagamento. Não existe perfil restrito para quem cuida só de comunicação ou do financeiro.

**[A IMPLEMENTAR]** A FHT vai criar perfis com permissões por área, para que cada pessoa alcance apenas o necessário à sua função (necessidade — art. 6º, III), e manterá controlada e revisada a lista de quem tem conta de administrador.

**[A CONFIRMAR]** Quantas contas de administrador existem hoje, quem as detém e quem autoriza a criação de novas.

### 6.3 Fornecedores, operadores e destinatários

Alguns fornecedores tratam dados **por conta da FHT** para que o sistema funcione. Eles são chamados de **operadores** e, por força do art. 39 da LGPD, só podem usar os dados para o que a FHT determinar, em contrato escrito com cláusulas de proteção de dados. **[A IMPLEMENTAR]** — a hospedagem já está definida (Render e Neon, ambos em Virginia, nos Estados Unidos), mas hoje a FHT não tem contrato nem acordo de tratamento de dados verificado com nenhum operador. Outras entidades recebem dados como **destinatários**. Esta é a lista completa, levantada do código.

| Quem | O que recebe | Situação hoje |
|---|---|---|
| **Google — fontes tipográficas do site** | Seu **endereço IP**, a identificação do seu navegador e a página que você abriu, em **toda visita a qualquer página**, inclusive sem login | **[JÁ EXISTE — ativo agora]** Acontece **antes** do aviso na tela e **sem opção de recusa**. A FHT vai hospedar as fontes no próprio servidor e eliminar esse compartilhamento. **[A IMPLEMENTAR]** |
| **Provedor do servidor de e-mail de saída** | Todo o conteúdo das mensagens automáticas: nome do clube, nome e e-mail do representante, motivo de recusa e, no aviso interno de pagamento, a **relação nominal dos atletas cobertos, inclusive menores** | **Pronto e desligado.** O envio está em modo simulado — nada sai. Basta uma alteração de configuração para ligar. **[A CONFIRMAR]** qual servidor será usado; o padrão de fábrica do projeto é o do Gmail. Ver as seções 7 e 8 |
| **Provedor das caixas postais de destino** | A caixa institucional da federação passa a **armazenar** os avisos, inclusive as listas nominais de atletas. O e-mail do representante de cada clube armazena os avisos dele | **[A CONFIRMAR]** em qual provedor essas caixas estão hospedadas e quantas pessoas têm acesso. Quem hospeda é **operador** |
| **Render (Render Services, Inc., EUA) — hospedagem da aplicação** | **Todo o tráfego da aplicação**: cada dado pessoal que entra ou sai do sistema passa por ele, e ele guarda os **registros técnicos de funcionamento (logs)** do servidor | **Operador. [JÁ EXISTE — hospedagem decidida; ativa desde a publicação]** Plano gratuito, região Virginia (EUA). É transferência internacional — ver a seção 8. Contrato ou acordo de tratamento de dados **[A IMPLEMENTAR]** |
| **Neon (Neon, Inc., EUA) — banco de dados** | **O banco de dados inteiro**: todos os cadastros, inclusive de crianças, dos responsáveis legais, os registros de autorização e os pagamentos | **Operador. [JÁ EXISTE — hospedagem decidida; ativa desde a publicação]** Região AWS us-east-1 (Virginia, EUA). É transferência internacional — ver a seção 8. Contrato ou acordo de tratamento de dados **[A IMPLEMENTAR]** |
| **Cloudflare (Cloudflare, Inc., EUA) — armazenamento de arquivos R2** | Bucket `fht-documentos`: todos os documentos e imagens enviados — RG, foto 3x4, comprovante de residência, comprovante de Pix, ata e estatuto, imagens de notícias, galeria e diretoria, documentos institucionais. Bucket `fht-backups` (privado, sem endereço público): as cópias de segurança do banco inteiro (ver a cláusula 10.1) | **Operador. [JÁ EXISTE — é o armazenamento na publicação]** Região física dos buckets **[A CONFIRMAR]** (escolhida na criação); tratada como transferência internacional — ver a seção 8. A proteção dos documentos com endereço assinado continua pendente **[A IMPLEMENTAR]** (ver a seção 10). Contrato ou acordo de tratamento de dados **[A IMPLEMENTAR]** |
| **GitHub (GitHub, Inc., EUA) — rotina de backup e imagem da aplicação** | Todo dia, às 03:00 UTC, uma máquina temporária do GitHub Actions nos EUA gera a cópia do **banco inteiro**, comprime e envia ao bucket `fht-backups`. O arquivo é apagado da máquina ao fim e o conteúdo nunca vai para o registro da execução. O GitHub também guarda a imagem da aplicação (GHCR), que **não contém dados pessoais nem chaves** | **Operador. [JÁ EXISTE]** É transferência internacional — ver a seção 8. Contrato ou acordo de tratamento de dados **[A IMPLEMENTAR]** |
| **Cada clube filiado** | O clube enxerga **os próprios atletas** e os próprios pagamentos — e o pacote de dados devolvido ao clube inclui a **identificação do administrador da FHT** que conferiu o pagamento | **[JÁ EXISTE]** Cada clube só alcança os próprios dados; a separação é verificada no servidor |
| **Qualquer pessoa que tenha o endereço de um arquivo** | Na prática, hoje: RG digitalizado, foto 3x4 e comprovante de residência de atletas (inclusive menores), ata e estatuto de clubes e comprovantes de pagamento | **[JÁ EXISTE — é um defeito, não uma escolha de compartilhamento]** O endereço que serve os arquivos **não verifica quem está pedindo**. Ver a seção 10. **[A IMPLEMENTAR]** |

**Com quem a FHT NÃO compartilha — verificado no código: [JÁ EXISTE]**

- **Nenhuma confederação, secretaria ou órgão de governo.** Não existe integração, exportação ou envio automático para a Confederação Brasileira de Handebol nem para qualquer outra entidade. Os endereços citados no rodapé do site são **apenas links**: nada é carregado deles e nenhum dado sai do seu navegador enquanto você não clicar neles. **Se você clicar**, você sai do site da FHT e o site de destino passa a receber o seu endereço IP e a informação de que você veio do nosso site. A partir daí vale a política de privacidade dele, não esta — a FHT não controla nem responde pelo que sites de terceiros fazem com os seus dados. O mesmo vale para o link de WhatsApp da seção de contato. **[JÁ EXISTE]**
- **Nenhum banco, adquirente ou meio de pagamento.** O Pix é feito fora do sistema e o comprovante é anexado como arquivo.
- **Nenhum bureau de crédito, Receita Federal ou base pública.** A conferência do CPF é um cálculo matemático local.
- **Nenhuma ferramenta de publicidade, medição de audiência ou rede social.**

> **[A CONFIRMAR] — compartilhamentos fora do sistema.** Esta lista foi levantada do código, e o código só enxerga o que passa pelo sistema. A federação precisa informar se envia listas de atletas por planilha, por e-mail ou por aplicativo de mensagens a confederações, patrocinadores, secretarias ou organizadores de competição, e se mantém fichas em papel. Isso é tratamento de dado pessoal do mesmo jeito, e precisa constar desta política.

> **[A IMPLEMENTAR] — contratos com operadores.** A FHT firmará com cada operador (Render, Neon, GitHub, Cloudflare e o provedor de e-mail) contrato com cláusulas de proteção de dados, como exige o art. 39. **[A CONFIRMAR]** — os quatro primeiros são contratados por termos de adesão padronizados; se os acordos de tratamento de dados que eles oferecem bastam, ou se é preciso algo além, é avaliação do advogado.

---

## 7. Comunicações que o sistema envia

O sistema envia **avisos operacionais por e-mail**. Eles são parte da execução da filiação — não são publicidade, não são newsletter e não há como se descadastrar deles sem sair da relação com a federação.

### 7.1 As mensagens e o que cada uma leva — **[JÁ EXISTE, programado]**

| Quando | Para quem | O que a mensagem leva |
|---|---|---|
| Um clube pede filiação pelo site | **Caixa institucional da FHT** | Nome do clube, cidade, nome e e-mail do representante |
| Um clube pede filiação pelo site | **Representante do clube** | Nome dele, nome do clube e o aviso de que o login será aquele e-mail |
| A FHT aprova a filiação | **Representante do clube** | Nome dele e nome do clube |
| A FHT recusa a filiação | **Representante do clube** | Nome do clube e o **motivo da recusa, escrito livremente** por um administrador |
| O clube envia o pagamento da anuidade | **Caixa institucional da FHT** | Protocolo, valor, quantidade e a **relação nominal completa dos atletas cobertos — inclusive menores**, um por linha |
| A FHT confirma o pagamento | **Representante do clube** | Protocolo, nome do clube e quantos atletas foram ativados e quantos ficaram retidos (números, sem nomes) |
| A FHT recusa o pagamento | **Representante do clube** | Protocolo, nome do clube e o motivo, escrito livremente |

**Nenhuma dessas mensagens carrega CPF, RG, documento digitalizado ou anexo.** Isso foi uma decisão de projeto e está verificado no código. **[JÁ EXISTE]** Mas **nomes completos de atletas menores saem** no aviso de pagamento.

### 7.2 O estado real hoje

**Hoje nenhuma mensagem sai.** O envio está em **modo simulado** por configuração: a mensagem é montada, aparece no registro interno de funcionamento do sistema e não chega a ninguém. **[JÁ EXISTE]** Basta uma alteração de configuração — sem mudar nenhuma linha de código — para o envio real começar, e o plano é ligá-lo no lançamento. **[A IMPLEMENTAR]**

> **[A CONFIRMAR]** Enquanto o modo simulado estiver ativo, não foi possível confirmar se o **corpo** da mensagem (com a lista de nomes) é escrito nos registros de funcionamento do servidor ou apenas o destinatário e o assunto. Se for o corpo, os registros passam a conter listas nominais de crianças. Ver a cláusula 9.5.

### 7.3 Compromissos sobre as comunicações

1. **O responsável legal passará a ser avisado.** **[A IMPLEMENTAR]** Hoje o e-mail do responsável é coletado, validado como contato obrigatório e gravado — e **nunca é usado como destinatário de nada**. Ele não é avisado de que a criança foi cadastrada, ativada ou publicada no site. Até 03/08/2026 isso era limitação técnica; hoje é escolha, porque o sistema já sabe enviar e-mail.
2. **A FHT vai reavaliar o envio da lista nominal por e-mail.** **[A IMPLEMENTAR]** Nome completo de criança trafegando por correio eletrônico comum, para uma caixa postal cuja existência e monitoramento ainda não foram confirmados, é exposição desnecessária: o aviso pode remeter ao painel autenticado em vez de transportar a lista.
3. **O remetente das mensagens é um endereço do tipo não-responda** (`nao-responda@[DOMÍNIO OFICIAL]`), e o rodapé de toda mensagem diz "mensagem automática, não responda". **[JÁ EXISTE — é o remetente configurado no sistema]** **[A CONFIRMAR]** — a federação precisa informar se essa caixa existe de fato, se alguém a lê e para onde as respostas vão. Enquanto isso não for confirmado, presuma que uma resposta **não** será atendida e use sempre o canal do Encarregado (cláusula 1.3).
4. **[A CONFIRMAR]** O e-mail do representante do clube pode ser alterado pelo próprio clube a qualquer momento, sem aviso à federação — inclusive o endereço que recebe avisos com dados de atletas.

---

## 8. Transferência internacional de dados (art. 33)

Os fornecedores que a FHT usa para hospedar o sistema mantêm servidores fora do Brasil. Quando isso acontece, seus dados saem do país. A lei chama isso de **transferência internacional** e exige que a FHT informe você e que a transferência se enquadre numa hipótese legal (art. 33).

**Na configuração decidida para a publicação, todo o sistema fica nos Estados Unidos.** A aplicação roda no Render e o banco de dados no Neon, ambos em Virginia (EUA); os arquivos e as cópias de segurança ficam no Cloudflare R2; a cópia de segurança diária é gerada numa máquina do GitHub nos EUA. Ou seja: **o banco inteiro, todos os documentos e todo o tráfego da aplicação — inclusive os registros técnicos de funcionamento — estão fora do Brasil desde o primeiro dia**. **[JÁ EXISTE — hospedagem decidida]**

**Hipótese legal invocada pela FHT:** [HIPÓTESE LEGAL DO ART. 33 A SER DEFINIDA PELO ADVOGADO — cláusulas contratuais padrão, cláusulas específicas, ou necessidade para execução de contrato]. **[A CONFIRMAR — obrigatória antes da publicação]** Como a transferência de todos os dados é certa, e não mais eventual, a definição dessa hipótese **não é opcional**: sem ela o sistema não pode ir ao ar com dados reais.

| Destino | Situação | O que sai do Brasil |
|---|---|---|
| **Google (fontes tipográficas)** | **ATIVA HOJE, sem alternativa de recusa** **[JÁ EXISTE]** | IP, navegador e página acessada de **100% dos visitantes**, inclusive crianças que só estejam lendo uma notícia |
| **Render (hospedagem da aplicação) — Virginia, EUA** | **ATIVA desde a publicação** **[JÁ EXISTE — hospedagem decidida]** | **Todo o tráfego da aplicação**, com todos os dados pessoais que passam por ela, e os registros técnicos de funcionamento (logs) |
| **Neon (banco de dados) — AWS us-east-1, Virginia, EUA** | **ATIVA desde a publicação** **[JÁ EXISTE — hospedagem decidida]** | **O banco de dados inteiro**, inclusive os cadastros de crianças e dos responsáveis legais |
| **GitHub (rotina de backup e imagem da aplicação) — EUA** | **ATIVA desde a publicação**, uma vez por dia **[JÁ EXISTE]** | A cópia do **banco inteiro** transita pela máquina temporária do GitHub Actions a cada execução, antes de ir para o bucket de backups; o arquivo é apagado da máquina ao fim. A imagem da aplicação guardada no GitHub (GHCR) **não contém dados pessoais** |
| **Cloudflare (armazenamento R2)** | **ATIVA desde a publicação** **[JÁ EXISTE]** — região dos buckets **[A CONFIRMAR]** | Bucket `fht-documentos`: todos os documentos digitalizados e as imagens do site. Bucket `fht-backups`: as cópias de segurança do banco inteiro. Tratado como transferência internacional até que a região seja confirmada |
| **Google (servidor de e-mail)** | **Latente.** O envio está desligado, mas o servidor configurado por padrão no projeto é o do Gmail | Todo o conteúdo dos avisos, inclusive a relação nominal de atletas menores. **[A CONFIRMAR]** — a federação decide qual servidor usar |
| **Provedor das caixas postais da FHT** | **[A CONFIRMAR]** | Se as caixas estiverem em serviço estrangeiro, todo aviso operacional fica armazenado fora do Brasil |

> **Compromisso da FHT. [A IMPLEMENTAR]** As fontes tipográficas passarão a ser servidas pelo próprio servidor da FHT. Feito isso, **nenhum dado de visitante será transmitido a terceiro pelo navegador** — é a correção de melhor custo-benefício de todo o levantamento técnico. Ela **não** elimina as demais transferências: hospedagem, banco de dados, backup e arquivos continuam nos Estados Unidos e dependem da hipótese legal acima.

> **Alerta ao revisor.** Um destino acima — o servidor de e-mail — passa de latente a ativo por **mera alteração de variável de configuração**, sem nenhuma mudança de código. E a região de cada provedor de hospedagem e armazenamento também é escolha de configuração. Isso significa que esta seção pode nascer correta e ficar falsa na semana seguinte. Recomenda-se travar, por decisão administrativa, que nenhum destino seja ligado e nenhuma região seja trocada sem atualização prévia desta política.

---

## 9. Por quanto tempo guardamos seus dados

### 9.1 A regra geral, dita com honestidade

Hoje o sistema tem **dois prazos automáticos de descarte**: o dos cadastros sem anuidade confirmada e o das cópias de segurança. Todo o resto é guardado **por prazo indeterminado**. **[JÁ EXISTE]** A FHT vai definir e aplicar prazos por categoria antes da publicação desta política. **[A IMPLEMENTAR]**

| Categoria | Prazo-alvo | Situação hoje |
|---|---|---|
| Cadastro de atleta sem anuidade confirmada | **90 dias**, contados do cadastro | **[JÁ EXISTE]** — uma das duas regras automáticas. Ver 9.2 |
| Cadastro de atleta ativo, suspenso ou desfiliado | [PRAZO APÓS A DESFILIAÇÃO] | Indeterminado **[A IMPLEMENTAR]** |
| Registros de pagamento e comprovantes | [PRAZO CONTÁBIL/FISCAL DE GUARDA] | Indeterminado, e desenhado para sobreviver à exclusão do atleta **[A CONFIRMAR]** |
| Cadastro de clube com filiação **recusada** | [PRAZO PARA CLUBE RECUSADO] | Indeterminado — ver 9.4 **[A IMPLEMENTAR]** |
| Contas de acesso desativadas | [PRAZO PARA CONTA DESATIVADA] | Indeterminado, e não existe forma de apagá-las **[A IMPLEMENTAR]** |
| Registros de autorização (consentimento) | Enquanto durar o tratamento + [PRAZO DE PRESTAÇÃO DE CONTAS] | Apagados **junto com o cadastro do atleta**, em cascata — ver 11.3 **[A IMPLEMENTAR]** |
| Documentos digitalizados (RG, foto, comprovantes) | Acompanhar o prazo do cadastro correspondente | **Nunca são apagados** — ver 9.3 **[A IMPLEMENTAR]** |
| Registros técnicos de funcionamento (logs) | [PRAZO DE RETENÇÃO DOS LOGS] | Indeterminado, e guardados no Render, nos EUA. Contêm nomes completos de atletas apagados, o nome de atleta ativado sem pagamento e o e-mail de cada destinatário de mensagem automática — ver 9.5 **[A IMPLEMENTAR]** |
| Cópias de segurança do banco (backups) | **30 cópias diárias** (≈30 dias) | **[JÁ EXISTE]** — rotação automática: a cada execução diária, só as 30 cópias mais recentes são mantidas no bucket privado `fht-backups`. **Cada cópia contém o banco inteiro**, inclusive dados que já foram apagados do banco em uso depois dela — ver 9.5. **[A CONFIRMAR]** a aceitação desse prazo pela federação |
| Cadastro de diretor, notícia e foto | [PRAZO POR CATEGORIA] | Indeterminado **[A IMPLEMENTAR]** |

### 9.2 O descarte automático de 90 dias — **[JÁ EXISTE]**

Uma vez por dia, o sistema apaga definitivamente os cadastros de atleta que estejam há mais de 90 dias sem a anuidade confirmada, contados da data do cadastro.

> **Defeito conhecido, a corrigir antes da publicação. [A IMPLEMENTAR]** Quando o clube envia o pagamento, o atleta continua marcado como "aguardando pagamento" até a federação conferir o comprovante. A rotina de descarte **não verifica se existe pagamento aguardando conferência**. Portanto, uma demora da federação pode fazer o sistema apagar o cadastro de um atleta **cuja anuidade já foi paga**. Há um segundo caminho para o mesmo destino: quando um pagamento é recusado, os atletas voltam à fila de pendentes mantendo a data de cadastro original, sem reiniciar a contagem.

### 9.3 Arquivos: o que a FHT precisa admitir — **[A IMPLEMENTAR]**

**Nenhum arquivo enviado ao sistema é apagado, jamais.** Não existe, em nenhum ponto do sistema, código capaz de excluir um arquivo. Apagar um cadastro remove a linha do banco de dados, mas o RG digitalizado, a foto 3x4, o comprovante de residência, o comprovante de pagamento, a ata e o estatuto **permanecem no armazenamento** e continuam acessíveis a quem tiver o endereço.

Há ainda um acúmulo silencioso. Os arquivos enviados **no momento do cadastro** são guardados numa pasta que o sistema nunca mais abre. Se o documento for trocado depois, a primeira versão continua guardada para sempre, sem que nada no sistema aponte para ela. **[A IMPLEMENTAR]**

A FHT vai implementar a exclusão efetiva de arquivos e a limpeza dos arquivos órfãos antes da publicação.

### 9.4 O que fica quando a filiação é recusada — **[JÁ EXISTE]**

Um clube que teve a filiação **negada** permanece indefinidamente no sistema com: o cadastro do clube, com o nome, o CPF, o e-mail e o telefone do representante, os PDFs de ata e estatuto, e uma **conta de acesso desativada, com o resumo criptográfico da senha escolhida**. Nada disso é apagado por nenhum código, e não existe forma de excluir um clube ou uma conta pelo sistema. **[A IMPLEMENTAR]**

### 9.5 Quatro lugares onde o dado sobrevive ao descarte — **[A IMPLEMENTAR]**

1. **Registros técnicos de funcionamento (logs).** Ao apagar um cadastro pela rotina automática, o sistema escreve o **nome completo** do atleta nesses registros. O mesmo acontece quando a federação ativa um atleta dispensando a exigência de pagamento: ficam gravados o nome completo do atleta e a identificação de quem autorizou. Esses registros não têm prazo de retenção definido. Trocar o nome por um identificador é correção de poucas linhas e será feita.
2. **A caixa postal da federação.** Uma vez entregue, uma mensagem com a relação nominal de atletas **escapa completamente do controle do sistema** e passa a viver sob as regras do provedor de e-mail. Ver as seções 6 e 7.
3. **O registro de cada mensagem enviada. [JÁ EXISTE]** Toda vez que o sistema dispara um e-mail, ele grava nos registros técnicos de funcionamento o **endereço de e-mail do destinatário** e o **assunto da mensagem** — e os assuntos trazem o nome do clube e o número do protocolo do pagamento. O mesmo é gravado quando o envio falha. Na prática, forma-se um histórico de quem recebeu o quê, que **não serve a nenhuma finalidade declarada** e não tem prazo de descarte definido. Enquanto o envio estiver em modo simulado, é possível que o **corpo** da mensagem — com a relação nominal de atletas — também seja escrito nesses registros (ver a cláusula 7.2). **[A IMPLEMENTAR]** A FHT vai reduzir esse registro ao mínimo necessário e definir prazo de descarte para os registros técnicos.
4. **As cópias de segurança (backups). [JÁ EXISTE]** Todo dia, às 03:00 UTC, o banco de dados **inteiro** é copiado para o bucket privado `fht-backups`, e só as 30 cópias mais recentes são mantidas (≈30 dias). Consequência: um dado apagado do banco em uso — pelo descarte automático de 90 dias, pela exclusão de um cadastro ou por um pedido de eliminação do titular — **continua existindo nas cópias feitas antes da exclusão, por até 30 dias**, até que elas expirem pela rotação. E há um risco adicional: **restaurar uma cópia de segurança traz de volta, para o banco em uso, dados que já tinham sido apagados** depois que ela foi feita. **[A IMPLEMENTAR]** A FHT vai criar e registrar um procedimento que, após qualquer restauração, reaplique as eliminações feitas depois da data da cópia restaurada.

E, como já dito na cláusula 3.4, o **nome do atleta permanece no registro financeiro** mesmo depois de o cadastro ser apagado — por decisão de projeto. Ver a cláusula 11.3.

---

## 10. Como protegemos seus dados

O art. 46 da LGPD obriga a FHT a adotar medidas de segurança. Esta seção diz **exatamente** quais existem hoje e quais ainda não — porque uma frase genérica do tipo "adotamos as melhores práticas de mercado" não protegeria ninguém e não sobreviveria a uma auditoria.

### 10.1 O que já existe e é verificável — **[JÁ EXISTE, com as ressalvas seladas linha a linha]**

- **Sua senha nunca é guardada em texto legível.** Ela é transformada num código embaralhado, do qual não é possível voltar à senha original (a técnica chama-se *hash* BCrypt, com um valor aleatório somado a cada senha). É esse código, e não a sua senha, que fica no banco, e ele nunca é devolvido por nenhuma tela ou resposta do sistema. Nem a federação consegue descobrir qual é a sua senha.
- **A sessão é selada criptograficamente** com chave RSA de 2048 bits, o que impede que alguém a falsifique. O acesso vale 1 dia.
- **Toda operação da API que devolve dado pessoal exige login e perfil**, verificados no servidor — nunca só na tela. **Cada clube só alcança os próprios dados**; a tentativa de alcançar outro clube é recusada. *Atenção:* essa separação vale **entre clubes**. Do lado da federação não há separação: toda conta de administrador da FHT alcança todos os dados (ver a cláusula 6.2). **[JÁ EXISTE]**
  > ⚠️ **Duas exceções, que o revisor precisa ler junto com esta linha.** Esta garantia vale para os endereços de dados (cadastros, fichas, pagamentos), **não** para os arquivos nem para a vitrine pública: (1) o endereço que serve os documentos digitalizados não verifica quem está pedindo — ver a primeira linha da tabela 10.2 e a cláusula 12.4; (2) a vitrine pública de clubes devolve nome, posição e categoria de atletas ativos sem login — ver a cláusula 12.4. **[A IMPLEMENTAR]**
- **Proteção contra manipulação de caminho de arquivo**, tanto na leitura quanto na gravação.
- **As respostas de erro não vazam dado pessoal:** falhas não previstas devolvem ao navegador apenas um texto fixo. **[JÁ EXISTE]** A exceção original, que pode conter dado pessoal, é gravada **apenas** nos registros técnicos do servidor (hospedados no Render, nos EUA — ver a seção 8) e **não é enviada a nenhum serviço de monitoramento de terceiros**. **[JÁ EXISTE]** O prazo de guarda desses registros ainda não está definido — ver a cláusula 9.5. **[A IMPLEMENTAR]**
- **A conferência do CPF é feita localmente**, por cálculo matemático, sem consultar nenhuma base externa.
- **As mensagens automáticas viajam cifradas até o provedor de e-mail.** A conexão com o servidor de saída exige criptografia (TLS). Uma ressalva honesta: a mensagem chega **em texto legível** na caixa postal de destino, como qualquer e-mail — a proteção é do transporte, não do armazenamento. **[JÁ EXISTE]**
- **Cópia de segurança diária do banco de dados.** Todo dia, às 03:00 UTC, uma rotina automática no GitHub Actions copia o banco **inteiro**, comprime a cópia e a envia ao bucket **privado** `fht-backups` no Cloudflare R2, que não tem endereço público. São mantidas só as 30 cópias mais recentes (≈30 dias). O arquivo é apagado da máquina que o gerou ao fim da execução, e o conteúdo nunca é escrito no registro da execução. **[JÁ EXISTE]** A contrapartida — dado apagado que sobrevive nas cópias, e o risco na restauração — está na cláusula 9.5.

### 10.2 O que ainda NÃO existe — e será construído antes da publicação

| Lacuna | Situação hoje | Compromisso |
|---|---|---|
| **Conexão segura entre o seu navegador e a FHT (HTTPS)** | Não há, no projeto, nenhuma configuração que exija conexão criptografada, e o endereço de produção ainda não foi definido. Desde agosto de 2026 trafegam por essa conexão a **senha** escolhida no formulário público de filiação, o RG digitalizado de atletas — inclusive de crianças —, o comprovante de residência e o comprovante bancário | Publicar o site e a interface de programação **exclusivamente sob HTTPS**, com redirecionamento obrigatório e certificado válido, **antes de qualquer coleta de dado real**. **[A IMPLEMENTAR — pré-requisito de lançamento]** **[A CONFIRMAR]** com o provedor de hospedagem (Render) |
| **Controle de acesso aos arquivos** | O endereço que serve os documentos **não verifica quem está pedindo**. Quem tiver o endereço baixa o RG de uma criança. O endereço não expira e não pode ser cancelado | Exigir autenticação e adotar endereço assinado com prazo. **[A IMPLEMENTAR — na avaliação técnica, a correção mais urgente do sistema]** |
| **Criptografia dos dados guardados** | CPF, RG e os documentos ficam em texto puro no banco e no armazenamento | **[A IMPLEMENTAR]** |
| **Restauração de cópia de segurança (backup)** | O backup diário **existe** (30 cópias, em bucket privado — ver a cláusula 10.1). Mas não existe procedimento para, depois de uma restauração, reaplicar as eliminações feitas após a data da cópia: restaurar traz de volta dados que já tinham sido apagados | Procedimento escrito de restauração que reaplique as eliminações, com registro de quem o executou. **[A IMPLEMENTAR]** |
| **Registro de auditoria** | Não existe. **Uma única** operação em todo o sistema registra quem a praticou: a conferência de pagamento. É impossível responder "quem consultou os dados desta criança" | **[A IMPLEMENTAR]** |
| **Troca e recuperação de senha** | Não existem. Quem esquecer a senha depende de contato manual com a federação — o próprio e-mail de aprovação já instrui isso por escrito | **[A IMPLEMENTAR]** |
| **Proteção contra tentativas repetidas de login** | Não há limite de tentativas, nem verificação anti-robô, nem bloqueio por força bruta | **[A IMPLEMENTAR]** |
| **Regra de qualidade da senha** | A senha escolhida no formulário público exige apenas 8 caracteres. Não há exigência de letras, números ou símbolos, nem verificação contra senhas comuns e já vazadas | **[A IMPLEMENTAR]** |
| **Proteção do formulário público de filiação** | O formulário que cria contas de acesso e recebe os PDFs de ata e estatuto não exige login e também não tem limite de envios, verificação anti-robô nem bloqueio. Qualquer pessoa pode criar cadastros e enviar arquivos em série | **[A IMPLEMENTAR]** |
| **Cancelamento de sessão pelo servidor** | Uma sessão copiada do seu dispositivo vale até expirar; não há como cancelá-la | **[A IMPLEMENTAR]** |
| **Senha da conta administrativa inicial** | A conta de administrador criada na instalação usa uma senha fraca e conhecida, e é a conta com acesso a todos os dados de menores | **[A IMPLEMENTAR — urgente]** |
| **Exposição do mapa técnico do sistema** | A documentação completa da interface de programação fica pública inclusive em produção | **[A IMPLEMENTAR]** |
| **Configuração de produção do site** | A imagem de execução do site roda o servidor de desenvolvimento, não uma versão compilada para produção | **[A IMPLEMENTAR]** |
| **Descoberta de contas por terceiros** | O formulário público responde "Este e-mail já está cadastrado no sistema", o que permite a um visitante anônimo descobrir se um e-mail tem conta | **[A IMPLEMENTAR]** |

### 10.3 Incidentes de segurança — **[A IMPLEMENTAR]**

A FHT manterá plano de resposta a incidentes e, havendo incidente que possa gerar risco relevante, comunicará à ANPD e aos titulares afetados no prazo da regulamentação vigente (Resolução CD/ANPD nº 15/2024 — 3 dias úteis). Incidente envolvendo **dados de crianças e adolescentes** é expressamente tratado como de risco relevante.

**[A IMPLEMENTAR]** Hoje não existe plano de resposta, não existe registro de operações de tratamento (art. 37) e não existe Relatório de Impacto (art. 38) — este último é boa prática forte, porque a FHT trata dados de grupo vulnerável.

**Se você suspeitar de um problema — como avisar a FHT. [A IMPLEMENTAR]** Se você encontrar um documento seu ou do seu filho acessível onde não deveria, desconfiar de acesso indevido à conta do seu clube ou receber uma mensagem estranha em nome da FHT, escreva imediatamente para **[E-MAIL DO ENCARREGADO]** descrevendo o que viu. A FHT registrará o aviso, apurará e responderá a você, e comunicará à ANPD e aos demais afetados se for o caso.

Este caminho é especialmente importante neste sistema por três razões que esta política declara abertamente: os arquivos hoje são servidos **sem verificação de quem os pede** (cláusula 10.2); **não existe trilha de auditoria**, então a FHT não tem como detectar sozinha um acesso indevido (cláusulas 10.2 e 11.1); e **não existe troca de senha** pelo sistema, de modo que uma senha comprometida precisa ser tratada manualmente pela federação. Enquanto essas três lacunas não forem fechadas, o aviso do titular é a principal forma de a FHT ficar sabendo de um incidente.

---

## 11. Seus direitos sobre os seus dados

A Lei Geral de Proteção de Dados (Lei 13.709/2018, art. 18) garante a você um conjunto de direitos sobre os dados pessoais que a FHT trata. Todos são **gratuitos**. Você não precisa justificar o pedido nem contratar advogado.

Nesta seção, "você" é o titular dos dados: o atleta, o responsável legal de um atleta menor, o representante de um clube, o membro da diretoria, e também quem aparece num comprovante de pagamento enviado ao sistema.

### 11.1 O canal para exercer seus direitos — **[A IMPLEMENTAR]**

Hoje o sistema da FHT **não tem nenhuma tela de autoatendimento** para exercer os direitos abaixo. Atleta, responsável legal e diretor **não têm login** — existem apenas dois tipos de acesso no sistema, o da federação e o do representante do clube. Por isso, todo pedido é recebido e executado **manualmente**, pelo canal do Encarregado.

- **E-mail do Encarregado:** [E-MAIL DO ENCARREGADO] **[A IMPLEMENTAR]**
- **Encarregado (DPO):** [NOME COMPLETO E CARGO DO ENCARREGADO] **[A IMPLEMENTAR]**
- **Endereço para correspondência:** [ENDEREÇO POSTAL PARA PEDIDOS ESCRITOS] **[A CONFIRMAR]**

> ⚠️ **Aviso ao revisor jurídico — situação de hoje.** Não há Encarregado nomeado em lugar nenhum do sistema ou do site. O formulário "Fale com a FHT" da página inicial **não envia nada a lugar nenhum**, embora exiba na tela a mensagem "MENSAGEM ENVIADA!". O link de WhatsApp divulgado no site aponta para um número que é só zeros. E as caixas `contato@fht.org.br` e `imprensa@fht.org.br` ainda não foram confirmadas como reais e monitoradas. **Nenhum desses três canais pode ser apontado por esta política enquanto não for corrigido.** Esta política não deve ser publicada antes de o canal do Encarregado existir de fato.

**O que informar no pedido, para que possamos atender:**

1. Seu nome completo e seu CPF;
2. Qual direito você quer exercer (pode ser com suas palavras — "quero saber o que vocês têm sobre mim", "quero apagar", "quero corrigir");
3. Se o pedido é sobre um atleta menor de idade, o nome do atleta, o clube dele e o seu grau de parentesco;
4. Um e-mail ou telefone para resposta.

**Como confirmamos que é você. [A IMPLEMENTAR]** A FHT precisa ter certeza de que não vai entregar dados de uma pessoa a outra. A conferência é feita com o que a FHT **já tem** no cadastro — por exemplo, o CPF do responsável legal e o grau de parentesco já ficam registrados no cadastro do atleta menor. Só pediremos documento adicional quando a conferência com o que já existe não for possível. A verificação de identidade **não** será usada como pretexto para coletar mais dados do que o necessário.

**Prazo de resposta. [A CONFIRMAR]** A FHT responderá em até [PRAZO DE RESPOSTA QUE A FHT VAI PROMETER — a lei admite resposta imediata em formato simplificado, ou até 15 dias na forma completa (art. 19); se a FHT se enquadrar como agente de tratamento de pequeno porte — uma categoria criada pela autoridade nacional para entidades pequenas, como associações sem fins lucrativos, com prazos e obrigações reduzidos —, na forma da Resolução CD/ANPD nº 2/2022, esse prazo é dobrado]. Se não for possível atender, você receberá a resposta com o motivo, por escrito.

**Pedido feito pelo clube.** Como toda a relação do atleta com a FHT passa pelo clube, é comum que o pedido chegue pelo clube. [A FHT DEVE DECIDIR: aceita pedido intermediado pelo clube, exige contato direto do titular, ou aceita o intermediado e confirma diretamente com o titular] **[A CONFIRMAR]**

**Registro do atendimento. [A IMPLEMENTAR]** A FHT manterá um registro de cada pedido recebido, de quem o atendeu e de quando foi atendido.

> ⚠️ **Aviso ao revisor jurídico.** Hoje o sistema **não tem nenhuma trilha de auditoria**. Não existe tabela, entidade ou serviço de auditoria em nenhuma das dezesseis versões do banco de dados. Existe **um único** registro de autoria em todo o sistema: quem confirmou ou recusou um pagamento de anuidade fica gravado, com data e hora. Fora isso, é hoje **impossível comprovar** que um pedido de titular foi recebido e atendido, e igualmente impossível responder "quem consultou os dados desta criança".

### 11.2 Os nove direitos, um a um

**I — Confirmação de que existe tratamento.** Você pode perguntar se a FHT trata algum dado seu, e a resposta é sim ou não. Peça pelo canal do Encarregado. **[A IMPLEMENTAR]**

**II — Acesso aos dados.** Você pode receber a relação dos dados que a FHT tem sobre você e de como eles são usados.
- O representante do clube já vê os próprios dados cadastrais e os dos atletas do seu clube dentro do painel. **[JÁ EXISTE]**
- Todos os demais titulares — atleta, responsável legal, diretor — só têm acesso pelo canal do Encarregado, porque não têm login. **[A IMPLEMENTAR]**

**III — Correção de dados incompletos, inexatos ou desatualizados.** Você pode pedir a correção de qualquer dado errado.
- O representante do clube corrige, sozinho, no painel: nome, cidade, UF, sigla e CNPJ do clube, e o próprio nome, e-mail, telefone e cargo. O clube também corrige os dados dos atletas que cadastrou. **[JÁ EXISTE]**
- **Exceção que precisa constar:** o CPF do representante do clube, informado no formulário público de filiação, **não pode ser corrigido por ninguém pelo sistema** — nem pelo titular, nem pela federação. Ele ficou de fora dos campos editáveis. Um CPF digitado errado hoje só é corrigível por intervenção direta no banco de dados. **[A IMPLEMENTAR — correção do sistema antes da publicação]**
- **Segunda exceção:** o nome e o e-mail do representante existem em **duas cópias que não se sincronizam** (cadastro do clube e conta de acesso). Corrigir uma pode não corrigir a outra. Enquanto isso não for resolvido, o atendimento manual precisa alcançar expressamente as duas. **[A IMPLEMENTAR]**
- Demais titulares: pelo canal do Encarregado. **[A IMPLEMENTAR]**

**IV — Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados fora da lei.** Você pode pedir que a FHT apague, bloqueie ou descaracterize dados que não deveriam estar sendo tratados. O pedido é feito pelo canal do Encarregado e executado manualmente. **[A IMPLEMENTAR]**

> ⚠️ **Limites reais da eliminação hoje — o revisor precisa ver isto antes de aprovar qualquer redação sobre "apagamos seus dados".**
> - **Arquivos nunca são apagados.** Ver a cláusula 9.3. **[A IMPLEMENTAR]**
> - **O nome do atleta sobrevive de propósito.** O registro financeiro guarda uma cópia congelada do nome completo de cada atleta coberto por um pagamento, e essa linha foi deliberadamente construída para **não** ser apagada junto com o cadastro ("a linha fiscal não pode sumir", diz o comentário no próprio banco de dados). Excluído o cadastro, o nome permanece por prazo indeterminado no histórico de pagamentos, visível para a federação e para o clube. Isso vale inclusive para menores. Ver 11.3.
> - **Não existe exclusão de clube nem de conta de acesso** em toda a interface do sistema. Ver a cláusula 9.4. **[A IMPLEMENTAR]**
> - **Registros técnicos de funcionamento** guardam o nome completo de atletas apagados pela rotina automática, sem prazo de retenção definido. Ver 9.5. **[A IMPLEMENTAR]**
> - **Cópias de segurança.** O dado eliminado continua existindo nas cópias de segurança feitas antes da eliminação, por até 30 dias, até que elas expirem; e uma restauração pode trazê-lo de volta enquanto não existir o procedimento de reaplicar as eliminações. Ver 9.5. **[JÁ EXISTE como fato — procedimento A IMPLEMENTAR]**

**V — Portabilidade dos dados a outro fornecedor.** Você pode pedir seus dados em formato estruturado para levá-los a outra entidade. Hoje **não existe nenhum recurso de exportação ou portabilidade no sistema**; o atendimento será manual, pelo canal do Encarregado, na forma e nos limites da regulamentação da ANPD. **[A IMPLEMENTAR]**

**VI — Eliminação dos dados tratados com base no seu consentimento.** Quando um tratamento se apoia no seu consentimento, você pode pedir a eliminação daqueles dados. Na FHT, o **único** tratamento que se apoia em consentimento é o **uso de imagem e nome em galeria e notícias**. **[A IMPLEMENTAR]**

> ⚠️ **Aviso ao revisor jurídico.** As fotos publicadas na galeria **não são vinculadas a nenhum atleta** no sistema. Não há como localizar automaticamente em quais fotos determinada pessoa aparece. O atendimento a este direito hoje depende de busca visual manual, foto por foto. **[A IMPLEMENTAR — vincular publicação a titular, ou registrar de outra forma que permita a retirada]**

**VII — Informação sobre com quem a FHT compartilhou seus dados.** Você pode pedir a relação das entidades públicas e privadas com as quais a FHT compartilhou seus dados. A relação geral está na seção 6; a relação específica sobre você é obtida pelo canal do Encarregado. **[A IMPLEMENTAR]**

**VIII — Informação sobre a possibilidade de não consentir e sobre as consequências da recusa.** Você tem direito de saber, antes de decidir, o que acontece se não autorizar algo. Na FHT a regra é simples e já está escrita no termo mostrado no cadastro: **a autorização de uso de imagem é opcional, e a filiação continua válida sem ela**. Recusar não impede o atleta de se filiar, de treinar nem de competir. **[JÁ EXISTE no texto do termo]** — a mesma informação passará a constar desta política e do termo revisado. **[A IMPLEMENTAR]**

**IX — Revogação do consentimento, a qualquer momento.** Onde o tratamento se apoia no seu consentimento — na FHT, o uso de imagem —, você pode voltar atrás quando quiser, sem custo, pelo canal do Encarregado. Revogar não afeta o que já foi feito com base no consentimento anterior, e não cancela a filiação. **[A IMPLEMENTAR]**

> ⚠️ **Este é um ponto de exposição atual e o revisor precisa saber.** **Não existe hoje nenhum caminho de revogação de consentimento no sistema.** A capacidade de registrar a data de revogação existe no modelo de dados e **nunca é acionada por nenhuma linha de código**: não há endereço de API, tela, botão ou rotina administrativa que revogue. As telas internas até preveem um selo "revogado", que nunca poderá aparecer. **E o termo que o responsável legal já aceita hoje, no sistema em produção, afirma textualmente que a autorização de imagem "pode ser revogada a qualquer momento".** É uma promessa publicada e não cumprida, anterior a esta política.

### 11.3 Quando a FHT pode recusar um pedido de eliminação

A LGPD (art. 16) permite que a FHT mantenha certos dados mesmo depois de um pedido de exclusão. A FHT invocará essa possibilidade nas situações abaixo e **sempre informará a você, por escrito, quando o fizer, registrando o pedido e a resposta**. **[A IMPLEMENTAR]** — hoje não existe canal do titular nem registro de atendimento (ver 11.1).

- **Comprovação de pagamento da anuidade. [JÁ EXISTE como fato — base legal A CONFIRMAR]** Os registros de pagamento — protocolo, valor, ano, comprovante bancário e o **nome do atleta coberto** — são mantidos como prova de pagamento, [PRAZO DE GUARDA CONTÁBIL/FISCAL QUE A FEDERAÇÃO PRECISA DEFINIR — hoje não existe prazo nenhum, nem em sistema nem em decisão registrada]. Na prática, isso significa que **o nome de um atleta cujo cadastro foi excluído permanece no histórico financeiro**.
- **Cumprimento de obrigação legal ou regulatória** e **exercício regular de direitos** em processo administrativo, judicial ou arbitral. **[A CONFIRMAR]** — a obrigação legal específica e o prazo correspondente ainda não foram identificados; ver o Anexo II.3.
- **Registro da própria autorização.** O registro de que houve consentimento deve ser guardado como prova de prestação de contas (art. 6º, X). **[A IMPLEMENTAR]** — hoje o sistema faz o contrário: quando o cadastro do atleta é apagado, por pedido ou pela rotina automática de 90 dias, os registros de consentimento vinculados a ele são **apagados em cascata**, e a prova desaparece com o cadastro. A FHT passará a preservar a evidência da autorização mesmo após a exclusão do cadastro. Ver a cláusula 5.3 e o contraste logo abaixo.

> ⚠️ **Contraste que o revisor deve avaliar.** Hoje o sistema faz exatamente o inverso do que seria prudente: quando o cadastro de um atleta é apagado, **o registro do consentimento do responsável é apagado junto, em cascata** — some a prova que protege a federação —, enquanto **o nome da criança permanece** no registro financeiro e nos registros técnicos.

### 11.4 Você também pode

- **Se opor a um tratamento** feito com base em legítimo interesse ou em qualquer outra hipótese sem consentimento, quando entender que há descumprimento da lei (art. 18, §2º). **[A IMPLEMENTAR]**
- **Peticionar diretamente à ANPD** — Autoridade Nacional de Proteção de Dados —, especialmente se não ficar satisfeito com a resposta da FHT (art. 18, §1º): www.gov.br/anpd. **[JÁ EXISTE — é direito legal, independe do sistema]**
- **Acionar os órgãos de defesa do consumidor** (art. 18, §8º). **[JÁ EXISTE — é direito legal, independe do sistema]**

### 11.5 Decisões automatizadas

A FHT **não** usa seus dados para tomar decisões automatizadas sobre seu perfil, personalidade, desempenho ou crédito. Não há perfilamento, pontuação nem análise preditiva no sistema. **[JÁ EXISTE — verificado]**

São **dois** os processos automáticos que decidem sobre a situação de um cadastro, ambos descritos na cláusula 4.3:

- **Rotina diária de descarte. [JÁ EXISTE]** Cadastros de atleta que ficam mais de 90 dias sem confirmação do pagamento da anuidade são **apagados definitivamente, sem aviso prévio** ao titular. O defeito dessa rotina está descrito na cláusula 9.2 e será corrigido antes da publicação. **[A IMPLEMENTAR]**
- **Ativação em bloco. [JÁ EXISTE]** Quando a federação confirma um pagamento, o sistema percorre a lista de atletas cobertos e decide, um a um, quem passa a ativo e quem fica retido — a regra confere se há RG digitalizado e, no caso de menor de 18 anos, se há autorização do responsável registrada. Quem não passa fica retido com o motivo escrito.

Você pode pedir a revisão de qualquer uma dessas duas decisões pelo canal do Encarregado (cláusula 11.1). **[A IMPLEMENTAR]** — hoje não há registro de que um pedido desses foi recebido ou atendido.

### 11.6 Como o responsável legal exerce os direitos do atleta menor de 18 anos

Se você é pai, mãe, tutor ou responsável legal de um atleta menor de 18 anos, **você é quem exerce os direitos dele** perante a FHT. E você é, além disso, titular por direito próprio: a FHT guarda **o seu** nome completo, **o seu** CPF, o grau de parentesco e o seu e-mail e/ou telefone. **[JÁ EXISTE]**

**Como fazer, na prática:**

1. Escreva para [E-MAIL DO ENCARREGADO]. **[A IMPLEMENTAR]**
2. Informe: seu nome completo, seu CPF, o nome completo do atleta, o clube dele e o seu grau de parentesco. Esses quatro dados **já constam do cadastro do atleta**, o que permite conferir sua identidade sem pedir documento adicional na maioria dos casos. **[JÁ EXISTE]**
3. Diga o que você quer. Você pode pedir, entre outras coisas:
   - a lista completa dos dados do seu filho ou tutelado que a FHT guarda, e cópia do registro da autorização que consta em nome do responsável (data, hora e versão do termo aceito);
   - a correção de qualquer dado errado;
   - **a retirada do nome e da imagem do menor do site público** — galeria, notícias e vitrine do clube;
   - a revogação da autorização de uso de imagem;
   - a exclusão do cadastro, observados os limites da cláusula 11.3.
4. A FHT responde em até [PRAZO DE RESPOSTA QUE A FHT VAI PROMETER]. **[A CONFIRMAR]**

**Você não precisa passar pelo clube.** Você pode escrever diretamente à FHT, ainda que quem tenha preenchido o cadastro do seu filho tenha sido o representante do clube. **[A IMPLEMENTAR]**

**Se o próprio adolescente pedir.** A FHT receberá e avaliará o pedido feito pelo próprio atleta menor, decidindo sempre pelo **melhor interesse dele** (LGPD, art. 14, caput) e, quando for o caso, envolvendo o responsável legal. **[A IMPLEMENTAR]**

> ⚠️ **Aviso ao revisor jurídico — duas lacunas sobre o responsável legal.**
> 1. **O responsável nunca é informado sobre os dados dele mesmo.** O único texto que ele supostamente aceita fala exclusivamente dos dados **do atleta**. Não há uma palavra dizendo que o nome, o CPF e o contato **dele** serão guardados, para qual finalidade, por quanto tempo, nem que o endereço de rede e o navegador do aceite ficam registrados. O termo precisa ser reescrito. **[A IMPLEMENTAR]**
> 2. **O responsável nunca recebe nenhuma mensagem do sistema.** Ver a cláusula 7.3. **[A IMPLEMENTAR]**

---

## 12. Crianças e adolescentes

Esta é a seção mais importante desta política. A FHT trata dados pessoais de **crianças e adolescentes** — os atletas das categorias de base. A LGPD dá a eles proteção reforçada (art. 14), e o **melhor interesse da criança e do adolescente** é o princípio que rege todas as decisões da FHT sobre esses dados: o que coletar, o que publicar, com quem compartilhar e por quanto tempo guardar.

Esta seção é escrita em linguagem simples de propósito, porque ela é dirigida a pais, mães e responsáveis — e não apenas a advogados (LGPD, art. 6º, VI e art. 14, §6º).

### 12.1 Como a FHT sabe que o atleta é menor de idade — **[JÁ EXISTE]**

Pela **data de nascimento** informada no cadastro. O sistema considera menor de idade quem tem **menos de 18 anos** na data de referência, e o cálculo é automático.

Dois esclarecimentos honestos:

- **Não existe idade mínima no sistema.** Uma criança de qualquer idade pode ser cadastrada. Esta política, portanto, fala em "menores de 18 anos", sem prometer um piso.
- **A categoria esportiva não determina a idade.** "Sub-12", "Sub-14", "Sub-16", "Sub-18" e "Adulto" são rótulos escolhidos pelo clube, sem qualquer amarração automática com a data de nascimento. Quem determina a menoridade, para efeito de proteção de dados, é sempre a data de nascimento.

### 12.2 A filiação de um menor depende da autorização do responsável legal — **[JÁ EXISTE]**

Quando a data de nascimento indica que o atleta é menor de 18 anos, o cadastro **exibe uma etapa adicional obrigatória**, chamada "Responsável (LGPD)", e o cadastro **não é concluído** sem ela. Nessa etapa são exigidos:

- nome completo do responsável legal;
- CPF do responsável, conferido pelo dígito verificador;
- o grau de parentesco (mãe, pai, tutor legal ou outro);
- pelo menos um contato — e-mail ou telefone;
- e o **aceite expresso** de um termo específico e destacado de autorização.

Além disso, **o sistema impede a ativação de um atleta menor sem o registro dessa autorização**, e essa trava funciona nos três caminhos possíveis de ativação: na aprovação manual pela federação, na baixa do pagamento em lote e na aprovação com dispensa de pagamento. **Pagar a anuidade não ativa um menor sem a autorização do responsável** — a dispensa administrativa alcança o pagamento, nunca a autorização. **[JÁ EXISTE]**

**Base legal. [A CONFIRMAR — decisão do advogado]** A FHT entende que a filiação esportiva do atleta menor se apoia na **execução da relação associativa** e no **cumprimento das obrigações da federação** (art. 7º, V e II), com a **anuência do responsável legal** exigida pelo art. 14, §1º e pela legislação civil, e sempre subordinada ao **melhor interesse** do menor. O **consentimento** fica reservado exclusivamente ao que é opcional: o uso de imagem.

**Esforços razoáveis de verificação (art. 14, §5º). [A IMPLEMENTAR]** A FHT confirmará diretamente com o responsável legal, pelo e-mail informado, que a autorização foi mesmo dada por ele. Ver a seção 13 — o ponto mais frágil do sistema hoje.

### 12.3 Que dados do menor a FHT coleta — **[JÁ EXISTE]**

**No cadastro:** nome completo, data de nascimento, sexo, CPF, número do RG e órgão emissor, naturalidade (cidade e UF), telefone e e-mail de contato, posição em quadra, categoria, situação de transferência e nome do clube anterior, valor e ano da anuidade, situação da filiação e o vínculo com o clube.

**Documentos digitalizados:** RG (obrigatório), foto 3x4 do rosto, comprovante de residência (que traz o endereço de casa da criança e, muitas vezes, o nome de terceiros) e, em cadastros antigos, o comprovante de pagamento individual.

**Do responsável legal:** nome completo, CPF, grau de parentesco, e-mail e/ou telefone, e o registro da autorização (data, hora, versão do termo, endereço de rede e navegador de origem).

**Sobre o endereço:** o endereço residencial do atleta **deixou de ser pedido no cadastro** desde 02/08/2026, por minimização — o endereço considerado é o do clube. **[JÁ EXISTE]** As ressalvas estão na cláusula 3.1: os endereços gravados antes dessa data continuam armazenados **[A IMPLEMENTAR]**, e o comprovante de residência continua sendo aceito como arquivo.

**Coleta sem uso, a ser encerrada. [A IMPLEMENTAR]** O **órgão emissor do RG** e a **naturalidade** do atleta são pedidos e gravados, e **nunca são usados por nada**. Por minimização (art. 6º, III), a FHT deixará de coletá-los.

**A FHT não coleta dados sensíveis de atletas. [JÁ EXISTE — verificado]** Não há campo de saúde, atestado médico, laudo, lesão, biometria, dado genético, origem racial, religião, filiação política ou sindical em nenhuma parte do sistema. E o sistema **não faz reconhecimento facial**: as fotos são apenas guardadas e exibidas.

### 12.4 O que do menor aparece publicamente no site

Esta é a cláusula que exige mais honestidade, e ela está dividida entre o que a FHT **vai** fazer e o que o sistema **faz hoje**.

**Estado-alvo. [A IMPLEMENTAR]** A FHT não publicará o nome completo de atleta menor de 18 anos no site aberto. A identificação pública de menores ficará limitada ao estritamente necessário para a divulgação institucional do esporte, e dependerá de autorização específica do responsável legal para aquela finalidade, com possibilidade de retirada a qualquer momento.

> ⚠️ **SITUAÇÃO DE HOJE — o revisor precisa decidir sobre isto.** O site publica, **neste momento**, dados que identificam crianças:
>
> 1. **Vitrine pública dos clubes.** Ao abrir a página de um clube marcado como visível na home, **qualquer visitante, sem login**, recebe a lista do elenco. Para **cada atleta ativo, inclusive menores**, aparecem três campos: **nome completo, sem abreviação**; posição em quadra; e **categoria** — que é literalmente a faixa etária ("Sub-12", "Sub-14"...). No mesmo pacote vão o nome do clube, a cidade e a UF. Traduzindo: um visitante anônimo lê *"Nome Completo da Criança — Pivô · Sub-12"*, junto com o clube e a cidade dela. **Não há filtro de idade e não há nenhuma consulta a autorização** antes de publicar. É o item de maior exposição do sistema.
> 2. **Galeria de fotos e notícias.** As imagens publicadas podem conter rostos identificáveis de atletas de categorias de base, com legenda livre, ano e categoria. São publicadas **sem qualquer verificação de autorização**, e a foto **não é vinculada a nenhum atleta** no sistema.
> 3. **Documentos e arquivos.** O RG digitalizado, a foto 3x4 e o comprovante de residência de uma criança **ficam acessíveis a quem tiver o endereço do arquivo, sem login**. O endereço não expira, não pode ser cancelado e não verifica quem está pedindo. A proteção planejada — armazenamento privado com endereço assinado e prazo — **ainda não foi ativada**. **[A IMPLEMENTAR — é, na avaliação técnica, a correção mais urgente do sistema]**
>
> A FHT **não pode**, hoje, afirmar que dados de menores não são publicados.

**O que NÃO é público em nenhuma tela nem em nenhuma resposta de dados do site, verificado campo a campo. [JÁ EXISTE]** Não são devolvidos por nenhum endereço público: CPF, número do RG, data de nascimento, telefone e e-mail do atleta; **todos** os dados do responsável legal; os registros de autorização; e **todos** os dados de pagamento. Atletas que não estejam ativos não aparecem; clubes não aprovados ou não marcados como visíveis não aparecem.

> ⚠️ **Ressalva que não pode ser separada da frase acima.** Isso vale para os **campos** publicados. **Não** vale para os **arquivos**: o RG digitalizado e o comprovante de residência da mesma criança — que trazem número do RG, data de nascimento e endereço de casa — continuam alcançáveis pelo próprio site, sem login, por quem tiver o endereço do arquivo. Ver o item 3 acima e a cláusula 10.2. **[A IMPLEMENTAR]**

### 12.5 Uso da imagem do menor

**Como funciona. [JÁ EXISTE]** No cadastro do atleta menor há uma segunda caixa, **opcional e separada** da autorização de filiação, com o seguinte texto: *"Autorizo a publicação da foto e do nome do atleta no site da FHT, na galeria e em notícias. É opcional e pode ser revogada a qualquer momento — a filiação continua válida sem esta autorização."* Recusar **não** impede a filiação.

**Como autorizar ou recusar. [A IMPLEMENTAR]** A autorização é dada pelo responsável legal, e pode ser concedida ou retirada a qualquer momento pelo canal do Encarregado (cláusula 11.1). Retirada a autorização, a FHT removerá do site o nome e as imagens do menor.

> ⚠️ **SITUAÇÃO DE HOJE — a autorização de imagem é, na prática, decorativa.** A caixa é gravada no banco de dados e **nenhum ponto do sistema a consulta antes de publicar qualquer coisa**. Verificado: a finalidade de uso de imagem aparece no código apenas na definição, na gravação e na exibição do registro nos painéis internos — **nunca numa leitura que condicione uma publicação**. **Marcar ou não marcar a caixa não muda absolutamente nada no comportamento do site:** o nome vai para a vitrine pública igual, a galeria publica igual e as notícias publicam igual. Somado à inexistência de revogação (cláusula 11.2, direito IX) e à inexistência de vínculo entre foto e atleta, a consequência é que **a FHT não consegue hoje cumprir a promessa que já faz no termo**. **[A IMPLEMENTAR — consultar a autorização antes de publicar, vincular a publicação ao titular e criar o caminho de revogação]**

### 12.6 O melhor interesse como trava, e não como frase de efeito

Mesmo quando a FHT tem base legal para tratar um dado de criança ou adolescente, ela deixará de tratá-lo se o tratamento não for do melhor interesse do menor. **[A IMPLEMENTAR]** — hoje não existe no sistema nenhum mecanismo que aplique essa trava: a autorização de imagem é gravada e nunca consultada antes de publicar, a vitrine pública não tem filtro de idade e não há caminho de revogação (ver 12.4 e 12.5). Na prática, isso significa quatro compromissos:

1. **Minimização reforçada.** Não pedir da criança nada além do necessário para a atividade esportiva, e não condicionar a participação ao fornecimento de dado excessivo (art. 14, §4º). **[A IMPLEMENTAR — hoje ainda há coleta sem uso; ver 12.3]**
2. **Publicação restrita.** Na dúvida sobre expor um menor, não expor. **[A IMPLEMENTAR]**
3. **Linguagem simples.** Toda informação sobre o tratamento de dados de menores será escrita de forma clara e acessível (art. 14, §6º). **[A IMPLEMENTAR — esta política é o primeiro passo; hoje não existe página de privacidade nenhuma no site]**
4. **Transparência ativa.** A FHT tornará pública a informação sobre os tipos de dados coletados de menores, a forma de utilização e os procedimentos para exercício de direitos (art. 14, §2º). **[A IMPLEMENTAR]**

### 12.7 Circulação e descarte dos dados de menores — pontos a resolver antes da publicação

- **Nome de menor por e-mail. [A CONFIRMAR]** Quando o clube envia o pagamento da anuidade, o sistema gera automaticamente uma mensagem para a caixa institucional da federação contendo **a lista nominal completa dos atletas cobertos, inclusive menores**. Hoje **nada sai de verdade**, mas basta trocar uma variável de configuração, sem alterar uma linha de código, para as mensagens começarem a sair. Antes de ligar, a federação precisa definir qual servidor de saída será usado e em qual provedor a caixa de destino está hospedada, porque isso pode caracterizar **transferência internacional de dados de crianças**. Ver as seções 7 e 8.
- **Descarte automático. [JÁ EXISTE, com o defeito descrito em 9.2]** Cadastros de atleta sem confirmação de pagamento há mais de 90 dias são apagados definitivamente, uma vez por dia.
- **O que sobrevive ao descarte. [A IMPLEMENTAR — correção]** Ao apagar um cadastro, o sistema registra **o nome completo do atleta** nos registros técnicos de funcionamento, que não têm prazo de retenção definido; e o nome permanece no histórico financeiro (cláusula 11.3). Trocar o nome por um identificador nesses registros é correção de poucas linhas e será feita antes da publicação. O cadastro apagado também continua, por até 30 dias, nas cópias de segurança do banco (cláusula 9.5).

---

## 13. Um aviso importante sobre quem dá o consentimento

Esta seção descreve como a autorização do responsável legal **deve** funcionar, e registra com transparência como ela funciona **hoje**. É, na avaliação técnica que fundamenta esta minuta, **o ponto juridicamente mais frágil de todo o sistema**.

### 13.1 Como vai funcionar — **[A IMPLEMENTAR]**

Quando um clube cadastrar um atleta menor de 18 anos, a FHT **confirmará a autorização diretamente com o responsável legal indicado**, pelo e-mail ou telefone informado, antes de considerar a autorização válida. A evidência guardada será a da manifestação **do próprio responsável** — data, hora, endereço de rede e dispositivo dele —, e não a de quem preencheu o formulário. O responsável receberá, no mesmo ato, um aviso claro de que **os dados dele próprio** (nome, CPF, parentesco e contato) também serão guardados pela FHT, com a finalidade e o prazo.

### 13.2 Como funciona hoje — leitura obrigatória para o revisor jurídico

- **Quem marca a caixa de autorização é o representante do clube, não o responsável legal.** Todo o cadastro do atleta é feito pelo painel do clube. O responsável legal **nunca toca no sistema** — não tem login e não existe portal para ele.
- **A evidência gravada é a do dispositivo do clube.** O endereço de rede (IP) e a identificação do navegador registrados como prova do consentimento são os do computador do representante do clube que preencheu o formulário.
- **Não existe nenhuma confirmação com o responsável.** Sem e-mail de confirmação, sem link, sem assinatura, sem dupla verificação. Juridicamente, o registro é hoje a **declaração de um terceiro** de que houve consentimento.
- **Isso deixou de ser limitação técnica e virou escolha.** Desde 03/08/2026 o sistema tem serviço de e-mail funcionando e conhece o e-mail do responsável. Nenhuma das mensagens automáticas é enviada a ele.
- **Existe um caminho retroativo sem evidência nenhuma.** Quando um cadastro antigo é regularizado pela edição do atleta, o consentimento é criado com o campo de evidência preenchido com o texto *"regularizado por"* seguido do login do operador do sistema. Esse consentimento tem **exatamente o mesmo peso** dos demais para liberar a ativação de um menor.
- **No caso de atleta adulto, o registro sai em nome do próprio atleta.** Se a caixa de uso de imagem for marcada para um atleta maior de idade, o sistema grava o consentimento com **o nome e o CPF do próprio atleta** como quem consentiu — ainda que quem tenha marcado a caixa tenha sido o representante do clube, na tela do clube, no computador do clube.
- **O texto do termo aceito não é guardado.** O sistema grava apenas o **número** da versão, que é uma constante fixa com o valor "1.0" escrita no código. O texto em si vive apenas dentro da tela. Se a redação mudar sem que alguém troque a constante, **será impossível reconstruir o que cada responsável aceitou**. **[A IMPLEMENTAR — ver seção 15]**
- **O termo atual promete três coisas que o sistema não entrega:** acesso, correção/exclusão "a qualquer momento" e revogação da autorização de imagem "a qualquer momento". Nenhum desses caminhos existe. O termo também declara autorizar o tratamento de "endereço", que não é mais coletado no cadastro, e não traz link para política de privacidade nenhuma — até porque o site ainda não tem uma.

### 13.3 A consequência para a redação desta política — **[A CONFIRMAR — decisão do advogado]**

Pelas razões acima, a FHT **não** apoia o cadastro esportivo em consentimento. A base legal do cadastro de atletas, de clubes e de diretores é a **execução da relação associativa** e o **cumprimento das obrigações da federação**, e o **consentimento fica reservado exclusivamente ao uso de imagem** — que é o único tratamento genuinamente opcional e revogável.

Recomenda-se ao revisor decidir, antes da publicação: (a) se a confirmação direta com o responsável será exigida de forma técnica (confirmação por e-mail) ou documental (termo assinado em papel, guardado pelo clube e conferido pela federação); e (b) o que fazer com os consentimentos já registrados sob o modelo atual.

---

## 14. Cookies e armazenamento no seu navegador

### 14.1 O site da FHT não usa cookies — **[JÁ EXISTE — verificado]**

No sentido técnico, o site **não usa cookies**: o servidor da FHT nunca emite cookie e o site nunca lê nem grava cookie no seu navegador. O que o site usa são **duas chaves de armazenamento local**, que ficam guardadas apenas no seu dispositivo:

| Item | O que guarda | Para quê | Por quanto tempo |
|---|---|---|---|
| `fht_cookies` | O valor `accepted`, gravado quando você clica em ACEITAR no aviso | Não reexibir o aviso a cada visita | Não expira. Não é enviado a nenhum servidor |
| `fht_token` | O token da sua sessão, **apenas se você fizer login** | Manter você conectado ao painel e restringir cada clube aos próprios dados | Fica até você sair da conta ou até o sistema recusar o token. Vale 1 dia |

O `fht_token` é um **crachá digital**: ele é **selado** contra falsificação, mas **não é embaralhado**. Quem abrir o conteúdo dele consegue ler o seu nome completo, o seu e-mail, o seu perfil de acesso e o clube a que você está vinculado. Ele fica guardado no seu navegador. **[JÁ EXISTE — fato]**

**Um esclarecimento sobre a duração da sessão. [JÁ EXISTE]** Quando você entra na sua conta, o sistema emite dois crachás digitais: um de **acesso**, válido por 1 dia, e um de **renovação**, válido por 30 dias no servidor. Hoje o site **nunca guarda o de renovação** — o seu navegador grava apenas o de 1 dia. Na prática, portanto, a sessão que existe no seu dispositivo dura no máximo um dia. A ressalva honesta é que **não existe cancelamento pelo lado do servidor** (cláusula 10.2): um crachá copiado do seu dispositivo continua valendo até vencer sozinho.

**Não existe** armazenamento de sessão, banco local no navegador, trabalhador de segundo plano nem cache offline.

### 14.2 A FHT não rastreia, não mede audiência e não faz publicidade — **[JÁ EXISTE — verificado]**

O site **não tem** nenhuma ferramenta de medição de audiência, pixel publicitário, mapa de calor, rastreador de rede social, chat de terceiros ou verificação anti-robô. Foi feita busca nominal pelas principais ferramentas do mercado — Google Analytics, Google Tag Manager, Pixel da Meta, Hotjar, Clarity, Matomo, Plausible, PostHog, Mixpanel, Segment e reCAPTCHA — com **zero ocorrências**. A FHT não monta perfil de comportamento, não vende dados e não exibe publicidade.

### 14.3 O único recurso de terceiro carregado pelo site: as fontes do Google

Toda página do site carrega as fontes tipográficas dos servidores do Google. Isso transmite ao Google **o seu endereço IP, a identificação do seu navegador e a página que você está abrindo**, em toda visita — inclusive de quem está apenas lendo uma notícia. **[JÁ EXISTE — fato]**

> ⚠️ **Aviso ao revisor jurídico.** Esse carregamento acontece **antes** de o aviso aparecer na tela e **independentemente** dele, porque o aviso é montado depois. **Não há como recusar.** É a **única transferência internacional feita pelo navegador do visitante a um terceiro** — as demais, de hospedagem, banco, backup e arquivos, estão na seção 8 —, e ela atinge 100% dos visitantes anônimos, inclusive crianças. Ela precisa ou constar da seção 8 com hipótese legal declarada, ou ser eliminada.
>
> **Recomendação técnica, de melhor custo-benefício de todo o levantamento: hospedar as fontes no próprio servidor da FHT. [A IMPLEMENTAR]** Feito isso, **não sobra nenhuma transferência de dado de visitante a terceiro pelo navegador**, e esta seção da política fica simples e defensável.

### 14.4 O aviso exibido no site — **[A IMPLEMENTAR]**

O aviso hoje exibido na página inicial diz "Este site utiliza cookies" e oferece apenas os botões **ACEITAR** e **Fechar**. Ele será substituído por um informe honesto de **armazenamento estritamente necessário**, exibido em todas as páginas e com link para esta política.

> ⚠️ **Situação de hoje, com quatro defeitos verificados:** (1) o texto é factualmente errado — não há cookies; (2) não existe opção de recusar, não há categorias e não há tela para revisar a escolha depois; (3) "Fechar" não guarda nada; (4) o aviso **só é renderizado na página inicial** — quem entra direto pelas notícias, pelo login ou pelos painéis nunca o vê. E ele **não bloqueia nada**: as fontes do Google já foram carregadas antes de ele existir na tela. Esta política **não pode** descrever o mecanismo atual como "gestão de consentimento de cookies".

### 14.5 Como apagar o que está no seu navegador — **[JÁ EXISTE]**

Basta limpar os dados do site nas configurações do seu navegador, ou sair da conta (o que remove o token da sessão). Apagar essas chaves não afeta nenhum dado que a FHT guarda nos próprios sistemas — para esses, use os direitos da seção 11.

---

## 15. Alterações desta política, vigência e versionamento

### 15.1 Versão e datas

- **Versão desta política:** [NÚMERO DA VERSÃO — sugestão: 1.0]
- **Data de entrada em vigor:** [DATA DE ENTRADA EM VIGOR]
- **Data da última atualização:** [DATA DA ÚLTIMA ATUALIZAÇÃO]
- **Onde ela fica publicada:** [ENDEREÇO DA PÁGINA DA POLÍTICA NO SITE DA FHT] **[A IMPLEMENTAR]**
- **Data da verificação técnica que fundamenta esta minuta:** 04/08/2026, contra o código do sistema na versão `c73e748` (estruturas de banco V1 a V16).

> ⚠️ **Aviso ao revisor jurídico.** **Não existe hoje página de política de privacidade no site, nem rota, nem link para ela** — a palavra "privacidade" não aparece em nenhum arquivo do site. Existem, porém, **três promessas já publicadas** que esta política terá de sustentar (ou que terão de ser retiradas do site): a frase "Dados protegidos pela LGPD" no rodapé; a frase "Cadastro gratuito · Dados protegidos pela LGPD — Lei Geral de Proteção de Dados" no formulário de filiação; e a mesma promessa repetida no aviso de cookies.
>
> **Este sistema muda toda semana.** Recomenda-se revalidar os fatos desta política contra o código antes de publicá-la, e registrar a data da verificação no próprio documento.

### 15.2 Quando e por que esta política pode mudar

A FHT pode alterar esta política sempre que houver mudança na forma como trata dados pessoais — por exemplo, quando um novo módulo do sistema entrar no ar, quando um novo prestador de serviço passar a tratar dados por conta da FHT, ou quando a legislação ou a regulamentação da ANPD assim exigir.

### 15.3 Como a FHT avisa você — **[A IMPLEMENTAR]**

1. A data da última atualização será sempre exibida no topo desta página.
2. Toda alteração **relevante** — mudança de finalidade, de base legal, de prazo de retenção, de destinatários ou dos seus direitos — será anunciada com **aviso em destaque no site** e, quando aplicável, por **e-mail aos representantes dos clubes filiados**, com antecedência mínima de [PRAZO DE AVISO PRÉVIO — sugestão: 15 dias] em relação à entrada em vigor.
3. As **versões anteriores** ficarão disponíveis em [ONDE AS VERSÕES ANTERIORES FICARÃO DISPONÍVEIS], para que você possa saber qual regra valia em cada momento.
4. Se a alteração afetar um tratamento que se apoia no **seu consentimento** — na FHT, o uso de imagem —, a FHT **colherá o consentimento novamente**, e não presumirá que o consentimento anterior continua valendo.

> ⚠️ **Aviso ao revisor jurídico.** O aviso por e-mail depende de o envio real ser ligado: hoje o sistema tem o serviço pronto, mas em **modo simulado** por configuração — nada sai. Além disso, o sistema **não** guarda uma lista de e-mails de responsáveis legais utilizável para comunicação em massa, e o e-mail do representante do clube pode ser alterado pelo próprio clube a qualquer momento, sem aviso à federação.

### 15.4 Relação entre esta política e o termo aceito no cadastro

Quando o cadastro de um atleta menor é feito, o responsável legal aceita um **termo de autorização**, e o sistema guarda **o número da versão do termo** aceita, junto com a data e a hora. **[JÁ EXISTE]** Esse número, porém, é hoje uma constante fixa ("1.0") escrita no código, e **o texto do termo não é armazenado** — de modo que ainda **não** é possível reconstruir com segurança o que cada responsável aceitou. **[A IMPLEMENTAR]** — a FHT passará a armazenar o texto integral de cada versão, para que sempre se saiba sob quais condições cada autorização foi dada.

**Compromissos: [A IMPLEMENTAR]**

1. **A publicação desta política gera uma nova versão do termo (2.0).** O termo atual precisa ser reescrito, porque (a) promete direitos que o sistema ainda não entrega — acesso, correção, exclusão e revogação "a qualquer momento"; (b) não informa o responsável legal sobre o tratamento dos **dados dele próprio**; (c) menciona o tratamento de "endereço", que deixou de ser coletado no cadastro; e (d) não traz nenhum link para esta política.
2. **O texto integral de cada versão do termo passará a ser armazenado**, e não apenas o número da versão, de modo que seja sempre possível reconstruir exatamente o que cada pessoa aceitou.
3. **Toda versão do termo indicará a versão desta política** que estava em vigor no momento do aceite.

> ⚠️ **Aviso ao revisor jurídico — este item tem prazo.** Hoje o sistema grava apenas o número "1.0", que é uma **constante fixa escrita no código**, e o texto do termo existe somente dentro da tela. Se alguém alterar a redação sem trocar essa constante, **será impossível provar o que foi aceito**. Como o art. 14, §1º exige consentimento **específico e em destaque**, provar o consentimento sem conseguir reconstruir o texto aceito é prova pela metade. O versionamento do texto precisa ser resolvido **antes** da publicação desta política — não depois —, justamente porque a publicação vai gerar a versão 2.0 do termo.

---
---

# ANEXO I — MAPA DE IMPLEMENTAÇÃO

Toda cláusula marcada **[A IMPLEMENTAR]** nesta política, com o que ela promete, o que o código faz hoje e uma estimativa de esforço.

**Esforço:** **P** = pequeno (até 1 dia de trabalho ou decisão administrativa) · **M** = médio (alguns dias, mexe em várias partes) · **G** = grande (módulo novo ou mudança estrutural).

## A. Identificação, canais e publicação

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 1.1 | Publicar razão social, CNPJ, endereço e telefone reais da FHT | Site publica só "Palmas, TO" e o CEP genérico 77000-000; nenhum arquivo do repositório tem razão social ou CNPJ | P |
| 1.2 | Encarregado nomeado, com e-mail monitorado e substituto definido | Nenhum Encarregado em lugar nenhum do sistema ou do site | P |
| 1.3 | Formulário "Fale com a FHT" funcionando (ou removido) | A função de envio tem 3 linhas que só marcam a tela como enviada; não existe endpoint de contato. A tela exibe "MENSAGEM ENVIADA!" | P |
| 1.3 | WhatsApp real e atendido (ou removido do site) | O link aponta para `wa.me/556300000000` — um número só de zeros | P |
| 12.6 / 15.1 | Publicar a página da política, com rota e link no rodapé e no formulário de filiação | A palavra "privacidade" não aparece em nenhum arquivo do site; existem 5 rotas e nenhuma é de política | P |
| 15.3 | Aviso de alteração relevante no site e por e-mail; versões anteriores disponíveis | Não existe página, nem histórico, nem lista de e-mails utilizável para comunicação em massa | P |
| 15.4 | Termo 2.0 reescrito e **texto integral** de cada versão armazenado | Só o número "1.0" é gravado, como constante fixa no código; o texto vive apenas dentro da tela | M |
| Nota ao advogado | Publicar em **duas peças**: a política enxuta (sem selos, sem blocos ao revisor, sem citação de artigo no corpo) e o dossiê técnico interno que a fundamenta | Existe apenas esta minuta única, escrita para o revisor | P |
| 6.1 | Cláusulas de proteção de dados no **termo de filiação do clube**, com os quatro deveres listados | Nenhum contrato ou cláusula de tratamento com clubes; o papel jurídico do clube nem sequer está definido | M |

## B. Minimização e qualidade dos dados

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 3.1 / 12.3 | Deixar de coletar órgão emissor do RG e naturalidade do atleta (ou declarar a finalidade) | Coletados na tela, gravados no banco e nunca devolvidos por nenhuma resposta do sistema | P |
| 3.1 | Apagar os endereços de atleta coletados antes de agosto/2026 | As colunas continuam no banco com os dados antigos; ninguém os apagou | P |
| 3.1 | Fechar a API para os campos de endereço de atleta | A interface de programação continua aceitando CEP, logradouro, número e bairro | P |
| 3.1 | Desativar o comprovante de pagamento individual (legado) | A tela não o oferece, mas a API ainda aceita o arquivo por dois caminhos | P |
| 3.3 / 11.2-III | Permitir a correção do CPF do representante do clube | O campo ficou fora dos editáveis; ninguém corrige pelo sistema — nem o titular, nem a federação | P |
| 3.3 / 11.2-III | Sincronizar as duas cópias dos dados do representante | Cadastro do clube e conta de acesso não se atualizam por completo entre si | M |
| 3.3 | Corrigir o encerramento de acesso após troca de e-mail | O bloqueio procura o usuário pelo e-mail do cadastro do clube; se o clube trocar o e-mail, a conta não é encontrada e o acesso continua aberto | P |
| 3.5 | Impedir que telefone pessoal de diretor vá ao ar | O objeto público do diretor devolve o registro completo, com e-mail e telefone; nada valida se o contato é institucional | P |
| 3.6 | Gravar identificador interno em vez do e-mail do administrador no campo "quem deu a baixa" | O valor gravado vem do token, cujo identificador é o e-mail; e ele é entregue também ao clube | P |
| 5 (fin. 9) | Permitir retirar o nome de ex-funcionário da autoria de notícias | A edição de notícia não regrava o autor; só por intervenção direta no banco | P |

## C. Menores, consentimento e publicação

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 12.4 / 5 (fin. 11) | Não publicar nome completo de atleta menor na vitrine pública | A vitrine devolve nome completo + posição + categoria de todo atleta ativo, sem filtro de idade e sem consultar autorização | M |
| 12.5 / 5 (fin. 10) | Consultar a autorização de imagem **antes** de publicar qualquer coisa | A finalidade de imagem é gravada e nunca lida; marcar ou não marcar a caixa não muda nada | G |
| 11.2-IX / 12.5 | Criar o caminho de revogação de consentimento | O método que grava a revogação existe na entidade e **nunca é chamado**; não há endpoint, tela nem rotina | M |
| 11.2-VI | Vincular fotos publicadas ao titular, para permitir a retirada | A galeria não tem vínculo com atleta; localizar em quais fotos alguém aparece exige busca visual manual | M |
| 13.1 / 12.2 | Confirmar a autorização diretamente com o responsável legal (art. 14, §5º) | Quem marca a caixa é o clube; o IP e o navegador gravados são os do clube; não há confirmação por nenhum meio | M |
| 3.2 / 11.6 | Reescrever o termo para informar o responsável sobre os dados **dele** | O termo trata exclusivamente dos dados do atleta | P |
| 7.3 | Passar a enviar avisos ao responsável legal | O e-mail dele é coletado, validado e gravado — e nunca usado como destinatário de nada | M |
| 13.2 | Rever o caminho retroativo de consentimento ("regularizado por") | Consentimento criado sem evidência real, com o mesmo peso dos demais para ativar um menor | P |
| 2 | Exigir dos clubes que informem as pessoas cujos dados eles inserem | Nenhum aviso é dado a responsáveis ou a terceiros citados em documentos | P |

## D. Segurança

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 10.2 | Publicar site e API **exclusivamente sob HTTPS**, com redirecionamento e certificado válido — **pré-requisito de lançamento** | Nenhuma configuração no projeto exige conexão criptografada, e trafegam por ela a senha do formulário público, o RG digitalizado de menores e o comprovante bancário | P |
| 6.2 | Perfis de administrador **com permissões por área** dentro da FHT + lista controlada de quem tem conta | Só existem dois perfis; toda conta de administrador da federação alcança todos os dados de todos, inclusive documentos de crianças | G |
| 10.2 / 12.4 / 5 (fin. 5) | Exigir autenticação nos arquivos e adotar endereço assinado com prazo | O endereço que serve os arquivos não tem nenhuma verificação de identidade; o comentário no código assume "público de propósito". Vale para RG de menor, foto 3x4, comprovante de residência, ata, estatuto e comprovante bancário | G |
| 10.2 | Criptografia dos dados guardados | CPF, RG e documentos em texto puro no banco e no volume de arquivos | G |
| 10.2 / 11.1 | Trilha de auditoria (quem acessou, alterou, apagou) | Nenhuma tabela, entidade ou serviço de auditoria em 16 versões do banco. Único rastro: quem conferiu um pagamento | G |
| 10.2 / 5 (fin. 2) | Troca e recuperação de senha | Não existem. O e-mail de aprovação já instrui "se esqueceu a senha, fale com a federação" | M |
| 10.2 | Limite de tentativas de login e proteção contra força bruta | Tentativas ilimitadas; sem CAPTCHA, sem bloqueio, sem limite de requisições | M |
| 10.2 / 3.3 | Regra de qualidade da senha (complexidade + recusa de senha vazada) | Exige apenas 8 caracteres, sem qualquer outra regra | P |
| 10.2 | Proteger o formulário público de filiação (limite de envios, anti-robô, bloqueio) | Cria contas e recebe PDFs sem login, sem limite, sem CAPTCHA — e ainda revela se um e-mail já tem conta | M |
| 10.3 | Canal para o **titular avisar** de vazamento ou acesso indevido, com registro e apuração | Não existe canal nenhum; sem auditoria, a FHT não detecta incidente sozinha | P |
| 10.2 | Cancelamento de sessão pelo servidor | Não há revogação de token; um token copiado vale até expirar | M |
| 10.2 | Trocar a senha da conta administrativa inicial | A conta de administrador do seed usa senha fraca e conhecida, e tem acesso a todos os dados de menores | P |
| 10.2 | Fechar a documentação técnica da API em produção | O mapa completo da API fica público inclusive em produção | P |
| 10.2 | Publicar o site em versão compilada para produção | A imagem de execução roda o servidor de desenvolvimento | P |
| 10.2 | Não revelar se um e-mail já tem conta | O formulário público responde "Este e-mail já está cadastrado no sistema" a visitante anônimo | P |
| 10.3 | Plano de resposta a incidentes; registro de operações (art. 37); RIPD (art. 38) | Nenhum dos três existe | M |

## E. Retenção, descarte e direitos

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 9.1 | Prazos de retenção definidos e aplicados por categoria | Existem dois prazos automáticos (90 dias para cadastro sem anuidade; rotação de 30 cópias de segurança). Todo o resto é indeterminado | M |
| 9.2 / 5.3 / 11.5 | Não descartar cadastro cuja anuidade já foi paga e aguarda conferência | A rotina olha só a situação e a data do cadastro; não exclui quem está dentro de um lote pago | P |
| 9.3 | Exclusão efetiva de arquivos ao apagar um cadastro | Não existe nenhuma rotina de exclusão de arquivo no sistema inteiro | G |
| 9.3 | Apagar os arquivos órfãos do cadastro | Os arquivos enviados no cadastro ficam numa pasta que o sistema nunca mais abre | M |
| 9.4 / 11.2-IV | Permitir exclusão de clube e de conta de acesso | Não existe endpoint de exclusão de clube nem de conta em toda a API. Clube recusado fica para sempre, com hash de senha | M |
| 9.5 / 12.7 | Prazo de retenção dos registros técnicos + trocar nome por identificador | Os logs guardam nome completo de atleta apagado e do atleta ativado sem pagamento; sem prazo definido | P |
| 9.5 | Reduzir ao mínimo o **registro de cada e-mail enviado** (destinatário + assunto) e definir prazo de descarte | Todo envio, e toda falha de envio, grava e-mail do destinatário e assunto nos registros técnicos; os assuntos trazem nome do clube e protocolo | P |
| 9.5 / 10.2 / 11.2-IV | Procedimento de restauração de backup que **reaplique as eliminações** feitas depois da data da cópia restaurada, com registro de quem executou | O backup diário existe (30 cópias, bucket privado); restaurar uma cópia traz de volta dados já apagados, e não há procedimento para impedir isso | P |
| 5.3 / 11.3 | Anonimizar o nome do atleta no registro financeiro **e** preservar a evidência da autorização | Hoje é o inverso: o consentimento é apagado em cascata e o nome da criança permanece | M |
| 11.1 | Canal do titular funcionando + registro de cada pedido e atendimento | Nenhum canal, nenhum registro; impossível comprovar atendimento | M |
| 11.2-I e II | Confirmação e acesso para titulares sem login | Só o representante do clube tem autoatendimento; atleta, responsável e diretor não têm nenhum | M |
| 11.2-V | Portabilidade / exportação estruturada | Busca por "exportar" e "portabilidade" no sistema: zero ocorrências | M |
| 11.2-VII | Informar com quem os dados foram compartilhados, caso a caso | Não há registro de compartilhamento por titular | P |
| 11.4 | Receber e processar oposição a tratamento | Não há procedimento nem registro | P |
| 4.3 | Registrar pedidos de revisão de decisão automática | Não há registro de nada disso | P |
| 11.6 | Responsável fala direto com a FHT; pedido do próprio adolescente é avaliado | Não há canal; toda a relação passa pelo clube | P |

## F. Terceiros, e-mail e transferência internacional

| Cláusula | O que a política promete | Situação hoje no código | Esforço |
|---|---|---|---|
| 3.7 / 6 / 8 / 14.3 | Hospedar as fontes tipográficas no próprio servidor | Toda página carrega fontes do Google, antes do aviso e sem opção de recusa. É a única transferência internacional feita pelo navegador do visitante a um terceiro | P |
| 5 (fin. 7) / 7.2 | Ligar o envio real de e-mail de forma controlada | Envio em modo simulado por padrão; o servidor de saída configurado de fábrica é o do Gmail | P |
| 7.3 | Reavaliar o envio da lista nominal de atletas por e-mail | O aviso de pagamento leva a relação nominal completa, inclusive de menores, para uma caixa postal externa | P |
| 6 / 6.3 | Contratos com operadores, com cláusulas de proteção de dados (art. 39) | Hospedagem definida (Render e Neon), backup no GitHub e arquivos no Cloudflare R2 — nenhum contrato ou acordo de tratamento de dados mencionado ou verificável com nenhum deles | P |
| 8 | Definir a hipótese legal do art. 33 **antes da publicação** | Banco inteiro, arquivos, backups e tráfego da aplicação ficam nos EUA desde o primeiro dia (Render e Neon em Virginia; GitHub; Cloudflare R2 com região a confirmar) | P |
| 6 / 8 | Manter o arquivo de dados de demonstração restrito ao desenvolvimento, e proibir dados reais nele | `db/dev/R__seed_dev.sql` tem só dados fictícios (imagens de `picsum.photos` e `i.pravatar.cc`, PDF de exemplo do `w3.org`) e só é carregado no perfil de desenvolvimento local; por construção, a configuração de produção nunca o aplica, e o repositório de código é privado. **[JÁ EXISTE]** Risco residual, só organizacional: um dado real colocado nesse arquivo "para testar" entraria no histórico do repositório, hospedado no GitHub (EUA), e não sairia mais | P |
| 8 | Travar administrativamente a ativação de destinos estrangeiros e a troca de região sem atualizar a política | O envio real de e-mail liga por mera variável de configuração, e a região de cada provedor também é escolha de configuração | P |
| 14.4 | Substituir o aviso de cookies por informe honesto, em todas as páginas, com link para a política | Diz "Este site utiliza cookies" (falso), só tem ACEITAR e Fechar, "Fechar" não guarda nada e ele só aparece na página inicial | P |

---
---

# ANEXO II — O QUE A FEDERAÇÃO PRECISA PREENCHER OU DECIDIR

## II.1 Identificação da federação (cláusula 1.1)

- `[RAZÃO SOCIAL COMPLETA DA FHT, CONFORME O ESTATUTO]`
- `[CNPJ DA FHT]`
- `[LOGRADOURO, NÚMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, CEP REAL]`
- `[TELEFONE INSTITUCIONAL REAL]`
- `[DOMÍNIO OFICIAL DO SITE]`
- `[NOME E CARGO DE QUEM ASSINA A POLÍTICA EM NOME DA FHT]`

## II.2 Encarregado e canais (cláusulas 1.2, 1.3 e 11.1)

- `[NOME COMPLETO DO ENCARREGADO]` e `[CARGO DO ENCARREGADO]`
- `[E-MAIL DO ENCARREGADO]` — precisa **existir de fato** e ser lido por alguém
- `[NOME DO SUBSTITUTO]` na ausência do Encarregado
- `[ENDEREÇO POSTAL PARA PEDIDOS ESCRITOS]`
- **Decidir:** as caixas `contato@fht.org.br` e `imprensa@fht.org.br` existem, estão ativas e são monitoradas? **Por quem?** Quantas pessoas têm acesso?
- **Decidir:** a caixa que recebe os avisos automáticos (com listas nominais de atletas) será a mesma do Encarregado ou outra?
- **Decidir:** o WhatsApp será oferecido como canal? Qual o número real e quem atende?

## II.3 Prazos (cláusulas 9.1, 11.1 e 15.3)

- `[PRAZO DE RESPOSTA EM DIAS]` ao titular — depende da decisão sobre ATPP
- `[PRAZO APÓS A DESFILIAÇÃO]` para o cadastro de atleta
- `[PRAZO CONTÁBIL/FISCAL DE GUARDA]` dos registros de pagamento e comprovantes — **é a resposta que justifica a retenção do nome do atleta excluído**
- `[PRAZO PARA CLUBE RECUSADO]`
- `[PRAZO PARA CONTA DESATIVADA]`
- `[PRAZO DE PRESTAÇÃO DE CONTAS]` dos registros de autorização
- `[PRAZO DE RETENÇÃO DOS LOGS]` — os registros técnicos ficam no Render (EUA)
- `[PRAZO POR CATEGORIA]` para diretor, notícia e foto
- **Confirmar** a retenção de **30 dias** das cópias de segurança (hoje: 30 cópias diárias) — cláusulas 9.1 e 9.5
- `[PRAZO DE AVISO PRÉVIO]` de alteração da política — sugestão: 15 dias

## II.4 Vigência e versionamento (cláusula 15.1)

- `[NÚMERO DA VERSÃO]` — sugestão: 1.0
- `[DATA DE ENTRADA EM VIGOR]`
- `[DATA DA ÚLTIMA ATUALIZAÇÃO]`
- `[ENDEREÇO DA PÁGINA DA POLÍTICA NO SITE DA FHT]`
- `[ONDE AS VERSÕES ANTERIORES FICARÃO DISPONÍVEIS]`

## II.5 Decisões jurídicas (do advogado)

1. **Base legal do cadastro do atleta menor:** contrato/relação associativa (art. 7º, V + II, com anuência do responsável) **ou** consentimento (art. 7º, I c/c art. 14, §1º)? — cláusula 12.2
2. **Enquadramento como ATPP** (Resolução CD/ANPD nº 2/2022), considerando que o tratamento de dados de crianças já crava o critério específico de alto risco — cláusula 11.1
3. **O nome completo de atleta menor pode aparecer no site aberto?** — cláusula 12.4
4. **Validade dos consentimentos coletados por intermédio do clube**, e o que fazer com os já registrados — seção 13
5. `[HIPÓTESE LEGAL DO ART. 33]` para a transferência internacional — **obrigatória antes da publicação**: banco inteiro, arquivos, backups e tráfego da aplicação ficam nos EUA desde o primeiro dia (Render, Neon, GitHub, Cloudflare) — seção 8
6. **Pedido de titular intermediado pelo clube:** aceita, exige contato direto, ou aceita e confirma com o titular? — cláusula 11.1
7. Base legal do **terceiro pagador** que aparece no comprovante de Pix — categoria 5 da seção 2
8. **Qual é o papel jurídico do clube filiado** — operador da FHT, controlador conjunto ou controlador independente? E o termo de filiação passará a conter cláusulas de proteção de dados? — cláusula 6.1
9. **Contratos com os operadores (art. 39):** os acordos de tratamento de dados padronizados de **Render, Neon, GitHub e Cloudflare** bastam, ou é preciso instrumento adicional? E o do provedor de e-mail, quando for escolhido — cláusula 6.3

## II.6 Decisões operacionais (da diretoria)

- **E-mail do sistema:** ligar o envio real antes do lançamento ou manter simulado? Se ligar, **qual servidor de saída**? (o padrão de fábrica é o do Google, e isso cria transferência internacional de dado de menor)
- **Hospedagem — aceite do controlador:** a decisão técnica já foi tomada — aplicação no **Render** e banco no **Neon**, ambos em **Virginia (EUA)**, no plano gratuito. A FHT **aceita** hospedar todos os dados, inclusive de crianças, nos EUA, ou exige região no Brasil (o que pode implicar trocar de provedor ou de plano)? A resposta define a seção 8 inteira — seções 6.3 e 8
- **Região dos buckets do Cloudflare R2** (`fht-documentos` e `fht-backups`): é escolhida na criação dos buckets; qual será? — seções 6.3 e 8
- **Acordos de tratamento de dados com Render, Neon, GitHub e Cloudflare:** quem, na FHT, aceita e guarda esses termos, e em nome de quem as contas desses serviços ficam registradas? — cláusula 6.3
- **Cópias de segurança:** a FHT aceita a retenção de 30 dias, sabendo que dado eliminado sobrevive nas cópias por até 30 dias? E quem executa, e onde fica registrado, o procedimento de reaplicar as eliminações depois de uma restauração? — cláusulas 9.5 e 10.2
- **Provedor das caixas postais:** Google, Microsoft, Zoho, servidor próprio? Define uma linha inteira da seção 8
- **Chave Pix oficial da federação** — o sistema exige o comprovante de um pagamento que hoje não tem para onde ser feito
- **Práticas fora do sistema** (o código nunca revelará): a FHT envia listas de atletas por planilha, e-mail ou aplicativo de mensagens à CBHb, à Secretaria de Esportes, ao Governo do Estado, a patrocinadores ou a organizadores de competição? Mantém fichas em papel? Usa grupo de mensagens com dados de atletas?
- **Redefinição de senha de clube:** como será feita sem virar canal informal por telefone ou WhatsApp?
- **Quem executa**, na prática, um pedido de exclusão ou de revogação — e onde isso fica registrado
- **Contas de administrador:** quantas existem hoje, quem as detém, quem autoriza a criação de novas e quem revisa a lista — cláusula 6.2
- **Caixa `nao-responda@`:** ela existe de fato? Alguém a lê? Para onde vão as respostas que os titulares mandarem para lá? — cláusulas 1.3 e 7.3
- **Dados de teste:** o arquivo de demonstração só roda no desenvolvimento local e a configuração de produção nunca o aplica. Falta a regra organizacional: quem fiscaliza que ninguém coloque dados reais de atletas nele para "testar mais rápido"? Dado real colocado ali vai para o histórico do repositório de código (privado, hospedado no GitHub, EUA) e não sai mais

---

*Fim da minuta. Documento gerado a partir do código do sistema em 04/08/2026 (commit `c73e748`, estruturas de banco V1 a V16) e ajustado em 30/09/2026 à versão MVP (branch `mvp-free-tier`). Revalidar antes de publicar.*
