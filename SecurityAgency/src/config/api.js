// src/config/api.js

// Use the environment variable or fallback to localhost for local dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Optional helper function
export const apiPost = async (endpoint, data) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
