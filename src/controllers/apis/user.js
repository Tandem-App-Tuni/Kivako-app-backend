const express = require('express');
const userService = require('../../services/user');
const auth = require('../../auth/auth')
let router = express.Router();

// Check if user is already registered
// Registered return true, otherwise false
router.get('/', auth.isAuthenticated, userService.checkIfUserAlreadyRegistered);

// Get a list of all users in system
// TODO -> In the end change authentication of this function to admin users
router.get('/', auth.isAuthenticated, userService.getUsers);

// Get information of one user, with his ID
// TODO -> Just for development, in the end delete this endpoint.
router.get('/:id', auth.isAuthenticated, userService.getUserById);

// Register a new user
router.post('/add', auth.isAuthenticated, userService.createUser);

// Update informations related to the user
router.put('/:id', auth.isAuthenticated, userService.updateUser);

// Delete user
// TODO -> Just for development, in the end delete this endpoint.
router.delete('/:id', auth.isAuthenticated, userService.deleteUser);

module.exports = router;