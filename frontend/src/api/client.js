// Production API Client connecting to FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  
  analyze: async (payloadText, fields = null) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const body = { payload: payloadText };
    if (fields) {
      body.fields = fields;
    }

    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
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
  },
  
  getPendingTrades: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_URL}/pending_trades`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`Fetch pending trades failed: ${res.statusText}`);
    return await res.json();
  },
  
  resolveTrade: async (tradeData) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_URL}/resolve_trade`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tradeData)
    });
    
    if (!res.ok) throw new Error(`Resolve trade failed: ${res.statusText}`);
    return await res.json();
  },

  deletePendingTrades: async (tradeIds) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_URL}/pending_trades`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ trade_ids: tradeIds })
    });
    
    if (!res.ok) throw new Error(`Delete trades failed: ${res.statusText}`);
    return await res.json();
  }
};
