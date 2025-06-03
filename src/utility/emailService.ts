import nodemailer from 'nodemailer';
import config from "./config";
import {injectable} from "inversify";



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});
@injectable()
export class EmailService  {
    async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
        try {
            console.log(`Попытка отправки письма на ${to} с темой "${subject}"`);
            await transporter.sendMail({ from: config.EMAIL_USER, to, subject, text, html });
            console.log(`Письмо успешно отправлено на ${to}`);
            return true;
        } catch (error) {
            console.error("Ошибка при отправке письма:", error);
            return false;
        }
    }

    async sendRegistrationEmail(email: string, confirmationCode: string): Promise<boolean> {
        console.log(`Confirmation code for ${email}: ${confirmationCode}`);
        const subject = "Подтверждение регистрации";
        const text = `Your confirmation code: ${confirmationCode}`;
        const html = `
      <h1>Thanks for your registration</h1>
      <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
      </p>
    `;
        return await this.sendEmail(email, subject, text, html);
    }

    async sendRecoveryEmail(email: string, recoveryCode: string): Promise<boolean> {
        const subject = "Восстановление пароля";
        const text = `Your password recovery code: ${recoveryCode}`;
        const html = `
      <h1>Password recovery</h1>
      <p>To recover your password please follow the link below:
          <a href='https://somesite.com/new-password?recoveryCode=${recoveryCode}'>recover password</a>
      </p>
    `;
        return await this.sendEmail(email, subject, text, html);
    }

}
