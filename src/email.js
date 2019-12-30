var nodemailer = require('nodemailer');
var fs = require('fs');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'unitandem.noreply@gmail.com',
           pass: 'unitandemtest'
       }
   });


const sendEmailNewMatchRequest = async (info, res, next) => {
    console.log("sending to ")
    console.log(info.email)

    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: info.email, // list of receivers
        subject: 'Unitandem, new match request!', // Subject line
        html: 'Hi, you received a new match request!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}

const sendEmailAcceptedMatchRequest = async (user, res, next) => {
    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: 'Unitandem, new match request!', // Subject line
        html: 'Hi, your match request have been accepted!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}

const sendEmailInactiveAccountOneMonth = async (info, res, next) => {
    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: info.userEmail, // list of receivers
        subject: 'Unitandem, new match request!', // Subject line
        html: 'Hi,you have been inactive for more than 1 year! Log again to be an active user!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}


module.exports =
{
    sendEmailNewMatchRequest:sendEmailNewMatchRequest,
    sendEmailAcceptedMatchRequest:sendEmailAcceptedMatchRequest,
    sendEmailInactiveAccountOneMonth:sendEmailInactiveAccountOneMonth
};