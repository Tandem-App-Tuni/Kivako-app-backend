const router = require('express').Router();
let User = require('../models/user.model'),
    mongoose = require('mongoose');

let express = require('express'),
    multer = require('multer'),
    uuidv4 = require('uuid/v4')

//User picture settings
const DIR = './public/uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// ================================ API =====================================

// Adding new user without profile picture
router.post('/add', upload.single('profileImg'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host')
  const user = new User({
      _id: new mongoose.Types.ObjectId(),
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      email : req.body.email,
      cities : req.body.cities,
      descriptionText : req.body.descriptionText,
      languagesToTeach : req.body.languagesToTeach,
      languagesToLearn : req.body.languagesToLearn,
      userIsActivie : req.body.userIsActivie,
      //profileImg: url + '/public/' + req.file.filename
  });

  user.save().then(result => {
      res.status(201).json({
          message: "User registered successfully!",
          userCreated: {
              _id: result._id,
              profileImg: result.profileImg
          }
      })
  }).catch(err => {
      console.log(err),
          res.status(500).json({
              error: err
          });
  })
});

// Update user
router.route('/update/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.cities = req.body.cities;
      user.descriptionText = req.body.descriptionText;
      user.languagesToTeach = req.body.languagesToTeach;
      user.languagesToLearn = req.body.languagesToLearn;

      user.save()
        .then(() => res.json('User updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update profile user picture
router.post('/updatePicture/:id', upload.single('profileImg'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host')
  User.findById(req.params.id)
    .then(user => {
      user.profileImg = url + '/public/' + req.file.filename;

      user.save()
        .then(() => res.json('User picture updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


// Get all users
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get one user by id
router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update user access date
router.route('/updateActivity/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.userIsActivie = req.body.userIsActivie;
      user.lastUserAccess = Date.parse(req.body.lastUserAccess);
      //user.userIsActivie = true;

      user.save()
        .then(() => res.json('User last access update!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


/*
// Add new user
router.route('/add').post((req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const cities = req.body.cities;
  const descriptionText = req.body.descriptionText;
  const languagesToTeach = req.body.languagesToTeach;
  const languagesToLearn = req.body.languagesToLearn;
  const userIsActivie = req.body.userIsActivie;
  //const profile_pic = req.body.profile_pic;

  const newUser = new User({
    firstName,
    lastName,
    email,
    cities,
    descriptionText,
    languagesToTeach,
    languagesToLearn,
    userIsActivie
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update user
router.route('/update/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.cities = req.body.cities;
      user.descriptionText = req.body.descriptionText;
      user.languagesToTeach = req.body.languagesToTeach;
      user.languagesToLearn = req.body.languagesToLearn;

      user.save()
        .then(() => res.json('User updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});
*/



module.exports = router;