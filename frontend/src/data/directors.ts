export interface Director {
  id: string
  name: string
  role: string
  photo?: string
}

export const directors: Director[] = [
  { id: '1', name: 'João Carlos Mendonça', role: 'Presidente' },
  { id: '2', name: 'Ana Paula Ribeiro', role: 'Vice-Presidente' },
  { id: '3', name: 'Roberto Alves Neto', role: 'Diretor Técnico' },
  { id: '4', name: 'Silvia Monteiro', role: 'Diretora Financeira' },
  { id: '5', name: 'Alexandre Costa', role: 'Diretor de Arbitragem' },
  { id: '6', name: 'Renata Pinheiro', role: 'Diretora de Comunicação' },
]
