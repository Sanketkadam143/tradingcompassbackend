import express from 'express';
import {signin,signup,googlesignin,resetpassword} from '../controllers/user.js';

const  router=express.Router();

router.post('/signin',signin);
router.post('/signup',signup);
router.post('/googlesignin',googlesignin);
router.post('/resetpassword',resetpassword);

export default router;