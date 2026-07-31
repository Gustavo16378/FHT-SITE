package br.org.fht.repository;

import br.org.fht.model.Competicao;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CompeticaoRepository implements PanacheRepositoryBase<Competicao, UUID> {

    /** Mais recentes primeiro — e como o admin espera ver a lista. */
    public List<Competicao> listAllOrdered() {
        return list("ORDER BY temporada DESC, dataInicio DESC");
    }

    /**
     * Vitrine publica. Nao filtra por status aqui: o status e derivado das datas em memoria
     * (ver Competicao.getStatusEfetivo), entao filtrar no SQL daria resultado errado.
     */
    public List<Competicao> listVisiveis() {
        return list("visivelNaHome = ?1 ORDER BY dataInicio DESC", true);
    }
}
