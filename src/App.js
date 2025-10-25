import './App.css';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />    
        <Route path="/home" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
