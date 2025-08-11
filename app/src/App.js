import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/UserAuthentication/Login';
import Register from './pages/UserAuthentication/Register';
import HomePage from './pages/HomePage.js';
import MyRequest from './pages/MyRequest.js';
import TechnicianDashboard from './pages/TechnicianDashboard.js';
import RateRequestWrapper from './pages/RateRequestWrapper.js';
function App() {
  return (
    <Router basename='/~89231015/build'>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/requests" element={<MyRequest />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/rate/:requestId" element={<RateRequestWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;