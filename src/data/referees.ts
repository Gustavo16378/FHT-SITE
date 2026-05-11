export type RefereeLevel = 'Nacional' | 'Estadual A' | 'Estadual B' | 'Regional'

export interface Referee {
  id: string
  name: string
  level: RefereeLevel
  city: string
  photo?: string
}

export interface RefereeCourse {
  id: string
  title: string
  date: string
  location: string
  spots: number
  registrationLink: string
}

export const referees: Referee[] = [
  { id: '1', name: 'Carlos Alberto Souza', level: 'Nacional', city: 'Palmas' },
  { id: '2', name: 'Fernanda Oliveira Lima', level: 'Nacional', city: 'Palmas' },
  { id: '3', name: 'Ricardo Mendes', level: 'Estadual A', city: 'Araguaína' },
  { id: '4', name: 'Patrícia Rocha', level: 'Estadual A', city: 'Gurupi' },
  { id: '5', name: 'Marcos Vinicius Alves', level: 'Estadual B', city: 'Porto Nacional' },
  { id: '6', name: 'Juliana Ferreira', level: 'Estadual B', city: 'Palmas' },
]

export const refereeCourses: RefereeCourse[] = [
  {
    id: '1',
    title: 'Curso de Formação de Árbitros — Nível Regional',
    date: '2025-06-14',
    location: 'Centro de Treinamento FHT — Palmas, TO',
    spots: 20,
    registrationLink: '#contato',
  },
  {
    id: '2',
    title: 'Atualização de Regras — Árbitros Estaduais',
    date: '2025-07-19',
    location: 'Ginásio Municipal — Araguaína, TO',
    spots: 15,
    registrationLink: '#contato',
  },
]
