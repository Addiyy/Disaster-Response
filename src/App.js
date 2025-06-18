import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Dashboard from './pages/Dashboard';
import DisasterDetail from './pages/DisasterDetail';
import Login from './pages/Login';
import './styles/global.css';

function App() {
  const [user, setUser] = useState(null);

  // Mock authentication
  useEffect(() => {
    // In a real app, you would check for existing session
    const mockUser = {
      id: 'netrunnerX',
      name: 'Disaster Responder',
      role: 'contributor'
    };
    setUser(mockUser);
  }, []);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <SocketProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/disasters/:id" element={<DisasterDetail user={user} />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
