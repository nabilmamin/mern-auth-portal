const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter, an object used to send emails
    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;