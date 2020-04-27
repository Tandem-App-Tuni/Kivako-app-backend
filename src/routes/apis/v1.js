const userController = require('../../controllers/apis/user');
const matchController = require('../../controllers/apis/match');
const chatController = require('../../controllers/apis/chat');
const adminController = require('../../controllers/apis/admin');
const imageUploadControler = require('../../controllers/apis/imageUpload');
const NewsController = require('../../controllers/apis/news');

const express = require('express');
let router = express.Router();

router.use('/users', userController);
router.use('/usersMatch', matchController);
router.use('/chat', chatController); // Router handeling chat requests
router.use('/admin', adminController);
router.use('/avatar', imageUploadControler);
router.use('/news', NewsController);

module.exports = router;
