import { useCallback, useEffect, useState } from 'react';
import {
  DollarSign, Check, Clock, X, Search, AlertCircle, FileText, Users,
} from 'lucide-react';
import { apiGet, apiPatch, ApiError, fileUrl } from '../../services/api';
import type { BaixaResultadoDTO, PagamentoLoteDTO, PagamentoLoteStatus } from '../../types/api';

const STATUS_META: Record<PagamentoLoteStatus, { label: string; badge: string }> = {
  AGUARDANDO_BAIXA: { label: 'Aguardando baixa', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  CONFIRMADO: { label: 'Confirmado', badge: 'text-green-400 bg-green-500/10 border-green-500/30' },
  REJEITADO: { label: 'Rejeitado', badge: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

const FILTROS: { valor: PagamentoLoteStatus | 'TODOS'; label: string }[] = [
  { valor: 'AGUARDANDO_BAIXA', label: 'Aguardando baixa' },
  { valor: 'CONFIRMADO', label: 'Confirmados' },
  { valor: 'REJEITADO', label: 'Rejeitados' },
  { valor: 'TODOS', label: 'Todos' },
];

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function fmtData(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function msgErro(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Erro inesperado.';
}

/** Resultado da baixa: mostra quem foi ativado e quem ficou barrado pela documentação. */
function ResultadoBaixa({ r, onClose }: { r: BaixaResultadoDTO; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-fht-white text-xl">BAIXA REGISTRADA</h3>

        {r.ativados.length > 0 && (
          <div>
            <p className="font-display text-green-400 text-xs tracking-widest mb-2">
              {r.ativados.length} ATLETA(S) ATIVADO(S)
            </p>
            <div className="flex flex-col gap-1">
              {r.ativados.map(n => (
                <p key={n} className="font-body text-gray-soft text-sm flex items-center gap-2">
                  <Check size={13} className="text-green-400 flex-shrink-0" /> {n}
                </p>
              ))}
            </div>
          </div>
        )}

        {r.bloqueados.length > 0 && (
          <div>
            <p className="font-display text-yellow-400 text-xs tracking-widest mb-2">
              {r.bloqueados.length} AGUARDANDO DOCUMENTAÇÃO
            </p>
            <p className="font-body text-gray-soft text-xs mb-2 leading-relaxed">
              O pagamento foi aceito, mas estes atletas não podem ser ativados enquanto a
              documentação não estiver em ordem.
            </p>
            <div className="flex flex-col gap-2">
              {r.bloqueados.map(b => (
                <div key={b.atletaNome} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <p className="font-body text-fht-white text-sm">{b.atletaNome}</p>
                  <p className="font-body text-yellow-400/90 text-xs mt-0.5">{b.motivo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose}
          className="font-display text-night bg-gold hover:bg-gold-light py-2.5 rounded-lg text-sm tracking-wider mt-1">
          ENTENDI
        </button>
      </div>
    </div>
  );
}

export function FinanceiroPage() {
  const [lotes, setLotes] = useState<PagamentoLoteDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<PagamentoLoteStatus | 'TODOS'>('AGUARDANDO_BAIXA');
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState<PagamentoLoteDTO | null>(null);
  const [rejeitando, setRejeitando] = useState<PagamentoLoteDTO | null>(null);
  const [motivo, setMotivo] = useState('');
  const [resultado, setResultado] = useState<BaixaResultadoDTO | null>(null);
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLotes(await apiGet<PagamentoLoteDTO[]>('/api/pagamentos'));
      setErro('');
    } catch (e) { setErro(msgErro(e)); } finally { setCarregando(false); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const filtrados = lotes
    .filter(l => filtro === 'TODOS' || l.status === filtro)
    .filter(l => {
      const t = busca.toLowerCase();
      return !t || (l.clubeNome ?? '').toLowerCase().includes(t) || l.protocolo.toLowerCase().includes(t);
    });

  const aguardando = lotes.filter(l => l.status === 'AGUARDANDO_BAIXA');
  const totalAguardando = aguardando.reduce((s, l) => s + l.valorTotal, 0);
  const confirmados = lotes.filter(l => l.status === 'CONFIRMADO');
  const totalRecebido = confirmados.reduce((s, l) => s + l.valorTotal, 0);

  async function darBaixa(lote: PagamentoLoteDTO) {
    setProcessando(true);
    try {
      const r = await apiPatch<BaixaResultadoDTO>(`/api/pagamentos/${lote.id}/baixar`);
      setDetalhe(null);
      setResultado(r);
      await carregar();
    } catch (e) { setErro(msgErro(e)); } finally { setProcessando(false); }
  }

  async function confirmarRejeicao() {
    if (!rejeitando) return;
    setProcessando(true);
    try {
      await apiPatch(`/api/pagamentos/${rejeitando.id}/rejeitar`, { motivo });
      setRejeitando(null); setMotivo(''); setDetalhe(null);
      await carregar();
    } catch (e) { setErro(msgErro(e)); } finally { setProcessando(false); }
  }

  const cards = [
    { label: 'Aguardando baixa', valor: brl(totalAguardando), sub: `${aguardando.length} pagamento(s)`, cor: 'border-yellow-500/30', Icon: Clock },
    { label: 'Recebido (confirmado)', valor: brl(totalRecebido), sub: `${confirmados.length} pagamento(s)`, cor: 'border-green-500/30', Icon: Check },
    { label: 'Atletas quitados', valor: String(confirmados.reduce((s, l) => s + l.quantidadeAtletas, 0)), sub: 'anuidades confirmadas', cor: 'border-federation/30', Icon: Users },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-fht-white text-3xl">FINANCEIRO</h2>
        <p className="font-body text-gray-soft text-sm mt-1">
          Pagamentos de anuidade enviados pelos clubes. Confira o comprovante e dê baixa —
          os atletas do lote são ativados automaticamente.
        </p>
      </div>

      {erro && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-5 font-body text-sm">
          <AlertCircle size={16} /> {erro}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className={`bg-[#0d1b2a]/60 border ${c.cor} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <c.Icon size={15} className="text-gold" />
              <p className="font-body text-gray-soft text-xs uppercase tracking-wider">{c.label}</p>
            </div>
            <p className="font-display text-fht-white text-3xl leading-none">{c.valor}</p>
            <p className="font-body text-gray-soft text-xs mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {FILTROS.map(f => (
          <button key={f.valor} onClick={() => setFiltro(f.valor)}
            className={`font-body text-xs px-3.5 py-1.5 rounded-full border transition-colors duration-150 ${
              filtro === f.valor ? 'text-gold bg-gold/10 border-gold/40'
                : 'text-gray-soft bg-gray-soft/5 border-gray-soft/20 hover:border-gray-soft/40'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-soft" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por clube ou protocolo..."
          className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full" />
      </div>

      {carregando ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 text-center font-body text-gray-soft text-sm">
          Carregando pagamentos...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-10 flex flex-col items-center gap-3">
          <DollarSign size={32} className="text-gray-soft/50" />
          <p className="font-body text-gray-soft text-sm">
            {lotes.length === 0 ? 'Nenhum pagamento recebido ainda.' : 'Nenhum pagamento com este filtro.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(l => (
            <div key={l.id} className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`font-body text-xs px-2.5 py-1 rounded-full border ${STATUS_META[l.status].badge}`}>
                      {STATUS_META[l.status].label}
                    </span>
                    <span className="font-body text-gray-soft text-xs">{l.protocolo}</span>
                  </div>
                  <p className="font-display text-fht-white text-xl leading-tight">{l.clubeNome ?? '—'}</p>
                  <p className="font-body text-gray-soft text-sm mt-1">
                    {l.quantidadeAtletas} {l.quantidadeAtletas === 1 ? 'atleta' : 'atletas'} · anuidade {l.ano} · enviado em {fmtData(l.enviadoEm)}
                  </p>
                  {l.observacao && (
                    <p className="font-body text-gray-soft/80 text-xs mt-1 italic">"{l.observacao}"</p>
                  )}
                  {l.motivoRejeicao && (
                    <p className="font-body text-red-400 text-xs mt-1">Rejeitado: {l.motivoRejeicao}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-gold text-2xl leading-none">{brl(l.valorTotal)}</p>
                  <button onClick={() => setDetalhe(l)}
                    className="font-body text-gold text-xs hover:underline mt-2">
                    Ver atletas e comprovante →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalhe: a lista nominal é o que a federação confere para dar baixa */}
      {detalhe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }} onClick={() => setDetalhe(null)}>
          <div className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-federation/20 flex items-start justify-between">
              <div>
                <h3 className="font-display text-fht-white text-xl tracking-wide">{detalhe.protocolo}</h3>
                <p className="font-body text-gray-soft text-sm mt-0.5">{detalhe.clubeNome}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-gray-soft hover:text-fht-white p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between bg-federation/10 border border-federation/20 rounded-lg px-4 py-3">
                <span className="font-body text-gray-soft text-sm">Total do pagamento</span>
                <span className="font-display text-gold text-2xl">{brl(detalhe.valorTotal)}</span>
              </div>

              {detalhe.comprovanteUrl && (
                <a href={fileUrl(detalhe.comprovanteUrl)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-federation/10 border border-federation/20 rounded-lg hover:border-gold/40 transition-colors duration-200">
                  <span className="font-body text-fht-white text-sm flex items-center gap-2">
                    <FileText size={15} className="text-gold" /> Comprovante enviado
                  </span>
                  <span className="font-body text-gray-soft text-xs">Abrir →</span>
                </a>
              )}

              <div>
                <p className="font-display text-gold text-xs tracking-widest mb-2">
                  ATLETAS COBERTOS ({detalhe.itens.length})
                </p>
                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                  {detalhe.itens.map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-federation/5 border border-federation/10 rounded-lg">
                      <span className="font-body text-fht-white text-sm">{i.atletaNome}</span>
                      <span className="font-body text-gray-soft text-sm">{brl(i.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {detalhe.status === 'CONFIRMADO' && (
                <p className="font-body text-green-400 text-xs">
                  Baixa dada em {fmtData(detalhe.baixadoEm)}{detalhe.baixadoPor ? ` por ${detalhe.baixadoPor}` : ''}.
                </p>
              )}
            </div>

            {detalhe.status === 'AGUARDANDO_BAIXA' && (
              <div className="p-5 border-t border-federation/20 flex justify-end gap-3">
                <button onClick={() => { setRejeitando(detalhe); setMotivo(''); }} disabled={processando}
                  className="font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50">
                  Rejeitar
                </button>
                <button onClick={() => darBaixa(detalhe)} disabled={processando}
                  className="font-display text-night bg-green-500 hover:bg-green-400 px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50 flex items-center gap-2">
                  <Check size={16} /> {processando ? 'Processando...' : 'Dar baixa'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejeitando && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setRejeitando(null)}>
          <div className="bg-[#0a1628] border border-federation/30 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-fht-white text-xl">REJEITAR PAGAMENTO?</h3>
            <p className="font-body text-gray-soft text-sm">
              Os {rejeitando.quantidadeAtletas} atleta(s) voltam para a fila de pendentes e o clube
              poderá enviar um novo comprovante.
            </p>
            <input value={motivo} onChange={e => setMotivo(e.target.value)}
              placeholder="Motivo (ex.: comprovante ilegível)"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejeitando(null)}
                className="font-display text-gray-soft border border-federation/30 px-5 py-2.5 rounded-lg text-sm tracking-wider">
                Cancelar
              </button>
              <button onClick={confirmarRejeicao} disabled={processando}
                className="font-display text-fht-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 px-5 py-2.5 rounded-lg text-sm tracking-wider disabled:opacity-50">
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      {resultado && <ResultadoBaixa r={resultado} onClose={() => setResultado(null)} />}
    </div>
  );
}
