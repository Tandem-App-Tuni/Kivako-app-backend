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

// Register a new user
//http://localhost:3000/api/v1/users/add //POST REQUEST
router.post('/add', userService.createUser);

// Update informations related to the user
// TODO -> Maybe is better change it to email instead of the id
//http://localhost:3000/api/v1/users/update //PUT REQUEST
router.post('/update', auth.isAuthenticated, userService.updateUser);

// Delete user
//http://localhost:3000/api/v1/users/:id //DELETE REQUEST
// TODO -> Just for development, in the end delete this endpoint.
router.delete('/:id', auth.isAuthenticated, userService.deleteUser);




module.exports = router;