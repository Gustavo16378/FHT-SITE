import img1 from '../assets/handebol.webp'
import img2 from '../assets/handebol3.webp'
import img3 from '../assets/handebol4.webp'
import img4 from '../assets/handebo5l.webp'

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
    image: img1,
    excerpt: 'A Federação de Handebol do Tocantins divulgou o calendário completo da temporada 2025, com competições em todas as categorias de base e adulto.',
    featured: true,
  },
  {
    id: '2',
    title: 'Campeonato Tocantinense tem rodada emocionante em Palmas',
    category: 'Competição',
    date: '2025-04-28',
    image: img2,
    excerpt: 'Equipes disputaram duas rodadas no Ginásio Ayrton Senna com casa cheia e grande nível técnico.',
  },
  {
    id: '3',
    title: 'Curso de formação de árbitros abre vagas para Palmas e Araguaína',
    category: 'Arbitragem',
    date: '2025-04-20',
    image: img3,
    excerpt: 'A FHT abre inscrições para o curso de formação de árbitros, em parceria com a CBHb, com vagas nas duas maiores cidades do estado.',
  },
  {
    id: '4',
    title: 'Seleção Tocantinense Sub-18 se prepara para os Jogos do Interior',
    category: 'Seleção',
    date: '2025-04-15',
    image: img4,
    excerpt: 'O grupo de trabalho se reuniu para os primeiros treinos da temporada visando representar o estado nos Jogos do Interior 2025.',
  },
]
