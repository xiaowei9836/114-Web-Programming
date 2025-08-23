
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import CreateTrip from './pages/CreateTrip';
import MapPlanning from './pages/MapPlanning';
import GoogleMapsLoader from './components/GoogleMapsLoader';
import AIChatbot from './components/AIChatbot';
import { AIChatProvider, useAIChat } from './contexts/AIChatContext';
import './App.css';

// 內部組件，使用 AIChat Context
function AppContent() {
  const { isOpen, toggleChat, isMinimized, minimizeChat } = useAIChat();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/create" element={<CreateTrip />} />
            <Route path="/map-planning" element={<MapPlanning />} />
          </Routes>
        </main>
        
        {/* 全局 AI 諮詢對話框 */}
        <AIChatbot
          isOpen={isOpen}
          onToggle={toggleChat}
          isMinimized={isMinimized}
          onMinimize={minimizeChat}
          messages={useAIChat().messages}
          onAddMessage={useAIChat().addMessage}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <GoogleMapsLoader>
      <AIChatProvider>
        <AppContent />
      </AIChatProvider>
    </GoogleMapsLoader>
  );
}

export default App;
