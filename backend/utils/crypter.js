import dotenv from "dotenv";
import CryptoJS from 'crypto-js';
import base32 from 'base32.js';

dotenv.config();
const password = process.env.KEY_PASSWORD;

const encodeBase32 = (value) => {
  const encoder = new base32.Encoder();
  const encoded = encoder.write(Buffer.from(value)).finalize();
  return encoded;
};

const decodeBase32 = (value) => {
  const decoder = new base32.Decoder();
  const decoded = decoder.write(value).finalize();
  return decoded.toString();
};

const encrypt = (val) => {
    const encryptedVal = CryptoJS.AES.encrypt(val, password).toString();
    const encodedVal = encodeURIComponent(encodeBase32(encryptedVal));
    return encodedVal;
};

const decrypt = (val) => {
    const decodedVal = decodeURIComponent(val);
    const decodedBase32 = decodeBase32(decodedVal);
    const decryptedBytes = CryptoJS.AES.decrypt(decodedBase32, password);
    const decryptedVal = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedVal;
};

export {
    encrypt,
    decrypt,
};
