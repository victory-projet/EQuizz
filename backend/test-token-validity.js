// backend/test-token-validity.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = process.argv[2];
const secret = process.env.JWT_SECRET;

console.log('Secret used for verification:', secret);

try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token is valid!');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.error('❌ Token is invalid:', error.message);
}
