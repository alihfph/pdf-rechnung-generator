import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthBar from './components/AuthBar';
import AdminRoute from './components/AdminRoute';
import './App.css';
import Home from './pages/Home';
import GeneratePdf from './pages/GeneratePdf';
import DaawatRestaurant from './pages/DaawatRestaurant';
import Roster from './pages/Roster';
import RosterHours from './pages/RosterHours';
import EmployeeWorkSummary from './pages/EmployeeWorkSummary';
import Admin from './pages/Admin';
import Order from './pages/Order';
import ManageAdmins from './pages/ManageAdmins';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daawat-restaurant" element={<DaawatRestaurant />} />
          <Route path="/order" element={<Order />} />
          <Route path="/generate-pdf" element={<AdminRoute><GeneratePdf /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/admins" element={<ManageAdmins />} />
          <Route path="/roster" element={<AdminRoute><Roster /></AdminRoute>} />
          <Route path="/roster/hours" element={<AdminRoute><RosterHours /></AdminRoute>} />
          <Route path="/roster/employee-work" element={<AdminRoute><EmployeeWorkSummary /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
