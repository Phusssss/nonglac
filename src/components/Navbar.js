import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Home, TrendingUp, Person, ExitToApp, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
          <img src={logo} alt="NôngLạc" style={{ height: '60px' }} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Trang chủ
          </Button>
          <Button color="inherit" startIcon={<TrendingUp />} onClick={() => navigate('/prices')}>
            Giá cả
          </Button>
          <Button color="inherit" startIcon={<Assessment />} onClick={() => navigate('/market')}>
            Thị trường
          </Button>
          
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {userProfile?.displayName?.charAt(0)}
                </Avatar>
                <Typography variant="body2">
                  Uy tín: {userProfile?.reputation || 0}
                </Typography>
              </Box>
              <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <Person />
              </IconButton>
              <IconButton color="inherit" onClick={handleLogout}>
                <ExitToApp />
              </IconButton>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;