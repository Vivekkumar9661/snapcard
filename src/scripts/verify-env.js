require('dotenv').config({ path: '.env.local' });
console.log('URL Length:', process.env.MONGODB_URL ? process.env.MONGODB_URL.length : 0);
console.log('Sample:', process.env.MONGODB_URL ? process.env.MONGODB_URL.substring(0, 10) : 'MISSING');
