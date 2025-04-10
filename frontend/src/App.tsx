import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import ForgotPass from './pages/FP/ForgotPassPage';
import FPSecurityQuestion from './pages/FP/FPSecurityQuestionPage';
import ChangePassword from './pages/FP/ChangePasswordPage';

function App() {
  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/ForgotPass" element={<ForgotPass />} /> 
        <Route path="/FPSecurityQuestion" element={<FPSecurityQuestion />} /> 
        <Route path="/ChangePassword" element={<ChangePassword />} /> 
      </Routes>
    </Router>
  );
}
export default App;