const crypto = require('node:crypto');

const ALGORITHM = 'aes-256-cbc';
const UTF_8 = 'utf8';
const HEX = 'hex';
const KEY = crypto.scryptSync('pepper', 'salt', 32);
const IV = Buffer.alloc(16, 0);
const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);

export const encrypt = (str: string): string => {
  return cipher.update(str, UTF_8, HEX) + cipher.final(HEX);
};

export const decrypt = (str: string): string => {
  return decipher.update(str, HEX, UTF_8) + decipher.final(UTF_8);
};
