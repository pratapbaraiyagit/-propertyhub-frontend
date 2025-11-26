// src/services/authService.js

// Simulate a network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock a user database (in a real app, this is on the backend)
const MOCK_ADMIN_USER = {
  username: 'admin',
  password: 'password123',
  id: 'admin001',
  name: 'Super Admin'
};

export const login = async (username, password) => {
  await delay(500); // Simulate network latency

  if (username === MOCK_ADMIN_USER.username && password === MOCK_ADMIN_USER.password) {
    // Simulate successful login and JWT generation
    // In a real app, the backend would generate and return a real JWT
    const fakeJwt = `fake-jwt-for-${username}-${Date.now()}`;
    const user = { id: MOCK_ADMIN_USER.id, username: MOCK_ADMIN_USER.username, name: MOCK_ADMIN_USER.name };
    return { success: true, token: fakeJwt, user };
  } else {
    return { success: false, message: 'Invalid username or password' };
  }
};

// In a real app, you might have a backend endpoint to validate a token
// For now, we assume any non-empty token in localStorage is "valid" for the frontend
export const verifyToken = async (token) => {
  await delay(100);
  if (token && token.startsWith('fake-jwt-for-')) {
    // In a real app, decode token to get user info
    // For mock, we can extract username if needed or just return a generic user
    const username = token.split('-')[3]; // Highly simplified
    return { isValid: true, user: { username, name: `User (${username})` } };
  }
  return { isValid: false };
};

export const logout = async () => {
  await delay(200);
  // On the backend, you might invalidate the token if it's stored server-side (e.g., in a blacklist)
  // For a stateless JWT approach, frontend just needs to clear it.
  return { success: true };
};