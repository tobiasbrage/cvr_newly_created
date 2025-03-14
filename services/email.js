const nodemailer = require('nodemailer');

module.exports = {

    emailSend: () => {

        var transporter = nodemailer.createTransport({
            host: "smtp.simply.com",
            port: 587,
            secure: false,
            auth: {
              user: 'kontakt@atrengøring.dk',
              pass: 'kikrE2-vaxmeh-secqid'
            }
        });
          
        var mailOptions = {
            from: 'kontakt@atrengøring.dk',
            to: 'tobiasbrage@me.com',
            subject: 'test',
            text: `test`
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });

    }

}