const express = require('express');
const userService = require('../../services/user');
const auth = require('../../auth/auth')
let router = express.Router();


router.get('/', auth.isAuthenticated, userService.getUsers);

router.get('/:id', auth.isAuthenticated, userService.getUserById);

router.post('/add', auth.isAuthenticated, userService.createUser);

router.put('/:id', auth.isAuthenticated, userService.updateUser);

router.delete('/:id', auth.isAuthenticated, userService.deleteUser);

router.get('/email/:email', auth.isAuthenticated, userService.getUserIdWithEmail)

module.exports = router;