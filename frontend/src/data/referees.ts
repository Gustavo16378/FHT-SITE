// Árbitros credenciados agora vêm da API (GET /api/arbitros/publico).
// Aqui ficam só os cursos, que ainda não têm módulo de backend.

export interface RefereeCourse {
  id: string
  title: string
  date: string
  location: string
  spots: number
  registrationLink: string
}

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
