const nodemailer = require('nodemailer');
const config = require('../config.json');

class MailService {
    async sandMail(mailText, emailAddress, subject){
        const transporter = nodemailer.createTransport({
            host: config.EMAIL_HOST,
            port: config.EMAIL_PORT,
            auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASS }
        });

        console.log('Fist step')

        const mailOptions = {
            from: 'Your favorite campus',
            to: emailAddress,
            subject: subject,
            html: mailText
        };

        console.log('Second step')

        // transporter.sendMail(mailOption, (error, info) => {
        //     if (error) {
        //         console.error('Email send error:', error);
        //         return sendResponse(res, 500, false, "Failed to send email", null, error);
        //     } else {
        //         console.log('Third step')
        //         return sendResponse(res, 200, true, "Password reset email sent", { token });
        //     }
        // });

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return info;
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    }
}

module.exports = new MailService();