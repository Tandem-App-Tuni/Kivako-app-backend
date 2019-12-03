const express = require('express');
const userService = require('../../services/user');
const auth = require('../../auth/auth')
let router = express.Router();

// Check if user is already registered
// Registered return true, otherwise false
//http://localhost:3000/api/v1/users/isRegistered
router.get('/isRegistered', auth.isAuthenticated, userService.checkIfUserAlreadyRegistered);

// Get a list of all users in system
// TODO -> In the end change authentication of this function to admin users
//http://localhost:3000/api/v1/users/studentUsers
router.get('/studentUsers', auth.isAuthenticated, userService.getUsers);

// Get a list of all admin users in system
// TODO -> In the end change authentication of this function to admin users
//http://localhost:3000/api/v1/users/adminUsers
router.get('/adminUsers', auth.isAuthenticated, userService.getAdminUsers);

// Get information of one user, with his email
//http://localhost:3000/api/v1/users/userInfo
router.get('/userInfo', auth.isAuthenticated, userService.getUserInformation);

// Register a new user
//http://localhost:3000/api/v1/users/add //POST REQUEST
router.post('/add', auth.isAuthenticated, userService.createUser);

// Update informations related to the user
// TODO -> Maybe is better change it to email instead of the id
//http://localhost:3000/api/v1/users/update //PUT REQUEST
router.post('/update', auth.isAuthenticated, userService.updateUser);

// Delete user
//http://localhost:3000/api/v1/users/:id //DELETE REQUEST
// TODO -> Just for development, in the end delete this endpoint.
router.delete('/:id', auth.isAuthenticated, userService.deleteUser);

module.exports = router;