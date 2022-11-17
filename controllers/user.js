import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { passwordStrength } from "check-password-strength";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import OTP from "../models/otp.js";
import sendmail from "./sendmail.js";

dotenv.config();

const JWTKEY = process.env.JWTKEY;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const PASSKEY = process.env.PASSKEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var userName;

//manual signin

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      JWTKEY,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(200).json({
      token,
      result: existingUser,
      successMessage: "You are Successfully Logged in",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//manual signup

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, otp } =
    req.body;

  const passMusthave = ["lowercase", "uppercase", "symbol", "number"];

  const passContains = passwordStrength(password).contains;

  var addPass = [];
  passMusthave.map((x) => !passContains.includes(x) && addPass.push(x));

  const strength = passwordStrength(password).value;
  const length = passwordStrength(password).length;
  userName = firstName + " " + lastName;

  try {
    const existingUser = await User.findOne({ email });

    if (!validator.isAlpha(firstName))
      return res
        .status(400)
        .json({ message: "First Name should contain only Alphabets" });

    if (!validator.isAlpha(lastName))
      return res
        .status(400)
        .json({ message: "Last Name should contain only Alphabets" });

    if (existingUser)
      return res.status(400).json({ message: "User already exist" });

    if (length < 8)
      return res
        .status(400)
        .json({ message: `Add password of length greater than 8` });

    if (strength === "Too weak" || strength === "Weak")
      return res.status(400).json({
        message: `Entered Password is ${strength} consider adding ${addPass.map(
          (x) => x
        )}`,
      });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords Don't Match" });

    if (!otp) {
      var digits = "0123456789";
      let generatedOtp = "";
      for (let i = 0; i < 4; i++) {
        generatedOtp += digits[Math.floor(Math.random() * 10)];
      }
      const hashedOtp = await bcrypt.hash(generatedOtp, 12);

      await OTP.updateOne(
        { email: email },
        {
          email: email,
          OTP: hashedOtp,
        },
        { upsert: true }
      );

      await sendmail({ userName, email, type: "signUpOtp", generatedOtp });

      return res.json({ successMessage: "OTP Sent on registered Email" });
    }

    if (otp) {
      const tempDetails = await OTP.findOne({ email });

      const isOtpCorrect = await bcrypt.compare(otp, tempDetails?.OTP);

      if (!isOtpCorrect)
        return res.status(400).json({ message: "Invalid OTP" });

      if (isOtpCorrect) {
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          picture: "",
        });

        const token = jwt.sign(
          { email: result.email, id: result._id },
          JWTKEY,
          {
            expiresIn: JWT_EXPIRE,
          }
        );

        await sendmail({ userName, email, type: "signUp" });

        res.status(200).json({
          result,
          token,
          successMessage: "Account created Successfully",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};

//google login

export const googlesignin = async (req, res) => {
  const googleToken = req.body.credential;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  client
    .verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    })
    .then((response) => {
      const {
        email_verified,
        name,
        email,
        picture: userImage,
        given_name: firstName,
      } = response.payload;

      if (email_verified) {
        User.findOne({ email }).exec((err, existingUser) => {
          if (existingUser) {
            User.findByIdAndUpdate(
              { _id: existingUser._id },
              { $set: { picture: userImage } }
            ).exec((err, res) => {});

            existingUser.picture = userImage;

            const token = jwt.sign(
              { email: existingUser.email, id: existingUser._id },
              JWTKEY,
              { expiresIn: JWT_EXPIRE }
            );

            const { email, name, orderDetails, picture, _id } = existingUser;

            return res.json({
              token,
              result: { name, email, orderDetails, picture, _id },
              successMessage: "Login with Google successful",
            });
          } else {
            let password = firstName + PASSKEY;

            bcrypt.hash(password, 12).then((hashedPassword) => {
              const user = new User({
                name,
                email,
                password: hashedPassword,
                picture: userImage,
              });
              user.save((err, newUser) => {
                if (err) {
                  return res.status(400).json({ errorMessage: `${err}` });
                }
                const token = jwt.sign(
                  { email: newUser.email, id: newUser._id },
                  JWTKEY,
                  { expiresIn: JWT_EXPIRE }
                );

                const { email, name, orderDetails, picture, _id } = newUser;

                sendmail({
                  userName: name,
                  email,
                  type: "googleSignUp",
                  password,
                });

                return res.json({
                  token,
                  result: { name, email, orderDetails, picture, _id },
                  successMessage: `Account successfully created! Check Your Email`,
                });
              });
            });
          }
        });
      } else {
        return res.status(400).json({ message: "Google login failed" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Server Error,Try again later" });
    });
};

//reset Password

export const resetpassword = async (req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  const existingUser = await User.findOne({ email });
  userName = existingUser?.name;

  try {
    if (!existingUser)
      return res.status(400).json({ message: "User don't exist" });

    if (!otp) {
      var digits = "0123456789";
      let generatedOtp = "";
      for (let i = 0; i < 4; i++) {
        generatedOtp += digits[Math.floor(Math.random() * 10)];
      }
      const hashedOtp = await bcrypt.hash(generatedOtp, 12);

      await OTP.updateOne(
        { email: existingUser.email },
        {
          email: existingUser.email,
          OTP: hashedOtp,
        },
        { upsert: true }
      );

      await sendmail({ userName, email, type: "resetPassword", generatedOtp });

      return res.json({ successMessage: "OTP Sent on registered Email" });
    }

    if (otp && email) {
      const tempDetails = await OTP.findOne({ email });

      const isOtpCorrect = await bcrypt.compare(otp, tempDetails?.OTP);

      if (!isOtpCorrect)
        return res.status(400).json({ message: "Invalid OTP" });

      if (!password) {
        if (isOtpCorrect) return res.json({ successMessage: "OTP Verified" });
      }

      if (isOtpCorrect && password) {
        const passMusthave = ["lowercase", "uppercase", "symbol", "number"];

        const passContains = passwordStrength(password).contains;

        var addPass = [];
        passMusthave.map((x) => !passContains.includes(x) && addPass.push(x));

        const strength = passwordStrength(password).value;
        const length = passwordStrength(password).length;

        if (length < 8)
          return res
            .status(400)
            .json({ message: `Add password of length greater than 8` });

        if (strength === "Too weak" || strength === "Weak")
          return res.status(400).json({
            message: `Entered Password is ${strength} consider adding ${addPass.map(
              (x) => x
            )}`,
          });

        if (password !== confirmPassword)
          return res.status(400).json({ message: "Passwords Don't Match" });

        const hashedPassword = await bcrypt.hash(password, 12);

        User.findByIdAndUpdate(
          { _id: existingUser._id },
          { $set: { password: hashedPassword } }
        ).exec((err, res) => {});

        return res.json({ successMessage: "Password Reset Successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};
