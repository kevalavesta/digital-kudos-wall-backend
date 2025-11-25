import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { EmailService } from "../../domain/email.service";
import "dotenv/config"; // Make sure environment variables are loaded

export class NodemailerEmailService implements EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationEmail(email: string): Promise<void> {
    const mailOptions = {
      from: `"Digital Kudos Wall" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome! Please Confirm Your Email",
      html: `<h1>Welcome to the Digital Kudos Wall!</h1>
             <p>Thank you for registering. Please click the link below to confirm your email address.</p>
             <p><a href="#">Confirm Email</a></p> 
             <p>(Note: This is a test email. The confirmation link is not yet functional.)</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        "Confirmation email sent successfully. Message ID:",
        info.messageId,
      );
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      // For production, consider a more robust error handling/logging strategy
      // or a queueing system for retries.
    }
  }
}
