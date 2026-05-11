export type CompetitionStatus = 'em-andamento' | 'inscricoes-abertas' | 'em-breve' | 'encerrado'
export type CompetitionCategory = 'adulto' | 'sub-18' | 'sub-16' | 'sub-14' | 'sub-12' | 'feminino' | 'masculino'

export interface Competition {
  id: string
  name: string
  category: CompetitionCategory[]
  status: CompetitionStatus
  startDate: string
  endDate: string
  location: string
  teams: number
  registrationLink?: string
  color: string
}

export const competitions: Competition[] = [
  {
    id: '1',
    name: 'Campeonato Tocantinense de Handebol 2025',
    category: ['adulto', 'masculino'],
    status: 'em-andamento',
    startDate: '2025-04-10',
    endDate: '2025-06-28',
    location: 'Ginásio Ayrton Senna — Palmas, TO',
    teams: 8,
    color: '#1A3A8F',
  },
  {
    id: '2',
    name: 'Copa FHT Sub-18 Feminino',
    category: ['sub-18', 'feminino'],
    status: 'inscricoes-abertas',
    startDate: '2025-07-05',
    endDate: '2025-07-20',
    location: 'Centro Esportivo Governador — Palmas, TO',
    teams: 6,
    registrationLink: '#cadastro',
    color: '#1E4DB7',
  },
  {
    id: '3',
    name: 'Festival de Handebol Sub-14 e Sub-12',
    category: ['sub-14', 'sub-12'],
    status: 'em-breve',
    startDate: '2025-08-15',
    endDate: '2025-08-17',
    location: 'Ginásio Municipal — Araguaína, TO',
    teams: 10,
    registrationLink: '#cadastro',
    color: '#1A3A8F',
  },
  {
    id: '4',
    name: 'Circuito Interior Sub-16',
    category: ['sub-16', 'masculino', 'feminino'],
    status: 'em-breve',
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    location: 'Diversas cidades — TO',
    teams: 12,
    registrationLink: '#cadastro',
    color: '#1E4DB7',
  },
  {
    id: '5',
    name: 'Campeonato Estadual Adulto Feminino 2024',
    category: ['adulto', 'feminino'],
    status: 'encerrado',
    startDate: '2024-08-01',
    endDate: '2024-10-30',
    location: 'Palmas, TO',
    teams: 6,
    color: '#1A3A8F',
  },
]
