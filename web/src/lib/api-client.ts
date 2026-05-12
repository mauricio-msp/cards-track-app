const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export async function apiRequest<T = unknown>(
  pathOrUrl: string | URL,
  init?: RequestInit,
): Promise<T> {
  const url = pathOrUrl instanceof URL ? pathOrUrl : `${BASE_URL}${pathOrUrl}`
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function apiUrl(path: string): URL {
  return new URL(`${BASE_URL}${path}`)
}
