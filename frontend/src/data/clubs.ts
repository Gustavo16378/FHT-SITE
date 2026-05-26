export interface Club {
  id: string
  name: string
  city: string
  initials: string
  categories: string[]
  logo?: string
}

export const clubs: Club[] = [
  { id: '1', name: 'Palmas Handebol Clube', city: 'Palmas', initials: 'PHC', categories: ['Adulto Masc.', 'Adulto Fem.', 'Sub-18'] },
  { id: '2', name: 'Araguaína Handebol', city: 'Araguaína', initials: 'AHC', categories: ['Adulto Masc.', 'Sub-18', 'Sub-16'] },
  { id: '3', name: 'Gurupi Esporte Clube', city: 'Gurupi', initials: 'GEC', categories: ['Adulto Masc.', 'Sub-16', 'Sub-14'] },
  { id: '4', name: 'Porto Nacional HC', city: 'Porto Nacional', initials: 'PNH', categories: ['Adulto Fem.', 'Sub-18'] },
  { id: '5', name: 'Tocantinópolis Hand', city: 'Tocantinópolis', initials: 'TOC', categories: ['Sub-18', 'Sub-16', 'Sub-14'] },
  { id: '6', name: 'Colinas HC', city: 'Colinas do Tocantins', initials: 'COL', categories: ['Adulto Masc.', 'Sub-16'] },
  { id: '7', name: 'Miracema HC', city: 'Miracema do Tocantins', initials: 'MHC', categories: ['Sub-18', 'Sub-14', 'Sub-12'] },
  { id: '8', name: 'Paraíso HC', city: 'Paraíso do Tocantins', initials: 'PAR', categories: ['Adulto Fem.', 'Sub-16', 'Sub-14'] },
]
