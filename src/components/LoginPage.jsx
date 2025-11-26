// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjusted path if AuthContext.jsx is in src/context
import { useNavigate, useLocation, Navigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  if (auth.isAuthenticated) {
    console.log("LoginPage: Already authenticated, redirecting to", from);
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log("LoginPage: Submitting login with email:", email);
    const result = await auth.login({ email, password });

    setIsLoading(false);

    if (result.success) {
      console.log("LoginPage: Login successful, navigating to", from);
      navigate(from, { replace: true });
    } else {
      console.error("LoginPage: Login failed with message:", result.message);
      setError(result.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  if (auth.initialLoading) {
      return <div>Verifying session...</div>;
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading || auth.loading}>
          {isLoading || auth.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Hint: Try an email/password of a user you registered (e.g., <strong>admin@example.com</strong> / <strong>password123</strong>)
      </p>
    </div>
  );
}

export default LoginPage;