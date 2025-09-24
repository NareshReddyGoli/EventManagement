export const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: auth ? { ...authHeaders() } : undefined,
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) throw new Error(data?.message || 'Request failed');
  return data?.data !== undefined ? data.data : data;
}

export async function apiPost<T>(path: string, body: any, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) throw new Error(data?.message || 'Request failed');
  return data?.data !== undefined ? data.data : data;
}

export async function apiPut<T>(path: string, body: any, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) throw new Error(data?.message || 'Request failed');
  return data?.data !== undefined ? data.data : data;
}

export async function apiDelete<T>(path: string, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: auth ? { ...authHeaders() } : undefined,
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) throw new Error(data?.message || 'Request failed');
  return data?.data !== undefined ? data.data : data;
}
