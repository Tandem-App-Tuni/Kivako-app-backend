const express = require('express');
const userService = require('../../services/user');
const auth = require('../../auth/auth')
let router = express.Router();

// Check if user is already registered
// Registered return true, otherwise false
//http://localhost:3000/api/v1/users/isRegistered
router.get('/isRegistered', auth.isAuthenticated, userService.checkIfUserAlreadyRegistered);

// Get information of one user, with his email
//http://localhost:3000/api/v1/users/userInfo
router.get('/userInfo', auth.isAuthenticated, userService.getUserInformation);

// Get some informations of one user, with his email, to insert in menudrawer
//http://localhost:3000/api/v1/users/drawer
router.get('/drawer', auth.isAuthenticated, userService.loadUserInfoMenuDrawer);

//http://localhost:3000/api/v1/users/activate/email
router.get('/activate/*', userService.activateUser);

//http://localhost:3000/api/v1/users/reactivate/email
router.get('/reactivate/*', userService.reactivateUser);

//http://localhost:3000/api/v1/users/isAdmin
router.get('/isAdmin', userService.isAdmin);

// Register a new user
//http://localhost:3000/api/v1/users/add //POST REQUEST
router.post('/add', userService.createUser);

// Update informations related to the user
// TODO -> Maybe is better change it to email instead of the id
//http://localhost:3000/api/v1/users/update //PUT REQUEST
router.post('/update', auth.isAuthenticated, userService.updateUser);

// Delete user
//http://localhost:3000/api/v1/users/delete
router.delete('/delete', auth.isAuthenticated, userService.deleteUser);

//http://localhost:3000/api/v1/users/deleteAdmin/
router.get('/deleteAdmin/*', auth.isAuthenticated, userService.adminDeleteUser);

//http://localhost:3000/api/v1/users/updateUserToAdmin/
router.post('/updateUserToAdmin/*', auth.checkIfUserIsAuthenticatedAndAdmin, userService.updateUserToAdmin);

//http://localhost:3000/api/v1/users/removeAdminStatus/
router.post('/removeAdminStatus/*', auth.checkIfUserIsAuthenticatedAndAdmin, userService.removeAdminStatus);


//http://localhost:3000/api/v1/users/resetPasswordRequest
router.get('/resetPasswordRequest/*', userService.resetPasswordRequest);

//http://localhost:3000/api/v1/users/resetPasswordRequestCheck
router.post('/resetPasswordRequestCheck', userService.resetPasswordRequestCheck)

//http://localhost:3000/api/v1/users/setMatchingVisibility
router.post('/setMatchingVisibility', userService.setMatchingVisibility)


module.exports = router;