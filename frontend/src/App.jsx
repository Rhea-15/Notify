import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import NotificationDrawer from './components/NotificationDrawer.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import RulesPage from './pages/RulesPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import LogsPage from './pages/LogsPage.jsx';

// Demo: switch between student (id=1) and admin view
const CURRENT_USER = { id: 1, name: 'Ananya Sharma', role: 'student' };

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('student'); // 'student' | 'admin'

  return (
    <div className="layout">
      <div className="bg-mesh" />
      <Sidebar view={view} setView={setView} />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar
          user={CURRENT_USER}
          view={view}
          onBellClick={() => setDrawerOpen(true)}
        />
        <div className="page fade-up">
          {view === 'student' ? (
            <Routes>
              <Route path="/" element={<StudentDashboard userId={CURRENT_USER.id} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
      </div>
      {drawerOpen && (
        <NotificationDrawer
          userId={CURRENT_USER.id}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}