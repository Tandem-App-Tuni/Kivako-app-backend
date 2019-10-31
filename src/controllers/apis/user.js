const express = require('express');
const userService = require('../../services/user');
const isAuthenticated = require('../../auth/auth')
let router = express.Router();

router.get('/' ,userService.getUsers);

router.get('/:id', userService.getUserById);

router.post('/add', userService.createUser);

router.put('/:id', userService.updateUser);

router.delete('/:id', userService.deleteUser);

router.get('/email/:email', userService.getUserIdWithEmail)

module.exports = router;