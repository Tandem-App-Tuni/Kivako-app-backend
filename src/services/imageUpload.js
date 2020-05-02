const fs = require('fs')
const path = require('path');
const constants = require('../configs/constants');
const sharp = require('sharp');
sharp.cache(false);

const storageFolder = constants.uploadsFolder;
const Logger = require('../log/logger');

/**
 * The functions here take care of the
 * uploading, storing and serving of user avatars.
 * Avatars are resized uppon storing to a default size of 300 x 300 pixels, retaining aspect ratio.
 * The images are accessible via a get request to the server with a postfixed name of 
 * the user whos avatar is requested.
 */

const uploadAvatar = async function(req, res, next) 
{
    try
    {
        sharp(req.file.path).resize(300).toBuffer().then(buf => 
        {
            fs.writeFile(req.file.path, buf, function(error) 
            {
                res.status(200).json({message:'Avatar saved!'});  
            });
        });
    }
    catch (error)
    {
        Logger.log('user', `Error while uploading avatar: ${error}`, 2);
    }
};

const getAvatar = async function(req, res, next) 
{
    try
    {
        let checkRequest = req.path.split('/');
        let imageFile;  

        for (i = checkRequest.length - 1; i >= 0; i--)
            if (checkRequest[i] !== '')
            {
                checkRequest = checkRequest[i];
                break;
            }

        if (checkRequest !== 'getAvatar') imageFile = path.join(storageFolder , checkRequest);
        else imageFile = path.join(storageFolder ,req.user.email);

        if (fs.existsSync(imageFile)) res.sendFile(imageFile);
        else res.status(400).json({message:'No avatar found!'});
    }
    catch (error)
    {
        Logger.log('user', `Error while fetching avatar: ${error}`, 2);
    }
};

module.exports = {
    uploadAvatar: uploadAvatar,
    getAvatar: getAvatar
};