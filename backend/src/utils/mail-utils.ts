import nodemailer, { SendMailOptions } from "nodemailer";
import { GOOGLE_APP_PASSWORD, MY_EMAIL } from "../configs";

interface Mail {
  subject: string;
  to: string;
  html?: string;
  text: string;
}

export const sendMail = async ({ subject, to, html, text }: Mail) => {
  // const mail = {
  //   from: "pierremariekod@gmail.com",
  //   to,
  //   subject,
  //   html,
  //   text,
  // };

  // const emailMessageData: EmailMessageData = {
  //   Recipients: [
  //     {
  //       Email: to,
  //       // Fields: {
  //       //   name: "A",

  //       // },
  //     },
  //   ],
  //   Content: {
  //     Body: [
  //       {
  //         ContentType: "HTML",
  //         Charset: "utf-8",
  //         Content: html,
  //       },
  //     ],
  //     From: "pierremariekod@gmail.com",
  //     Subject: subject,
  //   },
  // };

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: MY_EMAIL,
      pass: GOOGLE_APP_PASSWORD,
    },
  });
  const mailOptions: SendMailOptions = {
    from: MY_EMAIL,
    to,
    subject,
    html,
  };
  try {
    // const res = await emailsApi.emailsPost(emailMessageData);
    await transporter.sendMail(mailOptions);
  } catch (error: any) {}
};
