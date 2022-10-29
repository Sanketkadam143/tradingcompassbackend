import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { passwordStrength } from "check-password-strength";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";

import User from "../models/user.js";

dotenv.config();

const JWTKEY = process.env.JWTKEY;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const PASSKEY = process.env.PASSKEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

//manual signin

export const signin = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body)
  try {
    
    const existingUser = await User.findOne({ email} );
  
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

    res
      .status(200)
      .json({ token, result: existingUser,successMessage:"You are Successfully Logged in" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//manual signup

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  const passMusthave = ["lowercase", "uppercase", "symbol", "number"];

  const passContains = passwordStrength(password).contains;

  var addPass = [];
  passMusthave.map((x) => !passContains.includes(x) && addPass.push(x));

  const strength = passwordStrength(password).value;
  const length = passwordStrength(password).length;

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      picture: "",
    });

    const token = jwt.sign({ email: result.email, id: result._id }, JWTKEY, {
      expiresIn: JWT_EXPIRE,
    });

    res.status(200).json({ result, token,successMessage:"Account created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//google login

export const googlesignin = async (req, res) => {
  const googleToken = req.body.credential;

  const client = new OAuth2Client(
    GOOGLE_CLIENT_ID
  );
  client
    .verifyIdToken({
      idToken: googleToken,
      audience:
      GOOGLE_CLIENT_ID,
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
              successMessage:"Login with Google successful"
            });
          } else {
            let password = firstName +PASSKEY;
        
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

                return res.json({
                  token,
                  result: { name, email, orderDetails, picture, _id },
                  successMessage:` Account successfully created! Your auto generated password is ${password}`,
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
      return res.status(500).json({ message: "Server Error" });
    });
};
