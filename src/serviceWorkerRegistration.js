// Service Worker Registration for PWA
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('SW registered: ', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              
              // Show update notification
              showUpdateNotification(registration);
            } else {
              console.log('Content is cached for offline use.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Show update notification
function showUpdateNotification(registration) {
  // Create update notification
  const updateDiv = document.createElement('div');
  updateDiv.id = 'pwa-update-notification';
  updateDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        🎉 Cập nhật mới có sẵn!
      </div>
      <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
        Phiên bản mới của NôngLạc đã sẵn sàng với nhiều tính năng cải tiến.
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="pwa-update-btn" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        ">
          Cập nhật ngay
        </button>
        <button id="pwa-dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">
          Để sau
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateDiv);
  
  // Handle update button click
  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
  
  // Handle dismiss button click
  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    document.body.removeChild(updateDiv);
  });
  
  // Auto dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('pwa-update-notification')) {
      document.body.removeChild(updateDiv);
    }
  }, 10000);
}

// Install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  
  // Dispatch custom event for components to listen
  window.dispatchEvent(new CustomEvent('pwa-install-available', { detail: e }));
});

window.addEventListener('appinstalled', () => {
  console.log('PWA: App was installed');
  deferredPrompt = null;
  
  // Show success message
  const successDiv = document.createElement('div');
  successDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-weight: 600;">
        🎉 Cài đặt thành công!
      </div>
      <div style="font-size: 14px; margin-top: 4px; opacity: 0.9;">
        NôngLạc đã được thêm vào màn hình chính
      </div>
    </div>
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (document.body.contains(successDiv)) {
      document.body.removeChild(successDiv);
    }
  }, 3000);
});

export { deferredPrompt };