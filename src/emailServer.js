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

const sendActivationEmail = async(email, activationKeyUrl) =>
{
  console.log('Sending email to (' + email + ')', activationKeyUrl);

  transporter.sendMail(
  {
    from: serverEmailAddress,
    to: email,
    subject: 'Unitandem account activation',
    html: 'Welcome to Unitandem. Before you can start, please activate your account by <a href='+ activationKeyUrl +'>clicking on this link.</a>'
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