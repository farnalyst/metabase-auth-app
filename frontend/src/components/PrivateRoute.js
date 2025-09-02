import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />; // Redirect non-admins from admin routes
    }

    return <Outlet />;
};

export default PrivateRoute;