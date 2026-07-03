chrome.storage.sync.get(['tenantId', 'clientId', 'apiKey', 'endpoint'], (data) => {
  if (!data.tenantId || !data.apiKey) {
    console.log('[AltChat Extension] Missing credentials. Please configure via popup.');
    return;
  }

  // Prevent double injection
  if (document.getElementById('altchat-extension-script') || document.querySelector('altchat-widget')) {
    return;
  }

  console.log('[AltChat Extension] Injecting widget...', data.tenantId);

  // 1. Inject the Script
  const script = document.createElement('script');
  // Em produção, isso apontaria para a CDN do AltChat.
  script.src = 'http://localhost:5173/altchat.js'; 
  script.id = 'altchat-extension-script';
  // Use defer so it executes after parsing
  script.defer = true;
  document.head.appendChild(script);

  // 2. Inject the Widget Tag
  const widget = document.createElement('altchat-widget');
  widget.setAttribute('tenant-id', data.tenantId);
  widget.setAttribute('client-id', data.clientId || 'client_default');
  widget.setAttribute('api-key', data.apiKey);
  if (data.endpoint) {
    widget.setAttribute('endpoint', data.endpoint);
  }
  document.body.appendChild(widget);
});
