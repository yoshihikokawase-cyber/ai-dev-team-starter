import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const base = process.env.HOME + '/claude-practice/ai-dev-team-starter';

// --- pushUtils.ts ---
writeFileSync(join(base, 'src/lib/pushUtils.ts'), `'use client';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker not supported');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('[SW] Registered:', reg.scope);
    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

export async function subscribePush(registration, vapidPublicKey) {
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log('[Push] Subscribed:', subscription.endpoint.slice(0, 60) + '...');
    return subscription;
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    return null;
  }
}

export function extractSubscriptionData(sub) {
  const json = sub.toJSON();
  return {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? '',
    auth: json.keys?.auth ?? '',
    subscription_json: JSON.stringify(json),
  };
}
`, 'utf8');
console.log('pushUtils.ts written (JS version - will add types later)');
