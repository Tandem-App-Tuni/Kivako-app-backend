/// THIS FILE CONTAINS ALL THE CONSTANT SETTINGS OF THE SYSTEM.
/// JUST CHANGE HERE

// To access the hostname and port settings, access the file config
const path = require('path');

// URL's
const frontEndURL = 'http://localhost:3001'//'https://www.unitandem.fi'; //'http://localhost:3001'
const adminFrontEndURL = 'http://localhost:3002';
const smlAuthenticationProvider = 'http://localhost:8080';

// LOGIN STRATEGY
const localLoginStrategy = true; // If you want to use HAKA login strategy, set this constant to false.

// MATCHES LIMIT
const maxMatchCount = 10;

// AVATAR STORAGE FOLDER
const uploadsFolder = path.join(__dirname, 'uploads');

module.exports = {
    frontEndURL: frontEndURL,
    adminFrontEndURL: adminFrontEndURL,
    smlAuthenticationProvider: smlAuthenticationProvider,
    localLoginStrategy:localLoginStrategy,
    maxMatchCount: maxMatchCount,
    uploadsFolder: uploadsFolder
};