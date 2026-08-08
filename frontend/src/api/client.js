// Mock API Client for Frontend Development

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  login: async (username, password) => {
    await delay(800);
    if (username === 'admin' && password === 'admin') {
      const fakeToken = "mock.jwt.token.123";
      localStorage.setItem('auth_token', fakeToken);
      return { success: true, token: fakeToken };
    }
    throw new Error('Invalid credentials');
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
  
  getHealth: async () => {
    // In the real app, this will hit GET /health on the FastAPI backend
    // which will also ping the LiteLLM proxy internally.
    await delay(200);
    return {
      backend: 'online',
      litellm: 'online'
    };
  },
  
  analyze: async (payloadText) => {
    await delay(1500); // Simulate AI processing time
    
    // Return mock successful response
    return {
      confidence_score: Math.floor(Math.random() * 40) + 50, // 50-90
      historical_win_rate: Math.floor(Math.random() * 30) + 40, // 40-70
      suggested_bias: Math.random() > 0.5 ? "LONG" : "SHORT",
      key_risk: "SL cluster @29200",
      similar_sessions_count: Math.floor(Math.random() * 20) + 5,
      pattern_notes: "b-Shape + high vol at POC",
      narrative: "Based on historical sessions with similar structural patterns, we found multiple matches. Consider the suggested bias but watch out for key risk areas near the value area boundaries.",
      execution_time: 1.5,
      status: "Success"
    };
  },
  
  getHistory: async () => {
    await delay(500);
    return [
      {
        id: "1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        confidence_score: 78,
        historical_win_rate: 65,
        status: "Success"
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        confidence_score: 42,
        historical_win_rate: 38,
        status: "Success"
      }
    ];
  }
};
