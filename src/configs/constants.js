/// THIS FILE CONTAINS ALL THE CONSTANT SETTINGS OF THE SYSTEM.
/// JUST CHANGE HERE

// To access the hostname and port settings, access the file config
const path = require('path');

const LOCAL_TEST_ENVIRONMENT = true;
const LOCAL_LOGIN_STRATEGY = true;
const MAX_MATCH_COUNT = 10;
const AVATAR_UPLOAD_FOLDER = path.join(__dirname, 'uploads');

const backEndUrl = LOCAL_TEST_ENVIRONMENT ?'http://localhost:3000' : 'https://www.unitandem.fi';
const frontEndURL = LOCAL_TEST_ENVIRONMENT ? 'http://localhost:3001' : 'https://www.unitandem.fi';
const adminFrontEndURL = LOCAL_TEST_ENVIRONMENT ? 'https://www.unitandem.fi:3002' : 'http://localhost:3002';
const smlAuthenticationProvider = 'http://localhost:8080';

module.exports = {
    frontEndURL: frontEndURL,
    adminFrontEndURL: adminFrontEndURL,
    smlAuthenticationProvider: smlAuthenticationProvider,
    localLoginStrategy:LOCAL_LOGIN_STRATEGY,
    maxMatchCount: MAX_MATCH_COUNT,
    uploadsFolder: AVATAR_UPLOAD_FOLDER,
    backEndUrl: backEndUrl
};