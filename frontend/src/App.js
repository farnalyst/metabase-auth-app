import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardListPage from './pages/DashboardListPage';
import DashboardViewPage from './pages/DashboardViewPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<DashboardListPage />} />
            <Route path="/dashboard/:slug" element={<DashboardViewPage />} />
          </Route>

          {/* Admin Only Route */}
           <Route element={<PrivateRoute adminOnly={true} />}>
             <Route path="/admin" element={<AdminPage />} />
           </Route>

        </Routes>
      </main>
    </div>
  );
}

export default App;