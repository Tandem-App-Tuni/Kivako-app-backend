const express = require('express');
const auth = require('../../auth/auth')
const adminService = require('../../services/admin');
let router = express.Router();


//Get a list with statitics related to the languages
//http://localhost:3000/api/v1/admin/statitics // GET REQUEST
router.get('/statitics', auth.checkIfUserIsAuthenticatedAndAdmin, adminService.getLanguageStatitics);

//Get a list of all student users in system
//http://localhost:3000/api/v1/admin/studentUsers // GET REQUEST
router.get('/studentUsers', auth.checkIfUserIsAuthenticatedAndAdmin, adminService.getStudentUsers);

//Get a list of all admin users in system
//http://localhost:3000/api/v1/admin/adminUsers // GET REQUEST
router.get('/adminUsers', auth.checkIfUserIsAuthenticatedAndAdmin, adminService.getAdminUsers);

//Register an admin user in the system
//http://localhost:3000/api/v1/admin/adminUsers // GET REQUEST
router.post('/add', auth.checkIfUserIsAuthenticatedAndAdmin, adminService.createAdminUser);

module.exports = router;