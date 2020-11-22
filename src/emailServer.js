const serverEmailAddress =  'info@unitandem.fi';
const nodemailer = require('nodemailer');
const constants = require('./configs/constants')

const transporter = nodemailer.createTransport({
  host: 'mail.gandi.net',
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
  else console.log('[EMAIL] Email server is online!');
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
    console.log('[EMAIL] Email server information:', info);
  });
}

const sendPasswordResetEmail = async(user, resetKey) =>
{
  console.log('[EMAIL] Sending password email to (', user.email, ') ->', resetKey);

  let to = user.email;
  let subject = 'Unitandem password reset code';
  let html = 'Hello ' + user.firstName + ' ' + user.lastName + '. You have requested a password reset for the Unitandem application.' +
  ' If you did not request this, someone else has. Make sure that no one but you has access to your email account.' + 
  ' Enter the following token <b>' + resetKey + '</b> in the "Reset token" field at the password reset page.';

  sendEmail(to, subject, html);
}

const sendActivationEmail = async(user, activationKeyUrl) =>
{
  console.log('[EMAIL] Sending email to (' + user.email + ')', activationKeyUrl);

  let to = user.email;
  let subject = 'Unitandem account activation';
  let html = 'Welcome to Unitandem, ' + user.firstName + ' ' + user.lastName + '. Be sure that this is the latest ' +
  'activation email you received. You can activate ' +
  'your account by <a href='+ activationKeyUrl +'>clicking on this link.</a>';

  sendEmail(to, subject, html);
};

const sendNewRequestNotificationEmail = (user, receiver) => 
{
    console.log(`[EMAIL] Sending new request notification email to ${receiver.email}`);
    let to = receiver.email;
    let subject = 'Hey! You have a new partner request';
    let html = `Hey ${receiver.firstName} ${receiver.lastName}, <b> ${user.firstName} ${user.lastName} </b> wants to become your partner. 
                Click here <a href='${constants.frontEndURL}/match-requests'>to login</a>, accept and start studying now !!!` ;  
    sendEmail(to, subject, html);
}

const sendNewMessageNotificationEmail = (user, receiver, message) => 
{
  console.log('[EMAIL] Sending new message notification email to ${receiver.email}');
  let to = receiver;
  let subject = `Hey, you have a new message from ${user.firstName} ${user.lastName}!`;
  let html = `Hey, ${user.firstName} is saying: "${message}".\nLog into Unitandem to reply!` ;  
  sendEmail(to, subject, html);
}

const monthNotification = (user) =>
{
  console.log('[EMAIL] Sending one month inactivity notification!');
  let to = user.email;
  let subject = 'Inactive for over a month.'
  let html = `Hello ${user.firstName} ${user.lastName}. It looks like you have not been active for over a month. ` + 
             'Make sure to log back in if you wish to find new language partners.';

  sendEmail(to, subject, html);
}

const yearNotification = (user) =>
{
  console.log('[EMAIL] Sending one year inactivity notification!');
  let to = user.email;
  let subject = 'Inactive for over a year.'
  let html = `Hello ${user.firstName} ${user.lastName}. It looks like you have not been active for over a year. ` + 
             'Your account has now be removed.';

  sendEmail(to, subject, html);
}

module.exports ={
    sendActivationEmail:sendActivationEmail,
    sendPasswordResetEmail:sendPasswordResetEmail,
    monthNotification:monthNotification,
    yearNotification:yearNotification,
    sendNewRequestNotificationEmail,
    sendNewMessageNotificationEmail:sendNewMessageNotificationEmail
};