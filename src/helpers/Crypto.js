const CryptoJS = require('crypto-js');
require('dotenv').config();
const secretKey = process.env.CRYPTO_SECURE_KEY;

function encrypt(text) {
    return CryptoJS.AES.encrypt(JSON.stringify(text), secretKey).toString();
};

function decrypt(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
};

module.exports = { encrypt, decrypt };
