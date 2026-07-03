import React from 'react';
import { createRoot } from 'react-dom/client';
import { Widget } from './Widget';
import globalStyles from './styles.css?inline';

class AltChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const tenantId = this.getAttribute('tenant-id') || 'tenant_demo';
    const clientId = this.getAttribute('client-id') || 'client_default';
    const apiKey = this.getAttribute('api-key') || 'altchat_dev_key_12345';
    const endpoint = this.getAttribute('endpoint') || 'http://localhost:4300';

    if (!this.shadowRoot) return;

    // Inject styles into Shadow DOM
    const styleTag = document.createElement('style');
    styleTag.innerHTML = globalStyles;
    this.shadowRoot.appendChild(styleTag);

    // Create mount point
    const mountPoint = document.createElement('div');
    mountPoint.id = 'altchat-root';
    this.shadowRoot.appendChild(mountPoint);

    // Render React App
    const root = createRoot(mountPoint);
    root.render(
      <React.StrictMode>
        <Widget 
          tenantId={tenantId}
          clientId={clientId}
          apiKey={apiKey}
          endpoint={endpoint}
        />
      </React.StrictMode>
    );
  }
}

if (!customElements.get('altchat-widget')) {
  customElements.define('altchat-widget', AltChatWidget);
}

// Auto-injection logic for Zero-Code integration
const currentScript = document.currentScript;
if (currentScript && currentScript.hasAttribute('data-auto-inject')) {
  if (!document.querySelector('altchat-widget')) {
    const widget = document.createElement('altchat-widget');
    
    const tenantId = currentScript.getAttribute('data-tenant-id');
    const clientId = currentScript.getAttribute('data-client-id');
    const apiKey = currentScript.getAttribute('data-api-key');
    const endpoint = currentScript.getAttribute('data-endpoint');
    
    if (tenantId) widget.setAttribute('tenant-id', tenantId);
    if (clientId) widget.setAttribute('client-id', clientId);
    if (apiKey) widget.setAttribute('api-key', apiKey);
    if (endpoint) widget.setAttribute('endpoint', endpoint);
    
    document.body.appendChild(widget);
  }
}
