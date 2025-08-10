import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/UserAuthentication/Login';
import Register from './pages/UserAuthentication/Register';
import HomePage from './pages/HomePage.js';
import MyRequest from './pages/MyRequest.js';
import TechnicianDashboard from './pages/TechnicianDashboard.js';
import RateRequestWrapper from './pages/RateRequestWrapper.js';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/requests" element={<MyRequest />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/rate/:requestId" element={<RateRequestWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;