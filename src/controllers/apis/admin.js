const express = require('express');
const auth = require('../../auth/auth')
const adminService = require('../../services/admin');
let router = express.Router();


//Get a list with statitics related to the languages
//http://localhost:3000/api/v1/admin/statitics // GET REQUEST
router.get('/statitics', auth.checkIfUserIsAuthenticatedAndAdmin, adminService.getLanguageStatitics);

module.exports = router;