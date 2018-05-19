/**
 * Register sw.
 */
window.addEventListener('load', () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {

    if (!navigator.serviceWorker.controller) return;

    console.log('SW registration successful at scope', reg.scope);

    if (reg.waiting) {
      updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', function () {
      trackInstalling(reg.installing);
    });

  }).catch(() => {
    console.log('SW Registration failed!');
  });
});

let trackInstalling = (worker) => {
  worker.addEventListener('statechange', () => {
    if (worker.state == 'installed') {
      updateReady(worker);
    }
  });
};

let updateReady = (worker) => {
  showSnackbar(worker);
};