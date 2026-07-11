// Cliente HTTP central do frontend.
// - Anexa o JWT (fht_token) em toda requisição autenticada.
// - Desembrulha o envelope ApiResponse<T> do backend e retorna apenas `data`.
// - Lança ApiError (com status) em respostas não-OK, pra UI tratar.

import type { ApiEnvelope } from '../types/api'

export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('fht_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null
  try {
    body = (await res.json()) as ApiEnvelope<T>
  } catch {
    body = null
  }

  if (!res.ok) {
    // Token inválido/expirado: limpa pra ProtectedRoute mandar pro login no próximo render.
    if (res.status === 401) localStorage.removeItem('fht_token')
    throw new ApiError(body?.message || `Erro ${res.status}`, res.status)
  }

  return body?.data as T
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(`${API_URL}${path}`, { headers: authHeaders() }).then(r => handle<T>(r))
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(r => handle<T>(r))
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => handle<T>(r))
}

export function apiDelete<T>(path: string): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(r => handle<T>(r))
}

export function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => handle<T>(r))
}

// Multipart: NÃO setar Content-Type (o browser define o boundary automaticamente).
export function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  }).then(r => handle<T>(r))
}
