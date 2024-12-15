import nodemailer from "nodemailer";
import { readEnvVar } from "./env-utils";

interface Mail {
  subject: string;
  to: string;
  html?: string;
  text: string;
}

const SMTP_HOST = readEnvVar("SMTP_HOST");
const SMTP_PORT = readEnvVar("SMTP_PORT");
const SMTP_USER = readEnvVar("SMTP_USER");
const SMTP_PASSWORD = readEnvVar("SMTP_PASSWORD");
const SMTP_NAME = readEnvVar("SMTP_NAME");

export const sendMail = async ({ subject, to, html, text }: Mail) => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
  const mailOptions: nodemailer.SendMailOptions = {
    from: {
      address: SMTP_USER,
      name: SMTP_NAME,
    },
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};
