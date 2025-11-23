import './App.css';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />    
          <Route path="/reset-password" element={<LoginScreen />} />
          <Route path="/home" element={<HomeScreen />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
