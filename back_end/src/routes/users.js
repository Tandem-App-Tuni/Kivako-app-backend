const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const cityOne = req.body.cityOne;
  const cityTwo = req.body.cityTwo;
  const descriptionText = req.body.descriptionText;
  const languagesToTeach = req.body.languagesToTeach;
  const languagesToLearn = req.body.languagesToLearn;
  const userIsActivie = req.body.userIsActivie;

  const newUser = new User({
    firstName,
    lastName,
    email,
    cityOne,
    cityTwo,
    descriptionText,
    languagesToTeach,
    languagesToLearn,
    userIsActivie
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;