export type NewsCategory = 'Competição' | 'Seleção' | 'Arbitragem' | 'Institucional'

export interface NewsItem {
  id: string
  title: string
  category: NewsCategory
  date: string
  image: string
  excerpt: string
  featured?: boolean
}

export const news: NewsItem[] = [
  {
    id: '1',
    title: 'FHT lança calendário oficial de competições para a temporada 2025',
    category: 'Institucional',
    date: '2025-05-02',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    excerpt: 'A Federação de Handebol do Tocantins divulgou o calendário completo da temporada 2025, com competições em todas as categorias de base e adulto.',
    featured: true,
  },
  {
    id: '2',
    title: 'Campeonato Tocantinense tem rodada emocionante em Palmas',
    category: 'Competição',
    date: '2025-04-28',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600&q=80',
    excerpt: 'Equipes disputaram duas rodadas no Ginásio Ayrton Senna com casa cheia e grande nível técnico.',
  },
  {
    id: '3',
    title: 'Curso de formação de árbitros abre vagas para Palmas e Araguaína',
    category: 'Arbitragem',
    date: '2025-04-20',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    excerpt: 'A FHT abre inscrições para o curso de formação de árbitros, em parceria com a CBHb, com vagas nas duas maiores cidades do estado.',
  },
  {
    id: '4',
    title: 'Seleção Tocantinense Sub-18 se prepara para os Jogos do Interior',
    category: 'Seleção',
    date: '2025-04-15',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
    excerpt: 'O grupo de trabalho se reuniu para os primeiros treinos da temporada visando representar o estado nos Jogos do Interior 2025.',
  },
]
