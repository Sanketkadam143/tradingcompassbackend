import express from 'express';
import {getRegistration,registration } from '../controllers/contest.js';

import auth from '../middleware/auth.js';

const  router=express.Router();

router.get('/getregistration',auth,getRegistration);
router.post('/registration',auth,registration);



export default router;