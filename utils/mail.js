const dotenv = require('dotenv')
dotenv.config();
const nodemailer = require('nodemailer');
//메일 이벤트가 여러군데 있는 경우는 smtp -pool을 이용해야 메일이 안오는 경우를 대비할 수 있음
const smtpPool = require('nodemailer-smtp-pool');
const {EMAIL_ID, EMAIL_PASSWORD} = process.env;

const smtpTransport = nodemailer.createTransport(
  smtpPool({
    service : 'Gmail',
    auth : {
      user : EMAIL_ID,
      pass : EMAIL_PASSWORD
    },
    tls : {
      rejectUnauthorized : false
    }
  })
)

module.exports = {
  DosMail : async (req,res) => {
    try {
      const mailOptions = {
        from : EMAIL_ID,
        to : EMAIL_ID,
        subject : "limiter onreached메일",
        text : "한계치 도달"
      };
      smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) throw console.log(err);
        smtpTransport.close();
      });
    } catch (error) {
      console.log(error);
    }
  }
}
