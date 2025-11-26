import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            {isAuthenticated ? (
                <>
                    <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
                    <span style={{ marginRight: '10px' }}>Hello, {user?.name || user?.email}</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            )}
        </nav>
    );
}

export default Navbar;