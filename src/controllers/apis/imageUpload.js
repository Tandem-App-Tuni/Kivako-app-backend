const express = require('express');
const auth = require('../../auth/auth')
const multer = require('multer');
const constants = require('../../configs/constants');
let router = express.Router();

const storageFolder = constants.uploadsFolder;
const imageUpload = require('../../services/imageUpload');

let storage = multer.diskStorage(
{
    destination: function(req, file, cb) 
    {
        cb(null, storageFolder);
    },
    filename: function(req, file, cb) 
    {
        cb(null, req.user.email);
    }
});
let upload = multer({storage: storage});

router.post('/uploadAvatar', auth.isAuthenticated, upload.single('avatar'), imageUpload.uploadAvatar);

router.get('/getAvatar*', auth.isAuthenticated, imageUpload.getAvatar);

module.exports = router;