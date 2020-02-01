var nodemailer = require('nodemailer');
var fs = require('fs');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'unitandem.noreply@gmail.com',
           pass: 'unitandemtest'
       }
   });


const sendEmailNewMatchRequestReceived = async (user, res, next) => {

    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: user.email, // list of receivers
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
        to: user.email, // Receiver
        subject: 'Unitandem, match request accepted!', // Subject line
        html: 'Hi, your match request have been accepted! Log in the system and start to talk!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}

const sendEmailInactiveAccountOneMonth = async (user, res, next) => {
    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: user.email, // Receiver
        subject: 'Hey! We miss you!', // Subject line
        html: 'Hi,you have been inactive for more than 1 month! Log again to be an active user and keep receiving match requests!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}


const sendEmailInactiveAccountOneYear = async (user, res, next) => {
    const mailOptions = {
        from: 'unitandem.noreply@gmail.com', // sender address
        to: user.email, // Receiver
        subject: 'Unitandem, new match request!', // Subject line
        html: 'Hi,you have been inactive for more than 1 year! All your data have been erased from the system!'
      };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}

module.exports ={
    sendEmailNewMatchRequestReceived:sendEmailNewMatchRequestReceived,
    sendEmailAcceptedMatchRequest:sendEmailAcceptedMatchRequest,
    sendEmailInactiveAccountOneMonth:sendEmailInactiveAccountOneMonth,
    sendEmailInactiveAccountOneYear:sendEmailInactiveAccountOneYear
};