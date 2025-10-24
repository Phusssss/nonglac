import React, { useState, useCallback, useMemo } from 'react';
import { AppBar, Toolbar, Button, Box, Avatar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme, Divider } from '@mui/material';
import { Home, TrendingUp, Person, ExitToApp, Assessment, Menu, Agriculture, Restaurant } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MegaMenu from './MegaMenu';
import logo from '../assets/images/logo.png';

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
    setDrawerOpen(false);
  }, [logout, navigate]);

  const priceMenuItems = useMemo(() => [
    { text: 'Giá nông sản', icon: <Agriculture />, path: '/prices' },
    { text: 'Giá thực phẩm', icon: <Restaurant />, path: '/food-prices' },
    { text: 'Thị trường', icon: <Assessment />, path: '/market' },
  ], []);

  const menuItems = useMemo(() => [
    { text: 'Trang chủ', icon: <Home />, path: '/' },
  ], []);

  const handleMenuClick = useCallback((path) => {
    navigate(path);
    setDrawerOpen(false);
  }, [navigate]);

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {menuItems.map((item) => (
        <Button key={item.path} color="inherit" startIcon={item.icon} onClick={() => navigate(item.path)}>
          {item.text}
        </Button>
      ))}
      
      <MegaMenu 
        title="Giá cả"
        icon={<TrendingUp />}
      />
      
      {user ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {userProfile?.displayName?.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              Uy tín: {userProfile?.reputation || 0}
            </Box>
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
  );

  const renderMobileDrawer = () => (
    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: 250, pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.path} onClick={() => handleMenuClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {priceMenuItems.map((item) => (
            <ListItem button key={item.path} onClick={() => console.log('Mobile menu:', item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          {user && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem button onClick={() => handleMenuClick('/profile')}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Trang cá nhân" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItem>
            </>
          )}
          
          {!user && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem button onClick={() => handleMenuClick('/login')}>
                <ListItemText primary="Đăng nhập" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <Menu />
            </IconButton>
          )}
          
          <Box sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
            <img src={logo} alt="NôngLạc" style={{ height: '40px' }} />
          </Box>
          
          {!isMobile && renderDesktopMenu()}
          
          {isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {userProfile?.displayName?.charAt(0)}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {isMobile && renderMobileDrawer()}
    </>
  );
};

export default React.memo(ResponsiveNavbar);