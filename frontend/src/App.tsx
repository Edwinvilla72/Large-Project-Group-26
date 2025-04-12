import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPass from './pages/FP/ForgotPassPage';
import FPSecurityQuestion from './pages/FP/FPSecurityQuestionPage';
import ChangePassword from './pages/FP/ChangePasswordPage';
import Dashboard from './components/Dashboard';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ForgotPass" element={<ForgotPass />} />
        <Route path="/FPSecurityQuestion" element={<FPSecurityQuestion />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />


        <Route path="/Dashboard" element={<Dashboard/>} />


      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
