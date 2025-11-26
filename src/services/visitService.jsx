// src/services/visitService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const fetchMyVisitRequests = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/visit-requests/my-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch visit requests');
  }
  return res.json();
};
