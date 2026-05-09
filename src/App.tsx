import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SportsPage from './pages/SportsPage';
import PredictionMarketsPage from './pages/PredictionMarketsPage';
import HomeDashboard from './pages/HomeDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/finance" element={<HomePage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/prediction-markets" element={<PredictionMarketsPage />} />
        
        {/* Static Drawer Placeholders */}
        <Route path="/account" element={<HomeDashboard />} />
        <Route path="/alerts" element={<HomeDashboard />} />
        <Route path="/settings" element={<HomeDashboard />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
