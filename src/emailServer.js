const serverEmailAddress = 'unitandemfinland@gmail.com';

const mailServer = require('@sendgrid/mail');
mailServer.setApiKey(process.env.SENDGRID_API_KEY);

const sendTestEmail = async (email) => 
{
    const message =
    {
      to: email,
      from: serverEmailAddress,
      subject: 'Test email',
      text: 'This is a test for sending emails!'
    };

    mailServer.send(message);
}

const sendActivationEmail = async(email, activationKeyUrl) =>
{
  console.log('Sending email to', email, activationKeyUrl);

  const message =
  {
    to: email,
    from: serverEmailAddress,
    subject: 'Unitandem account activation',
    html: 'Welcome to Unitandem. Before you can start, please activate your account by <a href='+ activationKeyUrl +'>clicking on this link.</a>',
  };

  mailServer.send(message, (error, result) => 
  {
    if (error) console.log('Error sending email to', email,':',error);
  });
};

module.exports ={
    sendTestEmail:sendTestEmail,
    sendActivationEmail:sendActivationEmail
};