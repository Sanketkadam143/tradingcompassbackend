import express from 'express';
import { getOrderBook ,placeOrder,updateOrder,deleteOrder} from '../controllers/order.js';

import auth from '../middleware/auth.js';

const  router=express.Router();

router.get('/',auth,getOrderBook);
router.post('/',auth,placeOrder);
router.patch('/:id',auth,updateOrder);
router.delete('/:id',auth,deleteOrder);


export default router;
