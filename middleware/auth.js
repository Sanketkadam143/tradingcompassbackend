import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWTKEY = process.env.JWTKEY;

const auth = async(req,res,next)=>{

  try {
    const token = req.headers.authorization?.split(" ")[1];
    const isCustomAuth = token?.length < 500;
    let decodedData;

    if(token && isCustomAuth){
        decodedData = jwt.verify(token,JWTKEY);

        req.userId = decodedData?.id;
        

    }else{
        decodedData = jwt.decode(token);

        req.userId = decodedData?.sub;
       
    }

    next();
  } catch (error) {
    console.log("token expire")
  }

}

export default auth;