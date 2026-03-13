import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MessageSquare, Users, BookOpen, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Knowledge from './pages/Knowledge';

// Sidebar Layout Component
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            ChatSaaS Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/clients" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors">
            <Users size={20} />
            <span className="font-medium">Clients</span>
          </Link>
          <Link to="/knowledge" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors">
            <BookOpen size={20} />
            <span className="font-medium">Knowledge Base</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
