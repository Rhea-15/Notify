import React, { useState } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout user={user} onLogout={handleLogout} />} />
        <Route path="*"        element={<Navigate to="/admin" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/student/*" element={<StudentLayout user={user} onLogout={handleLogout} />} />
      <Route path="*"          element={<Navigate to="/student" />} />
    </Routes>
  );
}