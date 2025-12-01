import './App.css';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import YourListings from './components/screens/YourListings';
import SoldListings from './components/screens/SoldListings';
import MessagesScreen from './components/screens/MessagesScreen';
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
          <Route path="/listings" element={<YourListings />} />
          <Route path="/sold" element={<SoldListings />} />
          <Route path="/messages" element={<MessagesScreen />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
