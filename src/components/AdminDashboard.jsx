// src/components/AdminDashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';

function AdminDashboard() {
  const auth = useAuth();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {auth.user ? auth.user.name || auth.user.username : 'Admin'}!</p>
      <p>This page is protected. Only logged-in admins can see this.</p>
      <p>Your super secret token (for demo): {auth.token}</p>
      <LogoutButton />
    </div>
  );
}

export default AdminDashboard;