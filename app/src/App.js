import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/UserAuthentication/Login';
import Register from './pages/UserAuthentication/Register';
import HomePage from './pages/HomePage.js';
import MyRequest from './pages/MyRequest.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/requests" element={<MyRequest />} />
      </Routes>
    </Router>
  );
}

export default App;