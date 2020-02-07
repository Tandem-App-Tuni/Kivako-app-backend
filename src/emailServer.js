const serverEmailAddress =  'info@unitandem.fi';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: 
  {
    user: serverEmailAddress,
    pass: process.env.PASS
  },
  tls:
  {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => 
{
  if (error) console.log(error);
  else console.log('Email server is online!');
});

const sendActivationEmail = async(user, activationKeyUrl) =>
{
  console.log('Sending email to (' + user.email + ')', activationKeyUrl);

  transporter.sendMail(
  {
    from: serverEmailAddress,
    to: user.email,
    subject: 'Unitandem account activation',
    html: 'Welcome to Unitandem, ' + user.firstName + ' ' + user.lastName + '.Be sure that this is the latest ' +
    'activation email you received. You can activate ' +
    'your account by <a href='+ activationKeyUrl +'>clicking on this link.</a>'
  })
  .then((info, error) => 
  {
    if (error) console.log(error);
    console.log('Email server information:', info);
  });
};

module.exports ={
    sendActivationEmail:sendActivationEmail
};