const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text');
//new email(user,url).sendWelcome();

module.exports = class Email {
    constructor(user,url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours <${process.env.EMAIL_FROM}`

    }
    newTransport() {
        if(process.env.NODE.ENV === 'production') {
            //sendgrid
            return 1;

        }
        return nodemailer.createTransport({
            host :  process.env.EMAIL_HOST,
            port : process.env.EMAIL_PORT,
            auth : {
                user : process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
           
        });
    }


    async send(template,subject){
        //1.RENDER HTML BASED ON A PUG TEMPLATE
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url : this.url,
            subject
            
        }
        );
        const mailOptions = {
            from : this.from,
            to : this.to,
            subject,
            html,
            text : htmlToText.fromString(html)
        }

        await this.newTransport().sendMail(mailOptions)

    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
      }
    async sendPasswordReset() {
        await this.send('forgotPassword', 'Your Password Reset only valid in 10 minute');
      }
};

    
