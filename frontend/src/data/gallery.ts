import img1 from '../assets/handebol.webp'
import img2 from '../assets/handebol2.webp'
import img3 from '../assets/handebol3.webp'
import img4 from '../assets/handebol4.webp'
import img5 from '../assets/handebo5l.webp'
import img6 from '../assets/handebol1webp.webp'
import img7 from '../assets/handebol6.webp'

export interface GalleryPhoto {
  id: string
  src: string
  event: string
  year: string
  category: string
  size: 'large' | 'medium' | 'small'
}

export const gallery: GalleryPhoto[] = [
  { id: '1', src: img1, event: 'Campeonato Estadual', year: '2024', category: 'Adulto Masculino', size: 'large' },
  { id: '2', src: img2, event: 'Copa FHT Sub-18', year: '2024', category: 'Sub-18 Feminino', size: 'medium' },
  { id: '3', src: img3, event: 'Festival Sub-14', year: '2023', category: 'Sub-14', size: 'medium' },
  { id: '4', src: img4, event: 'Circuito Interior', year: '2023', category: 'Adulto Feminino', size: 'small' },
  { id: '5', src: img5, event: 'Campeonato Estadual', year: '2023', category: 'Adulto Masculino', size: 'small' },
  { id: '6', src: img6, event: 'Jogos do Interior', year: '2022', category: 'Seleção Sub-18', size: 'large' },
  { id: '7', src: img7, event: 'Copa FHT', year: '2022', category: 'Sub-16', size: 'medium' },
]
