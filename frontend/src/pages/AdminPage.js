import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminPage = () => {
    // User Management State
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'finance', level: 'branch', branchId: '', regionalId: '' });
    
    // Dashboard Management State
    const [dashboards, setDashboards] = useState([]);
    const [newDashboard, setNewDashboard] = useState({ name: '', metabaseDashboardId: '', roles: 'all' });
    const [dashboardToEdit, setDashboardToEdit] = useState(null);
    const [editRoles, setEditRoles] = useState('');
    const [message, setMessage] = useState('');

    // Roles for dropdowns
    const availableRoles = ['finance', 'partnership', 'growth', 'admin', 'QC','merchant'];

    // --- Data Fetching ---
    useEffect(() => {
        fetchUsers();
        fetchDashboards();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setMessage("Failed to fetch users.");
        }
    };

    const fetchDashboards = async () => {
        try {
            const { data } = await API.get('/dashboards/all'); // New endpoint to get all dashboards
            setDashboards(data);
        } catch (error) {
            console.error("Failed to fetch dashboards", error);
            setMessage("Failed to fetch dashboards.");
        }
    };

    // --- User Management Functions ---
    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await API.post('/users', newUser);
            setMessage('User created successfully!');
            fetchUsers(); // Refresh user list
            setNewUser({ username: '', password: '', role: 'finance', level: 'branch', branchId: '', regionalId: '' }); // Reset form
        } catch (error) {
            setMessage('Failed to create user.');
            console.error(error);
        }
    };
    
    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await API.put(`/users/${userId}/status`, { isActive: !currentStatus });
            setMessage('User status updated!');
            fetchUsers(); // Refresh list
        } catch (error) {
            setMessage('Failed to update user status.');
            console.error(error);
        }
    };

    const handleUserRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/users/${userId}/role`, { role: newRole });
            setMessage('User role updated!');
            fetchUsers();
        } catch (error) {
            setMessage('Failed to update user role.');
            console.error(error);
        }
    };

    // --- Dashboard Management Functions ---
    const handleDashboardInputChange = (e) => {
        const { name, value } = e.target;
        setNewDashboard({ ...newDashboard, [name]: value });
    };

    const handleAddDashboard = async (e) => {
        e.preventDefault();
        try {
            // Convert comma-separated roles string to an array
            const payload = { ...newDashboard, roles: newDashboard.roles.split(',').map(r => r.trim()) };
            await API.post('/dashboards', payload);
            setMessage('Dashboard added successfully!');
            fetchDashboards(); // Refresh dashboard list
            setNewDashboard({ name: '', metabaseDashboardId: '', roles: 'all' }); // Reset form
        } catch (error) {
            setMessage('Failed to add dashboard.');
            console.error(error);
        }
    };

    const handleDeleteDashboard = async (dashboardId) => {
        if (window.confirm('Are you sure you want to delete this dashboard?')) {
            try {
                await API.delete(`/dashboards/${dashboardId}`);
                setMessage('Dashboard deleted successfully!');
                fetchDashboards();
            } catch (error) {
                setMessage('Failed to delete dashboard.');
                console.error(error);
            }
        }
    };

    const handleUpdateDashboardPermissions = async (e) => {
        e.preventDefault();
        if (!dashboardToEdit) return;

        try {
            const payload = { roles: editRoles.split(',').map(r => r.trim()) };
            await API.put(`/dashboards/${dashboardToEdit.id}/permissions`, payload);
            setMessage('Dashboard permissions updated!');
            setDashboardToEdit(null);
            setEditRoles('');
            fetchDashboards();
        } catch (error) {
            setMessage('Failed to update dashboard permissions.');
            console.error(error);
        }
    };


    return (
        <div className="admin-page p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Admin Panel</h1>
            {message && <div className="bg-green-200 text-green-800 p-4 rounded mb-4">{message}</div>}

            <div className="admin-section">
                <h2>Add New User</h2>
                <form onSubmit={handleCreateUser}>
                    <input name="username" value={newUser.username} onChange={handleUserInputChange} placeholder="Username" required />
                    <input name="password" value={newUser.password} onChange={handleUserInputChange} placeholder="Password" type="password" required />
                    <select name="role" value={newUser.role} onChange={handleUserInputChange}>
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <select name="level" value={newUser.level} onChange={handleUserInputChange}>
                        <option value="ho">Head Office</option>
                        <option value="regional">Regional</option>
                        <option value="branch">Branch</option>
                    </select>
                    {newUser.level === 'regional' && <input name="regionalId" value={newUser.regionalId} onChange={handleUserInputChange} placeholder="Regional ID" type="number" />}
                    {newUser.level === 'branch' && <input name="branchId" value={newUser.branchId} onChange={handleUserInputChange} placeholder="Branch ID" type="number" />}
                    <button type="submit">Create User</button>
                </form>
            </div>

            {/* User Management */}
            <div className="admin-section bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Manage Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left">Username</th>
                                <th className="py-3 px-6 text-left">Role</th>
                                <th className="py-3 px-6 text-left">Level</th>
                                <th className="py-3 px-6 text-left">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{user.username}</td>
                                    <td className="py-3 px-6 text-left">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                            className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            {availableRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-6 text-left">{user.level}</td>
                                    <td className="py-3 px-6 text-left">
                                        <span className={`py-1 px-3 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                            className="bg-red-500 text-white py-1 px-3 rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dashboard Management */}
            <div className="admin-section bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Manage Dashboards</h2>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Add New Dashboard Form */}
                    <div className="w-full md:w-1/2">
                        <h3 className="text-xl font-medium mb-2">Add New Dashboard</h3>
                        <form onSubmit={handleAddDashboard} className="space-y-4">
                            <input name="name" value={newDashboard.name} onChange={handleDashboardInputChange} placeholder="Dashboard Display Name" required className="w-full p-2 border border-gray-300 rounded-md" />
                            <input name="metabaseDashboardId" value={newDashboard.metabaseDashboardId} onChange={handleDashboardInputChange} placeholder="Metabase Dashboard ID" type="number" required className="w-full p-2 border border-gray-300 rounded-md" />
                            <input name="roles" value={newDashboard.roles} onChange={handleDashboardInputChange} placeholder="Roles (comma-separated, e.g., finance,growth)" required className="w-full p-2 border border-gray-300 rounded-md" />
                            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors">Add Dashboard</button>
                        </form>
                    </div>

                    {/* Update Dashboard Permissions Form */}
                    {dashboardToEdit && (
                        <div className="w-full md:w-1/2">
                            <h3 className="text-xl font-medium mb-2">Update Permissions for "{dashboardToEdit.name}"</h3>
                            <form onSubmit={handleUpdateDashboardPermissions} className="space-y-4">
                                <input
                                    name="editRoles"
                                    value={editRoles}
                                    onChange={(e) => setEditRoles(e.target.value)}
                                    placeholder="Roles (e.g., finance,growth,admin)"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="w-1/2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors">Update Permissions</button>
                                    <button type="button" onClick={() => setDashboardToEdit(null)} className="w-1/2 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-medium mb-2">Existing Dashboards</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg">
                        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left">ID</th>
                                <th className="py-3 px-6 text-left">Name</th>
                                <th className="py-3 px-6 text-left">Metabase ID</th>
                                <th className="py-3 px-6 text-left">Visible to Roles</th>
                                <th className="py-3 px-6 text-left">Slug</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {dashboards.map(dashboard => (
                                <tr key={dashboard.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{dashboard.id}</td>
                                    <td className="py-3 px-6 text-left">{dashboard.name}</td>
                                    <td className="py-3 px-6 text-left">{dashboard.metabaseDashboardId}</td>
                                    <td className="py-3 px-6 text-left">{dashboard.roles.join(', ')}</td>
                                    <td className="py-3 px-6 text-left">{dashboard.slug}</td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex item-center justify-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setDashboardToEdit(dashboard);
                                                    setEditRoles(dashboard.roles.join(', '));
                                                }}
                                                className="bg-yellow-500 text-white py-1 px-3 rounded-full text-xs font-bold hover:bg-yellow-600 transition-colors"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDashboard(dashboard.id)}
                                                className="bg-red-500 text-white py-1 px-3 rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
