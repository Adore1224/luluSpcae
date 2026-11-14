import { sendJson } from './labApi';

function browserId() {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('lululab-visits', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('visitor');
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      // A read-write transaction lets first visits in multiple tabs share one ID.
      const transaction = db.transaction('visitor', 'readwrite');
      const store = transaction.objectStore('visitor');
      const lookup = store.get('id');
      let id;
      lookup.onsuccess = () => {
        id = lookup.result;
        if (!id) {
          id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
          store.put(id, 'id');
        }
      };
      transaction.oncomplete = () => { db.close(); resolve(id); };
      transaction.onabort = () => { db.close(); reject(transaction.error); };
    };
  });
}

export async function recordVisit() {
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  try {
    const id = await browserId();
    await fetch('/api/visits', { ...sendJson('POST', { id }), keepalive: true });
  } catch { /* Stats are optional when storage or the network is unavailable. */ }
}
