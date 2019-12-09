const express = require('express');
const auth = require('../../auth/auth')
const adminService = require('../../services/admin');
let router = express.Router();

//http://localhost:3000/api/v1/admin/statitics // GET REQUEST
router.get('/statitics', adminService.getLanguageStatitics);

module.exports = router;