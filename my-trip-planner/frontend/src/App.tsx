
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import CreateTrip from './pages/CreateTrip';
import MapPlanning from './pages/MapPlanning';
import './App.css';

function App() {
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
      </div>
    </Router>
  );
}

export default App;
