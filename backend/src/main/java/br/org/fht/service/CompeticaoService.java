package br.org.fht.service;

import br.org.fht.dto.competicao.CompeticaoForm;
import br.org.fht.dto.competicao.CompeticaoPublicaDTO;
import br.org.fht.dto.competicao.CompeticaoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface CompeticaoService {

    CompeticaoResponseDTO criar(CompeticaoForm form);

    CompeticaoResponseDTO atualizar(UUID id, CompeticaoForm form);

    List<CompeticaoResponseDTO> listar();

    CompeticaoResponseDTO buscarPorId(UUID id);

    List<CompeticaoPublicaDTO> listarPublicas();

    CompeticaoPublicaDTO buscarPublicaPorId(UUID id);

    /** Define o override manual de status (abrir inscricoes, iniciar, encerrar, adiar, cancelar). */
    CompeticaoResponseDTO definirStatus(UUID id, String override);

    /** Limpa o override — o status volta a ser derivado das datas. */
    CompeticaoResponseDTO voltarStatusAutomatico(UUID id);

    CompeticaoResponseDTO definirVitrine(UUID id, boolean visivel);

    void deletar(UUID id);
}
