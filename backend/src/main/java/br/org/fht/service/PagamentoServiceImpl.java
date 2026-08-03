package br.org.fht.service;

import br.org.fht.common.Escopo;
import br.org.fht.common.Fuso;
import br.org.fht.dto.pagamento.PagamentoLoteDTO;
import br.org.fht.dto.pagamento.PagamentoLoteForm;
import br.org.fht.dto.pagamento.PagamentoPendentesDTO;
import br.org.fht.exception.ValidationException;
import br.org.fht.model.Atleta;
import br.org.fht.model.Clube;
import br.org.fht.model.PagamentoLote;
import br.org.fht.model.PagamentoLoteItem;
import br.org.fht.repository.AtletaRepository;
import br.org.fht.repository.ClubeRepository;
import br.org.fht.repository.ConsentimentoRepository;
import br.org.fht.repository.PagamentoLoteItemRepository;
import br.org.fht.repository.PagamentoLoteRepository;
import br.org.fht.storage.R2StorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class PagamentoServiceImpl implements PagamentoService {

    @Inject PagamentoLoteRepository loteRepository;
    @Inject PagamentoLoteItemRepository itemRepository;
    @Inject AtletaRepository atletaRepository;
    @Inject ClubeRepository clubeRepository;
    @Inject ConsentimentoRepository consentimentoRepository;
    @Inject EmailService emailService;
    @Inject R2StorageService r2;

    /** Anuidade por atleta. Fonte única — antes o valor 35 estava escrito em 3 lugares. */
    @ConfigProperty(name = "fht.anuidade.valor", defaultValue = "35.00")
    BigDecimal valorAnuidade;

    @Override
    public PagamentoPendentesDTO listarPendentes(JsonWebToken jwt) {
        UUID clubeId = Escopo.clubeDoToken(jwt);
        int ano = Fuso.hoje().getYear();

        List<Atleta> pendentes = atletasPendentes(clubeId, ano);
        var itens = pendentes.stream()
                .map(a -> new PagamentoPendentesDTO.AtletaPendenteDTO(
                        a.getId(), a.getNomeCompleto(), a.getCategoria(), valorAnuidade))
                .toList();

        return new PagamentoPendentesDTO(ano, valorAnuidade,
                valorAnuidade.multiply(BigDecimal.valueOf(itens.size())), itens);
    }

    /**
     * Quem ainda deve a anuidade do ano: aguardando pagamento e sem item de lote vivo.
     * O critério é "não tem item ativo", e não "não está ATIVO" — senão quem já mandou um lote
     * e espera a baixa seria cobrado de novo.
     */
    private List<Atleta> atletasPendentes(UUID clubeId, int ano) {
        List<Atleta> doClube = atletaRepository.findByClubeId(clubeId).stream()
                .filter(a -> AtletaServiceImpl.STATUS_AGUARDANDO_PAGAMENTO.equals(a.getStatus()))
                .toList();
        if (doClube.isEmpty()) return List.of();

        var jaEmLote = itemRepository
                .findAtivosPorAno(doClube.stream().map(Atleta::getId).toList(), ano)
                .stream().map(PagamentoLoteItem::getAtletaId).collect(Collectors.toSet());

        return doClube.stream().filter(a -> !jaEmLote.contains(a.getId())).toList();
    }

    @Override
    @Transactional
    public PagamentoLoteDTO enviarPagamento(PagamentoLoteForm form, JsonWebToken jwt) {
        UUID clubeId = Escopo.clubeDoToken(jwt);
        int ano = Fuso.hoje().getYear();

        if (form == null || form.atletaIds == null || form.atletaIds.isBlank()) {
            throw new ValidationException("atletaIds", "Selecione ao menos um atleta para pagar");
        }
        if (form.comprovante == null || form.comprovante.size() == 0) {
            throw new ValidationException("comprovante", "Anexe o comprovante do pagamento");
        }

        List<UUID> ids = parseIds(form.atletaIds);
        // Indexado por id para validar e montar o snapshot sem ir ao banco de novo.
        Map<UUID, Atleta> pendentes = new LinkedHashMap<>();
        atletasPendentes(clubeId, ano).forEach(a -> pendentes.put(a.getId(), a));

        var selecionados = new ArrayList<Atleta>();
        for (UUID id : ids) {
            Atleta a = pendentes.get(id);
            if (a == null) {
                // Pode ser de outro clube, já pago, ou já dentro de outro lote — o clube não
                // precisa saber qual: em todos os casos ele não pode cobrar este atleta agora.
                throw new ValidationException("atletaIds",
                        "Um dos atletas selecionados não está disponível para pagamento. Atualize a página.");
            }
            selecionados.add(a);
        }

        // Protocolo e comprovante saem ANTES do persist: protocolo é NOT NULL e o INSERT pode
        // ser disparado já no persist, antes de qualquer setter posterior surtir efeito.
        String referencia = UUID.randomUUID().toString();
        String protocolo = gerarProtocolo(ano, referencia);

        var lote = new PagamentoLote();
        lote.setClubeId(clubeId);
        lote.setAno(ano);
        lote.setProtocolo(protocolo);
        lote.setQuantidadeAtletas(selecionados.size());
        lote.setValorTotal(valorAnuidade.multiply(BigDecimal.valueOf(selecionados.size())));
        lote.setObservacao(form.observacao);
        lote.setStatus(PagamentoLote.STATUS_AGUARDANDO_BAIXA);
        lote.setEnviadoEm(LocalDateTime.now());
        lote.setComprovanteUrl(r2.upload(
                "pagamentos/" + clubeId + "/" + referencia + "/" + form.comprovante.fileName(),
                form.comprovante));
        loteRepository.persist(lote);

        var itens = new ArrayList<PagamentoLoteItem>();
        for (Atleta a : selecionados) {
            var item = new PagamentoLoteItem();
            item.setLoteId(lote.getId());
            item.setAtletaId(a.getId());
            item.setAtletaNome(a.getNomeCompleto());
            item.setAno(ano);
            item.setValor(valorAnuidade);
            itemRepository.persist(item);
            itens.add(item);
        }

        String clubeNome = nomeDoClube(clubeId);
        // Requisito explícito da federação: o aviso tem que dizer QUAIS atletas o pagamento cobre.
        emailService.avisarPagamentoRecebido(clubeNome, lote.getProtocolo(), lote.getValorTotal(),
                itens.stream().map(PagamentoLoteItem::getAtletaNome).toList());

        return toDTO(lote, itens, clubeNome);
    }

    /** Código curto e legível derivado de um UUID — sem sequence e sem risco prático de colisão. */
    private String gerarProtocolo(int ano, String referencia) {
        return "FHT-" + ano + "-" + referencia.substring(0, 6).toUpperCase(Locale.ROOT);
    }

    private List<UUID> parseIds(String csv) {
        try {
            return Arrays.stream(csv.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .map(UUID::fromString).distinct().toList();
        } catch (IllegalArgumentException e) {
            throw new ValidationException("atletaIds", "Lista de atletas inválida");
        }
    }

    @Override
    public List<PagamentoLoteDTO> listarDoClube(JsonWebToken jwt) {
        UUID clubeId = Escopo.clubeDoToken(jwt);
        return montarLista(loteRepository.findByClubeId(clubeId));
    }

    @Override
    public List<PagamentoLoteDTO> listarTodos() {
        return montarLista(loteRepository.listAllOrdered());
    }

    /** Carrega itens e nomes de clube em lote — a fila do admin tem N lotes de M clubes. */
    private List<PagamentoLoteDTO> montarLista(List<PagamentoLote> lotes) {
        if (lotes.isEmpty()) return List.of();

        Map<UUID, List<PagamentoLoteItem>> porLote = itemRepository
                .findByLoteIds(lotes.stream().map(PagamentoLote::getId).toList())
                .stream().collect(Collectors.groupingBy(PagamentoLoteItem::getLoteId));

        Map<UUID, String> nomes = clubeRepository.listAll().stream()
                .collect(Collectors.toMap(Clube::getId, Clube::getNome));

        return lotes.stream()
                .map(l -> toDTO(l, porLote.getOrDefault(l.getId(), List.of()), nomes.get(l.getClubeId())))
                .toList();
    }

    @Override
    public PagamentoLoteDTO buscarPorId(UUID id, JsonWebToken jwt) {
        PagamentoLote lote = buscarComEscopo(id, jwt);
        return toDTO(lote, itemRepository.findByLoteId(id), nomeDoClube(lote.getClubeId()));
    }

    @Override
    @Transactional
    public BaixaResultado darBaixa(UUID id, JsonWebToken jwt) {
        PagamentoLote lote = loteRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Pagamento não encontrado", 404));

        if (!PagamentoLote.STATUS_AGUARDANDO_BAIXA.equals(lote.getStatus())) {
            throw new WebApplicationException("Este pagamento já foi conferido", 409);
        }

        lote.setStatus(PagamentoLote.STATUS_CONFIRMADO);
        lote.setBaixadoEm(LocalDateTime.now());
        lote.setBaixadoPor(jwt.getName());
        lote.setMotivoRejeicao(null);

        // A baixa libera o portão FINANCEIRO. O portão DOCUMENTAL (RG e, se menor, consentimento
        // do responsável) continua valendo: pagar não pode ativar um menor sem autorização.
        var ativados = new ArrayList<String>();
        var bloqueados = new ArrayList<BaixaResultado.Bloqueio>();

        List<PagamentoLoteItem> itens = itemRepository.findByLoteId(id);
        for (PagamentoLoteItem item : itens) {
            if (item.getAtletaId() == null) continue;
            var opt = atletaRepository.findByIdOptional(item.getAtletaId());
            if (opt.isEmpty()) continue;
            Atleta a = opt.get();

            String impedimento = impedimentoDocumental(a);
            if (impedimento != null) {
                bloqueados.add(new BaixaResultado.Bloqueio(a.getNomeCompleto(), impedimento));
                // Fica aguardando aprovação: o pagamento está ok, falta a documentação.
                a.setStatus(AtletaServiceImpl.STATUS_AGUARDANDO_APROVACAO);
                continue;
            }
            a.setStatus(AtletaServiceImpl.STATUS_ATIVO);
            a.setMotivoRejeicao(null);
            ativados.add(a.getNomeCompleto());
        }

        String clubeNome = nomeDoClube(lote.getClubeId());
        emailService.avisarBaixaConfirmada(emailDoClube(lote.getClubeId()), clubeNome,
                lote.getProtocolo(), ativados.size(), bloqueados.size());

        return new BaixaResultado(toDTO(lote, itens, clubeNome), ativados, bloqueados);
    }

    /** Null = documentação em ordem. Caso contrário, o motivo em texto para a federação ver. */
    private String impedimentoDocumental(Atleta a) {
        if (a.getRgUrl() == null || a.getRgUrl().isBlank()) {
            return "RG digitalizado não enviado";
        }
        if (a.isMenorDeIdade(Fuso.hoje()) && !temConsentimentoResponsavel(a.getId())) {
            return "Menor de idade sem consentimento do responsável legal (LGPD art. 14)";
        }
        return null;
    }

    private boolean temConsentimentoResponsavel(UUID atletaId) {
        return consentimentoRepository.findByAtletaId(atletaId).stream()
                .anyMatch(c -> br.org.fht.model.Consentimento.FINALIDADE_CADASTRO_MENOR.equals(c.getFinalidade())
                        && c.getRevogadoEm() == null);
    }

    @Override
    @Transactional
    public PagamentoLoteDTO rejeitar(UUID id, String motivo, JsonWebToken jwt) {
        PagamentoLote lote = loteRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Pagamento não encontrado", 404));

        if (PagamentoLote.STATUS_CONFIRMADO.equals(lote.getStatus())) {
            throw new WebApplicationException("Este pagamento já teve baixa e não pode ser rejeitado", 409);
        }

        lote.setStatus(PagamentoLote.STATUS_REJEITADO);
        lote.setMotivoRejeicao(motivo);
        lote.setBaixadoEm(LocalDateTime.now());
        lote.setBaixadoPor(jwt.getName());

        // Desativar os itens devolve os atletas para a fila de pendentes e libera a trava de
        // cobrança dupla — o clube pode montar um lote novo com eles.
        List<PagamentoLoteItem> itens = itemRepository.findByLoteId(id);
        itens.forEach(i -> i.setAtivo(false));

        String clubeNome = nomeDoClube(lote.getClubeId());
        emailService.avisarPagamentoRejeitado(
                emailDoClube(lote.getClubeId()), clubeNome, lote.getProtocolo(), motivo);

        return toDTO(lote, itens, clubeNome);
    }

    private PagamentoLote buscarComEscopo(UUID id, JsonWebToken jwt) {
        if (Escopo.ehAdminFederacao(jwt)) {
            return loteRepository.findByIdOptional(id)
                    .orElseThrow(() -> new WebApplicationException("Pagamento não encontrado", 404));
        }
        return loteRepository.findByClubeIdAndId(Escopo.clubeDoToken(jwt), id)
                .orElseThrow(() -> new WebApplicationException("Pagamento não encontrado", 404));
    }

    private String nomeDoClube(UUID clubeId) {
        return clubeRepository.findByIdOptional(clubeId).map(Clube::getNome).orElse(null);
    }

    /** E-mail do representante — é para lá que vão os avisos do clube. */
    private String emailDoClube(UUID clubeId) {
        return clubeRepository.findByIdOptional(clubeId).map(Clube::getRepresentanteEmail).orElse(null);
    }

    private PagamentoLoteDTO toDTO(PagamentoLote l, List<PagamentoLoteItem> itens, String clubeNome) {
        return new PagamentoLoteDTO(
                l.getId(), l.getClubeId(), clubeNome, l.getProtocolo(), l.getAno(),
                l.getValorTotal(), l.getQuantidadeAtletas(), l.getComprovanteUrl(),
                l.getStatus(), l.getObservacao(), l.getMotivoRejeicao(),
                l.getEnviadoEm(), l.getBaixadoEm(), l.getBaixadoPor(),
                itens.stream()
                        .map(i -> new PagamentoLoteDTO.ItemDTO(i.getAtletaId(), i.getAtletaNome(), i.getValor()))
                        .toList());
    }
}
