const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

    try {
        if (!options.to || !/^\S+@\S+\.\S+$/.test(options.to)) {
            throw new Error('Invalid recipient email address');
        }
        console.log('Creating transporter...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // Use SSL for port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            },
            debug: true, // Enable debug logs
            logger: true // Log SMTP communication
        });
        console.log('Transporter created. Sending email...');
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: options.to,
            subject: options.subject,
            html: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (err) {
        console.error('Error sending email:', err.message);
        throw new Error('Email could not be sent');
    }
}

module.exports = sendEmail;