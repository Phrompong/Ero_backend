const nodemailer = require("nodemailer");

export async function sendEmail(obj: any): Promise<boolean> {
  try {
    const { subject, issue, detail, specifyIssue, email } = obj;
    // * setup mail transporter service
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "aquila.api@gmail.com",
        pass: "Kaerkgcd39",
      },
    });

    const text = `<p style='color:black'>เรื่อง ${subject} <br />  <br /> เรียน Customer service <br />  <br /> &nbsp;&nbsp;   ปัญหาที่พบ : ${issue} <br />  <br />&nbsp;&nbsp;      รายละเอียด :${specifyIssue} <br />  <br />&nbsp;&nbsp;      ผู้แจ้งปัญหา : ${email} </p> <br />  <br /> <p style='color:red'>* This is only an automated notification email. Please do not reply to this e-mail address</p>`;

    const body =
      "<p style='color:black`>เรื่อง  <br />  <br /> เรียน Customer service <br />  <br />&nbsp;&nbsp;     ปัญหาที่พบ :  <br />  <br />&nbsp;&nbsp;         รายละเอียด : รายละเอียด <br />  <br />&nbsp;&nbsp;       ผู้แจ้งปัญหา : Test@mail.com</p> <br />  <br /> <p style=`color:red`>* This is only an automated notification email. Please do not reply to this e-mail address</p>";

    // * setup email data with unicode symbols
    const mailOptions = {
      from: "aquila.api@gmail.com", // sender
      to: ["phrompong.kht@gmail.com"], // list of receivers
      subject: `${subject}`, // Mail subject
      html: text,
    };

    // * send mail with defined transport object
    transporter.sendMail(mailOptions, function (err: any, info: any) {
      if (err) console.log(err);
      else console.log("send email success");
    });

    return true;
    // * For domain
    // // * setup mail transporter service
    // let transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 587,
    //   secure: false,
    //   requireTLS: true,
    //   auth: {
    //     user: "aquila.api@gmail.com",
    //     pass: "Kaerkgcd39",
    //   },
    // });
    // // * setup email data with unicode symbols
    // const mailOptions = {
    //   from: "aquila.api@gmail.com", // sender
    //   to: ["cs@asiawealth.co.th"], // list of receivers
    //   subject: "Customer service", // Mail subject
    //   html: message,
    // };
    // // * send mail with defined transport object
    // transporter.sendMail(mailOptions, function (err: any, info: any) {
    //   if (err) console.log(err);
    //   else console.log("send email success");
    // });
    // return true;
  } catch (error) {
    console.log(`send email : ${error}`);
    return false;
  }
}
