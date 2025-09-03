// services/keyManager.js
import nacl from 'tweetnacl';
import { toBase64, fromBase64 } from '../utils/cryptoHelpers';
import api from './api'; // your backend client (axios/fetch) - implement endpoints accordingly

const IDENTITY_KEY_LOCAL = 'tn-identity-key'; // store JSON { publicKey: b64, secretKey: b64 }

export function getLocalIdentity() {
  const raw = localStorage.getItem(IDENTITY_KEY_LOCAL);
  return raw ? JSON.parse(raw) : null;
}

export async function generateIdentityIfNeeded() {
  const existing = getLocalIdentity();
  if (existing) return existing;

  const kp = nacl.box.keyPair(); // { publicKey: Uint8Array(32), secretKey: Uint8Array(32) }
  const payload = {
    publicKey: toBase64(kp.publicKey),
    secretKey: toBase64(kp.secretKey),
  };
  localStorage.setItem(IDENTITY_KEY_LOCAL, JSON.stringify(payload));
  return payload;
}

export async function getPublicKeyFor(userId) {
  // call your backend to fetch the user's posted public key (base64)
  // e.g. GET /keys/:userId -> { userId, publicKey }
  const res = await api.get(`/keys/${userId}`);
  if (!res?.data?.publicKey) throw new Error('No public key for user');
  return res.data.publicKey; // base64
}

export async function publishMyPublicKey(userId) {
  // ensure identity exists
  const identity = await generateIdentityIfNeeded();
  // send identity.publicKey (not secret) to backend
  await api.post('/keys/upload', { userId, publicKey: identity.publicKey });
  console.log( identity.publicKey);
}
