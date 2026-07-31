package br.org.fht.service;

import br.org.fht.dto.competicao.CompeticaoForm;
import br.org.fht.dto.competicao.CompeticaoPublicaDTO;
import br.org.fht.dto.competicao.CompeticaoResponseDTO;
import br.org.fht.exception.ValidationException;
import br.org.fht.mapper.CompeticaoMapper;
import br.org.fht.model.Competicao;
import br.org.fht.repository.CompeticaoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@ApplicationScoped
public class CompeticaoServiceImpl implements CompeticaoService {

    /** As mesmas do site publico e do formulario do admin. */
    private static final List<String> CATEGORIAS_VALIDAS = List.of(
            "adulto", "sub-18", "sub-16", "sub-14", "sub-12", "feminino", "masculino", "master");

    @Inject CompeticaoRepository competicaoRepository;

    @Override
    @Transactional
    public CompeticaoResponseDTO criar(CompeticaoForm form) {
        if (form == null) {
            throw new ValidationException("form", "Dados da competicao ausentes");
        }
        if (branco(form.nome())) {
            throw new ValidationException("nome", "Nome da competicao e obrigatorio");
        }

        LocalDate inicio = parseData(form.dataInicio(), "dataInicio");
        LocalDate fim = parseData(form.dataFim(), "dataFim");
        validarPeriodo(inicio, fim);

        var c = new Competicao();
        c.setNome(validarTamanho(form.nome().trim(), 255, "nome"));
        c.setDescricao(form.descricao());
        c.setCategorias(normalizarCategorias(form.categorias()));
        c.setDataInicio(inicio);
        c.setDataFim(fim);
        c.setLocal(validarTamanho(form.local(), 255, "local"));
        c.setCidade(validarTamanho(form.cidade(), 100, "cidade"));
        c.setUf(branco(form.uf()) ? "TO" : validarUf(form.uf()));
        c.setTemporada(form.temporada() != null ? validarTemporada(form.temporada()) : inicio.getYear());
        c.setNumeroEquipes(form.numeroEquipes() != null ? Math.max(0, form.numeroEquipes()) : 0);
        c.setLinkInscricao(validarTamanho(form.linkInscricao(), 500, "linkInscricao"));
        if (!branco(form.cor())) c.setCor(validarTamanho(form.cor(), 20, "cor"));

        competicaoRepository.persist(c);
        return CompeticaoMapper.toResponse(c);
    }

    @Override
    @Transactional
    public CompeticaoResponseDTO atualizar(UUID id, CompeticaoForm form) {
        Competicao c = buscar(id);
        if (form == null) {
            throw new ValidationException("form", "Dados da competicao ausentes");
        }

        if (form.nome() != null) {
            if (form.nome().isBlank()) {
                throw new ValidationException("nome", "Nome da competicao e obrigatorio");
            }
            c.setNome(form.nome().trim());
        }
        if (form.descricao() != null) c.setDescricao(form.descricao());
        if (form.categorias() != null) c.setCategorias(normalizarCategorias(form.categorias()));
        if (form.local() != null) c.setLocal(validarTamanho(form.local(), 255, "local"));
        if (form.cidade() != null) c.setCidade(validarTamanho(form.cidade(), 100, "cidade"));
        if (!branco(form.uf())) c.setUf(validarUf(form.uf()));
        if (form.numeroEquipes() != null) c.setNumeroEquipes(Math.max(0, form.numeroEquipes()));
        if (form.linkInscricao() != null) c.setLinkInscricao(validarTamanho(form.linkInscricao(), 500, "linkInscricao"));
        if (!branco(form.cor())) c.setCor(validarTamanho(form.cor(), 20, "cor"));

        // As datas mudam o status derivado, entao o periodo e revalidado com o que ficou no fim.
        LocalDate inicio = form.dataInicio() != null ? parseData(form.dataInicio(), "dataInicio") : c.getDataInicio();
        LocalDate fim = form.dataFim() != null ? parseData(form.dataFim(), "dataFim") : c.getDataFim();
        validarPeriodo(inicio, fim);
        boolean anoMudou = !inicio.equals(c.getDataInicio());
        c.setDataInicio(inicio);
        c.setDataFim(fim);

        // A temporada acompanha a data de inicio quando o form nao a informa — senao, remarcar uma
        // competicao de dezembro para janeiro a deixaria presa no ano anterior, sem correcao pela UI
        // (o formulario do admin nao expoe o campo) e desordenando a lista e o cabecalho da home.
        if (form.temporada() != null) {
            c.setTemporada(validarTemporada(form.temporada()));
        } else if (anoMudou) {
            c.setTemporada(inicio.getYear());
        }

        return CompeticaoMapper.toResponse(c);
    }

    @Override
    public List<CompeticaoResponseDTO> listar() {
        return competicaoRepository.listAllOrdered().stream().map(CompeticaoMapper::toResponse).toList();
    }

    @Override
    public CompeticaoResponseDTO buscarPorId(UUID id) {
        return CompeticaoMapper.toResponse(buscar(id));
    }

    @Override
    public List<CompeticaoPublicaDTO> listarPublicas() {
        return competicaoRepository.listVisiveis().stream()
                // Cancelada nao vai pro site: foi desmarcada, nao ha o que anunciar.
                .filter(c -> !Competicao.STATUS_CANCELADO.equals(c.getStatusEfetivo()))
                .map(CompeticaoMapper::toPublica)
                .toList();
    }

    @Override
    public CompeticaoPublicaDTO buscarPublicaPorId(UUID id) {
        Competicao c = buscar(id);
        if (!c.isVisivelNaHome() || Competicao.STATUS_CANCELADO.equals(c.getStatusEfetivo())) {
            throw new WebApplicationException("Competicao nao encontrada", 404);
        }
        return CompeticaoMapper.toPublica(c);
    }

    @Override
    @Transactional
    public CompeticaoResponseDTO definirStatus(UUID id, String override) {
        Competicao c = buscar(id);
        if (branco(override)) {
            throw new ValidationException("status", "Status e obrigatorio");
        }
        String valor = override.trim().toUpperCase(Locale.ROOT);
        if (!Competicao.OVERRIDES_VALIDOS.contains(valor)) {
            throw new ValidationException("status",
                    "Status invalido. Use um de: " + String.join(", ", Competicao.OVERRIDES_VALIDOS));
        }
        c.setStatusOverride(valor);
        return CompeticaoMapper.toResponse(c);
    }

    @Override
    @Transactional
    public CompeticaoResponseDTO voltarStatusAutomatico(UUID id) {
        Competicao c = buscar(id);
        c.setStatusOverride(null);
        return CompeticaoMapper.toResponse(c);
    }

    @Override
    @Transactional
    public CompeticaoResponseDTO definirVitrine(UUID id, boolean visivel) {
        Competicao c = buscar(id);
        c.setVisivelNaHome(visivel);
        return CompeticaoMapper.toResponse(c);
    }

    @Override
    @Transactional
    public void deletar(UUID id) {
        competicaoRepository.delete(buscar(id));
    }

    // --------------------- helpers ---------------------

    private Competicao buscar(UUID id) {
        return competicaoRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Competicao nao encontrada", 404));
    }

    /** Aceita so as categorias conhecidas, em minusculas — o filtro do site publico compara literal. */
    private List<String> normalizarCategorias(List<String> categorias) {
        if (categorias == null) return new ArrayList<>();
        var normalizadas = new ArrayList<String>();
        for (String cat : categorias) {
            if (branco(cat)) continue;
            String valor = cat.trim().toLowerCase(Locale.ROOT);
            if (!CATEGORIAS_VALIDAS.contains(valor)) {
                throw new ValidationException("categorias",
                        "Categoria invalida: '" + cat + "'. Use uma de: " + String.join(", ", CATEGORIAS_VALIDAS));
            }
            if (!normalizadas.contains(valor)) normalizadas.add(valor);
        }
        return normalizadas;
    }

    /**
     * Recusa antes do INSERT o que estouraria a coluna. Sem isso o erro so aparece no Postgres e
     * o GlobalExceptionMapper devolve 500 — o cliente merece 422 dizendo qual campo.
     */
    private String validarTamanho(String valor, int max, String campo) {
        if (valor != null && valor.length() > max) {
            throw new ValidationException(campo, "Campo excede o limite de " + max + " caracteres");
        }
        return valor;
    }

    private String validarUf(String uf) {
        String valor = uf.trim().toUpperCase(Locale.ROOT);
        if (!valor.matches("[A-Z]{2}")) {
            throw new ValidationException("uf", "UF deve ter exatamente 2 letras (ex.: TO)");
        }
        return valor;
    }

    private Integer validarTemporada(Integer temporada) {
        if (temporada < 1900 || temporada > 2200) {
            throw new ValidationException("temporada", "Temporada fora de uma faixa plausivel");
        }
        return temporada;
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new ValidationException("dataFim", "A data de fim nao pode ser anterior a data de inicio");
        }
    }

    private LocalDate parseData(String valor, String campo) {
        if (branco(valor)) {
            throw new ValidationException(campo, "Data e obrigatoria");
        }
        try {
            return LocalDate.parse(valor.trim());
        } catch (DateTimeParseException e) {
            throw new ValidationException(campo, "Data invalida (use AAAA-MM-DD)");
        }
    }

    private static boolean branco(String s) {
        return s == null || s.isBlank();
    }
}
