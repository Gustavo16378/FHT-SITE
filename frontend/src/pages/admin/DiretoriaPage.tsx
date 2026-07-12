import { useState } from 'react';
import {
  Plus,
  X,
  UserCog,
  Pencil,
  Check,
  Info,
  Mail,
  Phone,
  Calendar,
  Shield,
  DollarSign,
  Newspaper,
  Award,
  Users,
} from 'lucide-react';

type Diretor = {
  id: string;
  nome: string;
  cargo: string;
  mandato: string;
  email: string;
  telefone: string;
  area: string;
  desde: string;
  bio: string[];
};

const DIRETORES: Diretor[] = [
  {
    id: 'presidente',
    nome: 'João Carlos Mendonça',
    cargo: 'Presidente',
    mandato: '2023–2027',
    email: 'presidencia@fht.org.br',
    telefone: '(63) 98111-2023',
    area: 'Gestão Geral',
    desde: 'Fevereiro/2023',
    bio: [
      'Natural de Palmas, João Carlos Mendonça atua no handebol tocantinense há mais de duas décadas, tendo iniciado como atleta e passado por funções técnicas antes de assumir a gestão esportiva. Foi um dos idealizadores da reestruturação da federação em 2023.',
      'À frente da presidência, tem priorizado a profissionalização administrativa da FHT, a ampliação do calendário estadual de competições e a filiação de novos clubes no interior do estado, com foco especial nas categorias de base.',
      'Representa a federação junto à Confederação Brasileira de Handebol (CBHb) e articula parcerias com secretarias municipais de esporte para expandir a modalidade em Tocantins.',
    ],
  },
  {
    id: 'vice',
    nome: 'Ana Paula Ribeiro',
    cargo: 'Vice-Presidente',
    mandato: '2023–2027',
    email: 'vice@fht.org.br',
    telefone: '(63) 98222-4477',
    area: 'Gestão Geral',
    desde: 'Fevereiro/2023',
    bio: [
      'Ana Paula Ribeiro é formada em Educação Física e pós-graduada em Gestão Esportiva. Coordenou projetos sociais de iniciação ao handebol em escolas públicas de Araguaína antes de integrar a diretoria.',
      'Como Vice-Presidente, dá suporte direto à presidência e responde pela federação em suas ausências, além de coordenar a integração entre as diretorias técnica, financeira e de comunicação.',
      'É uma das principais defensoras da equidade de gênero no esporte estadual, incentivando a criação de equipes femininas em todas as categorias filiadas.',
    ],
  },
  {
    id: 'tecnico',
    nome: 'Roberto Alves Neto',
    cargo: 'Diretor Técnico',
    mandato: '2023–2027',
    email: 'tecnico@fht.org.br',
    telefone: '(63) 98333-1590',
    area: 'Competições',
    desde: 'Março/2023',
    bio: [
      'Roberto Alves Neto acumula experiência como treinador de equipes adultas e de base, com passagens por clubes de Palmas e Gurupi. Possui certificação técnica reconhecida pela CBHb.',
      'Na direção técnica, é responsável pela elaboração do calendário estadual, pelo regulamento das competições e pela homologação de resultados oficiais da federação.',
      'Coordena ainda o desenvolvimento das seleções tocantinenses que representam o estado em campeonatos regionais e nacionais, definindo comissões técnicas e critérios de convocação.',
    ],
  },
  {
    id: 'financeira',
    nome: 'Silvia Monteiro',
    cargo: 'Diretora Financeira',
    mandato: '2023–2027',
    email: 'financeiro@fht.org.br',
    telefone: '(63) 98444-7788',
    area: 'Financeiro',
    desde: 'Fevereiro/2023',
    bio: [
      'Silvia Monteiro é contadora com ampla atuação no terceiro setor e em entidades esportivas sem fins lucrativos. Assumiu a diretoria financeira com o desafio de dar transparência às contas da federação.',
      'É responsável pelo controle das anuidades dos atletas, das taxas de filiação dos clubes e pela prestação de contas anual da FHT, garantindo conformidade com as exigências legais e estatutárias.',
      'Implantou controles internos para o acompanhamento de receitas e despesas e conduz a elaboração dos balanços e relatórios financeiros apresentados à assembleia dos clubes filiados.',
    ],
  },
  {
    id: 'arbitragem',
    nome: 'Alexandre Costa',
    cargo: 'Diretor de Arbitragem',
    mandato: '2023–2027',
    email: 'arbitragem@fht.org.br',
    telefone: '(63) 98555-3120',
    area: 'Arbitragem',
    desde: 'Março/2023',
    bio: [
      'Alexandre Costa foi árbitro por mais de quinze anos, com atuação em competições estaduais e nacionais, antes de migrar para a gestão da arbitragem tocantinense.',
      'À frente da diretoria, coordena o quadro de árbitros da federação, organiza as escalas para os jogos oficiais e promove cursos de formação e reciclagem para novos apitadores.',
      'Zela pela padronização das súmulas e pela aplicação uniforme das regras oficiais em todas as competições organizadas ou chanceladas pela FHT.',
    ],
  },
  {
    id: 'comunicacao',
    nome: 'Renata Pinheiro',
    cargo: 'Diretora de Comunicação',
    mandato: '2023–2027',
    email: 'comunicacao@fht.org.br',
    telefone: '(63) 98666-9041',
    area: 'Comunicação',
    desde: 'Abril/2023',
    bio: [
      'Renata Pinheiro é jornalista com experiência em assessoria de imprensa esportiva e gestão de mídias sociais. Integrou coberturas de eventos esportivos em todo o estado antes de assumir a diretoria.',
      'Responde pela comunicação oficial da federação: divulgação de notícias, cobertura das competições, gestão do site institucional e das redes sociais, além do relacionamento com a imprensa.',
      'Trabalha para dar visibilidade aos clubes e atletas tocantinenses, valorizando conquistas e fortalecendo a imagem do handebol como esporte em crescimento no estado.',
    ],
  },
];

const AREA_ICON: Record<string, typeof Shield> = {
  'Gestão Geral': Users,
  Competições: Award,
  Financeiro: DollarSign,
  Arbitragem: Shield,
  Comunicação: Newspaper,
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

const SELO_DEMO = (
  <span className="font-body text-[10px] text-gray-soft/60 border border-federation/20 rounded-full px-2 py-0.5">
    demonstração
  </span>
);

type CardProps = {
  diretor: Diretor;
  onClick: () => void;
};

function DiretorCard({ diretor, onClick }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#0d1b2a]/60 border border-federation/20 hover:border-gold/40 rounded-xl p-5 flex flex-col items-center text-center transition-colors duration-250 group"
    >
      <div className="w-20 h-20 rounded-lg bg-federation/20 border border-federation/40 group-hover:border-gold/50 flex items-center justify-center mb-4 transition-colors duration-250">
        <span className="font-display text-gold text-3xl tracking-wider">
          {iniciais(diretor.nome)}
        </span>
      </div>
      <p className="font-body text-fht-white text-sm font-semibold leading-tight">
        {diretor.nome}
      </p>
      <p className="font-body text-gray-soft text-xs mt-1">{diretor.cargo}</p>
    </button>
  );
}

type ModalProps = {
  diretor: Diretor;
  onClose: () => void;
};

function DiretorModal({ diretor, onClose }: ModalProps) {
  const [editando, setEditando] = useState<boolean>(false);
  const [bioSalva, setBioSalva] = useState<string[]>(diretor.bio);
  const [rascunho, setRascunho] = useState<string>(diretor.bio.join('\n\n'));
  const [feedback, setFeedback] = useState<boolean>(false);

  const AreaIcon = AREA_ICON[diretor.area] ?? UserCog;

  function iniciarEdicao() {
    setRascunho(bioSalva.join('\n\n'));
    setEditando(true);
    setFeedback(false);
  }

  function salvar() {
    const paragrafos = rascunho
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setBioSalva(paragrafos.length > 0 ? paragrafos : bioSalva);
    setEditando(false);
    setFeedback(true);
  }

  function cancelar() {
    setEditando(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="p-5 border-b border-federation/20 flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-federation/20 border border-federation/40 flex items-center justify-center shrink-0">
            <span className="font-display text-gold text-2xl tracking-wider">
              {iniciais(diretor.nome)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-fht-white text-xl tracking-wide leading-none">
                {diretor.nome}
              </h3>
              {SELO_DEMO}
            </div>
            <p className="font-body text-gold text-sm mt-1">{diretor.cargo}</p>
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-gray-soft mt-2">
              <Calendar size={13} /> Mandato {diretor.mandato}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-soft hover:text-fht-white transition-colors duration-150 shrink-0"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {/* corpo */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* dados de contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
              <AreaIcon size={16} className="text-blue-300 shrink-0" />
              <div className="min-w-0">
                <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider block">
                  Área
                </span>
                <span className="font-body text-fht-white text-sm truncate block">
                  {diretor.area}
                </span>
              </div>
            </div>
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
              <Calendar size={16} className="text-blue-300 shrink-0" />
              <div className="min-w-0">
                <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider block">
                  Na diretoria desde
                </span>
                <span className="font-body text-fht-white text-sm truncate block">
                  {diretor.desde}
                </span>
              </div>
            </div>
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
              <Mail size={16} className="text-blue-300 shrink-0" />
              <div className="min-w-0">
                <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider block">
                  E-mail
                </span>
                <span className="font-body text-fht-white text-sm truncate block">
                  {diretor.email}
                </span>
              </div>
            </div>
            <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
              <Phone size={16} className="text-blue-300 shrink-0" />
              <div className="min-w-0">
                <span className="font-body text-gray-soft text-[10px] uppercase tracking-wider block">
                  Telefone
                </span>
                <span className="font-body text-fht-white text-sm truncate block">
                  {diretor.telefone}
                </span>
              </div>
            </div>
          </div>

          {/* bio / curriculo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-gold text-xs tracking-widest">
                CURRÍCULO
              </p>
              {!editando && (
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="inline-flex items-center gap-1.5 font-display text-gray-soft hover:text-gold text-xs tracking-wider transition-colors duration-150"
                >
                  <Pencil size={13} /> Editar
                </button>
              )}
            </div>

            {editando ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={rascunho}
                  onChange={(e) => setRascunho(e.target.value)}
                  rows={9}
                  className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full resize-y leading-relaxed"
                  placeholder="Escreva a bio do diretor. Separe os parágrafos com uma linha em branco."
                />
                <p className="font-body text-gray-soft text-xs">
                  Separe parágrafos com uma linha em branco.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={salvar}
                    className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
                  >
                    <Check size={16} /> Salvar
                  </button>
                  <button
                    type="button"
                    onClick={cancelar}
                    className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {feedback && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                    <Check size={15} className="text-green-400 shrink-0" />
                    <span className="font-body text-green-400 text-xs">
                      Currículo atualizado (demonstração — não persiste no banco).
                    </span>
                  </div>
                )}
                {bioSalva.map((p, i) => (
                  <p
                    key={i}
                    className="font-body text-gray-soft text-sm leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-federation/20 flex items-center gap-2">
          <Info size={14} className="text-gray-soft shrink-0" />
          <span className="font-body text-gray-soft text-xs">
            Cada diretor pode editar o próprio perfil.
          </span>
        </div>
      </div>
    </div>
  );
}

function AdicionarModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState<string>('');
  const [cargo, setCargo] = useState<string>('Presidente');
  const [email, setEmail] = useState<string>('');
  const [mandato, setMandato] = useState<string>('2023–2027');

  const cargos = [
    'Presidente',
    'Vice-Presidente',
    'Diretor Técnico',
    'Diretora Financeira',
    'Diretor de Arbitragem',
    'Diretora de Comunicação',
    'Conselho Fiscal',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-federation/30 rounded-xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="p-5 border-b border-federation/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-fht-white text-lg tracking-wide">
              ADICIONAR MEMBRO
            </h3>
            {SELO_DEMO}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-soft hover:text-fht-white transition-colors duration-150"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {/* corpo */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-federation/20 border border-federation/40 flex items-center justify-center shrink-0">
              <span className="font-display text-gold text-2xl tracking-wider">
                {nome ? iniciais(nome) : '?'}
              </span>
            </div>
            <p className="font-body text-gray-soft text-xs leading-relaxed">
              O avatar usa as iniciais do nome automaticamente. Uma foto poderá
              ser enviada depois, no perfil do diretor.
            </p>
          </div>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              Nome completo
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Fernanda Souza"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Cargo
              </span>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full appearance-none cursor-pointer"
              >
                {cargos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
                Mandato
              </span>
              <input
                value={mandato}
                onChange={(e) => setMandato(e.target.value)}
                placeholder="2023–2027"
                className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-body text-gray-soft text-xs uppercase tracking-wider mb-1 block">
              E-mail institucional
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@fht.org.br"
              className="font-body bg-[#0d1b2a]/80 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none w-full"
            />
          </label>
        </div>

        {/* footer */}
        <div className="p-5 border-t border-federation/20 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-display text-gray-soft border border-federation/30 hover:border-federation/60 px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
          >
            <Check size={16} /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export function DiretoriaPage() {
  const [selecionado, setSelecionado] = useState<Diretor | null>(null);
  const [adicionando, setAdicionando] = useState<boolean>(false);

  return (
    <div>
      {/* cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-fht-white text-3xl">DIRETORIA</h2>
            {SELO_DEMO}
          </div>
          <p className="font-body text-gray-soft text-sm mt-1">
            Membros da diretoria da federação — perfis exibidos no site
            institucional.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdicionando(true)}
          className="font-display text-night bg-gold hover:bg-gold-light px-5 py-2.5 rounded-lg text-sm tracking-wider transition-colors duration-250 inline-flex items-center gap-2"
        >
          <Plus size={16} /> Adicionar membro
        </button>
      </div>

      {/* nota */}
      <div className="bg-[#0d1b2a]/60 border border-federation/20 rounded-xl p-4 mb-6 flex items-center gap-3">
        <UserCog size={18} className="text-gold shrink-0" />
        <p className="font-body text-gray-soft text-sm">
          Cada diretor pode editar o próprio perfil (foto, biografia e contato).
          Clique em um card para ver o currículo completo.
        </p>
      </div>

      {/* grid de diretores */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DIRETORES.map((d) => (
          <DiretorCard
            key={d.id}
            diretor={d}
            onClick={() => setSelecionado(d)}
          />
        ))}
      </div>

      {/* modais */}
      {selecionado && (
        <DiretorModal
          key={selecionado.id}
          diretor={selecionado}
          onClose={() => setSelecionado(null)}
        />
      )}
      {adicionando && <AdicionarModal onClose={() => setAdicionando(false)} />}
    </div>
  );
}
