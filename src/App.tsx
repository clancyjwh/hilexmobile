import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SportsPage from './pages/SportsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Redirect to login by default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/finance" element={<HomePage />} />
        <Route path="/sports" element={<SportsPage />} />
        {/* Legacy redirect */}
        <Route path="/home" element={<Navigate to="/finance" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
