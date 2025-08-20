// Very simple AES-GCM crypto for provider secrets. For MVP only.
const crypto = require('crypto');
const { saveProviderCred, getProviderCred } = require('./db');

const KEY_B64 = process.env.CREDENTIALS_KEY || '';
let KEY = null;
if (KEY_B64) {
  try { KEY = Buffer.from(KEY_B64, 'base64'); } catch {}
}

function requireKey() {
  if (!KEY || KEY.length !== 32) {
    const err = new Error('CREDENTIALS_KEY missing/invalid');
    err.code = 'NO_KEY';
    throw err;
  }
}

function encryptJson(obj) {
  requireKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(obj));
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptJson(b64) {
  requireKey();
  const raw = Buffer.from(b64, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString('utf8'));
}

async function saveProviderConfig(owner, provider, payload) {
  const secret_enc = encryptJson(payload);
  return saveProviderCred(owner, provider, { secret_enc, meta: {} });
}

async function getProviderConfig(owner, provider) {
  const row = await getProviderCred(owner, provider);
  if (!row) return null;
  return decryptJson(row.secret_enc);
}

module.exports = { saveProviderConfig, getProviderConfig };


