const serverEmailAddress =  'info@unitandem.fi';
const nodemailer = require('nodemailer');
const constants = require('./configs/constants')

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

function sendEmail(to, subject, html)
{
  transporter.sendMail(
  {
    from: serverEmailAddress,
    to: to,
    subject: subject,
    html: html
  })
  .then((info, error) => 
  {
    if (error) console.log(error);
    console.log('Email server information:', info);
  });
}

const sendPasswordResetEmail = async(user, resetKey) =>
{
  console.log('Sending password email to (', user.email, ') ->', resetKey);

  let to = user.email;
  let subject = 'Unitandem password reset code';
  let html = 'Hello ' + user.firstName + ' ' + user.lastName + '. You have requested a password reset for the Unitandem application.' +
  ' If you did not request this, someone else has. Make sure that no one but you has access to your email account.' + 
  ' Enter the following token <b>' + resetKey + '</b> in the "Reset token" field at the password reset page.';

  sendEmail(to, subject, html);
}

const sendActivationEmail = async(user, activationKeyUrl) =>
{
  console.log('Sending email to (' + user.email + ')', activationKeyUrl);

  let to = user.email;
  let subject = 'Unitandem account activation';
  let html = 'Welcome to Unitandem, ' + user.firstName + ' ' + user.lastName + '. Be sure that this is the latest ' +
  'activation email you received. You can activate ' +
  'your account by <a href='+ activationKeyUrl +'>clicking on this link.</a>';

  sendEmail(to, subject, html);
};

const sendNewRequestNotificationEmail = (user, receiver) => 
{
    console.log(`sending new request notification email to ${receiver.email}`);
    let to = receiver.email;
    let subject = 'Hey! You have a new partner request';
    let html = `Hey ${receiver.firstName} ${receiver.lastName}, <b> ${user.firstName} ${user.lastName} </b> wants to become your partner. 
                Click here <a href='${constants.frontEndURL}/match-requests'>to login</a>, accept and start studying now !!!` ;  
    sendEmail(to, subject, html);
}

module.exports ={
    sendActivationEmail:sendActivationEmail,
    sendPasswordResetEmail:sendPasswordResetEmail,
    sendNewRequestNotificationEmail
};