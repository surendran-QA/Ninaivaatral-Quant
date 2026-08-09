// Production API Client connecting to FastAPI backend
const API_URL = 'http://localhost:8000';

export const apiClient = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!res.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      return data;
    }
    throw new Error('No token received');
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
  
  getHealth: async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error('Backend unhealthy');
      return await res.json();
    } catch (err) {
      throw new Error('Backend unreachable');
    }
  },
  
  analyze: async (payloadText) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ payload: payloadText })
    });
    
    if (!res.ok) {
      if (res.status === 401) apiClient.logout(); // Token expired
      throw new Error(`Analyze failed: ${res.statusText}`);
    }
    
    return await res.json();
  },
  
  getHistory: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_URL}/history`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      if (res.status === 401) apiClient.logout();
      throw new Error(`History fetch failed: ${res.statusText}`);
    }
    
    return await res.json();
  }
};
