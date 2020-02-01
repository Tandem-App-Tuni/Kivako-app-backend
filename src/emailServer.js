const serverEmailAddress = 'unitandemfinland@gmail.com';

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
        user: serverEmailAddress,
        pass: 'unitandemtest'
    }
});

const sendTestEmail = async (email) => 
{
    const mailOptions = 
    {
        from: serverEmailAddress,
        to: email,
        subject: 'Unitandem, test email!',
        html: 'Hi, this is a test!'
      };

    transporter.sendMail(mailOptions, function (err, info) 
    {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
}

module.exports ={
    sendTestEmail:sendTestEmail
};