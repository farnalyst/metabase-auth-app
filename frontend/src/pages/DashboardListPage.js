import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import useAuth from '../hooks/useAuth';

const DashboardListPage = () => {
    const [dashboards, setDashboards] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboards = async () => {
            try {
                const { data } = await API.get('/dashboards');
                setDashboards(data);
            } catch (error) {
                console.error("Failed to fetch dashboards", error);
            }
        };
        fetchDashboards();
    }, []);

    return (
        <div>
            <h1>Welcome, {user?.username}!</h1>
            <p>Here are your available dashboards:</p>
            <div className="dashboard-grid">
                {dashboards.length > 0 ? (
                    dashboards.map(dash => (
                        <Link to={`/dashboard/${dash.slug}`} key={dash.slug} className="dashboard-card">
                            <h3>{dash.name}</h3>
                            <p>Click to view</p>
                        </Link>
                    ))
                ) : (
                    <p>No dashboards assigned to your role.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardListPage;