export interface GalleryPhoto {
  id: string
  src: string
  event: string
  year: string
  category: string
  size: 'large' | 'medium' | 'small'
}

export const gallery: GalleryPhoto[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=900&q=80', event: 'Campeonato Estadual', year: '2024', category: 'Adulto Masculino', size: 'large' },
  { id: '2', src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', event: 'Copa FHT Sub-18', year: '2024', category: 'Sub-18 Feminino', size: 'medium' },
  { id: '3', src: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80', event: 'Festival Sub-14', year: '2023', category: 'Sub-14', size: 'medium' },
  { id: '4', src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80', event: 'Circuito Interior', year: '2023', category: 'Adulto Feminino', size: 'small' },
  { id: '5', src: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80', event: 'Campeonato Estadual', year: '2023', category: 'Adulto Masculino', size: 'small' },
  { id: '6', src: 'https://images.unsplash.com/photo-1543357480-c60d40a8c4b8?w=800&q=80', event: 'Jogos do Interior', year: '2022', category: 'Seleção Sub-18', size: 'large' },
  { id: '7', src: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80', event: 'Copa FHT', year: '2022', category: 'Sub-16', size: 'medium' },
]
