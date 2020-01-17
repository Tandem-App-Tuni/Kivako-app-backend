const express = require('express');
const auth = require('../../auth/auth')
const multer = require('multer');
const fs = require('fs')
const path = require('path');
const constants = require('../../configs/constants');
const sharp = require('sharp');
sharp.cache(false);
let router = express.Router();

const storageFolder = constants.uploadsFolder;

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

router.post('/uploadAvatar', auth.isAuthenticated, upload.single('avatar'), function(req, res, next) 
{
    try
    {
        sharp(req.file.path).resize(100).toBuffer().then(buf => 
        {
            fs.writeFile(req.file.path, buf, function(error) 
            {
                res.status(200).json({message:'Avatar saved!'});  
            });
        });
    }
    catch (error)
    {
        console.log('Error while uploading avatar:', error);
    }
});

router.get('/getAvatar*', auth.isAuthenticated, function(req, res, next) 
{
    try
    {
        let checkRequest = req.path.split('/');
        let imageFile;  
        if (checkRequest[checkRequest.length - 1] !== 'getAvatar') imageFile = path.join(storageFolder , checkRequest[checkRequest.length - 1]);
        else imageFile = path.join(storageFolder ,req.user.email);

        console.log('Request for:', imageFile);

        if (fs.existsSync(imageFile)) 
        {
            res.sendFile(imageFile);
            console.log('Sending avatar...');
        }
        else 
        {
            res.status(200).json({message:'No avatar found!'});
            console.log('Can not find avatar...');
        }
        
    }
    catch (error)
    {
        console.log('Error while fetching avatar:', error);
    }
});

module.exports = router;