import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const PASSWORD = process.env.PASSWORD;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

export default async function sendmail({
  userName,
  email,
  type,
  generatedOtp,
  password,
}) {
  const signUpOtpMail = {
    from: "sanketkadam708312@gmail.com",

    to: email,

    subject: "Complete your Signup with Trading Compass",

    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Trading Compass</a>
      </div>
      <p style="font-size:1.1em">Hi, ${userName}</p>
      <p> Use the following OTP to complete your registration with trading compass. OTP is valid for 2 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${generatedOtp}</h2>
      <p style="font-size:0.9em;">Regards,<br />Trading 
        Compass</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Trading Compass</p>
        <p>Pune</p>
      </div>
    </div>
  </div>`,
  };

  const signUpMail = {
    from: "sanketkadam708312@gmail.com",

    to: email,

    subject: "Account Creation Successful",

    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Trading Compass</a>
      </div>
      <p style="font-size:1.1em">Hi, ${userName}</p>
      <p> You have successfully created an account with Trading Compass.Thank You for showing faith in us.</p>
      
      <p style="font-size:0.9em;">Regards,<br />Trading 
        Compass</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Trading Compass</p>
        <p>Pune</p>
      </div>
    </div>
  </div>`,
  };

  const googleSignUpMail = {
    from: "sanketkadam708312@gmail.com",

    to: email,

    subject: "Account Creation Successful",

    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Trading Compass</a>
      </div>
      <p style="font-size:1.1em">Hi, ${userName}</p>
      <p> You have successfully created an account with Trading Compass through google signIn.</p></br></br> <p>Your auto-generated Password is ${password}. </br>You can use it for manual signIn or reset it here <a href="https://www.tradingcompass.in/forget-password">Reset Password</a></p></br></br> <p>Thank You for showing faith in us.</p>
      
      <p style="font-size:0.9em;">Regards,<br />Trading 
        Compass</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Trading Compass</p>
        <p>Pune</p>
      </div>
    </div>
  </div>`,
  };

  const resetPasswordMail = {
    from: "sanketkadam708312@gmail.com",

    to: email,

    subject: "Reset Password for Trading Compass",

    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Trading Compass</a>
         </div>
         <p style="font-size:1.1em">Hi, ${userName}</p>
         <p> Use the following OTP to reset your password for trading compass. OTP is valid for 2 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${generatedOtp}</h2>
         <p style="font-size:0.9em;">Regards,<br />Trading 
           Compass</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
           <p>Trading Compass</p>
           <p>Pune</p>
         </div>
       </div>
     </div>`,
  };

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USERNAME,
        pass: PASSWORD,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    });

    type === "signUpOtp" &&
      transporter.sendMail(signUpOtpMail, function (error, info) {
        if (error) throw Error(error);
        console.log(error);
      });

    type === "signUp" &&
      transporter.sendMail(signUpMail, function (error, info) {
        if (error) throw Error(error);
        console.log(error);
      });

    type == "googleSignUp" &&
      transporter.sendMail(googleSignUpMail, function (error, info) {
        if (error) throw Error(error);
        console.log(error);
      });
    type === "resetPassword" &&
      transporter.sendMail(resetPasswordMail, function (error, info) {
        if (error) throw Error(error);
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
}
