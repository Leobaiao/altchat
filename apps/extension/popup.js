document.addEventListener('DOMContentLoaded', () => {
  // Load saved data
  chrome.storage.sync.get(['tenantId', 'clientId', 'apiKey', 'endpoint'], (data) => {
    if (data.tenantId) document.getElementById('tenantId').value = data.tenantId;
    if (data.clientId) document.getElementById('clientId').value = data.clientId;
    if (data.apiKey) document.getElementById('apiKey').value = data.apiKey;
    if (data.endpoint) document.getElementById('endpoint').value = data.endpoint;
  });

  // Save data and reload tab
  document.getElementById('saveBtn').addEventListener('click', () => {
    const tenantId = document.getElementById('tenantId').value.trim();
    const clientId = document.getElementById('clientId').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const endpoint = document.getElementById('endpoint').value.trim();

    chrome.storage.sync.set({ tenantId, clientId, apiKey, endpoint }, () => {
      document.getElementById('statusMsg').textContent = "Salvo! Recarregando página...";
      setTimeout(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
            window.close();
          }
        });
      }, 1000);
    });
  });
});
