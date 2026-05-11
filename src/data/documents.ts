export type DocumentCategory = 'Estatuto' | 'Regulamento' | 'Calendário' | 'Edital' | 'Circular'

export interface FHTDocument {
  id: string
  title: string
  category: DocumentCategory
  publishedAt: string
  fileUrl: string
}

export const documents: FHTDocument[] = [
  { id: '1', title: 'Estatuto da FHT — Versão 2023', category: 'Estatuto', publishedAt: '2023-03-15', fileUrl: '#' },
  { id: '2', title: 'Regulamento Geral de Competições 2025', category: 'Regulamento', publishedAt: '2025-01-10', fileUrl: '#' },
  { id: '3', title: 'Regulamento Copa FHT Sub-18 Feminino 2025', category: 'Regulamento', publishedAt: '2025-03-20', fileUrl: '#' },
  { id: '4', title: 'Calendário Oficial de Competições 2025', category: 'Calendário', publishedAt: '2025-01-05', fileUrl: '#' },
  { id: '5', title: 'Edital de Credenciamento de Árbitros 2025', category: 'Edital', publishedAt: '2025-02-14', fileUrl: '#' },
  { id: '6', title: 'Circular nº 01/2025 — Prazo de Transferências', category: 'Circular', publishedAt: '2025-02-28', fileUrl: '#' },
  { id: '7', title: 'Ata de Posse da Diretoria 2023–2027', category: 'Estatuto', publishedAt: '2023-04-01', fileUrl: '#' },
]
