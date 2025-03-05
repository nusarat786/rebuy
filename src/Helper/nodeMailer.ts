import nodemailer from 'nodemailer';


export const sendMail = async (
    from:string,
    to:string,
    subject:string,
    text:string,
    authUser:string,
    authPass:string
)=>{

    const transporter = nodemailer.createTransport({
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: {
          servername: 'smtp.gmail.com',
        },
        service: 'gmail',
        auth: {
          user: authUser,
          pass: authPass 
        },
      });
      

    const mailOptions = {
        from,
        to,
        subject,
        text
    }

    const info = await transporter.sendMail(mailOptions);
    //console.log(info);  
    if (!info.accepted.length) {
        throw new Error('Email was not sent. No recipients accepted the email.');
    }

    return info;
}