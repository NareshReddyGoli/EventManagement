export const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, auth = false): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: auth ? { ...authHeaders() } : undefined,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('API GET Response:', path, data);
    
    if (data?.success === false) {
      throw new Error(data?.message || 'Request failed');
    }
    
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('API GET Error:', path, error);
    throw error;
  }
}

export async function apiPost<T>(path: string, body: any, auth = false): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? authHeaders() : {}),
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('API POST Response:', path, data);
    
    if (data?.success === false) {
      throw new Error(data?.message || 'Request failed');
    }
    
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('API POST Error:', path, error);
    throw error;
  }
}

export async function apiPut<T>(path: string, body: any, auth = false): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? authHeaders() : {}),
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('API PUT Response:', path, data);
    
    if (data?.success === false) {
      throw new Error(data?.message || 'Request failed');
    }
    
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('API PUT Error:', path, error);
    throw error;
  }
}

export async function apiDelete<T>(path: string, auth = false): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: auth ? { ...authHeaders() } : undefined,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('API DELETE Response:', path, data);
    
    if (data?.success === false) {
      throw new Error(data?.message || 'Request failed');
    }
    
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('API DELETE Error:', path, error);
    throw error;
  }
}
