const nodemailer = require("nodemailer");

export async function sendEmail(message: string): Promise<boolean> {
  try {
    // * setup mail transporter service
    let transporter = nodemailer.createTransport({
      host: "172.16.1.54",
      //port: 587,
      secure: false,
      requireTLS: true,
      //   auth: {
      //     user: "info.aifirst@gmail.com",
      //     pass: "Aifadmin123.",
      //   },
    });

    // * setup email data with unicode symbols
    const mailOptions = {
      from: "cs@asiawealth.co.th", // sender
      to: ["cs@asiawealth.co.th"], // list of receivers
      subject: "Customer service", // Mail subject
      html: message,
    };

    // * send mail with defined transport object
    transporter.sendMail(mailOptions, function (err: any, info: any) {
      if (err) console.log(err);
      else console.log("send email success");
    });

    return true;
  } catch (error) {
    console.log(`send email : ${error}`);
    return false;
  }
}
