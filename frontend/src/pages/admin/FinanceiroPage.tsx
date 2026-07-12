import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Download,
  DollarSign,
  Check,
  Clock,
  TrendingUp,
  X,
  Lock,
  Search,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type StatusPagamento = 'PAGO' | 'PENDENTE';
type FiltroStatus = 'TODOS' | StatusPagamento;

interface Pagamento {
  id: number;
  atleta: string;
  clube: string;
  ano: number;
  valor: number;
  status: StatusPagamento;
  data: string; // vazio quando pendente
}

interface MesReceita {
  mes: string;
  valor: number;
}

interface LinhaBalanco {
  descricao: string;
  valor: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock
// ─────────────────────────────────────────────────────────────────────────────

const RECEITA_MESES: MesReceita[] = [
  { mes: 'JAN', valor: 1225 },
  { mes: 'FEV', valor: 2870 },
  { mes: 'MAR', valor: 4165 },
  { mes: 'ABR', valor: 3080 },
  { mes: 'MAI', valor: 5390 },
  { mes: 'JUN', valor: 4620 },
  { mes: 'JUL', valor: 2555 },
  { mes: 'AGO', valor: 0 },
  { mes: 'SET', valor: 0 },
  { mes: 'OUT', valor: 0 },
  { mes: 'NOV', valor: 0 },
  { mes: 'DEZ', valor: 0 },
];

const ENTRADAS: LinhaBalanco[] = [
  { descricao: 'Anuidades de atletas', valor: 23905 },
  { descricao: 'Taxas de filiação de clube', valor: 7200 },
  { descricao: 'Patrocínios', valor: 12000 },
];

const SAIDAS: LinhaBalanco[] = [
  { descricao: 'Custos de competição', valor: 14350 },
  { descricao: 'Material esportivo', valor: 6800 },
  { descricao: 'Administrativo', valor: 4120 },
];

const PAGAMENTOS: Pagamento[] = [
  { id: 1, atleta: 'Lucas Ferreira Lima', clube: 'Palmas HC', ano: 2026, valor: 35, status: 'PAGO', data: '12/02/2026' },
  { id: 2, atleta: 'Ana Beatriz Souza', clube: 'Araguaína HC', ano: 2026, valor: 35, status: 'PAGO', data: '03/03/2026' },
  { id: 3, atleta: 'Pedro Henrique Alves', clube: 'Gurupi EC', ano: 2026, valor: 35, status: 'PENDENTE', data: '' },
  { id: 4, atleta: 'Mariana Costa Reis', clube: 'Porto Nacional HC', ano: 2026, valor: 35, status: 'PAGO', data: '18/03/2026' },
  { id: 5, atleta: 'Gabriel Oliveira Rocha', clube: 'Palmas HC', ano: 2026, valor: 35, status: 'PENDENTE', data: '' },
  { id: 6, atleta: 'Juliana Martins Dias', clube: 'Tocantinópolis Hand', ano: 2026, valor: 35, status: 'PAGO', data: '05/05/2026' },
  { id: 7, atleta: 'Rafael Nunes Carvalho', clube: 'Colinas HC', ano: 2026, valor: 35, status: 'PENDENTE', data: '' },
  { id: 8, atleta: 'Camila Ribeiro Gomes', clube: 'Araguaína HC', ano: 2026, valor: 35, status: 'PAGO', data: '21/06/2026' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function brl(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function brlCompacto(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

const TOTAL_ENTRADAS = ENTRADAS.reduce((s, e) => s + e.valor, 0);
const TOTAL_SAIDAS = SAIDAS.reduce((s, e) => s + e.valor, 0);
const SALDO = TOTAL_ENTRADAS - TOTAL_SAIDAS;
const RECEITA_ANO = RECEITA_MESES.reduce((s, m) => s + m.valor, 0);
const QTD_PAGAS = PAGAMENTOS.filter((p) => p.status === 'PAGO').length;
const QTD_PENDENTES = PAGAMENTOS.filter((p) => p.status === 'PENDENTE').length;
const INADIMPLENCIA = Math.round((QTD_PENDENTES / PAGAMENTOS.length) * 100);
const MAX_RECEITA = Math.max(...RECEITA_MESES.map((m) => m.valor));

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function SeloDemo() {
  return (
    <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
      demonstração
    </span>
  );
}

interface KpiCardProps {
  rotulo: string;
  valor: string;
  icone: ReactNode;
  detalhe: string;
  acento: string;
}

function KpiCard({ rotulo, valor, icone, detalhe, acento }: KpiCardProps) {
  return (
    <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="font-body text-gray-soft text-xs uppercase tracking-wider">{rotulo}</p>
        <span className={acento}>{icone}</span>
      </div>
      <p className="font-display text-fht-white text-3xl leading-none">{valor}</p>
      <p className="font-body text-gray-soft text-xs mt-2">{detalhe}</p>
    </div>
  );
}

interface StatusBadgeProps {
  status: StatusPagamento;
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'PAGO') {
    return (
      <span className="font-body text-xs px-2.5 py-1 rounded-full border text-green-400 bg-green-500/10 border-green-500/30">
        Pago
      </span>
    );
  }
  return (
    <span className="font-body text-xs px-2.5 py-1 rounded-full border text-gold bg-gold/10 border-gold/30">
      Pendente
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export function FinanceiroPage() {
  const [filtro, setFiltro] = useState<FiltroStatus>('TODOS');
  const [busca, setBusca] = useState<string>('');
  const [gerandoPdf, setGerandoPdf] = useState<boolean>(false);

  const pagamentosFiltrados = PAGAMENTOS.filter((p) => {
    const casaStatus = filtro === 'TODOS' || p.status === filtro;
    const termo = busca.trim().toLowerCase();
    const casaBusca =
      termo === '' ||
      p.atleta.toLowerCase().includes(termo) ||
      p.clube.toLowerCase().includes(termo);
    return casaStatus && casaBusca;
  });

  const filtros: { chave: FiltroStatus; rotulo: string }[] = [
    { chave: 'TODOS', rotulo: 'Todos' },
    { chave: 'PAGO', rotulo: 'Pagos' },
    { chave: 'PENDENTE', rotulo: 'Pendentes' },
  ];

  function baixarBalanco() {
    setGerandoPdf(true);
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-fht-white text-3xl">FINANCEIRO</h2>
          <span className="font-body text-xs px-2.5 py-1 rounded-full border text-red-400 bg-red-500/10 border-red-500/30 flex items-center gap-1.5">
            <Lock size={12} />
            Dir. Financeira · restrito
          </span>
          <SeloDemo />
        </div>
        <button
          onClick={baixarBalanco}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 flex items-center gap-2"
        >
          <Download size={16} />
          BAIXAR BALANÇO
        </button>
      </div>

      {/* Regra de negócio */}
      <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 mb-6 flex items-start gap-3">
        <span className="text-gold mt-0.5">
          <DollarSign size={20} />
        </span>
        <div>
          <p className="font-display text-gold text-xs tracking-widest mb-1">REGRA DA ANUIDADE</p>
          <p className="font-body text-fht-white text-sm">
            A anuidade é <span className="text-gold font-semibold">ANUAL (R$ 35,00 por atleta)</span>.
            Pagar a anuidade do ano habilita o atleta a competir naquele ano — a filiação vence e
            renova a cada ano.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          rotulo="Receita 2026"
          valor={brlCompacto(RECEITA_ANO)}
          icone={<TrendingUp size={18} />}
          detalhe="Acumulado jan → jul"
          acento="text-green-400"
        />
        <KpiCard
          rotulo="Anuidades pagas"
          valor={String(QTD_PAGAS)}
          icone={<Check size={18} />}
          detalhe="Atletas habilitados a competir"
          acento="text-blue-300"
        />
        <KpiCard
          rotulo="Pendentes"
          valor={String(QTD_PENDENTES)}
          icone={<Clock size={18} />}
          detalhe="Aguardando pagamento"
          acento="text-gold"
        />
        <KpiCard
          rotulo="Inadimplência"
          valor={`${INADIMPLENCIA}%`}
          icone={<DollarSign size={18} />}
          detalhe="Sobre o total cadastrado"
          acento="text-red-400"
        />
      </div>

      {/* Gráfico de receita + Balanço */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Receita por mês */}
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-gold text-xs tracking-widest">RECEITA POR MÊS · 2026</p>
            <span className="font-body text-gray-soft text-xs">{brl(RECEITA_ANO)}</span>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-48">
            {RECEITA_MESES.map((m) => {
              const altura = MAX_RECEITA > 0 ? (m.valor / MAX_RECEITA) * 100 : 0;
              const vazio = m.valor === 0;
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                  <span className="font-body text-[10px] text-gray-soft opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    {vazio ? '—' : brlCompacto(m.valor)}
                  </span>
                  <div
                    className={
                      vazio
                        ? 'w-full rounded-t-sm bg-federation/15 min-h-[4px]'
                        : 'w-full rounded-t-sm bg-gradient-to-t from-federation to-gold min-h-[4px] group-hover:from-blue-mid group-hover:to-gold-light transition-colors duration-150'
                    }
                    style={{ height: `${Math.max(altura, vazio ? 3 : 6)}%` }}
                  />
                  <span className="font-body text-[10px] text-gray-soft uppercase tracking-wider">
                    {m.mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balanço */}
        <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-5 lg:col-span-2">
          <p className="font-display text-gold text-xs tracking-widest mb-4">
            BALANÇO 2026 · ENTRADAS × SAÍDAS
          </p>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-body text-green-400 text-xs uppercase tracking-wider">Entradas</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {ENTRADAS.map((e) => (
                <div key={e.descricao} className="flex items-center justify-between">
                  <span className="font-body text-gray-soft text-sm">{e.descricao}</span>
                  <span className="font-body text-fht-white text-sm">{brl(e.valor)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-federation/20">
                <span className="font-body text-fht-white text-sm font-semibold">Total entradas</span>
                <span className="font-body text-green-400 text-sm font-semibold">{brl(TOTAL_ENTRADAS)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="font-body text-red-400 text-xs uppercase tracking-wider">Saídas</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {SAIDAS.map((e) => (
                <div key={e.descricao} className="flex items-center justify-between">
                  <span className="font-body text-gray-soft text-sm">{e.descricao}</span>
                  <span className="font-body text-fht-white text-sm">− {brl(e.valor)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-federation/20">
                <span className="font-body text-fht-white text-sm font-semibold">Total saídas</span>
                <span className="font-body text-red-400 text-sm font-semibold">− {brl(TOTAL_SAIDAS)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gold/10 border border-gold/30 rounded-lg px-4 py-3">
            <span className="font-display text-gold text-sm tracking-widest">SALDO</span>
            <span className="font-display text-gold-light text-2xl leading-none">{brl(SALDO)}</span>
          </div>
        </div>
      </div>

      {/* Tabela de pagamentos */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-fht-white text-xl tracking-wider">PAGAMENTOS DE ANUIDADE</p>
        <div className="flex flex-wrap items-center gap-3">
          {/* Busca */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-soft">
              <Search size={15} />
            </span>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atleta ou clube…"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg pl-9 pr-4 py-2 text-fht-white placeholder-gray-soft text-sm outline-none w-56"
            />
          </div>
          {/* Filtro pills */}
          <div className="flex items-center gap-2">
            {filtros.map((f) => {
              const ativo = filtro === f.chave;
              return (
                <button
                  key={f.chave}
                  onClick={() => setFiltro(f.chave)}
                  className={
                    ativo
                      ? 'font-body text-xs px-3 py-1.5 rounded-full border text-gold bg-gold/10 border-gold/40 transition-colors duration-150'
                      : 'font-body text-xs px-3 py-1.5 rounded-full border text-gray-soft bg-gray-soft/5 border-federation/20 hover:border-federation/50 transition-colors duration-150'
                  }
                >
                  {f.rotulo}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-federation/20">
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Atleta</th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Clube</th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Ano</th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Valor</th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Status</th>
              <th className="font-body text-gray-soft text-xs uppercase tracking-wider px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            {pagamentosFiltrados.map((p) => (
              <tr
                key={p.id}
                className="border-b border-federation/10 hover:bg-federation/5 transition-colors duration-150"
              >
                <td className="px-4 py-3 font-body text-fht-white text-sm">{p.atleta}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{p.clube}</td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{p.ano}</td>
                <td className="px-4 py-3 font-body text-fht-white text-sm">{brl(p.valor)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 font-body text-gray-soft text-sm">{p.data || '—'}</td>
              </tr>
            ))}
            {pagamentosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-body text-gray-soft text-sm">
                  Nenhum pagamento encontrado para o filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="font-body text-gray-soft/60 text-xs mt-3">
        Exibindo {pagamentosFiltrados.length} de {PAGAMENTOS.length} registros.
      </p>

      {/* Modal: gerando PDF */}
      {gerandoPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setGerandoPdf(false)}
        >
          <div
            className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-federation/20 flex items-center justify-between">
              <p className="font-display text-gold text-sm tracking-widest flex items-center gap-2">
                <Download size={16} />
                GERANDO BALANÇO
              </p>
              <button
                onClick={() => setGerandoPdf(false)}
                className="text-gray-soft hover:text-fht-white transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="font-body text-fht-white text-sm">
                Gerando PDF do balanço financeiro de 2026…
              </p>
              <div className="w-full h-2 bg-federation/15 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-federation to-gold rounded-full" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-body text-gray-soft">Saldo consolidado: {brl(SALDO)}</span>
                <SeloDemo />
              </div>
            </div>
            <div className="p-5 flex gap-3 justify-end border-t border-federation/20">
              <button
                onClick={() => setGerandoPdf(false)}
                className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
