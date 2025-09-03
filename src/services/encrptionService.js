// services/encryptionService.js
import nacl from 'tweetnacl';
import { toBase64, fromBase64, stringToUint8Array, uint8ArrayToString } from '../utils/cryptoHelpers';
import { getLocalIdentity, getPublicKeyFor } from './keymanager';

/**
 * Encrypt message to recipient (recipientPublicKeyB64).
 * Returns payload safe to JSON: { ephPub, nonce, ciphertext } (all base64)
 */
export async function encryptMessageToRecipient(recipientPublicKeyB64, plaintext) {
  // ensure recipient public key is available (base64)
  const recipientPubBuf = fromBase64(recipientPublicKeyB64);
  const recipientPub = new Uint8Array(recipientPubBuf);

  // generate ephemeral keypair for THIS message
  const eph = nacl.box.keyPair();

  // compute shared key using ephemeral secret and recipient static pub
  const sharedKey = nacl.box.before(recipientPub, eph.secretKey); // Uint8Array(32)

  // message -> Uint8Array
  const msgU8 = stringToUint8Array(plaintext);

  // nonce: 24 bytes
  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  // encrypt using 'after' (uses sharedKey)
  const box = nacl.box.after(msgU8, nonce, sharedKey); // Uint8Array

  // payload - include ephemeral public key so recipient can compute same sharedKey
  return {
    ephPub: toBase64(eph.publicKey),         // base64
    nonce: toBase64(nonce),                  // base64
    ciphertext: toBase64(box)                // base64
  };
}

/**
 * Decrypt a received payload (payload must include ephPub, nonce, ciphertext base64),
 * returns plaintext string.
 * Assumes recipient's own secret key is stored locally.
 */
export async function decryptMessageFromSender(payload) {
  const identity = getLocalIdentity();
  if (!identity || !identity.secretKey) throw new Error('Local identity secret missing');

  const mySecret = new Uint8Array(fromBase64(identity.secretKey));
  const ephPub = new Uint8Array(fromBase64(payload.ephPub));
  const nonce = new Uint8Array(fromBase64(payload.nonce));
  const ciphertext = new Uint8Array(fromBase64(payload.ciphertext));

  // compute shared key with ephemeral public and our secret
  const sharedKey = nacl.box.before(ephPub, mySecret);

  // decrypt
  const decrypted = nacl.box.open.after(ciphertext, nonce, sharedKey);
  if (!decrypted) throw new Error('Failed to decrypt message (auth failed)');
  console.log(decrypted)
  return uint8ArrayToString(decrypted);
}
