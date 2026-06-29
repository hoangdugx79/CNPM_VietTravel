let googleScriptPromise;

function getClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In chi ho tro tren trinh duyet.'));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-identity="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google));
        existing.addEventListener('error', () => reject(new Error('Khong the tai Google Identity script.')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Khong the tai Google Identity script.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export async function requestGoogleAuthCode() {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Thieu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.');
  }

  const google = await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.code);
      },
      error_callback: () => reject(new Error('Dang nhap Google da bi huy hoac that bai.')),
    });

    client.requestCode();
  });
}
