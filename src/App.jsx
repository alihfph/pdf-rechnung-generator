import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthBar from './components/AuthBar';
import './App.css';
import Home from './pages/Home';
import GeneratePdf from './pages/GeneratePdf';
import DaawatRestaurant from './pages/DaawatRestaurant';
import Roster from './pages/Roster';
import RosterHours from './pages/RosterHours';
import EmployeeWorkSummary from './pages/EmployeeWorkSummary';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate-pdf" element={<GeneratePdf />} />
          <Route path="/daawat-restaurant" element={<DaawatRestaurant />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/roster/hours" element={<RosterHours />} />
          <Route path="/roster/employee-work" element={<EmployeeWorkSummary />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
