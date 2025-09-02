import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', color: 'white' }}>
                MetabaseApp
            </Link>
            {user && (
                <div className="navbar-menu">
                    {user.role === 'admin' && (
                        <Link to="/admin" className="admin-button">
                            Admin Panel
                        </Link>
                    )}
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;