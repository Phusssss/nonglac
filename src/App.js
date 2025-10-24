import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ResponsiveNavbar from './components/ResponsiveNavbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PriceUpdate from './pages/PriceUpdate';
import MarketData from './pages/MarketData';
import FoodPrices from './pages/FoodPrices';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ResponsiveNavbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prices" element={<PriceUpdate />} />
            <Route path="/food-prices" element={<FoodPrices />} />
            <Route path="/market" element={<MarketData />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;