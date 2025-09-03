// utils/cryptoHelpers.js
import naclUtil from 'tweetnacl-util';

export function toBase64(u8) {
  // accept Uint8Array or ArrayBuffer
  if (u8 instanceof ArrayBuffer) u8 = new Uint8Array(u8);
  return naclUtil.encodeBase64(u8);
}
export function fromBase64(b64) {
  const u8 = naclUtil.decodeBase64(b64);
  return u8.buffer; // ArrayBuffer
}

export function stringToUint8Array(str) {
  return naclUtil.decodeUTF8(str);
}
export function uint8ArrayToString(u8) {
  return naclUtil.encodeUTF8(u8);
}
