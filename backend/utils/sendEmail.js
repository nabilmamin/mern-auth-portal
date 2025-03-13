const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter, an object used to send emails
    const transporter = nodemailer.createTransport({
        // Email service, email user, and email password defined in .env file
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const mailOptions = {
        from: `Auth Portal <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.text
    };
    /* A function that sends an email with defined options looks like this:
    await sendEmail({
                to: user.email,
                subject: 'Email Verification',
                text: message
            })
    html will remain undefined. it can be sent in the options if there is desired styling in the email body.
    */

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;