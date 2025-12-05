import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box } from '@mui/material';
import { GetApp, Close } from '@mui/icons-material';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        action={
          <Box>
            <Button
              color="inherit"
              size="small"
              startIcon={<GetApp />}
              onClick={handleInstallClick}
              sx={{ mr: 1 }}
            >
              Cài đặt
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
            >
              <Close />
            </Button>
          </Box>
        }
      >
        Cài đặt NôngLạc để truy cập nhanh hơn!
      </Alert>
    </Snackbar>
  );
};

export default PWAInstaller;