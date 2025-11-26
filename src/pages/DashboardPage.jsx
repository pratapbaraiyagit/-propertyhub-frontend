import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Dashboard</h2>
            {user ? (
                <p>Welcome, {user.name || user.email}!</p> // Adjust based on your user object
            ) : (
                <p>Loading user data...</p>
            )}
            <p>This is a protected area.</p>
        </div>
    );
}

export default DashboardPage;