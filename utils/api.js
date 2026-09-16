import * as SecureStore from 'expo-secure-store';
export const BASE_URL = 'http://192.168.0.216:5001/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
   
    'ngrok-skip-browser-warning': 'true',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    
    throw new Error('Could not reach the server. Check your connection / BASE_URL.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}


export const saveToken = (token) => SecureStore.setItemAsync('authToken', token);
export const getToken = () => SecureStore.getItemAsync('authToken');
export const deleteToken = () => SecureStore.deleteItemAsync('authToken');

export const authApi = {
  signup: (phone) => request('/auth/signup', { method: 'POST', body: { phone } }),

  completeProfile: (token, profileData) =>
    request('/auth/profile', { method: 'PUT', token, body: profileData }),

  setPin: (token, pin) => request('/auth/set-pin', { method: 'PUT', token, body: { pin } }),

  login: (phone, pin) => request('/auth/login', { method: 'POST', body: { phone, pin } }),

  enableBiometric: (token, enabled) =>
    request('/auth/enable-biometric', { method: 'PUT', token, body: { enabled } }),

  getMe: (token) => request('/auth/me', { token }),
};

export const serviceApi = {
  getById: (id) => request(`/services/${id}`),

  getByCategory: (category) => request(`/services/category/${category}`),
  getPopular: (category) =>
    request(`/services/popular${category && category !== 'All' ? `?category=${category}` : ''}`),
  getCategories: () => request('/services/categories'),

  search: (term, filters = {}) => {
  
    const parts = [];

    if (term && term.trim()) {
      parts.push(`query=${encodeURIComponent(term.trim())}`);
    }
    if (filters.category && filters.category !== 'All') {
      parts.push(`category=${encodeURIComponent(filters.category)}`);
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (min !== undefined) parts.push(`minPrice=${encodeURIComponent(min)}`);
      if (max !== undefined) parts.push(`maxPrice=${encodeURIComponent(max)}`);
    }
    if (filters.rating && filters.rating !== 'All') {
      parts.push(`rating=${encodeURIComponent(filters.rating)}`);
    }

    const qs = parts.join('&');
    return request(`/services/search?${qs}`).then((data) => {
      console.log('Search URL:', `${BASE_URL}/services/search?${qs}`);
      console.log('Search result count:', data.providers?.length);
      return data;
    });
  },
};